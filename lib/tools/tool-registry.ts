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

import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import { fetchMapsGroundedResponseREST } from '@/lib/maps-grounding';
import { MapMarker, useLogStore, useMapStore, useClientProfileStore, useFavoritesStore, ClientProfile } from '@/lib/state';
import { fetchSearchGroundedResponse } from '@/lib/search-grounding';

// Hardcoded data for Dubai communities and projects to simulate a database API
const dubaiCommunities: Record<string, { lat: number; lng: number }> = {
  'the oasis by emaar': { lat: 24.9926, lng: 55.3045 },
  'dubai creek harbour': { lat: 25.2069, lng: 55.3394 },
  'sobha hartland ii': { lat: 25.1763, lng: 55.3117 },
  'business bay': { lat: 25.1834, lng: 55.2709 },
  'damac lagoons': { lat: 25.0435, lng: 55.2443 },
  'palm jumeirah': { lat: 25.1189, lng: 55.1383 },
  'al barari': { lat: 25.0978, lng: 55.3582 },
  "za'abeel": { lat: 25.2285, lng: 55.2952 },
  'dubai marina': { lat: 25.0784, lng: 55.1384 },
  'dubai hills estate': { lat: 25.1118, lng: 55.2575 },
  'downtown dubai': { lat: 25.1972, lng: 55.2744 },
  'arabian ranches': { lat: 25.0493, lng: 55.2818 },
  'arabian ranches 2': { lat: 25.0381, lng: 55.2671 },
  'arabian ranches 3': { lat: 25.0567, lng: 55.3194 },
  'jumeirah beach residence': { lat: 25.0770, lng: 55.1330 },
};

type Project = {
  name: string;
  type: string; // Apartment, Villa, Townhouse
  position: { lat: number; lng: number };
  amenities: string[];
  location_description: string;
  launch_date: string;
  handover_date_normalized: string;
  project_type: 'Off-plan' | 'Ready' | 'For Rent';
  starting_price: number;
  currency_code: string;
  service_charge: number;
  is_freehold: boolean;
  project_image_url: string;
  project_specs?: {
    avg_price_per_sqft: number;
    unit_types: {
      unit_type: string;
      avg_size_sqft: number;
    }[];
  };
};

const realEstateProjects: Record<string, Project[]> = {
  'the oasis by emaar': [
    { name: 'Palmiera Villas', type: 'Villas', position: { lat: 24.9930, lng: 55.3050 }, amenities: ['Private Lagoon Access', 'Community Parks', 'Fitness Centers', 'Gated Community'], location_description: 'Luxurious villas nestled within a green oasis with swimmable lagoons.', launch_date: '2023-06-01', handover_date_normalized: '2026-12-31', project_type: 'Off-plan', starting_price: 8000000, currency_code: 'AED', service_charge: 5, is_freehold: true, project_image_url: 'https://cdn.properties.emaar.com/wp-content/uploads/2024/05/PRO_EXT_1-1-670x500.jpg', project_specs: { avg_price_per_sqft: 1600, unit_types: [ { unit_type: '4 BR Villa', avg_size_sqft: 5000 }, { unit_type: '5 BR Villa', avg_size_sqft: 6000 } ] } },
    { name: 'Mirage at The Oasis', type: 'Villas', position: { lat: 24.9920, lng: 55.3040 }, amenities: ['Resort-style Pool', 'Kids Play Area', 'Landscaped Gardens', '24/7 Security'], location_description: 'Exclusive waterfront villas offering a serene and upscale lifestyle.', launch_date: '2023-09-10', handover_date_normalized: '2027-03-31', project_type: 'Off-plan', starting_price: 9500000, currency_code: 'AED', service_charge: 5, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Mirage+at+The+Oasis', project_specs: { avg_price_per_sqft: 1750, unit_types: [ { unit_type: '5 BR Villa', avg_size_sqft: 5500 }, { unit_type: '6 BR Villa', avg_size_sqft: 7000 } ] } },
    { name: 'Armonia Villas', type: 'Villas', position: { lat: 24.9940, lng: 55.3060 }, amenities: ['Linear Park', 'Community Center', 'Swimmable Lagoon', 'Gated Community'], location_description: 'A new cluster of luxury villas with a focus on harmonious living and nature.', launch_date: '2024-03-01', handover_date_normalized: '2027-09-30', project_type: 'Off-plan', starting_price: 10000000, currency_code: 'AED', service_charge: 5, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Armonia+Villas', project_specs: { avg_price_per_sqft: 1800, unit_types: [ { unit_type: '4 BR Villa', avg_size_sqft: 5600 }, { unit_type: '5 BR Villa', avg_size_sqft: 6500 } ] } },
    { name: 'Faux Rental Villa 1', type: 'Villas', position: { lat: 24.9950, lng: 55.3070 }, amenities: ['Community Pool', 'Playground', '24/7 Security'], location_description: 'A spacious villa available for rent in a family-friendly community.', launch_date: '2022-01-01', handover_date_normalized: '2023-01-01', project_type: 'For Rent', starting_price: 450000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Rental+Villa' },
    { name: 'Faux Rental Villa 2', type: 'Villas', position: { lat: 24.9960, lng: 55.3080 }, amenities: ['Private Garden', 'Shared Gym', 'Covered Parking'], location_description: 'Modern rental villa with premium finishes and access to community facilities.', launch_date: '2022-01-01', handover_date_normalized: '2023-01-01', project_type: 'For Rent', starting_price: 500000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Modern+Rental+Villa' },
  ],
  'dubai creek harbour': [
    { name: 'Creek Waters 2', type: 'Apartments', position: { lat: 25.2075, lng: 55.3400 }, amenities: ['Infinity Pool', 'State-of-the-art Gym', 'Creek Beach Access', 'Viewing Decks'], location_description: 'A striking waterfront apartment tower with unparalleled views of the creek and Dubai skyline.', launch_date: '2023-03-15', handover_date_normalized: '2027-09-30', project_type: 'Off-plan', starting_price: 1700000, currency_code: 'AED', service_charge: 20, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Creek+Waters+2', project_specs: { avg_price_per_sqft: 2000, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 800 }, { unit_type: '2 BR', avg_size_sqft: 1200 }, { unit_type: '3 BR', avg_size_sqft: 1800 } ] } },
    { name: 'Oria by Emaar', type: 'Apartments', position: { lat: 25.2060, lng: 55.3380 }, amenities: ['Yoga Lawn', 'Indoor & Outdoor Gyms', 'Children’s Pool & Splash Pad', 'BBQ Picnic Areas'], location_description: 'Urban living redefined, with contemporary residences and stunning views of the Dubai Creek.', launch_date: '2024-02-20', handover_date_normalized: '2028-06-30', project_type: 'Off-plan', starting_price: 1800000, currency_code: 'AED', service_charge: 21, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Oria+by+Emaar', project_specs: { avg_price_per_sqft: 2100, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 850 }, { unit_type: '2 BR', avg_size_sqft: 1300 }, { unit_type: '3 BR', avg_size_sqft: 1900 } ] } },
    { name: 'Savanna', type: 'Apartments', position: { lat: 25.2050, lng: 55.3370 }, amenities: ['Landscaped Gardens', 'Community Pool', 'Kids Play Area', 'Multi-purpose Room'], location_description: 'Apartments adjacent to a lush park, offering a tranquil environment for families.', launch_date: '2023-03-01', handover_date_normalized: '2026-12-31', project_type: 'Off-plan', starting_price: 1300000, currency_code: 'AED', service_charge: 18, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Savanna', project_specs: { avg_price_per_sqft: 1800, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 750 }, { unit_type: '2 BR', avg_size_sqft: 1100 } ] } },
    { name: 'Creek Rise', type: 'Apartments', position: { lat: 25.2085, lng: 55.3410 }, amenities: ['Temperature-controlled Pool', 'Modern Gym', 'Children\'s Play Area', 'Landscaped Leisure Deck'], location_description: 'A ready two-tower residential project offering stunning views of the Creek Island.', launch_date: '2017-01-01', handover_date_normalized: '2020-01-01', project_type: 'For Rent', starting_price: 120000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Creek+Rise+Rental' },
    { name: 'Harbour Gate', type: 'Apartments', position: { lat: 25.2095, lng: 55.3420 }, amenities: ['Gymnasium', 'Swimming Pools', 'Leisure Deck', 'Direct Park Access'], location_description: 'Apartments for rent in a gateway to the island district, offering park and water views.', launch_date: '2017-01-01', handover_date_normalized: '2020-01-01', project_type: 'For Rent', starting_price: 135000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Harbour+Gate+Rental' },
  ],
  'sobha hartland ii': [
    { name: '310 Waterfront Villas', type: 'Villas', position: { lat: 25.1770, lng: 55.3120 }, amenities: ['Private Gardens', 'Smart Home Technology', 'Waterfront Views', 'Community Clubhouse'], location_description: 'A premium collection of waterfront villas surrounded by lush greenery and blue lagoons.', launch_date: '2023-01-15', handover_date_normalized: '2025-12-31', project_type: 'Off-plan', starting_price: 22000000, currency_code: 'AED', service_charge: 6, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=310+Waterfront+Villas', project_specs: { avg_price_per_sqft: 2500, unit_types: [ { unit_type: '5 BR Villa', avg_size_sqft: 8500 }, { unit_type: '6 BR Villa', avg_size_sqft: 10000 } ] } },
    { name: 'Sobha Estates', type: 'Villas', position: { lat: 25.1750, lng: 55.3110 }, amenities: ['Forest Landscapes', 'Blue Lagoons', 'Walking & Cycling Trails', 'High-end Finishes'], location_description: 'An exclusive gated community of villas set amidst a private forest landscape.', launch_date: '2022-11-01', handover_date_normalized: '2025-09-30', project_type: 'Off-plan', starting_price: 15000000, currency_code: 'AED', service_charge: 6, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Sobha+Estates', project_specs: { avg_price_per_sqft: 2200, unit_types: [ { unit_type: '4 BR Villa', avg_size_sqft: 7000 }, { unit_type: '5 BR Villa', avg_size_sqft: 8000 } ] } },
  ],
  'business bay': [
    { name: 'Burj Binghatti Jacob & Co Residences', type: 'Apartments', position: { lat: 25.1840, lng: 55.2715 }, amenities: ['Concierge Services', 'Private Chef Services', 'Infinity Pool overlooking Dubai', 'Luxury Spa'], location_description: 'An ultra-luxury branded skyscraper aspiring to be the world\'s tallest residential tower.', launch_date: '2023-05-20', handover_date_normalized: '2027-06-30', project_type: 'Off-plan', starting_price: 8000000, currency_code: 'AED', service_charge: 25, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Burj+Binghatti', project_specs: { avg_price_per_sqft: 3500, unit_types: [ { unit_type: '2 BR Suite', avg_size_sqft: 2200 }, { unit_type: '3 BR Suite', avg_size_sqft: 3000 } ] } },
    { name: 'Altitude by DAMAC', type: 'Apartments', position: { lat: 25.1850, lng: 55.2725 }, amenities: ['Zero-gravity Pods', 'Canal Views', 'Swimming Pool', 'State-of-the-art Gym'], location_description: 'A luxury off-plan tower offering stunning views of the Dubai Canal.', launch_date: '2024-01-15', handover_date_normalized: '2027-12-31', project_type: 'Off-plan', starting_price: 1500000, currency_code: 'AED', service_charge: 22, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Altitude+by+DAMAC', project_specs: { avg_price_per_sqft: 2200, unit_types: [ { unit_type: 'Studio', avg_size_sqft: 450 }, { unit_type: '1 BR', avg_size_sqft: 750 }, { unit_type: '2 BR', avg_size_sqft: 1100 } ] } },
    { name: 'Volta by DAMAC', type: 'Apartments', position: { lat: 25.1860, lng: 55.2735 }, amenities: ['Sky Yoga', 'Aqua Gym', 'Trampoline Park', '24/7 Valet & Concierge'], location_description: 'A fitness-focused residential tower on Sheikh Zayed Road.', launch_date: '2023-09-01', handover_date_normalized: '2028-06-30', project_type: 'Off-plan', starting_price: 1670000, currency_code: 'AED', service_charge: 23, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Volta+by+DAMAC', project_specs: { avg_price_per_sqft: 2300, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 800 }, { unit_type: '2 BR', avg_size_sqft: 1200 }, { unit_type: '3 BR', avg_size_sqft: 1700 } ] } },
    { name: 'Executive Towers', type: 'Apartments', position: { lat: 25.1870, lng: 55.2745 }, amenities: ['Bay Avenue Mall Access', 'Shared Pools', 'Gyms', 'Landscaped Plazas'], location_description: 'A landmark mixed-use complex offering apartments for rent in the heart of Business Bay.', launch_date: '2005-01-01', handover_date_normalized: '2009-01-01', project_type: 'For Rent', starting_price: 110000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Executive+Towers+Rental' },
    { name: 'DAMAC Towers by Paramount', type: 'Apartments', position: { lat: 25.1880, lng: 55.2755 }, amenities: ['Private Cinema', 'Rooftop Infinity Pool', 'Wellness & Fitness Centre', 'Kids Studio Club'], location_description: 'Hollywood-inspired serviced apartments for rent with luxury amenities.', launch_date: '2013-01-01', handover_date_normalized: '2019-01-01', project_type: 'For Rent', starting_price: 150000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Paramount+Towers+Rental' },
  ],
  'damac lagoons': [
    { name: 'Morocco at DAMAC Lagoons', type: 'Townhouse', position: { lat: 25.0440, lng: 55.2450 }, amenities: ['Serene Yoga Hubs', 'Argan Oil Treatment Spa', 'Botanical Gardens', 'Outdoor Art Installations'], location_description: 'A tranquil retreat with Moroccan-inspired townhouses and villas.', launch_date: '2023-04-01', handover_date_normalized: '2026-10-31', project_type: 'Off-plan', starting_price: 2900000, currency_code: 'AED', service_charge: 4, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Morocco+Lagoons', project_specs: { avg_price_per_sqft: 1200, unit_types: [ { unit_type: '4 BR Townhouse', avg_size_sqft: 2400 }, { unit_type: '5 BR Townhouse', avg_size_sqft: 3000 } ] } },
    { name: 'Mykonos at DAMAC Lagoons', type: 'Townhouse', position: { lat: 25.0430, lng: 55.2460 }, amenities: ['Floating Gardens', 'Beach Club', 'Cobblestone Streets', 'Windmill Park'], location_description: 'Experience the charm of the Greek isles with these vibrant townhouses.', launch_date: '2022-11-20', handover_date_normalized: '2025-12-31', project_type: 'Off-plan', starting_price: 2500000, currency_code: 'AED', service_charge: 4, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Mykonos+Lagoons', project_specs: { avg_price_per_sqft: 1150, unit_types: [ { unit_type: '3 BR Townhouse', avg_size_sqft: 2200 }, { unit_type: '4 BR Townhouse', avg_size_sqft: 2600 } ] } },
  ],
  'palm jumeirah': [
    { name: 'ELA by Omniyat', type: 'Apartments', position: { lat: 25.1090, lng: 55.1260 }, amenities: ['Private Beach Access', 'Wellness Spa', 'Yacht Concierge', 'Residents Lounge'], location_description: 'An ultra-exclusive residential project on the iconic Palm Jumeirah crescent.', launch_date: '2023-11-01', handover_date_normalized: '2026-12-31', project_type: 'Off-plan', starting_price: 35000000, currency_code: 'AED', service_charge: 30, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=ELA+by+Omniyat', project_specs: { avg_price_per_sqft: 7000, unit_types: [ { unit_type: '3 BR Apartment', avg_size_sqft: 5000 }, { unit_type: '4 BR Apartment', avg_size_sqft: 6500 } ] } },
    { name: 'Como Residences', type: 'Apartments', position: { lat: 25.1125, lng: 55.1490 }, amenities: ['Rooftop Infinity Pool', 'Private Elevators', '360-degree Panoramic Views', 'Exclusive Beach Club'], location_description: 'A 76-storey tower offering one residence per floor, defining privacy and luxury.', launch_date: '2023-05-15', handover_date_normalized: '2027-09-30', project_type: 'Off-plan', starting_price: 21000000, currency_code: 'AED', service_charge: 28, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Como+Residences', project_specs: { avg_price_per_sqft: 4500, unit_types: [ { unit_type: '3 BR Apartment', avg_size_sqft: 4500 }, { unit_type: '5 BR Apartment', avg_size_sqft: 7000 } ] } },
    { name: 'Six Senses Residences', type: 'Villas', position: { lat: 25.1110, lng: 55.1275 }, amenities: ['Six Senses Spa', 'Wellness Club', 'Central Garden', 'Tennis Court', 'Padel Court'], location_description: 'A beachfront development focused on wellness and sustainability, offering penthouses and villas.', launch_date: '2022-01-26', handover_date_normalized: '2024-12-31', project_type: 'Off-plan', starting_price: 9400000, currency_code: 'AED', service_charge: 28, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Six+Senses', project_specs: { avg_price_per_sqft: 4000, unit_types: [ { unit_type: '2 BR Penthouse', avg_size_sqft: 2200 }, { unit_type: '4 BR Royal Villa', avg_size_sqft: 8000 } ] } },
    { name: 'Atlantis The Royal Residences', type: 'Apartments', position: { lat: 25.1385, lng: 55.1205 }, amenities: ['Sky Pool & Lounge', 'Private Beach Club', 'Celebrity Chef Restaurants', 'Aquaventure Waterpark Access'], location_description: 'An iconic architectural landmark offering a collection of sky courts, penthouses, and garden suites.', launch_date: '2017-03-01', handover_date_normalized: '2023-02-10', project_type: 'Ready', starting_price: 7500000, currency_code: 'AED', service_charge: 35, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Atlantis+The+Royal', project_specs: { avg_price_per_sqft: 5500, unit_types: [ { unit_type: '2 BR Apartment', avg_size_sqft: 1800 }, { unit_type: '3 BR Apartment', avg_size_sqft: 2500 } ] } },
    { name: 'One at Palm Jumeirah', type: 'Apartments', position: { lat: 25.1070, lng: 55.1240 }, amenities: ['Private Jetty', 'Landscaped Gardens by Vladimir Djurovic', 'Indoor Lap Pool', 'Luxury Cinema'], location_description: 'Managed by Dorchester Collection, this is an architectural masterpiece with unparalleled views and services.', launch_date: '2015-02-01', handover_date_normalized: '2021-12-31', project_type: 'Ready', starting_price: 15000000, currency_code: 'AED', service_charge: 32, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=One+at+Palm', project_specs: { avg_price_per_sqft: 6000, unit_types: [ { unit_type: '3 BR Apartment', avg_size_sqft: 3000 }, { unit_type: '4 BR Apartment', avg_size_sqft: 4500 } ] } },
    { name: 'Golden Mile', type: 'Apartments', position: { lat: 25.1105, lng: 55.1485 }, amenities: ['Golden Mile Galleria Mall', 'Park Access', 'Swimming Pools', 'Health Club'], location_description: 'A residential and retail boulevard offering apartments for rent on the trunk of the Palm.', launch_date: '2006-01-01', handover_date_normalized: '2015-01-01', project_type: 'For Rent', starting_price: 180000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Golden+Mile+Rental' },
    { name: 'Shoreline Apartments', type: 'Apartments', position: { lat: 25.1145, lng: 55.1525 }, amenities: ['Private Beach Access', 'Clubhouses with Gyms', 'Infinity Pools', 'Children\'s Playgrounds'], location_description: 'A collection of 20 residential buildings on the east side of the trunk, popular for rentals.', launch_date: '2004-01-01', handover_date_normalized: '2007-01-01', project_type: 'For Rent', starting_price: 160000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Shoreline+Rental' },
  ],
  'al barari': [
    { name: 'Chorisia Villas Phase 3', type: 'Villas', position: { lat: 25.0985, lng: 55.3590 }, amenities: ['Private Pools', 'Rooftop Terraces', 'Lush Green Surroundings', 'Water Features'], location_description: 'A nature-themed luxury villa community focused on green architecture and privacy.', launch_date: '2022-08-10', handover_date_normalized: '2024-12-31', project_type: 'Ready', starting_price: 12000000, currency_code: 'AED', service_charge: 7, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Chorisia+Villas', project_specs: { avg_price_per_sqft: 2000, unit_types: [ { unit_type: '5 BR Villa', avg_size_sqft: 6000 }, { unit_type: '6 BR Villa', avg_size_sqft: 7500 } ] } },
  ],
  "za'abeel": [
    { name: 'One Za’abeel', type: 'Apartments', position: { lat: 25.2290, lng: 55.2960 }, amenities: ['The Link Skybridge', 'Michelin-starred Restaurants', 'Rooftop Infinity Pool', 'Luxury Retail Outlets'], location_description: 'Iconic mixed-use development with two towers connected by the world\'s longest cantilever.', launch_date: '2018-01-01', handover_date_normalized: '2023-12-01', project_type: 'Ready', starting_price: 3900000, currency_code: 'AED', service_charge: 26, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=One+Zaabeel', project_specs: { avg_price_per_sqft: 3200, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 1200 }, { unit_type: '2 BR', avg_size_sqft: 1800 } ] } },
  ],
  'dubai marina': [
    { name: 'Ciel Tower', type: 'Apartments', position: { lat: 25.0850, lng: 55.1450 }, amenities: ['Rooftop Observation Deck', 'Luxury Hotel Amenities', 'Multiple Swimming Pools', 'World-class Spa'], location_description: 'An 82-floor hotel and residential tower set to be the tallest hotel in the world.', launch_date: '2019-03-01', handover_date_normalized: '2024-12-31', project_type: 'Off-plan', starting_price: 2000000, currency_code: 'AED', service_charge: 22, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Ciel+Tower', project_specs: { avg_price_per_sqft: 2500, unit_types: [ { unit_type: 'Studio', avg_size_sqft: 500 }, { unit_type: '1 BR', avg_size_sqft: 900 } ] } },
  ],
  'dubai hills estate': [
    { name: 'Maple at Dubai Hills', type: 'Townhouse', position: { lat: 25.1050, lng: 55.2590 }, amenities: ['Community Pool', 'Cycle Path', 'Dubai Hills Mall Access', '18-Hole Golf Course'], location_description: 'A popular community of contemporary townhouses along a network of green corridors.', launch_date: '2016-05-01', handover_date_normalized: '2019-06-30', project_type: 'Ready', starting_price: 2500000, currency_code: 'AED', service_charge: 3, is_freehold: true, project_image_url: 'https://properties.emaar.com/wp-content/uploads/2020/07/MAPLE_CYCLING-1.jpg', project_specs: { avg_price_per_sqft: 1300, unit_types: [ { unit_type: '3 BR Townhouse', avg_size_sqft: 2200 }, { unit_type: '4 BR Townhouse', avg_size_sqft: 2400 }, { unit_type: '5 BR Townhouse', avg_size_sqft: 2700 } ] } },
    { name: 'Sidra Villas', type: 'Villas', position: { lat: 25.1080, lng: 55.2630 }, amenities: ['Private Gardens', 'Community Parks', 'Dubai Hills Golf Club', 'GEMS Schools Nearby'], location_description: 'An exclusive community of premium villas offering a tranquil and upscale family lifestyle.', launch_date: '2015-01-01', handover_date_normalized: '2018-12-31', project_type: 'Ready', starting_price: 4500000, currency_code: 'AED', service_charge: 4, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Sidra+Villas', project_specs: { avg_price_per_sqft: 1450, unit_types: [ { unit_type: '3 BR Villa', avg_size_sqft: 3100 }, { unit_type: '4 BR Villa', avg_size_sqft: 3500 }, { unit_type: '5 BR Villa', avg_size_sqft: 4200 } ] } },
    { name: 'Park Heights', type: 'Apartments', position: { lat: 25.1150, lng: 55.2550 }, amenities: ['Infinity Pool', 'Gymnasium', 'Dubai Hills Park Access', 'Retail Outlets'], location_description: 'A modern apartment complex with direct access to the expansive Dubai Hills Park.', launch_date: '2017-01-01', handover_date_normalized: '2020-06-30', project_type: 'Ready', starting_price: 1200000, currency_code: 'AED', service_charge: 16, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Park+Heights', project_specs: { avg_price_per_sqft: 1600, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 700 }, { unit_type: '2 BR', avg_size_sqft: 1100 }, { unit_type: '3 BR', avg_size_sqft: 1600 } ] } },
    { name: 'Golf Place', type: 'Villas', position: { lat: 25.1190, lng: 55.2650 }, amenities: ['Views of the Golf Course', 'Private Gardens', 'Luxury Finishes', 'Community Clubhouse'], location_description: 'A prestigious collection of luxurious villas set directly on the 18-hole championship golf course.', launch_date: '2018-06-01', handover_date_normalized: '2022-12-31', project_type: 'Ready', starting_price: 10000000, currency_code: 'AED', service_charge: 5, is_freehold: true, project_image_url: 'https://properties.emaar.com/wp-content/uploads/2021/03/1620x832_C-1.jpg', project_specs: { avg_price_per_sqft: 1800, unit_types: [ { unit_type: '4 BR Villa', avg_size_sqft: 5500 }, { unit_type: '5 BR Villa', avg_size_sqft: 6500 }, { unit_type: '6 BR Villa', avg_size_sqft: 8000 } ] } },
    { name: 'Collective 2.0', type: 'Apartments', position: { lat: 25.1165, lng: 55.2535 }, amenities: ['Co-working Spaces', 'Library', 'Games Room', 'Padel Tennis Court', 'Rooftop Pool'], location_description: 'Contemporary apartments designed for a modern, social lifestyle, ideal for young professionals and couples.', launch_date: '2018-01-01', handover_date_normalized: '2021-12-31', project_type: 'For Rent', starting_price: 90000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Collective+2.0+Rental' },
  ],
  'downtown dubai': [
    { name: 'W Residences Downtown', type: 'Apartments', position: { lat: 25.1960, lng: 55.2790 }, amenities: ['W Hotel Amenities', 'Infinity Pool', 'Private Cinema', 'Co-working Space'], location_description: 'Luxury branded residences offering hotel-inspired living next to the Burj Khalifa.', launch_date: '2021-01-01', handover_date_normalized: '2025-12-31', project_type: 'Off-plan', starting_price: 2100000, currency_code: 'AED', service_charge: 25, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=W+Residences', project_specs: { avg_price_per_sqft: 2800, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 800 }, { unit_type: '2 BR', avg_size_sqft: 1300 } ] } },
    { name: 'St. Regis Residences', type: 'Apartments', position: { lat: 25.1915, lng: 55.2795 }, amenities: ['St. Regis Butler Service', 'F&B Outlets', 'Cigar Lounge', 'Cognac Room'], location_description: 'Ultra-luxury apartments in the Opera District with premium services and amenities.', launch_date: '2022-01-01', handover_date_normalized: '2026-12-31', project_type: 'Off-plan', starting_price: 2500000, currency_code: 'AED', service_charge: 28, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=St+Regis', project_specs: { avg_price_per_sqft: 3000, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 900 }, { unit_type: '2 BR', avg_size_sqft: 1400 } ] } },
    { name: 'The Address Opera', type: 'Apartments', position: { lat: 25.1905, lng: 55.2780 }, amenities: ['Serviced Living', 'Pool with Burj Khalifa Views', 'Health Club', 'Concierge Service'], location_description: 'Serviced apartments offering five-star hotel amenities in the heart of the Opera District.', launch_date: '2016-01-01', handover_date_normalized: '2022-01-01', project_type: 'Ready', starting_price: 3000000, currency_code: 'AED', service_charge: 26, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=The+Address+Opera', project_specs: { avg_price_per_sqft: 3200, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 850 }, { unit_type: '2 BR', avg_size_sqft: 1350 } ] } },
    { name: 'Burj Khalifa Residences', type: 'Apartments', position: { lat: 25.1972, lng: 55.2744 }, amenities: ['Direct Dubai Mall Access', 'Valet Parking', 'Sky Lobbies', 'Indoor & Outdoor Pools', 'Jacuzzis'], location_description: 'Iconic residences within the world\'s tallest building, offering ultimate prestige and luxury.', launch_date: '2009-01-01', handover_date_normalized: '2010-01-04', project_type: 'Ready', starting_price: 5000000, currency_code: 'AED', service_charge: 30, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Burj+Khalifa', project_specs: { avg_price_per_sqft: 4500, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 1100 }, { unit_type: '2 BR', avg_size_sqft: 2000 } ] } },
    { name: 'Opera Grand', type: 'Apartments', position: { lat: 25.1925, lng: 55.2785 }, amenities: ['Rooftop Pool', 'Health Club', 'Retail Outlets', 'Kids Play Area', 'Views of Dubai Fountain'], location_description: 'A 66-storey tower in the Opera District with stunning views of the Burj Khalifa and The Dubai Fountain.', launch_date: '2015-05-12', handover_date_normalized: '2020-03-31', project_type: 'Ready', starting_price: 2500000, currency_code: 'AED', service_charge: 24, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Opera+Grand', project_specs: { avg_price_per_sqft: 2800, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 800 }, { unit_type: '2 BR', avg_size_sqft: 1500 } ] } },
    { name: 'Burj Royale', type: 'Apartments', position: { lat: 25.1920, lng: 55.2790 }, amenities: ['Swimming Pool', 'Fully Equipped Gym', 'BBQ Area', 'Community Park', 'Observation Deck'], location_description: 'The last residential tower with direct views of the Burj Khalifa and The Dubai Fountain.', launch_date: '2018-11-01', handover_date_normalized: '2022-10-31', project_type: 'Ready', starting_price: 1500000, currency_code: 'AED', service_charge: 22, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Burj+Royale', project_specs: { avg_price_per_sqft: 2200, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 650 }, { unit_type: '2 BR', avg_size_sqft: 1000 } ] } },
    { name: 'Grande', type: 'Apartments', position: { lat: 25.1900, lng: 55.2770 }, amenities: ['Infinity Pool', 'Yoga Room', 'Kids\' Play Area', 'State-of-the-art Fitness Centre', 'Health Club'], location_description: 'A 71-storey residential tower in The Opera District offering premium finishes and spectacular views.', launch_date: '2018-05-13', handover_date_normalized: '2023-03-31', project_type: 'Ready', starting_price: 1800000, currency_code: 'AED', service_charge: 25, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Grande', project_specs: { avg_price_per_sqft: 2400, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 700 }, { unit_type: '2 BR', avg_size_sqft: 1100 } ] } },
    { name: 'Burj Views', type: 'Apartments', position: { lat: 25.1885, lng: 55.2770 }, amenities: ['Shared Swimming Pool', 'Gymnasium', 'Retail Centre', 'Business Centre', '24/7 Security'], location_description: 'A three-tower residential complex in Downtown Dubai, offering views of the Burj Khalifa and easy access to the Dubai Mall.', launch_date: '2005-01-01', handover_date_normalized: '2009-12-31', project_type: 'Ready', starting_price: 1800000, currency_code: 'AED', service_charge: 20, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Burj+Views', project_specs: { avg_price_per_sqft: 1900, unit_types: [ { unit_type: 'Studio', avg_size_sqft: 600 }, { unit_type: '1 BR', avg_size_sqft: 900 }, { unit_type: '2 BR', avg_size_sqft: 1400 } ] } },
    { name: 'South Ridge Towers', type: 'Apartments', position: { lat: 25.1890, lng: 55.2760 }, amenities: ['Swimming Pool', 'Gymnasium', 'Squash Courts', 'Badminton Court'], location_description: 'A popular cluster of 6 towers offering apartments for rent with easy access to the boulevard.', launch_date: '2005-01-01', handover_date_normalized: '2008-01-01', project_type: 'For Rent', starting_price: 140000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=South+Ridge+Rental' },
    { name: 'The Lofts', type: 'Apartments', position: { lat: 25.1930, lng: 55.2800 }, amenities: ['Leisure Deck', 'Lap Pool', 'Gym', 'Multipurpose Room'], location_description: 'A complex of three towers offering stylish apartments for rent with a unique, modern design.', launch_date: '2005-01-01', handover_date_normalized: '2009-01-01', project_type: 'For Rent', starting_price: 130000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=The+Lofts+Rental' },
  ],
  'arabian ranches': [
    { name: 'Saheel', type: 'Villas', position: { lat: 25.0545, lng: 55.2801 }, amenities: ['Community Pools', 'Landscaped Parks', 'Basketball Courts', 'Gated Community', 'Spacious Gardens'], location_description: 'A mature and sought-after villa community known for its spacious homes and lush landscapes.', launch_date: '2004-01-01', handover_date_normalized: '2006-12-31', project_type: 'Ready', starting_price: 4500000, currency_code: 'AED', service_charge: 1.5, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Saheel', project_specs: { avg_price_per_sqft: 1200, unit_types: [ { unit_type: '3 BR Villa', avg_size_sqft: 3500 }, { unit_type: '5 BR Villa', avg_size_sqft: 5000 } ] } },
    { name: 'Palmera', type: 'Townhouse', position: { lat: 25.0519, lng: 55.2782 }, amenities: ['Community Swimming Pools', 'Children\'s Play Areas', 'On-site Nursery', 'Gated Entry', 'Lakeside Views'], location_description: 'Charming Spanish-style townhouses with lake views in a tranquil setting.', launch_date: '2005-03-01', handover_date_normalized: '2007-06-30', project_type: 'Ready', starting_price: 2800000, currency_code: 'AED', service_charge: 2, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Palmera', project_specs: { avg_price_per_sqft: 1100, unit_types: [ { unit_type: '2 BR Townhouse', avg_size_sqft: 2200 }, { unit_type: '3 BR Townhouse', avg_size_sqft: 2800 } ] } },
  ],
  'arabian ranches 2': [
    { name: 'Lila', type: 'Villas', position: { lat: 25.0401, lng: 55.2695 }, amenities: ['Landscaped Gardens', 'Community Hall', 'Gym', 'Swimming Pool', 'BBQ Pits'], location_description: 'A family-friendly villa community with a focus on outdoor leisure and green spaces.', launch_date: '2014-02-01', handover_date_normalized: '2017-06-30', project_type: 'Ready', starting_price: 3800000, currency_code: 'AED', service_charge: 1.8, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Lila', project_specs: { avg_price_per_sqft: 1150, unit_types: [ { unit_type: '3 BR Villa', avg_size_sqft: 3200 }, { unit_type: '4 BR Villa', avg_size_sqft: 3800 } ] } },
    { name: 'Rosa', type: 'Villas', position: { lat: 25.0375, lng: 55.2721 }, amenities: ['Spanish-style architecture', 'Gourmet Kitchens', 'Community Centre', 'Parks and Playgrounds', 'Private Gardens'], location_description: 'Elegant villas with Spanish architectural influences, offering a premium family lifestyle.', launch_date: '2013-10-01', handover_date_normalized: '2016-12-31', project_type: 'Ready', starting_price: 5500000, currency_code: 'AED', service_charge: 1.9, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Rosa', project_specs: { avg_price_per_sqft: 1300, unit_types: [ { unit_type: '4 BR Villa', avg_size_sqft: 4300 }, { unit_type: '5 BR Villa', avg_size_sqft: 5500 } ] } },
  ],
  'arabian ranches 3': [
    { name: 'Sun', type: 'Townhouse', position: { lat: 25.0581, lng: 55.3210 }, amenities: ['Private Back Gardens', 'Clubhouse', 'Lazy River', 'Kids Pool', 'Gated Entry'], location_description: 'Modern townhouses with two distinct architectural styles, designed for family living.', launch_date: '2019-04-01', handover_date_normalized: '2022-05-31', project_type: 'Ready', starting_price: 2100000, currency_code: 'AED', service_charge: 3, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Sun', project_specs: { avg_price_per_sqft: 1000, unit_types: [ { unit_type: '3 BR Townhouse', avg_size_sqft: 2000 }, { unit_type: '4 BR Townhouse', avg_size_sqft: 2400 } ] } },
    { name: 'Joy', type: 'Townhouse', position: { lat: 25.0595, lng: 55.3185 }, amenities: ['Splash Pad', 'Adventure Park', 'Outdoor Cinema', 'Badminton Courts', 'Community Park'], location_description: 'A vibrant community of townhouses with a wide array of recreational and leisure facilities.', launch_date: '2019-06-01', handover_date_normalized: '2022-08-31', project_type: 'Ready', starting_price: 1900000, currency_code: 'AED', service_charge: 3, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Joy', project_specs: { avg_price_per_sqft: 950, unit_types: [ { unit_type: '3 BR Townhouse', avg_size_sqft: 1950 }, { unit_type: '4 BR Townhouse', avg_size_sqft: 2350 } ] } },
  ],
  'jumeirah beach residence': [
    { name: 'Address Beach Resort', type: 'Apartments', position: { lat: 25.0789, lng: 55.1364 }, amenities: ['Rooftop Infinity Pool', 'Direct Beach Access', 'Fitness Centre', 'Spa', 'Kids Club'], location_description: 'An iconic beachfront resort with two towers connected by a skybridge, offering luxury serviced apartments.', launch_date: '2016-01-01', handover_date_normalized: '2020-12-31', project_type: 'Ready', starting_price: 3500000, currency_code: 'AED', service_charge: 28, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Address+Beach+Resort', project_specs: { avg_price_per_sqft: 3000, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 1000 }, { unit_type: '2 BR', avg_size_sqft: 1500 } ] } },
    { name: '1/JBR', type: 'Apartments', position: { lat: 25.0811, lng: 55.1388 }, amenities: ['Private Beach', 'Valet Parking', 'Indoor & Outdoor Gyms', 'VIP Parking', 'Private Elevators'], location_description: 'An exclusive, high-end residential tower at the entrance of JBR, offering spacious apartments with panoramic sea views.', launch_date: '2015-10-01', handover_date_normalized: '2019-12-31', project_type: 'Ready', starting_price: 9000000, currency_code: 'AED', service_charge: 25, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=1/JBR', project_specs: { avg_price_per_sqft: 4000, unit_types: [ { unit_type: '2 BR', avg_size_sqft: 2500 }, { unit_type: '3 BR', avg_size_sqft: 3500 } ] } },
    { name: 'La Vie', type: 'Apartments', position: { lat: 25.0758, lng: 55.1311 }, amenities: ['Miami-style Architecture', 'Infinity Pool', 'Landscaped Gardens', 'Beach Access', 'Gymnasium'], location_description: 'A waterfront home with a Miami modernist design, offering premium apartments with views of Palm Jumeirah.', launch_date: '2019-03-01', handover_date_normalized: '2023-02-28', project_type: 'Ready', starting_price: 2200000, currency_code: 'AED', service_charge: 20, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=La+Vie', project_specs: { avg_price_per_sqft: 2500, unit_types: [ { unit_type: '1 BR', avg_size_sqft: 850 }, { unit_type: '2 BR', avg_size_sqft: 1400 } ] } },
    { name: 'Rimal', type: 'Apartments', position: { lat: 25.0760, lng: 55.1320 }, amenities: ['The Walk JBR Access', 'Multiple Swimming Pools', 'Community Gym', 'Retail Outlets', '24/7 Security'], location_description: 'One of the six original clusters in JBR, offering a vibrant community feel with direct access to The Walk.', launch_date: '2004-01-01', handover_date_normalized: '2007-06-30', project_type: 'For Rent', starting_price: 180000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Rimal' },
    { name: 'Al Bateen Residences', type: 'Apartments', position: { lat: 25.0795, lng: 55.1375 }, amenities: ['Private Beach', 'Infinity Pool', 'Concierge Service', 'State-of-the-art Gym', 'Children\'s Play Area'], location_description: 'A modern development consisting of a residential tower and a hotel, offering direct beach access and premium facilities.', launch_date: '2008-01-01', handover_date_normalized: '2014-01-31', project_type: 'For Rent', starting_price: 300000, currency_code: 'AED', service_charge: 0, is_freehold: true, project_image_url: 'https://placehold.co/600x400/1C1F21/E1E2E3?text=Al+Bateen+Residences' },
  ],
};


/**
 * Context object containing shared resources and setters that can be passed
 * to any tool implementation.
 */
export interface ToolContext {
  map: google.maps.maps3d.Map3DElement | null;
  placesLib: google.maps.PlacesLibrary | null;
  elevationLib: google.maps.ElevationLibrary | null;
  geocoder: google.maps.Geocoder | null;
  padding: [number, number, number, number];
  setHeldGroundedResponse: (
    response: GenerateContentResponse | undefined,
  ) => void;
  setHeldGroundingChunks: (chunks: GroundingChunk[] | undefined) => void;
}

/**
 * Defines the signature for any tool's implementation function.
 * @param args - The arguments for the function call, provided by the model.
 * @param context - The shared context object.
 * @returns A promise that resolves to either a string or a GenerateContentResponse
 *          to be sent back to the model.
 */
export type ToolImplementation = (
  args: any,
  context: ToolContext,
) => Promise<GenerateContentResponse | string>;

/**
 * Fetches and processes place details from grounding chunks.
 * @param groundingChunks - The grounding chunks from the model's response.
 * @param placesLib - The Google Maps Places library instance.
 * @param responseText - The model's text response to filter relevant places.
 * @param markerBehavior - Controls whether to show all markers or only mentioned ones.
 * @returns A promise that resolves to an array of MapMarker objects.
 */
async function fetchPlaceDetailsFromChunks(
  groundingChunks: GroundingChunk[],
  placesLib: google.maps.PlacesLibrary,
  responseText?: string,
  markerBehavior: 'mentioned' | 'all' | 'none' = 'mentioned',
): Promise<MapMarker[]> {
  if (markerBehavior === 'none' || !groundingChunks?.length) {
    return [];
  }

  let chunksToProcess = groundingChunks.filter(c => c.maps?.placeId);
  if (markerBehavior === 'mentioned' && responseText) {
    // Filter the marker list to only what was mentioned in the grounding text.
    chunksToProcess = chunksToProcess.filter(
      chunk =>
        chunk.maps?.title && responseText.includes(chunk.maps.title),
    );
  }

  if (!chunksToProcess.length) {
    return [];
  }

  const placesRequests = chunksToProcess.map(chunk => {
    const placeId = chunk.maps!.placeId.replace('places/', '');
    const place = new placesLib.Place({ id: placeId });
    return place.fetchFields({ fields: ['location', 'displayName'] });
  });

  const locationResults = await Promise.allSettled(placesRequests);

  const newMarkers: MapMarker[] = locationResults
    .map((result, index) => {
      if (result.status !== 'fulfilled' || !result.value.place.location) {
        return null;
      }
      
      const { place } = result.value;
      const originalChunk = chunksToProcess[index];
      
      let showLabel = true; // Default for 'mentioned'
      if (markerBehavior === 'all') {
        showLabel = !!(responseText && originalChunk.maps?.title && responseText.includes(originalChunk.maps.title));
      }

      return {
        position: {
          lat: place.location.lat(),
          lng: place.location.lng(),
          altitude: 1,
        },
        label: place.displayName ?? '',
        showLabel,
      };
    })
    .filter((marker): marker is MapMarker => marker !== null);

  return newMarkers;
}

/**
 * Updates the global map state based on the provided markers and grounding data.
 * It decides whether to perform a special close-up zoom or a general auto-frame.
 * @param markers - An array of markers to display on the map.
 * @param groundingChunks - The original grounding chunks to check for metadata.
 */
function updateMapStateWithMarkers(
  markers: MapMarker[],
  groundingChunks: GroundingChunk[],
) {
  const hasPlaceAnswerSources = groundingChunks.some(
    chunk => chunk.maps?.placeAnswerSources,
  );

  if (hasPlaceAnswerSources && markers.length === 1) {
    // Special close-up zoom: prevent auto-framing and set a direct camera target.
    const { setPreventAutoFrame, setMarkers, setCameraTarget } =
      useMapStore.getState();

    setPreventAutoFrame(true);
    setMarkers(markers);
    setCameraTarget({
      center: { ...markers[0].position, altitude: 200 },
      range: 500, // A tighter range for a close-up
      tilt: 60, // A steeper tilt for a more dramatic view
      heading: 0,
      roll: 0,
    });
  } else {
    // Default behavior: just set the markers and let the App component auto-frame them.
    const { setPreventAutoFrame, setMarkers } = useMapStore.getState();
    setPreventAutoFrame(false);
    setMarkers(markers);
  }
}


/**
 * Tool implementation for grounding queries with Google Maps.
 *
 * This tool fetches a grounded response and then, in a non-blocking way,
 * processes the place data to update the markers and camera on the 3D map.
 */
const mapsGrounding: ToolImplementation = async (args, context) => {
  const { setHeldGroundedResponse, setHeldGroundingChunks, placesLib } = context;
  const {
    query,
    markerBehavior = 'mentioned',
    systemInstruction,
    enableWidget,
  } = args;

  const groundedResponse = await fetchMapsGroundedResponseREST({
    prompt: query as string,
    systemInstruction: systemInstruction as string | undefined,
    enableWidget: enableWidget as boolean | undefined,
  });

  if (!groundedResponse) {
    return 'Failed to get a response from maps grounding.';
  }

  // Hold response data for display in the chat log
  setHeldGroundedResponse(groundedResponse);
  const groundingChunks =
    groundedResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks && groundingChunks.length > 0) {
    setHeldGroundingChunks(groundingChunks);
  } else {
    // If there are no grounding chunks, clear any existing markers and return.
    useMapStore.getState().setMarkers([]);
    return groundedResponse;
  }

  // Process place details and update the map state asynchronously.
  // This is done in a self-invoking async function so that the `mapsGrounding`
  // tool can return the response to the model immediately without waiting for
  // the map UI to update.
  if (placesLib && markerBehavior !== 'none') {
    (async () => {
      try {
        const responseText =
          groundedResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
        const markers = await fetchPlaceDetailsFromChunks(
          groundingChunks,
          placesLib,
          responseText,
          markerBehavior,
        );
        updateMapStateWithMarkers(markers, groundingChunks);
      } catch (e) {
        console.error('Error processing place details and updating map:', e);
      }
    })();
  } else if (markerBehavior === 'none') {
    // If no markers are to be created, ensure the map is cleared.
    useMapStore.getState().setMarkers([]);
  }

  return groundedResponse;
};

/**
 * Tool implementation for displaying a Dubai community on the 3D map.
 */
const locateCommunity: ToolImplementation = async (args, context) => {
  const { communityName } = args;

  if (typeof communityName !== 'string') {
    return 'Invalid community name provided.';
  }

  const communityKey = communityName.toLowerCase();
  const community = dubaiCommunities[communityKey];

  if (!community) {
    const message = `Sorry, I couldn't find the community "${communityName}". Please try another, like "Dubai Hills Estate" or "Downtown Dubai".`;
    useLogStore.getState().addTurn({ role: 'system', text: message, isFinal: true });
    return message;
  }

  // Clear previous markers when locating a new community
  useMapStore.getState().clearMarkers();

  useMapStore.getState().setCameraTarget({
    center: { ...community, altitude: 2000 },
    range: 10000,
    tilt: 30,
    heading: 0,
    roll: 0,
  });

  return `Located ${communityName} on the map.`;
};


/**
 * Tool implementation for finding and marking real estate projects on the map.
 */
const findProjects: ToolImplementation = async (args, context) => {
  const { communityName, projectType } = args;

  if (typeof communityName !== 'string' || typeof projectType !== 'string') {
    return 'Invalid community name or project type provided.';
  }

  const communityKey = communityName.toLowerCase();
  const projectsInCommunity = realEstateProjects[communityKey];

  if (!projectsInCommunity) {
    return `I don't have project data for "${communityName}" right now.`;
  }
  
  const filteredProjects = projectsInCommunity.filter(p =>
    projectType.toLowerCase().includes(p.type.toLowerCase())
  );

  if (filteredProjects.length === 0) {
    return `I couldn't find any "${projectType}" projects in ${communityName}. You could try another type.`;
  }

  const markersToSet: MapMarker[] = filteredProjects.map(project => ({
    position: { ...project.position, altitude: 1 },
    label: project.name,
    showLabel: true,
  }));

  const { setMarkers, setPreventAutoFrame } = useMapStore.getState();
  setPreventAutoFrame(false); // Ensure auto-framing is enabled
  setMarkers(markersToSet);

  return `Found and marked ${filteredProjects.length} ${projectType} projects in ${communityName}.`;
};

/**
 * Tool implementation for updating the client's profile.
 */
const updateClientProfile: ToolImplementation = async (args) => {
  const { fieldName, fieldValue } = args;

  // Tool is disabled - log but don't update profile
  console.log(`[DISABLED] Profile update attempted: ${fieldName} = ${fieldValue}`);

  // Log to system to show tool was called but disabled
  useLogStore.getState().addTurn({
    role: 'system',
    text: `Profile update feature is currently disabled: ${fieldName}`,
    isFinal: true,
  });

  return 'Profile update feature is currently disabled';
};

/**
 * Tool implementation for adding a project to the user's favorites list.
 */
const addProjectToFavorites: ToolImplementation = async (args) => {
  const { projectName, communityName } = args;

  if (!projectName || !communityName) {
    return 'Missing project name or community name to add to favorites.';
  }

  const projectKey = projectName.toLowerCase();
  
  // 1. Check if the project is already a favorite to determine the response message.
  const { favorites } = useFavoritesStore.getState();
  const isAlreadyFavorite = favorites.some(
    (f) => f.name.toLowerCase() === projectKey
  );
  
  // 2. Find the project in the mock data to get its image URL and other details.
  let foundProject: Project | null = null;

  for (const community in realEstateProjects) {
    const project = (realEstateProjects as Record<string, Project[]>)[community].find(p => p.name.toLowerCase().includes(projectKey));
    if (project) {
        foundProject = project;
        break;
    }
  }

  if (!foundProject) {
      return `Sorry, I couldn't find details for "${projectName}" to add it to your favorites.`;
  }

  // 3. Extract key features from the recent conversation history.
  const { turns } = useLogStore.getState();
  const recentTurns = turns.slice(-4);
  const features = new Set<string>();

  recentTurns.forEach(turn => {
    if (turn.role === 'agent') {
      const listItems = turn.text.match(/(\*|-)\s(.*?)(?=\n|$)/g);
      if (listItems) {
        listItems.forEach(item => features.add(item.replace(/(\*|-)\s/, '').trim()));
      }
    }
  });

  // 4. Fallback to project amenities if no features are found in the conversation.
  if (features.size === 0 && foundProject.amenities.length > 0) {
    foundProject.amenities.slice(0, 3).forEach(amenity => features.add(amenity));
  } else if (features.size === 0) {
    features.add("Modern architecture");
    features.add("Prime location in " + communityName);
  }

  // 5. Add/Update the project in the favorites store.
  useFavoritesStore.getState().addProject({
    name: projectName,
    community: communityName,
    imageUrl: foundProject.project_image_url,
    features: Array.from(features),
    project_specs: foundProject.project_specs,
    starting_price: foundProject.starting_price,
    project_type: foundProject.project_type,
    propertyType: foundProject.type,
    service_charge: foundProject.service_charge,
  });

  // 6. Return the appropriate message to the user.
  if (isAlreadyFavorite) {
    return `I've updated the details for ${projectName} in your favorites list.`;
  }
  
  return `I've added ${projectName} to your favorites list. You can view it and add notes in the sidebar.`;
};

/**
 * Tool implementation for retrieving details about a specific project.
 */
const getProjectDetails: ToolImplementation = async (args) => {
  const { projectName } = args;

  if (typeof projectName !== 'string') {
    return 'Invalid project name provided.';
  }

  let foundProject: Project | null = null;
  const projectKey = projectName.toLowerCase();

  // Search through all communities to find the project
  for (const community in realEstateProjects) {
    const project = (realEstateProjects as Record<string, Project[]>)[community].find(p => p.name.toLowerCase().includes(projectKey));
    if (project) {
      foundProject = project;
      break;
    }
  }

  let projectDetailsString: string;

  if (foundProject) {
    // Format the details from the mock data
    const handoverDate = new Date(foundProject.handover_date_normalized).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const formattedPrice = new Intl.NumberFormat('en-US').format(foundProject.starting_price);
    
    const priceLabel = foundProject.project_type === 'For Rent' ? 'Annual Rent' : 'Starting Price';
    const handoverInfo = foundProject.project_type === 'Off-plan' ? `, with handover around ${handoverDate}` : '';

    const details = [
      `**Location**: ${foundProject.location_description}`,
      `**Status**: ${foundProject.project_type}${handoverInfo}.`,
      `**${priceLabel}**: ${foundProject.currency_code} ${formattedPrice}`,
    ];

    if (foundProject.project_specs && foundProject.project_type !== 'For Rent') {
      const formattedAvgPrice = new Intl.NumberFormat('en-US').format(foundProject.project_specs.avg_price_per_sqft);
      details.push(`**Avg. Price/SqFt**: ${foundProject.currency_code} ${formattedAvgPrice}`);
      
      const unitTypesString = foundProject.project_specs.unit_types
        .map(ut => `    *   ${ut.unit_type}: ~${new Intl.NumberFormat('en-US').format(ut.avg_size_sqft)} sq. ft.`)
        .join('\n');
      details.push(`**Available Unit Sizes**:\n${unitTypesString}`);
    }

    details.push(`**Ownership**: ${foundProject.is_freehold ? 'Freehold' : 'Leasehold'}`);
    details.push(`**Key Amenities**:\n${foundProject.amenities.map(a => `    *   ${a}`).join('\n')}`);
    
    projectDetailsString = `Here are the details for **${foundProject.name}**:\n\n*   ${details.join('\n*   ')}`;

  } else {
    // Fallback to online search if not in mock data
    try {
      const searchPrompt = `Provide a summary for the real estate project "${projectName}" in Dubai, including its status, handover date, starting price, and key amenities.`;
      const searchResult = await fetchSearchGroundedResponse(searchPrompt);
      if (searchResult && !searchResult.toLowerCase().includes("i don't have enough information")) {
        projectDetailsString = `I found some information online for **${projectName}**:\n\n${searchResult}`;
      } else {
        return `I apologize, but I couldn't find specific details for "${projectName}" at this moment, both in my database and online.`;
      }
    } catch (error) {
      console.error(`Error fetching project details online for ${projectName}:`, error);
      return `I encountered an error while searching for details about "${projectName}". Please try again later.`;
    }
  }

  // Check if the project is in favorites and update notes
  const { favorites, updateNotes } = useFavoritesStore.getState();
  const favoriteProject = favorites.find(f => f.name.toLowerCase() === projectKey);

  if (favoriteProject) {
    // Remove the initial "Here are the details for..." part for the notes
    const noteContent = projectDetailsString.substring(projectDetailsString.indexOf('*'));
    const updatedNotes = `${favoriteProject.notes}\n\n**Project Details:**\n${noteContent}`;
    updateNotes(favoriteProject.id, updatedNotes.trim());
    return `I've found the details for ${projectName} and added them to your notes in the favorites list.`;
  }

  return projectDetailsString;
};


/**
 * A registry mapping tool names to their implementation functions.
 * The `onToolCall` handler uses this to dispatch function calls dynamically.
 */
export const toolRegistry: Record<string, ToolImplementation> = {
  mapsGrounding,
  locateCommunity,
  findProjects,
  updateClientProfile,
  addProjectToFavorites,
  getProjectDetails,
};