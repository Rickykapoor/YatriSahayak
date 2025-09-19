import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/types/auth';

const NotificationsModal: React.FC = () => {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Safety Alert',
      message: 'Heavy rain warning in your current area. Please take necessary precautions.',
      type: 'safety',
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      title: 'Trip Reminder',
      message: 'Check-in at next checkpoint in 2 hours',
      type: 'trip',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New safety features have been added to your app',
      type: 'system',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'safety': return 'warning';
      case 'trip': return 'map';
      case 'emergency': return 'alert-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'safety': return '#F59E0B';
      case 'trip': return '#B45309';
      case 'emergency': return '#EF4444';
      default: return '#6B46C1';
    }
  };

  return (
    <ScrollView className="flex-1 bg-primary-50">
      <Stack.Screen 
        options={{ 
          title: 'Notifications',
          headerStyle: { backgroundColor: '#F5F5F4' },
          headerTitleStyle: { color: '#44403C' }
        }} 
      />
      
      <View className="p-4">
        {notifications.map((notification) => (
          <View 
            key={notification.id}
            className={`bg-white rounded-xl mb-3 p-4 shadow-sm ${!notification.read ? 'border-l-4 border-secondary-500' : ''}`}
          >
            <View className="flex-row items-start">
              <View 
                className="w-10 h-10 rounded-full justify-center items-center mr-3"
                style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
              >
                <Ionicons 
                  name={getNotificationIcon(notification.type)} 
                  size={20} 
                  color={getNotificationColor(notification.type)}
                />
              </View>
              
              <View className="flex-1">
                <Text className="text-base font-semibold text-primary-800 mb-1">
                  {notification.title}
                </Text>
                <Text className="text-sm text-primary-700 mb-2">
                  {notification.message}
                </Text>
                <Text className="text-xs text-primary-500">
                  {new Date(notification.timestamp).toLocaleString()}
                </Text>
              </View>
              
              {!notification.read && (
                <View className="w-3 h-3 bg-secondary-600 rounded-full" />
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default NotificationsModal;
