import React from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Destination } from '@/types/auth';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onSelect }) => {
  const getSafetyColor = (score: number): string => {
    if (score >= 85) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <Pressable
      className="w-48 h-32 rounded-xl overflow-hidden mr-3"
      onPress={() => onSelect(destination)}
    >
      <ImageBackground
        source={{ uri: `https://via.placeholder.com/200x120?text=${destination.name}` }}
        className="flex-1 justify-end"
      >
        <View className="bg-black/50 p-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-base font-semibold">{destination.name}</Text>
            <View className={`px-2 py-1 rounded-full ${getSafetyColor(destination.safetyScore)}`}>
              <Text className="text-white text-xs font-bold">{destination.safetyScore}</Text>
            </View>
          </View>
          {destination.description && (
            <Text className="text-white/80 text-xs mt-1" numberOfLines={1}>
              {destination.description}
            </Text>
          )}
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default DestinationCard;
