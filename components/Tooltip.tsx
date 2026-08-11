import React, { ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string; // For additional wrapper styling if needed
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    className = ''
}) => {
    // Styling for the positioning
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    return (
        <div className={`group relative inline-block ${className}`}>
            {children}
            <div
                className={`
          absolute ${positionClasses[position]} z-[100] w-max max-w-xs scale-0 transition-all duration-200 
          group-hover:scale-100 opacity-0 group-hover:opacity-100 pointer-events-none
          bg-lc-navy text-white text-[10px] sm:text-xs font-medium px-3 py-2 rounded-lg 
          shadow-xl border border-lc-gold/30 tracking-wide
        `}
            >
                {content}
                {/* Tiny arrow pointer */}
                {position === 'top' && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-lc-navy/90"></div>
                )}
                {position === 'bottom' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-lc-navy/90"></div>
                )}
                {position === 'left' && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-lc-navy/90"></div>
                )}
                {position === 'right' && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-lc-navy/90"></div>
                )}
            </div>
        </div>
    );
};

export default Tooltip;
