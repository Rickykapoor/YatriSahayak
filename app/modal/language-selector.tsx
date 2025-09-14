import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
];

const LanguageSelectorModal: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(
    user?.settings?.language || 'en'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = useCallback(async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setIsLoading(true);

    try {
      const selectedLang = languages.find(lang => lang.code === languageCode);
      await updateUser({
        settings: {
          ...user?.settings,
          language: languageCode
        }
      });

      Alert.alert(
        'Language Updated',
        `App language changed to ${selectedLang?.name}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update language');
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  const LanguageItem = ({ language }: { language: Language }) => (
    <Pressable
      className={`p-4 border-b border-gray-100 ${selectedLanguage === language.code ? 'bg-primary/5' : ''}`}
      onPress={() => handleLanguageSelect(language.code)}
      disabled={isLoading}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{language.flag}</Text>
          <View>
            <Text className={`text-base font-medium ${selectedLanguage === language.code ? 'text-primary' : 'text-black'}`}>
              {language.name}
            </Text>
            <Text className="text-sm text-gray-600">{language.nativeName}</Text>
          </View>
        </View>
        
        {selectedLanguage === language.code && (
          <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
        )}
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-gray-light">
      <Stack.Screen 
        options={{ 
          title: 'Select Language',
          headerBackTitle: 'Back'
        }} 
      />

      <View className="flex-1">
        {/* Header Info */}
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-sm text-gray-600 text-center">
            Choose your preferred language for the app interface
          </Text>
        </View>

        {/* Language List */}
        <ScrollView className="flex-1 bg-white">
          {languages.map((language) => (
            <LanguageItem key={language.code} language={language} />
          ))}
        </ScrollView>

        {/* Footer Info */}
        <View className="bg-gray-50 p-4 border-t border-gray-200">
          <View className="flex-row items-center justify-center">
            <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
            <Text className="text-xs text-gray-500 ml-2 text-center">
              Emergency features remain available in all languages
            </Text>
          </View>
        </View>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/20 justify-center items-center">
          <View className="bg-white p-6 rounded-xl items-center">
            <Text className="text-base font-medium">Updating language...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default LanguageSelectorModal;
