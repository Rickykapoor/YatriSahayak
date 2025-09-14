import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

const QRScannerModal: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  React.useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = useCallback(({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    try {
      const qrData = JSON.parse(data);
      Alert.alert(
        'QR Code Scanned',
        `Tourist ID: ${qrData.id || 'Unknown'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Invalid QR Code', 'This is not a valid tourist ID QR code');
      setScanned(false);
    }
  }, []);

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="camera-outline" size={64} color="#8E8E93" />
        <Text className="text-xl font-semibold text-black mt-4 mb-2">Camera Access Required</Text>
        <Text className="text-base text-gray-600 text-center">
          Please allow camera access to scan QR codes
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen 
        options={{ 
          title: 'Scan QR Code',
          headerBackTitle: 'Back'
        }} 
      />

      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      >
        {/* Overlay */}
        <View className="flex-1 justify-center items-center">
          <View className="w-64 h-64 border-2 border-white rounded-xl" />
          <Text className="text-white text-center mt-4 px-4">
            Position the QR code within the frame to scan
          </Text>
        </View>

        {/* Bottom Instructions */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
          <Text className="text-white text-center text-base font-medium">
            Scan Tourist ID QR Code
          </Text>
          <Text className="text-white/80 text-center text-sm mt-1">
            Hold your device steady for automatic scanning
          </Text>
        </View>
      </BarCodeScanner>
    </View>
  );
};

export default QRScannerModal;
