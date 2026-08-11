import React from 'react';
import DarieApp from './DarieApp';
import './DarieApp.css';

interface DarieAssistantProps {
  onClose?: () => void;
}

const DarieAssistant: React.FC<DarieAssistantProps> = ({ onClose }) => {
  return (
    <div className="Darie-map-assistant-container">
      <DarieApp onClose={onClose} />
    </div>
  );
};

export default DarieAssistant;
