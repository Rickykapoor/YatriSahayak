import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckpointListProps {
  visitedCheckpoints: string[];
  onClose: () => void;
}

interface CheckpointHistoryItem {
  id: string;
  name: string;
  type: 'police' | 'hotel' | 'attraction' | 'transport';
  visitedAt: string;
  location: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
}

const CheckpointList: React.FC<CheckpointListProps> = ({ visitedCheckpoints, onClose }) => {
  // Mock checkpoint history data
  const checkpointHistory: CheckpointHistoryItem[] = [
    {
      id: '1',
      name: 'Goa Police Station',
      type: 'police',
      visitedAt: new Date().toISOString(),
      location: 'Calangute, Goa',
      verificationStatus: 'verified'
    },
    {
      id: '2',
      name: 'Hotel Taj Exotica',
      type: 'hotel',
      visitedAt: new Date(Date.now() - 3600000).toISOString(),
      location: 'Benaulim, Goa',
      verificationStatus: 'verified'
    },
    {
      id: '3',
      name: 'Baga Beach Entry',
      type: 'attraction',
      visitedAt: new Date(Date.now() - 7200000).toISOString(),
      location: 'Baga, Goa',
      verificationStatus: 'pending'
    }
  ];

  const getCheckpointIcon = (type: CheckpointHistoryItem['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'police': return 'shield-checkmark';
      case 'hotel': return 'bed';
      case 'attraction': return 'camera';
      case 'transport': return 'car';
      default: return 'location';
    }
  };

  const getCheckpointColor = (type: CheckpointHistoryItem['type']): string => {
    switch (type) {
      case 'police': return '#5856D6';
      case 'hotel': return '#007AFF';
      case 'attraction': return '#34C759';
      case 'transport': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusColor = (status: CheckpointHistoryItem['verificationStatus']): string => {
    switch (status) {
      case 'verified': return '#34C759';
      case 'pending': return '#FF9500';
      case 'failed': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: CheckpointHistoryItem['verificationStatus']): string => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View className="flex-1 bg-gray-light">
      {/* Header */}
      <View className="bg-white p-4 flex-row justify-between items-center border-b border-gray-200">
        <Text className="text-lg font-semibold text-black">Checkpoint History</Text>
        <Pressable onPress={onClose} className="p-1">
          <Ionicons name="close" size={24} color="#8E8E93" />
        </Pressable>
      </View>

      {/* Statistics */}
      <View className="bg-white mx-4 mt-4 p-4 rounded-xl">
        <Text className="text-base font-semibold text-black mb-3">Today's Activity</Text>
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-xl font-bold text-primary">{checkpointHistory.length}</Text>
            <Text className="text-sm text-gray-600">Total</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-success">
              {checkpointHistory.filter(c => c.verificationStatus === 'verified').length}
            </Text>
            <Text className="text-sm text-gray-600">Verified</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-bold text-warning">
              {checkpointHistory.filter(c => c.verificationStatus === 'pending').length}
            </Text>
            <Text className="text-sm text-gray-600">Pending</Text>
          </View>
        </View>
      </View>

      {/* Checkpoint List */}
      <ScrollView className="flex-1 p-4">
        {checkpointHistory.length > 0 ? (
          checkpointHistory.map((checkpoint, index) => (
            <View key={checkpoint.id} className="bg-white rounded-xl mb-3 p-4">
              <View className="flex-row items-center">
                {/* Icon */}
                <View 
                  className="w-12 h-12 rounded-full justify-center items-center mr-4"
                  style={{ backgroundColor: `${getCheckpointColor(checkpoint.type)}20` }}
                >
                  <Ionicons 
                    name={getCheckpointIcon(checkpoint.type)} 
                    size={20} 
                    color={getCheckpointColor(checkpoint.type)} 
                  />
                </View>

                {/* Details */}
                <View className="flex-1">
                  <Text className="text-base font-semibold text-black mb-1">
                    {checkpoint.name}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    {checkpoint.location}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatTime(checkpoint.visitedAt)}
                  </Text>
                </View>

                {/* Status */}
                <View className="items-end">
                  <View 
                    className="px-3 py-1 rounded-full mb-1"
                    style={{ backgroundColor: `${getStatusColor(checkpoint.verificationStatus)}20` }}
                  >
                    <Text 
                      className="text-xs font-semibold"
                      style={{ color: getStatusColor(checkpoint.verificationStatus) }}
                    >
                      {getStatusText(checkpoint.verificationStatus)}
                    </Text>
                  </View>
                  
                  {checkpoint.verificationStatus === 'verified' && (
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                  )}
                  
                  {checkpoint.verificationStatus === 'pending' && (
                    <Ionicons name="time" size={16} color="#FF9500" />
                  )}
                  
                  {checkpoint.verificationStatus === 'failed' && (
                    <Ionicons name="close-circle" size={16} color="#FF3B30" />
                  )}
                </View>
              </View>

              {/* Timeline Connector */}
              {index < checkpointHistory.length - 1 && (
                <View className="absolute left-9 top-16 w-0.5 h-6 bg-gray-200" />
              )}
            </View>
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="location-outline" size={48} color="#8E8E93" />
            <Text className="text-gray-500 text-center mt-4 mb-2">No checkpoints yet</Text>
            <Text className="text-gray-400 text-sm text-center">
              Your checkpoint history will appear here as you travel
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CheckpointList;
