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
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
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
    <View className="bg-white m-4 rounded-2xl shadow-sm overflow-hidden border border-primary-200">
      {/* Header */}
      <View className={`p-6 ${getScoreBg(score)}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className={`w-12 h-12 ${getScoreBg(score)} rounded-full justify-center items-center mr-3 border-2 border-white`}>
              <Ionicons 
                name={getScoreIcon(score)} 
                size={24} 
                color={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'} 
              />
            </View>
            <View>
              <Text className="text-lg font-bold text-primary-800">Safety Score</Text>
              <Text className={`text-sm font-medium ${getScoreColor(score)}`}>
                {getScoreText(score)}
              </Text>
            </View>
          </View>
          
          <View className="items-center">
            <Text className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name={calculateTrendIcon()} size={16} color="#A8A29E" />
              <Text className="text-xs text-primary-500 ml-1">vs yesterday</Text>
            </View>
          </View>
        </View>

        <Text className="text-sm text-primary-700 leading-5">
          {getScoreDescription(score)}
        </Text>
      </View>

      {/* Current Zone Info */}
      {zone && (
        <View className="px-6 py-4 border-b border-primary-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${
                zone.type === 'safe' ? 'bg-success' : 
                zone.type === 'caution' ? 'bg-warning' : 'bg-danger'
              }`} />
              <Text className="text-base font-medium text-primary-800">Current Zone</Text>
            </View>
            <Text className={`text-sm font-semibold capitalize ${
              zone.type === 'safe' ? 'text-success' : 
              zone.type === 'caution' ? 'text-warning' : 'text-danger'
            }`}>
              {zone.type} Zone
            </Text>
          </View>
          <Text className="text-sm text-primary-600 mt-1">{zone.name}</Text>
        </View>
      )}

      {/* Safety Factors */}
      <View className="p-6">
        <Text className="text-base font-semibold text-primary-800 mb-3">Factors Affecting Your Score</Text>
        
        {getFactorsAffectingScore().map((factor, index) => (
          <View key={index} className="flex-row items-center justify-between py-2">
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-3 ${
                factor.impact === 'positive' ? 'bg-success' :
                factor.impact === 'negative' ? 'bg-danger' : 'bg-primary-400'
              }`} />
              <Text className="text-sm text-primary-700">{factor.name}</Text>
            </View>
            <Text className="text-sm font-medium text-primary-800">{factor.value}</Text>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <View className="px-6 pb-6">
        <Pressable className="bg-secondary-700 py-3 rounded-lg shadow-sm">
          <Text className="text-white text-center font-semibold">View Safety Tips</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SafetyScoreCard;
