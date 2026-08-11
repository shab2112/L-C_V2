/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const itineraryPlannerTools: FunctionCall[] = [
  {
    name: 'mapsGrounding',
    description: `A tool that uses Google Maps data to find nearby points of interest (amenities) like schools, hospitals, malls, or restaurants.`,
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'A search query, like "schools near Dubai Hills Estate" or "restaurants in Downtown Dubai". You MUST be as precise as possible.',
        },
        markerBehavior: {
          type: 'STRING',
          description:
            'Controls which results get markers. "mentioned" for places in the text response, "all" for all search results, or "none" for no markers.',
          enum: ['mentioned', 'all', 'none'],
        },
      },
      required: ['query'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'locateCommunity',
    description: 'Call this function to display a specific Dubai community on the map. This provides a wide, establishing shot of the area.',
    parameters: {
      type: 'OBJECT',
      properties: {
        communityName: {
          type: 'STRING',
          description: 'The name of the Dubai community to locate (e.g., "Dubai Hills Estate", "Palm Jumeirah").',
        },
      },
      required: ['communityName'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'findProjects',
    description: 'Finds and displays real estate projects on the map within a specific community. It adds markers for each project found.',
    parameters: {
      type: 'OBJECT',
      properties: {
        communityName: {
          type: 'STRING',
          description: 'The name of the community where to search for projects.',
        },
        projectType: {
          type: 'STRING',
          description: 'The type of project to search for (e.g., "Villas", "Apartments", "Off-plan").',
        },
      },
      required: ['communityName', 'projectType'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'updateClientProfile',
    description: 'Updates a specific field in the client\'s profile with an extracted value. This should be called discreetly in the background whenever a piece of client information is identified.',
    parameters: {
      type: 'OBJECT',
      properties: {
        fieldName: {
          type: 'STRING',
          description: 'The name of the profile field to update.',
          enum: [
            'projectInterestedIn', 'budget', 'communitiesInterestedIn', 'workLocation',
            'maxBedrooms', 'maxBathrooms', 'property_type', 'project_type', 'age', 
            'salary', 'isFirstProperty', 'purpose', 'downpaymentReady', 'isMarried', 
            'childrenCount', 'specificRequirements', 'handoverConsideration', 
            'needsMortgageAgent', 'needsGoldenVisa'
          ]
        },
        fieldValue: {
          type: 'STRING',
          description: 'The value extracted from the conversation to store in the profile field. For boolean fields, use "true" or "false".',
        },
      },
      required: ['fieldName', 'fieldValue'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'addProjectToFavorites',
    description: 'Saves a real estate project to the user\'s personal favorites list for later review. It finds an image and extracts key features from the conversation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        projectName: {
          type: 'STRING',
          description: 'The full name of the project to save (e.g., "Maple at Dubai Hills").',
        },
        communityName: {
          type: 'STRING',
          description: 'The name of the community the project is in (e.g., "Dubai Hills Estate").',
        },
      },
      required: ['projectName', 'communityName'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'getProjectDetails',
    description: 'Retrieves and lists the amenities for a specific real estate project.',
    parameters: {
      type: 'OBJECT',
      properties: {
        projectName: {
          type: 'STRING',
          description: 'The name of the project to get details for (e.g., "Maple at Dubai Hills").',
        },
      },
      required: ['projectName'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];
