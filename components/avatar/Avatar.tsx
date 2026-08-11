/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './Avatar.css';
import cn from 'classnames';

interface AvatarProps {
  volume: number;
  isSpeaking: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ volume, isSpeaking }) => {
  // Use volume to control animation, but only when speaking.
  const mouthHeight = isSpeaking ? Math.max(2, 2 + volume * 40) : 2;
  const faceScale = isSpeaking ? 1 + volume * 0.1 : 1;

  return (
    <div className="avatar-container">
      <div 
        className={cn("avatar-face", { speaking: isSpeaking })}
        style={{ transform: `scale(${faceScale})`}}
      >
        <div className="avatar-eye left"></div>
        <div className="avatar-eye right"></div>
        <div 
          className="avatar-mouth"
          style={{ height: `${mouthHeight}px` }}
        ></div>
      </div>
    </div>
  );
};

export default Avatar;
