import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const languagesData = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🌐',
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
  },
  {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '📖',
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '📜',
  },
  {
    id: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🏛️',
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🏺',
  },
  {
    id: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🕌',
  },
  {
    id: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🏰',
  },
  {
    id: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🌾',
  },
  {
    id: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🕌',
  },
];

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
  };

  const renderLanguageCard = (language: typeof languagesData[0]) => (
    <TouchableOpacity
      key={language.id}
      className={`mx-5 mb-3 p-5 rounded-2xl border ${
        selectedLanguage === language.id 
          ? 'bg-secondary-50 border-secondary-300 shadow-md' 
          : 'bg-white border-primary-200 shadow-sm'
      }`}
      onPress={() => handleLanguageSelect(language.id)}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-12 h-12 rounded-full justify-center items-center mr-4 border ${
            selectedLanguage === language.id 
              ? 'bg-secondary-100 border-secondary-200' 
              : 'bg-primary-50 border-primary-200'
          }`}>
            <Text className="text-xl">{language.flag}</Text>
          </View>
          <View className="flex-1">
            <Text className={`text-lg font-semibold mb-1 ${
              selectedLanguage === language.id ? 'text-secondary-800' : 'text-primary-800'
            }`}>
              {language.name}
            </Text>
            <Text className={`text-base font-medium ${
              selectedLanguage === language.id ? 'text-secondary-700' : 'text-primary-600'
            }`}>
              {language.nativeName}
            </Text>
          </View>
        </View>
        
        {selectedLanguage === language.id && (
          <View className="w-7 h-7 rounded-full bg-secondary-600 justify-center items-center">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F4" />
      
      {/* Header with App Branding */}
      <View className="bg-primary-100 px-6 pt-5 pb-8">
        <View className="items-center mb-6">
          {/* App Logo */}
          <View className="w-72 h-20 rounded-3xl justify-center items-center mb-3">
            <Image 
              source={require('@/assets/images/Logo_text.png')} 
              style={{ width: 270, height: 180 }} 
              resizeMode="contain"
            />
          </View>
          
          <Text className="text-primary-600 text-sm text-center font-medium">
            Digital Tourist Identity & Security Platform
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-primary-800 text-2xl font-bold mb-2 tracking-tight">
            Choose Your Language
          </Text>
          <Text className="text-primary-600 text-base text-center leading-6 font-medium">
            Select your preferred language to continue
          </Text>
        </View>
      </View>

      {/* Language List Container */}
      <View className="flex-1 bg-primary-50 rounded-t-3xl shadow-sm">
        <View className="pt-3 pb-2 items-center">
          <View className="w-10 h-1 rounded-full bg-primary-300" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-2">
            {languagesData.map(renderLanguageCard)}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View className="px-5 pt-5 pb-8 bg-white border-t border-primary-200">
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center ${
              selectedLanguage 
                ? 'bg-secondary-700 shadow-lg' 
                : 'bg-primary-300'
            }`}
            style={{
              shadowColor: selectedLanguage ? '#B45309' : 'transparent',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: selectedLanguage ? 0.2 : 0,
              shadowRadius: 8,
              elevation: selectedLanguage ? 5 : 0,
            }}
            onPress={() => {
              if (selectedLanguage) {
                console.log('Selected language:', selectedLanguage);
                router.push('/(auth)/phone-input');
              }
            }}
            disabled={!selectedLanguage}
          >
            <View className="flex-row items-center">
              <Text className={`text-lg font-bold ${
                selectedLanguage ? 'text-white' : 'text-primary-500'
              }`}>
                Continue
              </Text>
              {selectedLanguage && (
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color="white" 
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Skip Option */}
          <TouchableOpacity
            className="mt-4 py-3 px-4 rounded-xl"
            onPress={() => router.push('/(auth)/phone-input')}
          >
            <Text className="text-center text-primary-600 text-sm font-medium">
              Skip for now (English will be used)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
