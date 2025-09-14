import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/context/AuthContext';

interface Document {
  id: string;
  name: string;
  type: 'aadhaar' | 'passport' | 'license' | 'other';
  uri: string;
  uploadedAt: string;
  verified: boolean;
}

const DocumentManagerModal: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Aadhaar Card',
      type: 'aadhaar',
      uri: 'https://example.com/aadhaar.jpg',
      uploadedAt: '2024-01-15',
      verified: true,
    },
    // Add more mock documents
  ]);

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'aadhaar':
        return 'card';
      case 'passport':
        return 'airplane';
      case 'license':
        return 'car';
      default:
        return 'document';
    }
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? '#34C759' : '#FF9500';
  };

  const handleUploadDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        // Handle document upload
        Alert.alert('Document Selected', 'Document upload functionality will be implemented');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    }
  }, []);

  const handleVerifyDocument = useCallback((documentId: string) => {
    Alert.alert('Verify Document', 'Document verification will be implemented');
  }, []);

  const handleDeleteDocument = useCallback((documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
          },
        },
      ]
    );
  }, []);

  return (
    <View className="flex-1 bg-gray-light">
      <Stack.Screen 
        options={{ 
          title: 'Document Manager',
          headerBackTitle: 'Back'
        }} 
      />

      <ScrollView className="flex-1 p-4">
        {/* Upload Section */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-black mb-3">Upload Documents</Text>
          <Pressable
            className="border-2 border-dashed border-primary rounded-xl p-6 items-center"
            onPress={handleUploadDocument}
          >
            <Ionicons name="cloud-upload" size={32} color="#007AFF" />
            <Text className="text-primary font-semibold mt-2">Upload New Document</Text>
            <Text className="text-sm text-gray-600 text-center mt-1">
              Supported: JPG, PNG, PDF
            </Text>
          </Pressable>
        </View>

        {/* Documents List */}
        <View className="bg-white rounded-xl p-4">
          <Text className="text-lg font-semibold text-black mb-4">Your Documents</Text>
          
          {documents.length > 0 ? (
            documents.map((document) => (
              <View key={document.id} className="py-4 border-b border-gray-100 last:border-b-0">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-primary/10 rounded-lg justify-center items-center mr-3">
                    <Ionicons 
                      name={getDocumentIcon(document.type)} 
                      size={24} 
                      color="#007AFF" 
                    />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-medium text-black">{document.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <View 
                        className="px-2 py-1 rounded"
                        style={{ backgroundColor: `${getStatusColor(document.verified)}20` }}
                      >
                        <Text 
                          className="text-xs font-semibold"
                          style={{ color: getStatusColor(document.verified) }}
                        >
                          {document.verified ? 'VERIFIED' : 'PENDING'}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500 ml-2">
                        Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row gap-2">
                    {!document.verified && (
                      <Pressable 
                        className="p-2"
                        onPress={() => handleVerifyDocument(document.id)}
                      >
                        <Ionicons name="shield-checkmark" size={20} color="#34C759" />
                      </Pressable>
                    )}
                    
                    <Pressable 
                      className="p-2"
                      onPress={() => handleDeleteDocument(document.id)}
                    >
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="py-8 items-center">
              <Ionicons name="document-outline" size={48} color="#8E8E93" />
              <Text className="text-gray-500 mt-4">No documents uploaded</Text>
              <Text className="text-sm text-gray-400 text-center mt-1">
                Upload your identity documents for verification
              </Text>
            </View>
          )}
        </View>

        {/* Help Section */}
        <View className="bg-blue-50 rounded-xl p-4 mt-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text className="text-primary font-semibold ml-2">Document Guidelines</Text>
          </View>
          <Text className="text-sm text-gray-700 leading-5">
            • Ensure documents are clear and readable{'\n'}
            • Upload original documents, not photocopies{'\n'}
            • All personal information should be visible{'\n'}
            • Maximum file size: 10MB
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DocumentManagerModal;
