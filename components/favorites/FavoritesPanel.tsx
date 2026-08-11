/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useFavoritesStore } from '@/lib/state';
import FavoriteCard from './FavoriteCard';
import './FavoritesPanel.css';

const FavoritesPanel: React.FC = () => {
  const favorites = useFavoritesStore(state => state.favorites);

  return (
    <div className="favorites-panel">
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
  );
};

export default FavoritesPanel;
