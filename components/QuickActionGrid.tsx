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
  color = '#007AFF', 
  onPress 
}) => (
  <Pressable 
    className="flex-1 bg-white p-4 rounded-xl items-center mx-1"
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={color} />
    <Text className="text-xs font-medium text-black mt-2 text-center">{title}</Text>
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
        color="#FF3B30"
        onPress={onEmergencyPress}
      />
      <ActionButton
        icon="map"
        title="Live Map"
        onPress={onMapPress}
      />
      <ActionButton
        icon="qr-code"
        title="Scan QR"
        onPress={onScanPress}
      />
      <ActionButton
        icon="location"
        title="Tracking"
        onPress={onLocationPress}
      />
    </View>
  );
};

export default QuickActionGrid;
