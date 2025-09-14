import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cards per row with margins

const languagesData = [
  {
    id: 'hi',
    name: 'हिंदी',
    englishName: 'Hindi',
    monument: 'India Gate',
    monumentImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
    region: 'North India'
  },
  {
    id: 'bn',
    name: 'বাংলা',
    englishName: 'Bengali',
    monument: 'Howrah Bridge',
    monumentImage: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    region: 'West Bengal'
  },
  {
    id: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    monument: 'Charminar',
    monumentImage: 'https://images.unsplash.com/photo-1657981630164-769503f3a9a8?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    region: 'Andhra Pradesh'
  },
  {
    id: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    monument: 'Shaniwar Wada',
    monumentImage: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=400&h=300&fit=crop',
    region: 'Maharashtra'
  },
  {
    id: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    monument: 'Meenakshi Temple',
    monumentImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop',
    region: 'Tamil Nadu'
  },
  {
    id: 'ur',
    name: 'اردو',
    englishName: 'Urdu',
    monument: 'Taj Mahal',
    monumentImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop',
    region: 'North India'
  },
  {
    id: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    monument: 'Akshardham Temple',
    monumentImage: 'https://plus.unsplash.com/premium_photo-1697730464803-fcede713753e?q=80&w=2065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    region: 'Gujarat'
  },
  {
    id: 'kn',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    monument: 'Mysore Palace',
    monumentImage: 'https://plus.unsplash.com/premium_photo-1697730494992-7d5a0c46ea52?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    region: 'Karnataka'
  },
  {
    id: 'or',
    name: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    monument: 'Konark Sun Temple',
    monumentImage: 'https://plus.unsplash.com/premium_photo-1694475136007-14c4dbf484f5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    region: 'Odisha'
  },
  {
    id: 'pa',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    monument: 'Golden Temple',
    monumentImage: 'https://images.unsplash.com/photo-1623059508779-2542c6e83753?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29sZGVuJTIwdGVtcGxlfGVufDB8fDB8fHww',
    region: 'Punjab'
  },
];

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = (language) => {
    // Toggle selection: if already selected, deselect it
    if (selectedLanguage === language.id) {
      setSelectedLanguage(null);
    } else {
      setSelectedLanguage(language.id);
    }
    // Removed automatic navigation
  };

  const renderLanguageCard = (language) => (
    <TouchableOpacity
      key={language.id}
      className={`bg-white rounded-2xl mb-4 overflow-hidden border-2 ${
        selectedLanguage === language.id 
          ? 'border-blue-500 shadow-blue-500/30' 
          : 'border-transparent'
      } shadow-lg shadow-black/10`}
      style={{ width: cardWidth }}
      onPress={() => handleLanguageSelect(language)}
      activeOpacity={0.8}
    >
      <View className="relative h-30">
        <Image
          source={{ uri: language.monumentImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          className="absolute bottom-0 left-0 right-0 h-1/2"
        />
        <View className="absolute bottom-2 left-3 right-3">
          <Text 
            className="text-white text-xs font-semibold"
            style={{
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {language.monument}
          </Text>
        </View>
      </View>
      
      <View className="p-4">
        <Text className="text-xl font-bold text-gray-900 mb-1 text-center">
          {language.name}
        </Text>
        <Text className="text-sm font-medium text-blue-600 mb-3 text-center">
          {language.englishName}
        </Text>
        <View className="items-center">
          <Text className="text-xs text-gray-500">
            {language.region}
          </Text>
        </View>
      </View>

      {selectedLanguage === language.id && (
        <View className="absolute top-2 right-2">
          <View className="w-6 h-6 rounded-full bg-blue-600 justify-center items-center">
            <Text className="text-white text-sm font-bold">✓</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View className="px-6 pt-5 pb-6 bg-white border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
          Choose Your Language
        </Text>
        <Text className="text-base text-gray-600 text-center leading-6">
          Select your preferred language to get started with Yatri Sahayak
        </Text>
      </View>

      {/* Language Cards */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between px-4">
          {languagesData.map(renderLanguageCard)}
        </View>
      </ScrollView>

      {/* Continue Button */}
      {selectedLanguage && (
        <View className="px-6 py-5 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-600/30"
            onPress={() => router.push('/(auth)/phone-input')}
          >
            <Text className="text-white text-lg font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
