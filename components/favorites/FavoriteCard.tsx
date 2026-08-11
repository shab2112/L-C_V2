/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { FavoriteProject, useFavoritesStore } from '@/lib/state';
import './FavoriteCard.css';

interface FavoriteCardProps {
  project: FavoriteProject;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ project }) => {
  const updateNotes = useFavoritesStore(state => state.updateNotes);
  const removeProject = useFavoritesStore(state => state.removeProject);
  const [notes, setNotes] = useState(project.notes);

  // Debounce the notes update to avoid excessive re-renders
  useEffect(() => {
    const handler = setTimeout(() => {
      if (notes !== project.notes) {
        updateNotes(project.id, notes);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [notes, project.id, project.notes, updateNotes]);
  
  // Update local state if the project notes change from the store
  useEffect(() => {
    setNotes(project.notes);
  }, [project.notes]);

  // Memoized ROI Calculation Logic
  const estimatedROI = useMemo(() => {
    // Cannot calculate ROI for rental properties or if essential data is missing.
    if (project.project_type === 'For Rent' || !project.starting_price || !project.project_specs) {
      return null;
    }

    // 1. Estimate Annual Rental Income
    // Use different yield assumptions based on property type. Apartments generally have higher yields.
    const grossYieldRate = project.propertyType.toLowerCase().includes('apartment') ? 0.065 : 0.045; // 6.5% for Apartments, 4.5% for Villas/Townhouses
    const estimatedAnnualRent = project.starting_price * grossYieldRate;

    // 2. Estimate Annual Costs (Service Charge)
    const unitTypes = project.project_specs.unit_types;
    if (!unitTypes || unitTypes.length === 0) return null;

    const avgSizeSqFt = unitTypes.reduce((acc, ut) => acc + ut.avg_size_sqft, 0) / unitTypes.length;
    
    // If avg size or service charge is invalid, we can't calculate cost.
    if (!avgSizeSqFt || !project.service_charge) {
        return null; 
    }
    const annualServiceCharge = project.service_charge * avgSizeSqFt;

    // 3. Calculate Net Yield (ROI)
    const netIncome = estimatedAnnualRent - annualServiceCharge;
    const roi = (netIncome / project.starting_price) * 100;

    // Return a formatted, rounded string.
    return `${roi.toFixed(1)}%`;
  }, [project]);

  return (
    <div className="favorite-card">
      {project.imageUrl && (
        <div className="favorite-card-image-container">
          <img src={project.imageUrl} alt={project.name} className="favorite-card-image" />
          {estimatedROI && (
            <div className="roi-badge">
              <span className="roi-label">Est. Annual ROI</span>
              <span className="roi-value">{estimatedROI}</span>
            </div>
          )}
        </div>
      )}
      <div className="favorite-card-content">
        <button
          className="remove-favorite-button"
          onClick={() => removeProject(project.id)}
          aria-label={`Remove ${project.name} from favorites`}
          title="Remove from favorites"
        >
          <span className="icon">delete</span>
        </button>
        <h4 className="favorite-card-name">{project.name}</h4>
        <p className="favorite-card-community">{project.community}</p>
        
        <h5 className="favorite-card-section-title">Key Features</h5>
        <ul className="favorite-card-features">
          {project.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>

        {project.project_specs && (
          <>
            <h5 className="favorite-card-section-title">Project Specs</h5>
            <div className="favorite-card-specs">
              <div className="spec-item">
                <span className="spec-label">Avg. Price/SqFt</span>
                <span className="spec-value">
                  AED {new Intl.NumberFormat('en-US').format(project.project_specs.avg_price_per_sqft)}
                </span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Available Unit Sizes</span>
                <ul className="spec-unit-list">
                  {project.project_specs.unit_types.map((ut, index) => (
                    <li key={index}>
                      <strong>{ut.unit_type}:</strong> ~{new Intl.NumberFormat('en-US').format(ut.avg_size_sqft)} sq. ft.
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        <h5 className="favorite-card-section-title">My Research Notes</h5>
        <textarea
          className="favorite-card-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your thoughts, questions, or follow-up items here..."
        />
      </div>
    </div>
  );
};

export default FavoriteCard;