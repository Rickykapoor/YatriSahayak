import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip, Geofence, SafetyAlert } from '@/types/auth';

interface SafetyScoreCardProps {
  score: number;
  zone: Geofence | null;
  hazards: SafetyAlert[];
  trip: Trip | null;
}

const SafetyScoreCard: React.FC<SafetyScoreCardProps> = ({ 
  score, 
  zone, 
  hazards, 
  trip 
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-danger/10';
  };

  const getScoreIcon = (score: number): keyof typeof Ionicons.glyphMap => {
    if (score >= 80) return 'shield-checkmark';
    if (score >= 60) return 'shield';
    return 'warning';
  };

  const getScoreText = (score: number): string => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const getScoreDescription = (score: number): string => {
    if (score >= 80) return 'Your current location and travel conditions are safe. Continue enjoying your trip!';
    if (score >= 60) return 'Exercise normal caution. Stay aware of your surroundings and follow safety guidelines.';
    return 'Exercise increased caution. Consider avoiding this area or taking extra safety measures.';
  };

  const calculateTrendIcon = (): keyof typeof Ionicons.glyphMap => {
    // Mock trend calculation - in real app, compare with previous score
    const mockTrend = Math.random() > 0.5 ? 'up' : 'down';
    return mockTrend === 'up' ? 'trending-up' : 'trending-down';
  };

  const getFactorsAffectingScore = () => {
    const factors = [
      { name: 'Time of Day', impact: score >= 70 ? 'positive' : 'negative', value: new Date().getHours() < 20 ? 'Daytime' : 'Nighttime' },
      { name: 'Weather', impact: 'positive', value: 'Clear' },
      { name: 'Crowd Density', impact: score >= 75 ? 'positive' : 'neutral', value: score >= 75 ? 'Low' : 'Medium' },
      { name: 'Local Events', impact: hazards.length === 0 ? 'positive' : 'negative', value: hazards.length === 0 ? 'None' : `${hazards.length} Alert(s)` },
    ];
    return factors;
  };

  return (
    <View className="bg-white m-4 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <View className={`p-6 ${getScoreBg(score)}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className={`w-12 h-12 ${getScoreBg(score)} rounded-full justify-center items-center mr-3`}>
              <Ionicons name={getScoreIcon(score)} size={24} color={getScoreColor(score).replace('text-', '#')} />
            </View>
            <View>
              <Text className="text-lg font-bold text-black">Safety Score</Text>
              <Text className={`text-sm font-medium ${getScoreColor(score)}`}>
                {getScoreText(score)}
              </Text>
            </View>
          </View>
          
          <View className="items-center">
            <Text className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name={calculateTrendIcon()} size={16} color="#8E8E93" />
              <Text className="text-xs text-gray-500 ml-1">vs yesterday</Text>
            </View>
          </View>
        </View>

        <Text className="text-sm text-gray-700 leading-5">
          {getScoreDescription(score)}
        </Text>
      </View>

      {/* Current Zone Info */}
      {zone && (
        <View className="px-6 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${
                zone.type === 'safe' ? 'bg-success' : 
                zone.type === 'caution' ? 'bg-warning' : 'bg-danger'
              }`} />
              <Text className="text-base font-medium text-black">Current Zone</Text>
            </View>
            <Text className={`text-sm font-semibold capitalize ${
              zone.type === 'safe' ? 'text-success' : 
              zone.type === 'caution' ? 'text-warning' : 'text-danger'
            }`}>
              {zone.type} Zone
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mt-1">{zone.name}</Text>
        </View>
      )}

      {/* Safety Factors */}
      <View className="p-6">
        <Text className="text-base font-semibold text-black mb-3">Factors Affecting Your Score</Text>
        
        {getFactorsAffectingScore().map((factor, index) => (
          <View key={index} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-3 ${
                factor.impact === 'positive' ? 'bg-success' :
                factor.impact === 'negative' ? 'bg-danger' : 'bg-gray-400'
              }`} />
              <Text className="text-sm text-gray-700">{factor.name}</Text>
            </View>
            <Text className="text-sm font-medium text-black">{factor.value}</Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <View className="px-6 pb-6">
        <Pressable className="bg-primary py-3 rounded-lg">
          <Text className="text-white text-center font-semibold">View Safety Tips</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SafetyScoreCard;
