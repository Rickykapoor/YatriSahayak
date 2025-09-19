import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionGridProps {
  onEmergencyPress: () => void;
  onMapPress: () => void;
  onScanPress: () => void;
  onLocationPress: () => void;
}

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color?: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  title, 
  color = '#B45309', 
  onPress 
}) => (
  <Pressable 
    className="flex-1 bg-white p-4 rounded-xl items-center mx-1 shadow-sm border border-primary-200"
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={color} />
    <Text className="text-xs font-medium text-primary-800 mt-2 text-center">{title}</Text>
  </Pressable>
);

const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onEmergencyPress,
  onMapPress,
  onScanPress,
  onLocationPress,
}) => {
  return (
    <View className="flex-row mx-3 mb-4">
      <ActionButton
        icon="warning"
        title="Emergency"
        color="#EF4444"
        onPress={onEmergencyPress}
      />
      <ActionButton
        icon="map"
        title="Live Map"
        color="#B45309"
        onPress={onMapPress}
      />
      <ActionButton
        icon="qr-code"
        title="Scan QR"
        color="#6B46C1"
        onPress={onScanPress}
      />
      <ActionButton
        icon="location"
        title="Tracking"
        color="#10B981"
        onPress={onLocationPress}
      />
    </View>
  );
};

export default QuickActionGrid;
