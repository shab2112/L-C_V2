/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

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


import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../lib/genai-live-client';
import { LiveConnectConfig, Modality, LiveServerToolCall } from '@google/genai';
import { AudioStreamer } from '../lib/audio-streamer';
import { audioContext } from '../lib/utils';
import { useLogStore, useMapStore, useSettings, useClientProfileStore } from '@/lib/state';
import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import { ToolContext, toolRegistry } from '@/lib/tools/tool-registry';


export type UseLiveApiResults = {
 client: GenAILiveClient;
 setConfig: (config: LiveConnectConfig) => void;
 config: LiveConnectConfig;
 audioStreamer: MutableRefObject<AudioStreamer | null>;


 connect: () => Promise<void>;
 disconnect: () => void;
 connected: boolean;
 heldGroundingChunks: GroundingChunk[] | undefined;
 clearHeldGroundingChunks: () => void;
 heldGroundedResponse: GenerateContentResponse | undefined;
 clearHeldGroundedResponse: () => void;
};


export function useLiveApi({
 apiKey,
 map,
 placesLib,
 elevationLib,
 geocoder,
 padding,
}: {
 apiKey: string;
 map: google.maps.maps3d.Map3DElement | null;
 placesLib: google.maps.PlacesLibrary | null;
 elevationLib: google.maps.ElevationLibrary | null;
 geocoder: google.maps.Geocoder | null;
 padding: [number, number, number, number];
}): UseLiveApiResults {
 const { model } = useSettings();
 const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);


 const audioStreamerRef = useRef<AudioStreamer | null>(null);
 const paddingRef = useRef(padding);

 useEffect(() => {
   paddingRef.current = padding;
 }, [padding]);


 const [connected, setConnected] = useState(false);
 const [sessionLost, setSessionLost] = useState(false);
 const [streamerReady, setStreamerReady] = useState(false);
 const [config, setConfig] = useState<LiveConnectConfig>({});
 const [heldGroundingChunks, setHeldGroundingChunks] = useState<
    GroundingChunk[] | undefined
  >(undefined);
 const [heldGroundedResponse, setHeldGroundedResponse] = useState<
    GenerateContentResponse | undefined
  >(undefined);

  const clearHeldGroundingChunks = useCallback(() => {
    setHeldGroundingChunks(undefined);
  }, []);

 const clearHeldGroundedResponse = useCallback(() => {
    setHeldGroundedResponse(undefined);
  }, []);

 // register audio for streaming server -> speakers
 useEffect(() => {
   if (!audioStreamerRef.current) {
     audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
       audioStreamerRef.current = new AudioStreamer(audioCtx);
       setStreamerReady(true);
     });
   }
 }, []);

 // This effect sets up the main event listeners for the GenAILiveClient.
 useEffect(() => {
   const onOpen = () => {
     setConnected(true);
   };

   const onSetupComplete = () => {
     // Send the initial message once the connection is confirmed open and setup is complete.
     client.sendRealtimeText('hello');
   };

   const onClose = (event: CloseEvent) => {
     setConnected(false);
     stopAudioStreamer();

     let reason;
     if (event.code === 1000) {
       // Normal, intentional closure
       reason = "Session ended. Press 'Play' to start a new session.";
       setSessionLost(false);
     } else {
       // Abnormal closure, e.g., network error
       const reasonText = event.reason ? ` Reason: ${event.reason}` : '';
       reason = `Connection lost (Code: ${event.code}). Your session has been saved. Press 'Play' to reconnect.${reasonText}`;
       setSessionLost(true);
     }

     useLogStore.getState().addTurn({
       role: 'agent',
       text: reason,
       isFinal: true,
     });
   };


   const stopAudioStreamer = () => {
     if (audioStreamerRef.current) {
       audioStreamerRef.current.stop();
     }
   };

   const onInterrupted = () => {
    stopAudioStreamer();
    const { updateLastTurn, turns } = useLogStore.getState();
    const lastTurn = turns[turns.length - 1];
    if (lastTurn && !lastTurn.isFinal) {
      updateLastTurn({ isFinal: true });
    }
   };

   const onAudio = (data: ArrayBuffer) => {
     if (audioStreamerRef.current) {
       audioStreamerRef.current.addPCM16(new Uint8Array(data));
     }
   };
   
   const onGenerationComplete = () => {
   };


   // Bind event listeners
   client.on('open', onOpen);
   client.on('setupcomplete', onSetupComplete);
   client.on('close', onClose);
   client.on('interrupted', onInterrupted);
   client.on('audio', onAudio);
   client.on('generationcomplete', onGenerationComplete);

   /**
     * Handles incoming `toolcall` events from the Gemini Live API. This function
     * acts as the central dispatcher for all function calls requested by the model.
     */
   const onToolCall = async (toolCall: LiveServerToolCall) => {
     // A background task should not trigger a loading spinner in the UI.
     const isBackgroundTask = toolCall.functionCalls.every(
        fc => fc.name === 'updateClientProfile'
     );

     if (!isBackgroundTask) {
      useLogStore.getState().setIsAwaitingFunctionResponse(true);
     }

     try {
       const functionResponses: any[] = [];
       const toolContext: ToolContext = {
         map,
         placesLib,
         elevationLib,
         geocoder,
         padding: paddingRef.current,
         setHeldGroundedResponse,
         setHeldGroundingChunks,
       };


       for (const fc of toolCall.functionCalls) {
         // Log the function call trigger
         const triggerMessage = `Triggering function call: **${
           fc.name
         }**\n\`\`\`json\n${JSON.stringify(fc.args, null, 2)}\n\`\`\``;
         useLogStore.getState().addTurn({
           role: 'system',
           text: triggerMessage,
           isFinal: true,
         });


         let toolResponse: GenerateContentResponse | string = 'ok';
         try {
           const toolImplementation = toolRegistry[fc.name];
           if (toolImplementation) {
             toolResponse = await toolImplementation(fc.args, toolContext);
           } else {
             toolResponse = `Unknown tool called: ${fc.name}.`;
             console.warn(toolResponse);
           }


           // Prepare the response to send back to the model
           functionResponses.push({
             id: fc.id,
             name: fc.name,
             response: { result: toolResponse },
           });
         } catch (error) {
           const errorMessage = `Error executing tool ${fc.name}.`;
           console.error(errorMessage, error);
           // Log error to UI
           useLogStore.getState().addTurn({
             role: 'system',
             text: errorMessage,
             isFinal: true,
           });
           // Inform the model about the failure
           functionResponses.push({
             id: fc.id,
             name: fc.name,
             response: { result: errorMessage },
           });
         }
       }


       // Log the function call response
       if (functionResponses.length > 0) {
         const responseMessage = `Function call response:\n\`\`\`json\n${JSON.stringify(
           functionResponses,
           null,
           2,
         )}\n\`\`\``;
         useLogStore.getState().addTurn({
           role: 'system',
           text: responseMessage,
           isFinal: true,
         });
       }


       client.sendToolResponse({ functionResponses: functionResponses });
     } finally {
      if (!isBackgroundTask) {
        useLogStore.getState().setIsAwaitingFunctionResponse(false);
      }
     }
   };


   client.on('toolcall', onToolCall);


   return () => {
     // Clean up event listeners
     client.off('open', onOpen);
     client.off('setupcomplete', onSetupComplete);
     client.off('close', onClose);
     client.off('interrupted', onInterrupted);
     client.off('audio', onAudio);
     client.off('toolcall', onToolCall);
     client.off('generationcomplete', onGenerationComplete);

     // Ensure graceful disconnection when the hook is torn down.
     // This prevents abrupt WebSocket closures that can cause server-side errors.
      if (client.status === 'connected') {
        client.disconnect();
      }
   };
 }, [client, map, placesLib, elevationLib, geocoder, setHeldGroundedResponse, setHeldGroundingChunks]);


 const connect = useCallback(async () => {
   if (!config) {
     throw new Error('config has not been set');
   }
   if (!sessionLost) {
     useLogStore.getState().clearTurns();
     useMapStore.getState().clearMarkers();
     useClientProfileStore.getState().resetProfile();
   }
   setSessionLost(false); // Reset after use
   client.disconnect();
   await client.connect(config);
 }, [client, config, sessionLost]);


 const disconnect = useCallback(async () => {
   client.disconnect();
   setConnected(false);
 }, [setConnected, client]);


 return {
   client,
   config,
   setConfig,
   connect,
   connected,
   disconnect,
   heldGroundingChunks,
   clearHeldGroundingChunks,
   heldGroundedResponse,
   clearHeldGroundedResponse,
   audioStreamer: audioStreamerRef,
 };
}