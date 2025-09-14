import React from 'react';
import { View } from 'react-native';

interface SafetyStatusIndicatorProps {
  score: number;
}

const SafetyStatusIndicator: React.FC<SafetyStatusIndicatorProps> = ({ score }) => {
  const getIndicatorColor = (score: number): string => {
    if (score >= 80) return '#34C759'; // Green
    if (score >= 60) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  };

  const getIndicatorSize = (score: number): number => {
    if (score >= 80) return 6;
    if (score >= 60) return 8;
    return 10; // Larger for danger
  };

  return (
    <View 
      style={{
        position: 'absolute',
        top: -2,
        right: -2,
        width: getIndicatorSize(score),
        height: getIndicatorSize(score),
        backgroundColor: getIndicatorColor(score),
        borderRadius: getIndicatorSize(score) / 2,
        borderWidth: 1,
        borderColor: 'white',
      }}
    />
  );
};

export default SafetyStatusIndicator;
