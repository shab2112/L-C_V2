/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useMemo, useState } from 'react';
import { useSettings, useUI, useLogStore, useTools, personas, useFavoritesStore, useClientProfileStore, useAuthStore } from '@/lib/state';
import FavoriteCard from './favorites/FavoriteCard';
import ClientProfile from './ClientProfile';
import { useFavoritesSync } from '@/hooks/useFavoritesSync';
import c from 'classnames';
import {
  AVAILABLE_VOICES_FULL,
  AVAILABLE_VOICES_LIMITED,
  MODELS_WITH_LIMITED_VOICES,
  DEFAULT_VOICE,
} from '@/lib/constants';
import { useLiveAPIContext } from '@/contexts/LiveAPIContext';

const AVAILABLE_MODELS = [
  'gemini-2.5-flash-native-audio-preview-09-2025',
  'gemini-2.5-flash-native-audio-latest',
  'gemini-live-2.5-flash-preview',
  'gemini-2.0-flash-live-001'
];

type SidebarTab = 'settings' | 'favorites';

export default function Sidebar() {
  useFavoritesSync();
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'Admin';
  const [activeTab, setActiveTab] = useState<SidebarTab>('favorites');

  // Verify tab permission on mount and when role changes
  useEffect(() => {
    if (isAdmin) {
      // If admin, default to settings if just mounted or stay? 
      // Let's just keep 'favorites' as default if not explicitly set, 
      // but strictly enforce no-settings for non-admins.
      // Actually user requested "only show the settings [if Admin] else dont show".
      // So if Admin, we CAN show settings.
      setActiveTab('settings');
    } else {
      setActiveTab('favorites');
    }
  }, [isAdmin]);

  const {
    isSidebarOpen,
    toggleSidebar,
    showSystemMessages,
    toggleShowSystemMessages,
  } = useUI();
  const favorites = useFavoritesStore(state => state.favorites);
  const profile = useClientProfileStore(state => state.profile);
  const {
    systemPrompt,
    model,
    voice,
    setSystemPrompt,
    setModel,
    setVoice,
    isEasterEggMode,
    activePersona,
    setPersona,
  } = useSettings();
  const { connected } = useLiveAPIContext();

  const availableVoices = useMemo(() => {
    return MODELS_WITH_LIMITED_VOICES.includes(model)
      ? AVAILABLE_VOICES_LIMITED
      : AVAILABLE_VOICES_FULL;
  }, [model]);

  useEffect(() => {
    if (!availableVoices.some(v => v.name === voice)) {
      setVoice(DEFAULT_VOICE);
    }
  }, [availableVoices, voice, setVoice]);

  const handleExportLogs = () => {
    const { systemPrompt, model } = useSettings.getState();
    const { tools } = useTools.getState();
    const { turns } = useLogStore.getState();

    const logData = {
      configuration: {
        model,
        systemPrompt,
      },
      tools,
      conversation: turns.map(turn => ({
        ...turn,
        // Convert Date object to ISO string for JSON serialization
        timestamp: turn.timestamp.toISOString(),
      })),
    };

    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `live-api-logs-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <aside className={c('sidebar', { open: isSidebarOpen })}>
        <div className="sidebar-header">
          <div className="sidebar-tabs">
            {isAdmin && (
              <button
                className={c('sidebar-tab', { active: activeTab === 'settings' })}
                onClick={() => setActiveTab('settings')}
              >
                <span className="icon">settings</span>
                <span>Settings</span>
              </button>
            )}
            <button
              className={c('sidebar-tab', { active: activeTab === 'favorites' })}
              onClick={() => setActiveTab('favorites')}
            >
              <span className="icon">favorite</span>
              <span>Favorites</span>
            </button>
          </div>
          <button onClick={toggleSidebar} className="close-button">
            <span className="icon">close</span>
          </button>
        </div>
        <div className="sidebar-content">
          {activeTab === 'settings' ? (
            <div className="sidebar-section">
              <fieldset disabled={connected}>
                {isEasterEggMode && (
                  <label>
                    Persona
                    <select
                      value={activePersona}
                      onChange={e => setPersona(e.target.value)}
                    >
                      {Object.keys(personas).map(personaName => (
                        <option key={personaName} value={personaName}>
                          {personaName}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  System Prompt
                  <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    rows={10}
                    placeholder="Describe the role and personality of the AI..."
                    disabled={isEasterEggMode}
                  />
                </label>
                <label>
                  Model
                  <select
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    disabled={!isEasterEggMode}
                  >
                    {/* This is an experimental model name that should not be removed from the options. */}
                    {AVAILABLE_MODELS.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="settings-field-label">
                  Voice
                  <select
                    value={voice}
                    onChange={e => setVoice(e.target.value)}
                    className="settings-select"
                  >
                    {availableVoices.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <p className="voice-caption">
                    {availableVoices.find(v => v.name === voice)?.description || 'Clear and natural voice'}
                  </p>
                </label>
              </fieldset>
              <div className="settings-toggle-item">
                <label className="tool-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="system-message-toggle"
                    checked={showSystemMessages}
                    onChange={toggleShowSystemMessages}
                  />
                  <span className="checkbox-visual"></span>
                </label>
                <label
                  htmlFor="system-message-toggle"
                  className="settings-toggle-label"
                >
                  Show system messages
                </label>
              </div>
              <div className="sidebar-actions">
                <button onClick={handleExportLogs} title="Export session logs">
                  <span className="icon">download</span>
                  Export Logs
                </button>
                <button
                  onClick={useLogStore.getState().clearTurns}
                  title="Reset session logs"
                >
                  <span className="icon">refresh</span>
                  Reset Session
                </button>
              </div>
            </div>
          ) : (
            <div className="favorites-tab-content">
              {favorites.length === 0 ? (
                <div className="favorites-empty">
                  <span className="icon">favorite</span>
                  <p>Your saved projects will appear here.</p>
                  <span>Ask the advisor to save a project you're interested in.</span>
                </div>
              ) : (
                <div className="favorites-list">
                  {favorites.map(project => (
                    <FavoriteCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}