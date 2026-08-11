/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useClientProfileStore, ClientProfile } from '@/lib/state';
import { useClientProfileSync } from '@/hooks/useClientProfileSync';

const fieldLabels: Record<keyof ClientProfile, string> = {
  projectInterestedIn: 'Project of Interest',
  budget: 'Budget',
  communitiesInterestedIn: 'Communities of Interest',
  workLocation: 'Work Location',
  maxBedrooms: 'Max Bedrooms',
  maxBathrooms: 'Max Bathrooms',
  property_type: 'Property Type',
  project_type: 'Project Type',
  age: 'Age',
  salary: 'Salary',
  isFirstProperty: 'First Property?',
  purpose: 'Purpose',
  downpaymentReady: 'Downpayment Ready?',
  isMarried: 'Married?',
  childrenCount: 'No. of Children',
  specificRequirements: 'Specific Requirements',
  handoverConsideration: 'Handover Time',
  needsMortgageAgent: 'Needs Mortgage Agent?',
  needsGoldenVisa: 'Needs Golden Visa?',
};

const ClientProfileComponent: React.FC = () => {
  useClientProfileSync();
  const profile = useClientProfileStore(state => state.profile);

  const profileEntries = Object.entries(profile)
    .filter(([, value]) => value !== undefined && value !== null && value !== '');

  return (
    <div className="client-profile-container">
      <h3 className="client-profile-header">
        <span className="icon">person</span>
        Client Profile
      </h3>
      {profileEntries.length === 0 ? (
        <p className="client-profile-empty">Profile details will appear here as they are mentioned in the conversation.</p>
      ) : (
        <div className="client-profile-grid">
          {profileEntries.map(([key, value]) => (
            <div key={key} className="client-profile-item">
              <span className="profile-label">{fieldLabels[key as keyof ClientProfile]}</span>
              <span className="profile-value">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProfileComponent;
