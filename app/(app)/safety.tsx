import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafety } from '@/context/SafetyContext';
import { useTourist } from '@/context/TouristContext';
import EmergencyButton from '@/components/EmergencyButton';
import SafetyScoreCard from '@/components/SafetyScoreCard';
import LocationStatusPanel from '@/components/LocationStatusPanel';
import SafetyTipsCard from '@/components/SafetyTipsCard';
import { SafetyAlert } from '@/types/auth';

interface SafetyActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  backgroundColor: string;
  onPress: () => void;
}

const SafetyActionCard: React.FC<SafetyActionProps> = ({
  icon,
  title,
  subtitle,
  backgroundColor,
  onPress,
}) => (
  <Pressable 
    className="flex-1 min-w-[45%] bg-white p-4 rounded-xl items-center"
    onPress={onPress}
  >
    <View 
      className="w-12 h-12 rounded-full justify-center items-center mb-2"
      style={{ backgroundColor }}
    >
      <Ionicons name={icon} size={24} color="white" />
    </View>
    <Text className="text-base font-semibold text-black mb-0.5">{title}</Text>
    <Text className="text-xs text-gray-500 text-center">{subtitle}</Text>
  </Pressable>
);

const SafetyScreen: React.FC = () => {
  const { 
    safetyScore, 
    currentZone, 
    nearbyHazards, 
    triggerEmergency,
    shareLocation,
    findNearestPolice,
    findNearestHospital 
  } = useSafety();
  const { user, currentTrip } = useTourist();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    const loopAnimation = Animated.loop(pulse);
    loopAnimation.start();

    return () => loopAnimation.stop();
  }, [pulseAnim]);

  const handleEmergency = useCallback((): void => {
    Alert.alert(
      'Emergency Alert',
      'This will immediately alert emergency contacts and authorities. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Emergency!', 
          style: 'destructive',
          onPress: triggerEmergency 
        },
      ]
    );
  }, [triggerEmergency]);

  const handleShareLocation = useCallback(async (): Promise<void> => {
    try {
      await shareLocation();
    } catch (error) {
      Alert.alert('Error', 'Failed to share location');
    }
  }, [shareLocation]);

  const handleFindPolice = useCallback(async (): Promise<void> => {
    try {
      await findNearestPolice();
    } catch (error) {
      Alert.alert('Error', 'Failed to find police station');
    }
  }, [findNearestPolice]);

  const handleFindHospital = useCallback(async (): Promise<void> => {
    try {
      await findNearestHospital();
    } catch (error) {
      Alert.alert('Error', 'Failed to find hospital');
    }
  }, [findNearestHospital]);

  const handleEmergencyContacts = useCallback((): void => {
    router.push('/modal/emergency-contacts' as any);
  }, []);

  const getSafetyColor = useCallback((score: number): string => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  }, []);

  const renderAlertCard = useCallback((hazard: SafetyAlert, index: number) => (
    <View key={hazard.id || index} className="bg-white p-4 rounded-xl mb-2 border-l-4 border-warning">
      <View className="flex-row items-center mb-2">
        <Ionicons 
          name="warning" 
          size={20} 
          color={hazard.severity === 'high' ? '#FF3B30' : '#FF9500'} 
        />
        <Text className="flex-1 text-base font-semibold text-black ml-2">{hazard.title}</Text>
        <Text className="text-xs text-gray-500">{hazard.time}</Text>
      </View>
      <Text className="text-sm text-gray-700 leading-5">{hazard.description}</Text>
    </View>
  ), []);

  return (
    <ScrollView className="flex-1 bg-gray-light">
      {/* Header */}
      <View className="bg-white pt-14 px-5 pb-5 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-black">Safety Dashboard</Text>
        <View className="items-center">
          <Text className={`text-2xl font-bold ${getSafetyColor(safetyScore)}`}>
            {safetyScore}
          </Text>
          <Text className="text-xs text-gray-500 font-medium">Safety Score</Text>
        </View>
      </View>

      {/* Emergency Panel */}
      <View className="bg-danger m-4 p-6 rounded-2xl items-center">
        <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
          <Pressable 
            className="w-30 h-30 rounded-full bg-white justify-center items-center shadow-lg mb-4"
            onPress={handleEmergency}
          >
            <Ionicons name="warning" size={48} color="#FF3B30" />
          </Pressable>
        </Animated.View>
        <Text className="text-white text-xl font-bold mb-1">Tap for immediate help</Text>
        <Text className="text-white/80 text-sm text-center">
          Your location will be shared with emergency contacts
        </Text>
      </View>

      {/* Current Safety Status */}
      <SafetyScoreCard 
        score={safetyScore}
        zone={currentZone}
        hazards={nearbyHazards}
        trip={currentTrip}
      />

      {/* Location Status */}
      <LocationStatusPanel 
        zone={currentZone}
        hazards={nearbyHazards}
      />

      {/* Quick Safety Actions */}
      <View className="m-4">
        <Text className="text-xl font-semibold text-black mb-4">Quick Actions</Text>
        
        <View className="flex-row flex-wrap gap-3">
          <SafetyActionCard
            icon="location-sharp"
            title="Share Location"
            subtitle="With emergency contacts"
            backgroundColor="#007AFF"
            onPress={handleShareLocation}
          />

          <SafetyActionCard
            icon="shield-checkmark"
            title="Find Police"
            subtitle="Nearest station"
            backgroundColor="#5856D6"
            onPress={handleFindPolice}
          />

          <SafetyActionCard
            icon="medical"
            title="Find Hospital"
            subtitle="Medical emergency"
            backgroundColor="#FF3B30"
            onPress={handleFindHospital}
          />

          <SafetyActionCard
            icon="people"
            title="Contacts"
            subtitle="Emergency list"
            backgroundColor="#34C759"
            onPress={handleEmergencyContacts}
          />
        </View>
      </View>

      {/* Safety Tips */}
      <SafetyTipsCard 
        location={currentZone}
        timeOfDay={new Date().getHours()}
        userProfile={user}
      />

      {/* Recent Alerts */}
      <View className="m-4">
        <Text className="text-xl font-semibold text-black mb-4">Recent Safety Alerts</Text>
        
        {nearbyHazards.length > 0 ? (
          nearbyHazards.slice(0, 3).map(renderAlertCard)
        ) : (
          <View className="bg-white p-6 rounded-xl items-center">
            <Ionicons name="checkmark-circle" size={32} color="#34C759" />
            <Text className="text-base text-success font-medium mt-2">No safety alerts in your area</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SafetyScreen;
