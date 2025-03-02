import React from 'react';

interface NotificationBarProps {
  message: string;
  bgColor?: string; // Background color
  textColor?: string; // Text color
  position?: 'top' | 'bottom'; // Position for potential styling differences
}

/**
 * Notification bar component to display important messages
 * Can be used at the top or bottom of the page
 */
export const NotificationBar = ({ 
  message, 
  bgColor = 'bg-amber-100', 
  textColor = 'text-amber-800',
  position = 'top'
}: NotificationBarProps) => {
  return (
    <div className={`w-full py-2 ${bgColor} ${textColor}`}>
      <div className="container-custom text-center">
        <p className="text-sm font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};
