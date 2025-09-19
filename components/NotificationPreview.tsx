import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/types/auth';

interface NotificationPreviewProps {
  onViewAll: () => void;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({ onViewAll }) => {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Safety Alert',
      message: 'Heavy rain warning in your area',
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
  ]);

  const getNotificationIcon = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'safety': return 'warning';
      case 'trip': return 'map';
      case 'emergency': return 'alert-circle';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'safety': return '#F59E0B';
      case 'trip': return '#B45309';
      case 'emergency': return '#EF4444';
      default: return '#A8A29E';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View className="bg-white m-4 p-4 rounded-xl shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold text-primary-800">Notifications</Text>
          {unreadCount > 0 && (
            <View className="bg-danger w-5 h-5 rounded-full justify-center items-center ml-2">
              <Text className="text-white text-xs font-bold">{unreadCount}</Text>
            </View>
          )}
        </View>
        <Pressable onPress={onViewAll}>
          <Text className="text-secondary-700 text-base font-medium">View All</Text>
        </Pressable>
      </View>

      {notifications.slice(0, 2).map((notification) => (
        <View 
          key={notification.id} 
          className={`flex-row items-center p-3 rounded-lg mb-2 ${notification.read ? 'bg-primary-50' : 'bg-secondary-50'}`}
        >
          <View className="w-8 h-8 rounded-full bg-white justify-center items-center mr-3 shadow-sm">
            <Ionicons 
              name={getNotificationIcon(notification.type)} 
              size={16} 
              color={getNotificationColor(notification.type)} 
            />
          </View>
          
          <View className="flex-1">
            <Text className={`text-sm font-medium mb-1 ${notification.read ? 'text-primary-700' : 'text-primary-800'}`}>
              {notification.title}
            </Text>
            <Text className="text-xs text-primary-600" numberOfLines={1}>
              {notification.message}
            </Text>
            <Text className="text-xs text-primary-500 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </Text>
          </View>

          {!notification.read && (
            <View className="w-2 h-2 bg-secondary-600 rounded-full" />
          )}
        </View>
      ))}
    </View>
  );
};

export default NotificationPreview;
