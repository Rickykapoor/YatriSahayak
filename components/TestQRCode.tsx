// File: components/TestQRCode.tsx (Updated with debugging)
import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { generateMockQRData, verifyQRCode } from '@/utils/qrDecoder';

const TestQRCode: React.FC = () => {
  const [qrData, setQrData] = useState<string>('');

  const generateTestQR = () => {
    try {
      const testData = generateMockQRData();
      setQrData(testData);
      console.log('🧪 Generated test QR data:', testData.substring(0, 50) + '...');
      
      // Test verification immediately
      const verification = verifyQRCode(testData);
      console.log('🔍 Verification result:', verification);
      
      Alert.alert(
        '🧪 Test QR Generated', 
        `QR Code generated successfully!\n\nVerification: ${verification.valid ? '✅ Valid' : '❌ Invalid'}\n${verification.error || ''}`
      );
    } catch (error) {
      console.error('Error generating test QR:', error);
      setQrData('test_fallback');
    }
  };

  const testVerification = () => {
    if (!qrData) return;
    
    const result = verifyQRCode(qrData);
    Alert.alert(
      '🔍 Verification Test',
      `Valid: ${result.valid}\n${result.valid ? `Name: ${result.data?.tripName}` : `Error: ${result.error}`}`
    );
  };

  return (
    <View className="bg-white p-6 rounded-xl shadow-sm border border-primary-200 items-center">
      <Text className="text-primary-800 font-bold text-lg mb-4">🧪 Test QR Code</Text>
      
      {qrData ? (
        <View className="items-center">
          <View className="bg-primary-50 p-4 rounded-xl border-2 border-primary-200">
            <QRCode
              value={qrData}
              size={200}
              color="#292524"
              backgroundColor="white"
            />
          </View>
          <Text className="text-primary-600 text-center text-sm mt-3">
            Test QR Code - Valid for 7+ days
          </Text>
        </View>
      ) : (
        <Text className="text-primary-500 mb-4">Generate a test QR code to scan</Text>
      )}

      <View className="flex-row gap-3 mt-4">
        <Pressable
          className="bg-secondary-600 px-6 py-3 rounded-xl"
          onPress={generateTestQR}
        >
          <Text className="text-white font-bold">Generate Test QR</Text>
        </Pressable>
        
        {qrData && (
          <Pressable
            className="bg-blue-600 px-6 py-3 rounded-xl"
            onPress={testVerification}
          >
            <Text className="text-white font-bold">Test Verify</Text>
          </Pressable>
        )}
      </View>
      
      {qrData && (
        <Pressable
          className="bg-primary-600 px-6 py-2 rounded-xl mt-2"
          onPress={() => setQrData('')}
        >
          <Text className="text-white font-medium">Clear</Text>
        </Pressable>
      )}
    </View>
  );
};

export default TestQRCode;
