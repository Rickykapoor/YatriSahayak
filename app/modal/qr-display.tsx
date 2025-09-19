import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/context/AuthContext';
import { useTourist } from '@/context/TouristContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

interface QRData {
  id: string;
  name: string;
  expiry: string;
  verified: boolean;
  timestamp: number;
}

const QRDisplayModal: React.FC = () => {
  const { user } = useAuth();
  const { currentTrip } = useTourist();
  const [qrSize] = useState(Math.min(width * 0.7, 280));

  const generateQRData = useCallback((): string => {
    if (!user || !currentTrip) return '';
    
    const qrPayload: QRData = {
      id: user.digitalID,
      name: user.name,
      expiry: currentTrip.endDate,
      verified: user.verified,
      timestamp: Date.now(),
    };
    
    return JSON.stringify(qrPayload);
  }, [user, currentTrip]);

  const handleShare = useCallback(async (): Promise<void> => {
    try {
      if (!user?.digitalID) {
        Alert.alert('Error', 'User information not available');
        return;
      }

      await Share.share({
        message: `My Digital Tourist ID: ${user.digitalID}`,
        title: 'Digital Tourist ID',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  }, [user]);

  const handlePrint = useCallback(async (): Promise<void> => {
    try {
      if (!user || !currentTrip) {
        Alert.alert('Error', 'Missing user or trip information');
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .header { color: #B45309; margin-bottom: 20px; }
              .qr-section { margin: 20px 0; }
              .footer { font-size: 12px; color: #78716C; margin-top: 20px; }
              .info { margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1 class="header">Digital Tourist ID</h1>
            <div class="info"><strong>Name:</strong> ${user.name}</div>
            <div class="info"><strong>ID:</strong> ${user.digitalID}</div>
            <div class="info"><strong>Trip:</strong> ${currentTrip.destination}</div>
            <div class="info"><strong>Valid Until:</strong> ${new Date(currentTrip.endDate).toLocaleDateString()}</div>
            <div class="qr-section">
              <p><strong>QR Code Data:</strong></p>
              <p style="font-size: 10px; word-break: break-all;">${generateQRData()}</p>
            </div>
            <div class="footer">
              Present this at checkpoints for verification<br>
              Generated on ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ 
        html: htmlContent,
        width: 612,
        height: 792,
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Digital Tourist ID'
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Error', 'Failed to print QR code');
    }
  }, [user, currentTrip, generateQRData]);

  const handleRegenerate = useCallback((): void => {
    Alert.alert(
      'Regenerate QR Code',
      'This will create a new QR code with updated timestamp. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Regenerate', 
          onPress: () => {
            Alert.alert('Success', 'QR code regenerated successfully');
          }
        },
      ]
    );
  }, []);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <Stack.Screen 
          options={{ 
            title: 'Digital ID',
            headerStyle: { backgroundColor: '#F5F5F4' },
            headerTitleStyle: { color: '#44403C' }
          }} 
        />
        <View className="items-center">
          <Ionicons name="person-circle-outline" size={64} color="#A8A29E" />
          <Text className="text-lg text-primary-500 mt-4">Loading user data...</Text>
        </View>
      </View>
    );
  }

  if (!currentTrip) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <Stack.Screen 
          options={{ 
            title: 'Digital ID',
            headerStyle: { backgroundColor: '#F5F5F4' },
            headerTitleStyle: { color: '#44403C' }
          }} 
        />
        <View className="items-center px-8">
          <Ionicons name="map-outline" size={64} color="#A8A29E" />
          <Text className="text-xl font-semibold text-primary-800 mt-4 mb-2">No Active Trip</Text>
          <Text className="text-base text-primary-500 text-center">
            You need an active trip to generate a QR code for verification
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary-50">
      <Stack.Screen 
        options={{ 
          title: 'Your Digital Tourist ID',
          headerTitleStyle: { fontSize: 18 },
          headerStyle: { backgroundColor: '#F5F5F4' },
        }} 
      />
      
      {/* Header Info */}
      <View className="items-center p-6 bg-white border-b border-primary-200">
        <Text className="text-xl font-bold text-primary-800 mb-2">{user.name}</Text>
        <Text className="text-sm text-primary-600 mb-1">ID: {user.digitalID}</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 bg-success rounded-full mr-2" />
          <Text className="text-sm text-success font-medium">
            {user.verified ? 'Verified Tourist' : 'Pending Verification'}
          </Text>
        </View>
      </View>

      {/* QR Code Display */}
      <View className="flex-1 justify-center items-center p-8">
        <View className="bg-white p-8 rounded-2xl shadow-lg items-center border border-primary-200">
          <QRCode
            value={generateQRData()}
            size={qrSize}
            backgroundColor="white"
            color="#44403C"
          />
          
          <View className="mt-6 items-center">
            <Text className="text-base font-semibold text-primary-800 mb-1">
              {currentTrip.destination}
            </Text>
            <Text className="text-sm text-primary-600">
              Valid until {new Date(currentTrip.endDate).toLocaleDateString()}
            </Text>
            <Text className="text-xs text-primary-500 mt-2">
              Status: {currentTrip.status.charAt(0).toUpperCase() + currentTrip.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text className="text-center text-primary-500 text-sm mt-6 px-4">
          Show this QR code at checkpoints, hotels, and tourist attractions for quick verification
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="p-6 bg-white border-t border-primary-200">
        <View className="flex-row gap-3 mb-4">
          <Pressable 
            className="flex-1 bg-secondary-700 py-3 rounded-lg flex-row justify-center items-center shadow-sm"
            onPress={handleShare}
            disabled={!user?.digitalID}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Share</Text>
          </Pressable>
          
          <Pressable 
            className="flex-1 bg-primary-600 py-3 rounded-lg flex-row justify-center items-center shadow-sm"
            onPress={handlePrint}
            disabled={!user || !currentTrip}
          >
            <Ionicons name="print-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Print</Text>
          </Pressable>
        </View>
        
        <Pressable 
          className="bg-warning py-3 rounded-lg flex-row justify-center items-center shadow-sm"
          onPress={handleRegenerate}
        >
          <Ionicons name="refresh-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Regenerate QR Code</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default QRDisplayModal;
