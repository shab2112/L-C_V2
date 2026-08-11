/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { itineraryPlannerTools } from './tools/itinerary-planner';

export type Template = 'itinerary-planner';

const toolsets: Record<Template, FunctionCall[]> = {
  'itinerary-planner': itineraryPlannerTools,
};

import {
  SYSTEM_INSTRUCTIONS,
  SCAVENGER_HUNT_PROMPT,
} from './constants.ts';
const systemPrompts: Record<Template, string> = {
  'itinerary-planner': SYSTEM_INSTRUCTIONS,
};

import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import {
  GenerateContentResponse,
  FunctionResponse,
  FunctionResponseScheduling,
  LiveServerToolCall,
  GroundingChunk,
} from '@google/genai';
// FIX: Import `Map3DCameraProps` from the correct file where it is defined.
import { Map3DCameraProps } from '@/components/map-3d/map-3d-types';

/**
 * Personas
 */
export const SCAVENGER_HUNT_PERSONA =
  'ClueMaster Cory, the Scavenger Hunt Creator';

export const personas: Record<string, { prompt: string; voice: string }> = {
  [SCAVENGER_HUNT_PERSONA]: {
    prompt: SCAVENGER_HUNT_PROMPT,
    voice: 'Puck',
  },
};

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  isEasterEggMode: boolean;
  activePersona: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
  setPersona: (persona: string) => void;
  activateEasterEggMode: () => void;
}>(set => ({
  systemPrompt: systemPrompts['itinerary-planner'],
  model: DEFAULT_LIVE_API_MODEL,
  voice: DEFAULT_VOICE,
  isEasterEggMode: false,
  activePersona: SCAVENGER_HUNT_PERSONA,
  setSystemPrompt: prompt => set({ systemPrompt: prompt }),
  setModel: model => set({ model }),
  setVoice: voice => set({ voice }),
  setPersona: (persona: string) => {
    if (personas[persona]) {
      set({
        activePersona: persona,
        systemPrompt: personas[persona].prompt,
        voice: personas[persona].voice,
      });
    }
  },
  activateEasterEggMode: () => {
    set(state => {
      if (!state.isEasterEggMode) {
        const persona = SCAVENGER_HUNT_PERSONA;
        return {
          isEasterEggMode: true,
          activePersona: persona,
          systemPrompt: personas[persona].prompt,
          voice: personas[persona].voice,
          model: 'gemini-live-2.5-flash-preview', // gemini-2.5-flash-preview-native-audio-dialog
        };
      }
      return {};
    });
  },
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  showSystemMessages: boolean;
  toggleShowSystemMessages: () => void;
  sidebarView: 'settings' | 'favorites';
  setSidebarView: (view: 'settings' | 'favorites') => void;
}>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  showSystemMessages: false,
  toggleShowSystemMessages: () =>
    set(state => ({ showSystemMessages: !state.showSystemMessages })),
  sidebarView: 'settings',
  setSidebarView: (view) => set({ sidebarView: view }),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}



export const useTools = create<{
  tools: FunctionCall[];
  template: Template;
  setTemplate: (template: Template) => void;
}>(set => ({
  tools: itineraryPlannerTools,
  template: 'itinerary-planner',
  setTemplate: (template: Template) => {
    set({ tools: toolsets[template], template });
    useSettings.getState().setSystemPrompt(systemPrompts[template]);
  },
}));

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
  toolResponse?: GenerateContentResponse;
}

export const useLogStore = create<{
  turns: ConversationTurn[];
  isAwaitingFunctionResponse: boolean;
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  mergeIntoLastAgentTurn: (
    update: Omit<ConversationTurn, 'timestamp' | 'role'>,
  ) => void;
  clearTurns: () => void;
  setTurns: (turns: ConversationTurn[]) => void;
  userId: string | null;
  sessionId: string | null;
  setIsAwaitingFunctionResponse: (isAwaiting: boolean) => void;
  setSession: (userId: string | null, sessionId: string | null) => void;
}>((set, get) => ({
  turns: [],
  isAwaitingFunctionResponse: false,
  userId: null,
  sessionId: null,
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
  setTurns: (turns) => set({ turns }),
  updateLastTurn: (update: Partial<Omit<ConversationTurn, 'timestamp'>>) => {
    set(state => {
      if (state.turns.length === 0) {
        return state;
      }
      const newTurns = [...state.turns];
      const lastTurn = { ...newTurns[newTurns.length - 1], ...update };
      newTurns[newTurns.length - 1] = lastTurn;
      return { turns: newTurns };
    });
  },
  mergeIntoLastAgentTurn: (
    update: Omit<ConversationTurn, 'timestamp' | 'role'>,
  ) => {
    set(state => {
      const turns = state.turns;
      const lastAgentTurnIndex = turns.map(t => t.role).lastIndexOf('agent');

      if (lastAgentTurnIndex === -1) {
        // Fallback: add a new turn.
        return {
          turns: [
            ...turns,
            { ...update, role: 'agent', timestamp: new Date() } as ConversationTurn,
          ],
        };
      }

      const lastAgentTurn = turns[lastAgentTurnIndex];
      const mergedTurn: ConversationTurn = {
        ...lastAgentTurn,
        text: lastAgentTurn.text + (update.text || ''),
        isFinal: update.isFinal,
        groundingChunks: [
          ...(lastAgentTurn.groundingChunks || []),
          ...(update.groundingChunks || []),
        ],
        toolResponse: update.toolResponse || lastAgentTurn.toolResponse,
      };

      // Rebuild the turns array, replacing the old agent turn.
      const newTurns = [...turns];
      newTurns[lastAgentTurnIndex] = mergedTurn;


      return { turns: newTurns };
    });
  },
  clearTurns: () => set({ turns: [] }),
  setIsAwaitingFunctionResponse: isAwaiting =>
    set({ isAwaitingFunctionResponse: isAwaiting }),
  setSession: (userId, sessionId) => set({ userId, sessionId }),
}));

/**
 * Map Entities
 */
export interface MapMarker {
  position: {
    lat: number;
    lng: number;
    altitude: number;
  };
  label: string;
  showLabel: boolean;
}

export const useMapStore = create<{
  markers: MapMarker[];
  cameraTarget: Map3DCameraProps | null;
  preventAutoFrame: boolean;
  setMarkers: (markers: MapMarker[]) => void;
  clearMarkers: () => void;
  setCameraTarget: (target: Map3DCameraProps | null) => void;
  setPreventAutoFrame: (prevent: boolean) => void;
}>(set => ({
  markers: [],
  cameraTarget: null,
  preventAutoFrame: false,
  setMarkers: markers => set({ markers }),
  clearMarkers: () => set({ markers: [] }),
  setCameraTarget: target => set({ cameraTarget: target }),
  setPreventAutoFrame: prevent => set({ preventAutoFrame: prevent }),
}));

/**
 * Client Profile
 */
export interface ClientProfile {
  projectInterestedIn?: string;
  budget?: string;
  communitiesInterestedIn?: string;
  workLocation?: string;
  maxBedrooms?: string;
  maxBathrooms?: string;
  property_type?: string;
  project_type?: string;
  age?: string;
  salary?: string;
  isFirstProperty?: string;
  purpose?: string;
  downpaymentReady?: string;
  isMarried?: string;
  childrenCount?: string;
  specificRequirements?: string;
  handoverConsideration?: string;
  needsMortgageAgent?: string;
  needsGoldenVisa?: string;
}

const multiValueFields: ReadonlyArray<keyof ClientProfile> = [
  'communitiesInterestedIn',
  'projectInterestedIn',
  'specificRequirements',
  'property_type',
];

export const useClientProfileStore = create<{
  profile: ClientProfile;
  updateProfile: (field: keyof ClientProfile, value: string) => void;
  resetProfile: () => void;
}>((set) => ({
  profile: {},
  updateProfile: (field, value) => set(state => {
    const currentProfile = state.profile;
    const existingValue = currentProfile[field];
    let finalValue = value;

    if (multiValueFields.includes(field)) {
      if (existingValue) {
        // Use a Set for efficient duplicate checking.
        const existingSet = new Set(existingValue.split(', ').map(v => v.trim()));
        if (!existingSet.has(value.trim())) {
          finalValue = `${existingValue}, ${value}`;
        } else {
          finalValue = existingValue; // Value already exists, no change needed.
        }
      }
    }

    // Only update state if the value has actually changed to prevent unnecessary re-renders.
    if (currentProfile[field] === finalValue) {
      return state;
    }

    return {
      profile: {
        ...currentProfile,
        [field]: finalValue
      }
    };
  }),
  resetProfile: () => set({ profile: {} }),
}));

/**
 * Favorites
 */
export interface FavoriteProject {
  id: string;
  name: string;
  community: string;
  imageUrl: string;
  features: string[];
  notes: string;
  project_specs?: {
    avg_price_per_sqft: number;
    unit_types: {
      unit_type: string;
      avg_size_sqft: number;
    }[];
  };
  starting_price: number;
  project_type: string;
  propertyType: string;
  service_charge: number;
}

export const useFavoritesStore = create(
  persist<{
    favorites: FavoriteProject[];
    addProject: (project: Omit<FavoriteProject, 'id' | 'notes'>) => void;
    updateNotes: (projectId: string, notes: string) => void;
    removeProject: (projectId: string) => void;
  }>(
    (set) => ({
      favorites: [],
      addProject: (project) => set((state) => {
        const existingIndex = state.favorites.findIndex(
          (p) => p.name.toLowerCase() === project.name.toLowerCase()
        );

        if (existingIndex > -1) {
          // Project exists, update it.
          const updatedFavorites = [...state.favorites];
          const existingProject = updatedFavorites[existingIndex];
          // Preserve the original ID and any notes the user has already made.
          updatedFavorites[existingIndex] = {
            ...existingProject, // Keep old id and notes
            ...project, // Overwrite with new data
          };
          return { favorites: updatedFavorites };
        } else {
          // Project doesn't exist, add it as new.
          const newProject = {
            ...project,
            id: `${project.name}-${Date.now()}`,
            notes: '' // Start with empty notes
          };
          return { favorites: [...state.favorites, newProject] };
        }
      }),
      updateNotes: (projectId, notes) => set((state) => ({
        favorites: state.favorites.map(p =>
          p.id === projectId ? { ...p, notes } : p
        )
      })),
      removeProject: (projectId) => set((state) => ({
        favorites: state.favorites.filter(p => p.id !== projectId)
      })),
    }),
    {
      name: 'real-estate-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Auth
 */
import { User } from '@/types';

export const useAuthStore = create<{
  user: User | null;
  setUser: (user: User | null) => void;
}>(set => ({
  user: null,
  setUser: user => set({ user }),
}));