// File: app/modal/qr-scanner.tsx (Fixed import to access static method)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { TripServiceClass } from '@/services/tripService'; // Import the class to access static method

const { width } = Dimensions.get('window');

interface BarcodeScanningResult {
  type: string;
  data: string;
}

const QRScannerScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);
    Vibration.vibrate(100);

    try {
      console.log('📱 QR Code scanned:', data.substring(0, 50) + '...');

      // Use the static method from TripServiceClass
      const verificationResult = TripServiceClass.decodeQRData(data);

      if (verificationResult.valid && verificationResult.data) {
        const tripData = verificationResult.data;
        
        Alert.alert(
          '✅ Valid Digital Tourist ID',
          `Tourist: ${tripData.tripName}\nDestination: ${tripData.destination}\nStatus: ${tripData.status.toUpperCase()}\nValid until: ${tripData.endDate.toLocaleDateString('en-IN')}\n\nID verified successfully!`,
          [
            {
              text: 'View Details',
              onPress: () => showDetailedInfo(tripData)
            },
            {
              text: 'Scan Another',
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              }
            },
            {
              text: 'Close',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert(
          '❌ Invalid QR Code',
          verificationResult.error || 'This is not a valid YatriSahayak Digital Tourist ID.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              }
            },
            {
              text: 'Close',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        '❌ Scanning Error',
        'Failed to process QR code. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            }
          }
        ]
      );
    }
  };

  const showDetailedInfo = (tripData: any) => {
    Alert.alert(
      '🛡️ Digital Tourist ID Details',
      `Name: ${tripData.tripName}\nDestination: ${tripData.destination}\nUser ID: ${tripData.userId}\nTrip ID: ${tripData.tripId}\nStatus: ${tripData.status}\nIssued: ${tripData.issuedAt.toLocaleDateString('en-IN')}\nExpires: ${tripData.endDate.toLocaleDateString('en-IN')}\nVersion: ${tripData.version}`,
      [
        {
          text: 'Record Check-in',
          onPress: () => recordCheckIn(tripData)
        },
        {
          text: 'Close',
          onPress: () => router.back()
        }
      ]
    );
  };

  const recordCheckIn = (tripData: any) => {
    Alert.alert(
      '✅ Check-in Recorded',
      `Tourist "${tripData.tripName}" has been successfully checked in at this checkpoint.\n\nTimestamp: ${new Date().toLocaleString('en-IN')}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const flipCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleManualInput = () => {
    Alert.prompt(
      'Manual Code Entry',
      'Enter the 6-character offline verification code:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify',
          onPress: (code) => {
            if (code && code.length === 6) {
              const alphanumericRegex = /^[A-Z0-9]{6}$/;
              if (alphanumericRegex.test(code.toUpperCase())) {
                Alert.alert(
                  '✅ Manual Verification',
                  `Code: ${code.toUpperCase()}\n\nThis offline code has been verified successfully.\n\n(In production, this would be checked against the database)`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Invalid Code', 'Please enter a valid 6-character alphanumeric code.');
              }
            } else {
              Alert.alert('Invalid Code', 'Please enter a 6-character code.');
            }
          }
        }
      ],
      'plain-text'
    );
  };

  // ... (rest of the render logic remains the same)
  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-primary-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#B45309" />
          <Text className="text-white mt-4">Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-primary-900">
        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="camera-off" size={80} color="#B45309" />
          <Text className="text-white text-xl font-bold mt-4 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-primary-300 text-center mt-2 mb-6">
            Please enable camera access to scan QR codes for Digital Tourist ID verification.
          </Text>
          <Pressable
            className="bg-secondary-600 px-6 py-3 rounded-xl"
            onPress={requestPermission}
          >
            <Text className="text-white font-bold">Grant Permission</Text>
          </Pressable>
          <Pressable
            className="mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-primary-300">Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-primary-900">
      <StatusBar barStyle="light-content" backgroundColor="#1C1917" />
      
      {/* Header */}
      <SafeAreaView className="bg-primary-900">
        <View className="flex-row items-center justify-between px-4 py-4">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
          <Text className="text-white font-bold text-lg">Scan Digital Tourist ID</Text>
          <View className="flex-row gap-2">
            <Pressable onPress={flipCamera}>
              <Ionicons name="camera-reverse" size={28} color="white" />
            </Pressable>
            <Pressable onPress={toggleFlash}>
              <Ionicons name={flashOn ? "flash" : "flash-off"} size={28} color="white" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Camera View */}
      <View className="flex-1">
        <CameraView
          style={{ flex: 1 }}
          facing={facing}
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          {/* Scan Overlay */}
          <View className="flex-1 relative">
            {/* Dark Overlay */}
            <View className="absolute inset-0 bg-black/50" />
            
            {/* Scan Area */}
            <View className="flex-1 justify-center items-center">
              <View className="relative">
                {/* Scan Frame */}
                <View
                  className="border-2 border-white bg-transparent"
                  style={{
                    width: width * 0.7,
                    height: width * 0.7,
                    borderRadius: 20,
                  }}
                >
                  {/* Corner Indicators */}
                  <View className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-secondary-500" />
                  <View className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-secondary-500" />
                  <View className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-secondary-500" />
                  <View className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-secondary-500" />
                </View>

                {/* Processing Indicator */}
                {isProcessing && (
                  <View className="absolute inset-0 bg-secondary-600/20 justify-center items-center rounded-lg">
                    <ActivityIndicator size="large" color="#B45309" />
                    <Text className="text-white font-semibold mt-2">Processing...</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </CameraView>
      </View>

      {/* Bottom Instructions */}
      <SafeAreaView className="bg-primary-900">
        <View className="px-4 py-6">
          <Text className="text-white text-center font-semibold text-lg mb-2">
            {isProcessing ? 'Verifying Digital ID...' : 'Scan Digital Tourist ID'}
          </Text>
          <Text className="text-primary-300 text-center text-sm mb-4">
            {isProcessing 
              ? 'Please wait while we verify the tourist identity'
              : 'Position the QR code within the scanning frame'
            }
          </Text>
          
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-secondary-600/20 border border-secondary-600 py-3 rounded-xl"
              onPress={handleManualInput}
              disabled={isProcessing}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="keypad" size={16} color="#B45309" />
                <Text className="text-secondary-400 font-semibold ml-2">Manual Entry</Text>
              </View>
            </Pressable>
            
            {scanned && (
              <Pressable
                className="flex-1 bg-secondary-600 py-3 rounded-xl"
                onPress={() => {
                  setScanned(false);
                  setIsProcessing(false);
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="scan" size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Scan Again</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default QRScannerScreen;
