import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Geofence, SafetyAlert } from '@/types/auth';

interface LocationStatusPanelProps {
  zone: Geofence | null;
  hazards: SafetyAlert[];
}

const LocationStatusPanel: React.FC<LocationStatusPanelProps> = ({ zone, hazards }) => {
  const getCurrentLocationStatus = () => {
    if (!zone) {
      return {
        status: 'unknown',
        title: 'Location Unknown',
        description: 'Unable to determine your current safety zone',
        color: 'primary',
        bgColor: 'bg-primary-100',
        textColor: 'text-primary-600'
      };
    }

    switch (zone.type) {
      case 'safe':
        return {
          status: 'safe',
          title: 'Safe Zone',
          description: 'You are in a monitored safe area with regular patrol presence',
          color: 'success',
          bgColor: 'bg-green-50',
          textColor: 'text-success'
        };
      case 'caution':
        return {
          status: 'caution',
          title: 'Caution Zone',
          description: 'Exercise normal caution and stay aware of your surroundings',
          color: 'warning',
          bgColor: 'bg-yellow-50',
          textColor: 'text-warning'
        };
      case 'danger':
        return {
          status: 'danger',
          title: 'High Risk Zone',
          description: 'Consider leaving this area or taking extra safety precautions',
          color: 'danger',
          bgColor: 'bg-red-50',
          textColor: 'text-danger'
        };
      default:
        return {
          status: 'unknown',
          title: 'Unknown Zone',
          description: 'Zone classification unavailable',
          color: 'primary',
          bgColor: 'bg-primary-100',
          textColor: 'text-primary-600'
        };
    }
  };

  const getNearbyServices = () => {
    const services = [
      { name: 'Police Station', distance: '0.5 km', type: 'police' },
      { name: 'Medical Center', distance: '1.2 km', type: 'medical' },
      { name: 'Tourist Help Desk', distance: '0.8 km', type: 'help' },
    ];
    return services;
  };

  const getServiceIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'police': return 'shield-checkmark';
      case 'medical': return 'medical';
      case 'help': return 'help-circle';
      default: return 'location';
    }
  };

  const locationStatus = getCurrentLocationStatus();
  const nearbyServices = getNearbyServices();

  return (
    <View className="m-4">
      {/* Current Location Status */}
      <View className={`p-4 rounded-xl mb-4 ${locationStatus.bgColor} border border-primary-200`}>
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 bg-white rounded-full justify-center items-center mr-3 shadow-sm">
            <Ionicons 
              name={locationStatus.status === 'safe' ? 'shield-checkmark' : 
                    locationStatus.status === 'caution' ? 'shield' : 
                    locationStatus.status === 'danger' ? 'warning' : 'help-circle'} 
              size={20} 
              color={locationStatus.color === 'success' ? '#10B981' : 
                     locationStatus.color === 'warning' ? '#F59E0B' : 
                     locationStatus.color === 'danger' ? '#EF4444' : '#A8A29E'} 
            />
          </View>
          <View className="flex-1">
            <Text className={`text-lg font-bold ${locationStatus.textColor}`}>
              {locationStatus.title}
            </Text>
            {zone && (
              <Text className="text-sm text-primary-600">{zone.name}</Text>
            )}
          </View>
        </View>
        
        <Text className="text-sm text-primary-700 leading-5 mb-3">
          {locationStatus.description}
        </Text>

        <View className="flex-row gap-2">
          <Pressable className="flex-1 bg-white/50 py-2 px-3 rounded-lg">
            <Text className="text-center text-sm font-medium text-primary-700">Share Location</Text>
          </Pressable>
          <Pressable className="flex-1 bg-white/50 py-2 px-3 rounded-lg">
            <Text className="text-center text-sm font-medium text-primary-700">Get Directions</Text>
          </Pressable>
        </View>
      </View>

      {/* Active Hazards */}
      {hazards.length > 0 && (
        <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text className="text-base font-semibold text-primary-800 ml-2">
              Active Alerts ({hazards.length})
            </Text>
          </View>

          {hazards.slice(0, 2).map((hazard, index) => (
            <View key={hazard.id} className="py-2 border-b border-primary-100 last:border-b-0">
              <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-medium text-primary-800">{hazard.title}</Text>
                  <Text className="text-xs text-primary-600 mt-1" numberOfLines={2}>
                    {hazard.description}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${
                  hazard.severity === 'high' ? 'bg-red-50' :
                  hazard.severity === 'medium' ? 'bg-yellow-50' : 'bg-primary-100'
                }`}>
                  <Text className={`text-xs font-semibold ${
                    hazard.severity === 'high' ? 'text-danger' :
                    hazard.severity === 'medium' ? 'text-warning' : 'text-primary-600'
                  }`}>
                    {hazard.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {hazards.length > 2 && (
            <Pressable className="mt-2">
              <Text className="text-secondary-700 text-sm font-medium text-center">
                View {hazards.length - 2} more alerts
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Nearby Services */}
      <View className="bg-white p-4 rounded-xl shadow-sm">
        <Text className="text-base font-semibold text-primary-800 mb-3">Nearby Services</Text>
        
        {nearbyServices.map((service, index) => (
          <Pressable 
            key={index} 
            className="flex-row items-center py-3 border-b border-primary-100 last:border-b-0"
          >
            <View className="w-8 h-8 bg-secondary-100 rounded-full justify-center items-center mr-3">
              <Ionicons name={getServiceIcon(service.type)} size={16} color="#B45309" />
            </View>
            
            <View className="flex-1">
              <Text className="text-sm font-medium text-primary-800">{service.name}</Text>
              <Text className="text-xs text-primary-600">{service.distance} away</Text>
            </View>
            
            <Ionicons name="chevron-forward" size={16} color="#A8A29E" />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default LocationStatusPanel;
