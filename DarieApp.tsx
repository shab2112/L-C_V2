/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useCallback, useState, useEffect, useRef } from 'react';

import ControlTray from './components/ControlTray';
import ErrorScreen from './components/ErrorScreen';
import StreamingConsole from './components/streaming-console/StreamingConsole';
import PopUp from './components/popup/PopUp';
import Sidebar from './components/DarieSettingsSidebar';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Map3D } from './components/map-3d';
import { Map3DCameraProps } from './components/map-3d/map-3d-types';
import { useMapStore, useAuthStore, useLogStore } from './lib/state';
import { MapController } from './lib/map-controller';
import { ChatSession } from './types';
import { chatHistoryService } from './lib/db';

const GEMINI_API_KEY = process.env.API_KEY as string;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

if (typeof GEMINI_API_KEY !== 'string' || !GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in .env file');
}

if (typeof GOOGLE_MAPS_API_KEY !== 'string' || !GOOGLE_MAPS_API_KEY) {
  throw new Error('Missing VITE_GOOGLE_API_KEY in .env file');
}

const INITIAL_VIEW_PROPS = {
  center: {
    lat: 25.12,
    lng: 55.22,
    altitude: 1500
  },
  range: 25000,
  heading: 45,
  tilt: 65,
  roll: 0
};

interface AppComponentProps {
  onClose?: () => void;
}

function AppComponent({ onClose }: AppComponentProps) {
  const [map, setMap] = useState<google.maps.maps3d.Map3DElement | null>(null);
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [viewProps, setViewProps] = useState(INITIAL_VIEW_PROPS);
  const { markers, cameraTarget, setCameraTarget, preventAutoFrame } = useMapStore();
  const mapController = useRef<MapController | null>(null);

  const maps3dLib = useMapsLibrary('maps3d');
  const elevationLib = useMapsLibrary('elevation');

  const [showPopUp, setShowPopUp] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  const user = useAuthStore(state => state.user);
  const { setSession, setTurns, clearTurns } = useLogStore();

  const consolePanelRef = useRef<HTMLDivElement>(null);
  const controlTrayRef = useRef<HTMLElement>(null);
  const [padding, setPadding] = useState<[number, number, number, number]>([0.05, 0.05, 0.05, 0.05]);

  useEffect(() => {
    if (geocodingLib) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib]);

  useEffect(() => {
    if (map && maps3dLib && elevationLib) {
      mapController.current = new MapController({
        map,
        maps3dLib,
        elevationLib,
      });
    }
    return () => {
      mapController.current = null;
    };
  }, [map, maps3dLib, elevationLib]);

  useEffect(() => {
    const calculatePadding = () => {
      const consoleEl = consolePanelRef.current;
      const trayEl = controlTrayRef.current;
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      if (!consoleEl || !trayEl) return;

      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      const top = 0.05;
      const right = 0.05;
      let bottom = 0.05;
      let left = 0.05;

      if (!isMobile) {
        left = Math.max(left, (consoleEl.offsetWidth / vw) + 0.02);
      }

      setPadding([top, right, bottom, left]);
    };

    const observer = new ResizeObserver(calculatePadding);
    if (consolePanelRef.current) observer.observe(consolePanelRef.current);
    if (controlTrayRef.current) observer.observe(controlTrayRef.current);

    window.addEventListener('resize', calculatePadding);

    const timeoutId = setTimeout(calculatePadding, 100);

    return () => {
      window.removeEventListener('resize', calculatePadding);
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleClosePopUp = () => {
    setShowPopUp(false);
  };

  // Load user sessions on mount/login
  useEffect(() => {
    async function loadSessions() {
      if (user) {
        try {
          const sessionIds = await chatHistoryService.getAllUserSessions(user.id);
          const sessions: ChatSession[] = sessionIds.map(id => ({
            id,
            title: `Session ${id.slice(-4)}`, // Placeholder title until we have session names in DB
            messages: []
          }));
          setChatSessions(sessions);

          if (sessions.length > 0) {
            // Auto-select latest session
            handleSelectSession(sessions[0].id);
          } else {
            handleNewChatSession();
          }
        } catch (e) {
          console.error("Failed to load sessions:", e);
        }
      }
    }
    loadSessions();
  }, [user?.id]);

  const handleNewChatSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: `Darie Session ${chatSessions.length + 1}`,
      messages: [],
    };
    setChatSessions([newSession, ...chatSessions]);
    setActiveSessionId(newId);
    setSession(user?.id || null, newId);

    // Don't clear turns automatically if user wants to keep context, 
    // but add a marker.
    useLogStore.getState().addTurn({
      role: 'system',
      text: 'Session started.',
      isFinal: true
    });
  };

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id);
    if (user) {
      setSession(user.id, id);
      try {
        const history = await chatHistoryService.getSessionHistory(user.id, id);
        const logTurns = history.map(h => ({
          role: h.role,
          text: h.text,
          isFinal: h.is_final,
          timestamp: new Date(h.created_at),
          groundingChunks: h.metadata?.groundingChunks,
          toolResponse: h.metadata?.toolResponse
        }));
        setTurns(logTurns);
      } catch (e) {
        console.error("Failed to load session history:", e);
      }
    }
  };

  const handleDeleteSession = (id: string) => {
    setChatSessions(chatSessions.filter(s => s.id !== id));
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setChatSessions(chatSessions.map(s =>
      s.id === id ? { ...s, title: newTitle } : s
    ));
  };

  useEffect(() => {
    if (map) {
      const banner = document.querySelector(
        '.vAygCK-api-load-alpha-banner',
      ) as HTMLElement;
      if (banner) {
        banner.style.display = 'none';
      }
    }
  }, [map]);

  useEffect(() => {
    if (!mapController.current) return;

    const controller = mapController.current;
    controller.clearMap();

    if (markers.length > 0) {
      controller.addMarkers(markers);
    }

    const markerPositions = markers.map(m => m.position);
    const allEntities = [...markerPositions].map(p => ({ position: p }));

    if (allEntities.length > 0 && !preventAutoFrame) {
      controller.frameEntities(allEntities, padding);
    }
  }, [markers, padding, preventAutoFrame]);

  useEffect(() => {
    if (cameraTarget && mapController.current) {
      mapController.current.flyTo(cameraTarget);
      setCameraTarget(null);
      useMapStore.getState().setPreventAutoFrame(false);
    }
  }, [cameraTarget, setCameraTarget]);

  const handleCameraChange = useCallback((props: Map3DCameraProps) => {
    setViewProps(oldProps => ({ ...oldProps, ...props }));
  }, []);

  return (
    <LiveAPIProvider
      apiKey={GEMINI_API_KEY}
      map={map}
      placesLib={placesLib}
      elevationLib={elevationLib}
      geocoder={geocoder}
      padding={padding}
    >
      <ErrorScreen />
      <ChatHistorySidebar
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewChatSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        isOpen={isChatHistoryOpen}
        setIsOpen={setIsChatHistoryOpen}
      />
      <Sidebar />
      {showPopUp && <PopUp onClose={handleClosePopUp} />}
      {onClose && (
        <button className="close-map-button" onClick={onClose} aria-label="Close map assistant">
          <span className="icon">close</span>
        </button>
      )}
      <div className="streaming-console">
        <div className="console-panel" ref={consolePanelRef}>
          <StreamingConsole />
          <ControlTray trayRef={controlTrayRef} />
        </div>
        <div className="map-panel">
          <Map3D
            ref={element => setMap(element ?? null)}
            onCameraChange={handleCameraChange}
            {...viewProps}>
          </Map3D>
        </div>
      </div>
    </LiveAPIProvider>
  );
}

interface DarieAppProps {
  onClose?: () => void;
}

function DarieApp({ onClose }: DarieAppProps) {
  return (
    <div className="App">
      <APIProvider
        version={'alpha'}
        apiKey={GOOGLE_MAPS_API_KEY}
        solutionChannel={"gmp_aistudio_itineraryapplet_v1.0.0"}>
        <AppComponent onClose={onClose} />
      </APIProvider>
    </div>
  );
}

export default DarieApp;