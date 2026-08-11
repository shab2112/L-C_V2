import { useEffect, useRef } from 'react';
import { useFavoritesStore, useAuthStore } from '@/lib/state';
import { favoritesService, clientPreferencesService } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

export function useFavoritesSync() {
  const favorites = useFavoritesStore(state => state.favorites);
  const isInitialMount = useRef(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = useAuthStore(state => state.user);

  // Load favorites from DB when user logs in or hook mounts
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        console.log('[FavoritesSync] No user, skipping load');
        return;
      }

      console.log('[FavoritesSync] Loading favorites for user:', user.id);

      try {
        const dbFavorites = await favoritesService.getAllByUserId(user.id);
        console.log('[FavoritesSync] Loaded from DB:', dbFavorites.length, 'favorites');

        // Map DB data to store format
        const storeFavorites = dbFavorites.map(fav => ({
          id: fav.id,
          name: fav.name,
          community: fav.community || '',
          imageUrl: fav.image_url || '',
          features: (fav.features as string[]) || [],
          notes: fav.notes || '',
          project_specs: fav.project_specs,
          starting_price: fav.starting_price || 0,
          project_type: fav.project_type || '',
          propertyType: fav.property_type || '',
          service_charge: fav.service_charge || 0,
        }));

        // Replace store data with DB data
        useFavoritesStore.setState({ favorites: storeFavorites });
        console.log('[FavoritesSync] Store updated with DB favorites');
      } catch (error) {
        console.error('[FavoritesSync] Error loading favorites:', error);
      } finally {
        // Mark as loaded after first successful load
        setTimeout(() => {
          isInitialMount.current = false;
          console.log('[FavoritesSync] Initial mount complete, sync enabled');
        }, 500);
      }
    }

    if (user) {
      loadFavorites();
    } else {
      // Reset initial mount flag when user logs out
      isInitialMount.current = true;
    }
  }, [user?.id]);

  // Save favorites to DB when they change (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      console.log('[FavoritesSync] Skipping save - initial mount');
      return;
    }

    console.log('[FavoritesSync] Favorites changed, scheduling sync...', favorites.length, 'items');

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync operation
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        if (!user) {
          console.log('[FavoritesSync] No user, skipping save');
          return;
        }

        console.log('[FavoritesSync] Starting sync to DB for user:', user.id);

        // Get current DB favorites
        const dbFavorites = await favoritesService.getAllByUserId(user.id);
        const dbFavIds = new Set(dbFavorites.map(f => f.id));
        const storeFavIds = new Set(favorites.map(f => f.id));

        // Delete removed favorites
        for (const dbFav of dbFavorites) {
          if (!storeFavIds.has(dbFav.id)) {
            console.log('[FavoritesSync] Deleting removed favorite:', dbFav.name);
            await favoritesService.delete(dbFav.id);
          }
        }

        // Upsert current favorites
        for (const fav of favorites) {
          const dbData = {
            id: dbFavIds.has(fav.id) ? fav.id : undefined,
            user_id: user.id,
            name: fav.name,
            community: fav.community,
            image_url: fav.imageUrl,
            features: fav.features,
            notes: fav.notes,
            project_specs: fav.project_specs,
            starting_price: fav.starting_price,
            project_type: fav.project_type,
            property_type: fav.propertyType,
            service_charge: fav.service_charge,
          };

          if (dbFavIds.has(fav.id)) {
            console.log('[FavoritesSync] Updating existing favorite:', fav.name);
            await favoritesService.update(fav.id, dbData);
          } else {
            console.log('[FavoritesSync] Creating new favorite:', fav.name);
            const newFav = await favoritesService.create(dbData as any);
            // Update store with the new ID from DB
            const updatedFavs = favorites.map(f =>
              f.id === fav.id ? { ...f, id: newFav.id } : f
            );
            useFavoritesStore.setState({ favorites: updatedFavs });
          }
        }

        // Sync to client_preferences as well (User Request: "Listings updates against that user what he saved")
        const projectNamestList = favorites.map(f => f.name).join(', ');
        await clientPreferencesService.upsert({
          user_id: user.id,
          project_interested_in: projectNamestList
        });

        console.log('[FavoritesSync] ✅ Successfully synced', favorites.length, 'favorites to DB');
      } catch (error) {
        console.error('[FavoritesSync] ❌ Error syncing favorites:', error);
      }
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [favorites, user]);
}
