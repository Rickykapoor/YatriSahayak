import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Geofence, User } from '@/types/auth';

interface SafetyTipsCardProps {
  location: Geofence | null;
  timeOfDay: number;
  userProfile: User | null;
}

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'general' | 'location' | 'time' | 'weather' | 'personal';
  icon: keyof typeof Ionicons.glyphMap;
}

const SafetyTipsCard: React.FC<SafetyTipsCardProps> = ({ 
  location, 
  timeOfDay, 
  userProfile 
}) => {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const generateContextualTips = (): SafetyTip[] => {
    const tips: SafetyTip[] = [];

    if (timeOfDay >= 20 || timeOfDay <= 6) {
      tips.push({
        id: 'night-safety',
        title: 'Night Safety',
        description: 'Stay in well-lit areas, avoid isolated places, and keep your phone charged. Consider using ride-sharing services instead of walking alone.',
        priority: 'high',
        category: 'time',
        icon: 'moon'
      });
    }

    if (location?.type === 'danger') {
      tips.push({
        id: 'high-risk-area',
        title: 'High Risk Area',
        description: 'You are in a high-risk zone. Stay alert, avoid displaying valuables, and consider leaving the area if possible.',
        priority: 'high',
        category: 'location',
        icon: 'warning'
      });
    } else if (location?.type === 'caution') {
      tips.push({
        id: 'caution-area',
        title: 'Exercise Caution',
        description: 'Remain aware of your surroundings, stick to main roads, and trust your instincts if something feels wrong.',
        priority: 'medium',
        category: 'location',
        icon: 'shield'
      });
    }

    tips.push(
      {
        id: 'emergency-contacts',
        title: 'Emergency Preparedness',
        description: 'Keep emergency contacts updated and easily accessible. Know local emergency numbers: Police (100), Fire (101), Medical (108).',
        priority: 'medium',
        category: 'general',
        icon: 'call'
      },
      {
        id: 'document-safety',
        title: 'Document Security',
        description: 'Keep digital copies of important documents. Store originals safely and carry photocopies when going out.',
        priority: 'medium',
        category: 'personal',
        icon: 'document'
      },
      {
        id: 'communication',
        title: 'Stay Connected',
        description: 'Inform trusted contacts about your whereabouts. Share your live location during travel and check in regularly.',
        priority: 'high',
        category: 'general',
        icon: 'chatbubbles'
      },
      {
        id: 'weather-awareness',
        title: 'Weather Precautions',
        description: 'Check weather conditions before heading out. Carry appropriate gear and avoid outdoor activities during severe weather.',
        priority: 'low',
        category: 'weather',
        icon: 'cloud'
      }
    );

    return tips.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const tips = generateContextualTips();

  const getPriorityColor = (priority: SafetyTip['priority']): string => {
    switch (priority) {
      case 'high': return 'border-danger';
      case 'medium': return 'border-warning';
      case 'low': return 'border-primary-300';
    }
  };

  const getPriorityBg = (priority: SafetyTip['priority']): string => {
    switch (priority) {
      case 'high': return 'bg-red-50';
      case 'medium': return 'bg-yellow-50';
      case 'low': return 'bg-primary-50';
    }
  };

  const getCategoryColor = (category: SafetyTip['category']): string => {
    switch (category) {
      case 'location': return '#B45309';
      case 'time': return '#6B46C1';
      case 'weather': return '#10B981';
      case 'personal': return '#F59E0B';
      default: return '#A8A29E';
    }
  };

  return (
    <View className="m-4">
      <View className="bg-white rounded-xl overflow-hidden shadow-sm border border-primary-200">
        {/* Header */}
        <View className="p-4 bg-secondary-50 border-b border-primary-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-secondary-100 rounded-full justify-center items-center mr-3">
              <Ionicons name="bulb" size={20} color="#B45309" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-primary-800">Safety Tips</Text>
              <Text className="text-sm text-primary-600">
                Personalized for your current situation
              </Text>
            </View>
          </View>
        </View>

        {/* Tips List */}
        <ScrollView className="max-h-96">
          {tips.map((tip, index) => (
            <View key={tip.id}>
              <Pressable 
                className={`p-4 ${getPriorityBg(tip.priority)} border-l-4 ${getPriorityColor(tip.priority)}`}
                onPress={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-full justify-center items-center mr-3"
                          style={{ backgroundColor: `${getCategoryColor(tip.category)}20` }}>
                      <Ionicons 
                        name={tip.icon} 
                        size={16} 
                        color={getCategoryColor(tip.category)} 
                      />
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-semibold text-primary-800 mr-2">
                          {tip.title}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${
                          tip.priority === 'high' ? 'bg-red-100' :
                          tip.priority === 'medium' ? 'bg-yellow-100' : 'bg-primary-100'
                        }`}>
                          <Text className={`text-xs font-bold ${
                            tip.priority === 'high' ? 'text-danger' :
                            tip.priority === 'medium' ? 'text-warning' : 'text-primary-600'
                          }`}>
                            {tip.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      
                      {expandedTip !== tip.id && (
                        <Text className="text-sm text-primary-600 mt-1" numberOfLines={1}>
                          {tip.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <Ionicons 
                    name={expandedTip === tip.id ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#A8A29E" 
                  />
                </View>

                {/* Expanded Content */}
                {expandedTip === tip.id && (
                  <View className="mt-3 pl-11">
                    <Text className="text-sm text-primary-700 leading-5">
                      {tip.description}
                    </Text>
                    
                    {tip.priority === 'high' && (
                      <View className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Text className="text-xs font-semibold text-danger mb-1">
                          ⚠️ IMMEDIATE ACTION RECOMMENDED
                        </Text>
                        <Text className="text-xs text-primary-700">
                          This is a high-priority safety concern that requires your immediate attention.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
              
              {index < tips.length - 1 && (
                <View className="h-px bg-primary-100 mx-4" />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View className="p-4 bg-primary-50 border-t border-primary-100">
          <Text className="text-xs text-primary-600 text-center">
            💡 Tips are updated based on your location, time, and travel profile
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SafetyTipsCard;
