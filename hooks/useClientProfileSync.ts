import { useEffect, useRef } from 'react';
import { useClientProfileStore } from '@/lib/state';
import { clientPreferencesService } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

export function useClientProfileSync() {
  const profile = useClientProfileStore(state => state.profile);
  const isInitialMount = useRef(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load profile from DB on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const prefs = await clientPreferencesService.getByUserId(user.id);
        if (prefs) {
          // Map DB fields to profile store
          const profileData = {
            projectInterestedIn: prefs.project_interested_in,
            budget: prefs.budget,
            communitiesInterestedIn: prefs.communities_interested_in,
            workLocation: prefs.work_location,
            maxBedrooms: prefs.max_bedrooms,
            maxBathrooms: prefs.max_bathrooms,
            property_type: prefs.property_type,
            project_type: prefs.project_type,
            age: prefs.age,
            salary: prefs.salary,
            isFirstProperty: prefs.is_first_property,
            purpose: prefs.purpose,
            downpaymentReady: prefs.downpayment_ready,
            isMarried: prefs.is_married,
            childrenCount: prefs.children_count,
            specificRequirements: prefs.specific_requirements,
            handoverConsideration: prefs.handover_consideration,
            needsMortgageAgent: prefs.needs_mortgage_agent,
            needsGoldenVisa: prefs.needs_golden_visa,
          };

          // Update store with DB data
          Object.entries(profileData).forEach(([key, value]) => {
            if (value) {
              useClientProfileStore.getState().updateProfile(key as any, value);
            }
          });
        }
      } catch (error) {
        console.error('Error loading client profile:', error);
      } finally {
        isInitialMount.current = false;
      }
    }

    loadProfile();
  }, []);

  // Save profile to DB when it changes (debounced)
  useEffect(() => {
    if (isInitialMount.current) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the save operation
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Map profile store to DB fields
        const dbData = {
          user_id: user.id,
          project_interested_in: profile.projectInterestedIn,
          budget: profile.budget,
          communities_interested_in: profile.communitiesInterestedIn,
          work_location: profile.workLocation,
          max_bedrooms: profile.maxBedrooms,
          max_bathrooms: profile.maxBathrooms,
          property_type: profile.property_type,
          project_type: profile.project_type,
          age: profile.age,
          salary: profile.salary,
          is_first_property: profile.isFirstProperty,
          purpose: profile.purpose,
          downpayment_ready: profile.downpaymentReady,
          is_married: profile.isMarried,
          children_count: profile.childrenCount,
          specific_requirements: profile.specificRequirements,
          handover_consideration: profile.handoverConsideration,
          needs_mortgage_agent: profile.needsMortgageAgent,
          needs_golden_visa: profile.needsGoldenVisa,
        };

        await clientPreferencesService.upsert(dbData);
        console.log('Client profile saved to DB');
      } catch (error) {
        console.error('Error saving client profile:', error);
      }
    }, 1000); // Wait 1 second after last change before saving

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [profile]);
}
