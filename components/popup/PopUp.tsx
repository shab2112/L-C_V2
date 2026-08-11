/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC } from 'react';
import { X } from 'lucide-react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {/* Close button (top-right only) */}
        <button
          type="button"
          className="popup-close"
          onClick={onClose}
          aria-label="Close introduction"
        >
          <X size={20} />
        </button>

        <h2 className="popup-title">Welcome to Darie</h2>
        <p className="popup-subtitle">
          Plan your property search effortlessly using natural, multi-language conversation.
        </p>

        <div className="popup-scrollable-content">
          <ol className="popup-steps">
            <li>
              <span className="icon">play_circle</span>
              <div>
                <strong>Start Your Session:</strong> Press the Play button to begin your voice conversation with DARIE.
              </div>
            </li>
            <li>
              <span className="icon">record_voice_over</span>
              <div>
                <strong>Use Natural Language:</strong> Simply speak as you would to a real estate advisor. Try: "Show me Dubai Hills Estate."
              </div>
            </li>
            <li>
              <span className="icon">apartment</span>
              <div>
                <strong>Explore Properties:</strong> Ask for specific types like "Show me villas in that area" or "Find 3-bedroom apartments."
              </div>
            </li>
            <li>
              <span className="icon">map</span>
              <div>
                <strong>Interactive Map:</strong> Watch the 3D map update in real-time as DARIE shows you communities and projects.
              </div>
            </li>
            <li>
              <span className="icon">school</span>
              <div>
                <strong>Discover Amenities:</strong> Ask about nearby facilities: "Where are the closest schools?" or "Show me parks nearby."
              </div>
            </li>
          </ol>
        </div>

        <button
          type="button"
          className="popup-primary-button"
          onClick={onClose}
        >
          Let&apos;s Get Started!
        </button>
      </div>
    </div>
  );
};

export default PopUp;
