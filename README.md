# 🛡️ YatriSahayak - Digital Tourist Identity & Safety Platform

<div align="center">

![YatriSahayak Logo](./assets/images/Logo_text.png)

**Secure • Verified • Protected**

A comprehensive React Native mobile application for digital tourist identity verification, real-time safety monitoring, and emergency response in India.

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [Feature Documentation](#-feature-documentation)
- [Security & Privacy](#-security--privacy)
- [API Integration](#-api-integration)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**YatriSahayak** (यात्री सहायक) is a digital platform designed to enhance tourist safety and streamline identity verification in India. The application provides tourists with a secure digital identity (Digital Tourist ID) that can be verified at checkpoints, while offering real-time safety monitoring, emergency response, and location tracking features.

### Problem Statement

- Tourists face identity verification challenges at multiple checkpoints
- Manual verification processes are time-consuming and inefficient
- Safety monitoring and emergency response are often fragmented
- Lack of centralized tourist identity management system

### Solution

YatriSahayak provides:
- **Digital Tourist ID** with QR code verification
- **Real-time location tracking** with geofencing
- **AI-powered safety scoring** based on destination and demographics
- **Emergency response system** with one-tap alerts
- **Checkpoint verification** for authorities
- **Trip planning and management** tools

---

## ✨ Key Features

### 🆔 Digital Tourist ID System

- **Secure Digital Identity**: Blockchain-inspired verification system
- **QR Code Generation**: Encrypted QR codes for instant verification
- **Offline Verification**: 6-character alphanumeric backup codes
- **Auto-expiration**: IDs automatically expire after trip completion
- **Data Encryption**: End-to-end encryption for sensitive data

### 📱 Tourist Features

#### Trip Management
- ✅ **Trip Planning**: Create detailed trip itineraries
- ✅ **Trip Templates**: Pre-built templates (Golden Triangle, Kerala Backwaters, etc.)
- ✅ **Single Active Trip**: Only one active trip at a time for security
- ✅ **Trip History**: View completed trips and statistics

#### Safety & Monitoring
- ✅ **AI Safety Score**: Real-time safety assessment (0-100 scale)
- ✅ **Live Location Tracking**: GPS-based real-time location updates
- ✅ **Geofencing**: Automatic alerts when entering risk zones
- ✅ **Emergency Services Map**: View nearby hospitals, police stations, fire stations
- ✅ **SOS Button**: One-tap emergency alert with location sharing

#### Identity Verification
- ✅ **QR Code Display**: Show scannable QR code for checkpoint verification
- ✅ **Offline Code**: Manual verification code for network issues
- ✅ **Digital ID Card**: Complete tourist profile with statistics
- ✅ **Check-in History**: Track all checkpoint verifications

### 👮 Authority Features

#### Verification & Scanning
- ✅ **QR Code Scanner**: Camera-based QR code scanning
- ✅ **Identity Verification**: Instant tourist identity validation
- ✅ **Manual Code Entry**: Fallback verification method
- ✅ **Detailed Tourist Info**: Access to tourist trip details and status

#### Monitoring & Management
- ✅ **Tourist Tracking**: Monitor tourist locations in real-time
- ✅ **Checkpoint Logging**: Record all verification activities
- ✅ **Incident Reporting**: Report and track tourist-related incidents
- ✅ **Analytics Dashboard**: View verification statistics and trends

### 🗺️ Location & Navigation

- **Real-time GPS Tracking**: Continuous location monitoring
- **Interactive Maps**: View current location and surrounding areas
- **Emergency Services Locator**: Find nearest hospitals (red pins), police stations (blue pins), fire stations (orange pins)
- **Route History**: View complete travel trail
- **Geofence Alerts**: Automatic notifications for zone entry/exit

---

## 🛠️ Technology Stack

### Frontend & Mobile
- **React Native** (0.74.5) - Cross-platform mobile framework
- **Expo** (51.0.28) - Development and build platform
- **TypeScript** (5.3.3) - Type-safe JavaScript
- **Expo Router** (3.5.23) - File-based navigation
- **NativeWind** (4.0.1) - Tailwind CSS for React Native

### UI & Styling
- **TailwindCSS** (3.4.1) - Utility-first CSS framework
- **React Native Safe Area Context** - Safe area handling
- **Expo Vector Icons** - Icon library
- **React Native QRCode SVG** - QR code generation

### Location & Camera
- **Expo Location** (17.0.1) - GPS and location services
- **Expo Camera** (15.0.16) - Camera access for QR scanning
- **React Native Maps** (1.14.0) - Map integration

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & user management
  - Real-time subscriptions
  - File storage

### State Management
- **React Context API** - Global state management
- **Custom Hooks** - Reusable state logic

### Security & Encryption
- **Custom Encryption** - Base64 + Caesar cipher for QR data
- **Checksum Validation** - Data integrity verification
- **Token-based Auth** - Secure authentication system

---

## 🏗️ Architecture

### Project Structure
YatriSahayak/
├── app/ # Expo Router pages
│ ├── (app)/ # Authenticated app screens
│ │ ├── home.tsx # Home screen with QR code display
│ │ ├── profile.tsx # User profile
│ │ ├── safety.tsx # Safety dashboard
│ │ ├── tracking.tsx # Location tracking
│ │ └── trip-planner/ # Trip planning screens
│ ├── (auth)/ # Authentication screens
│ │ ├── login.tsx
│ │ ├── register.tsx
│ │ └── verification.tsx
│ ├── modal/ # Modal screens
│ │ ├── qr-scanner.tsx # QR code scanner
│ │ ├── qr-display.tsx # Full-screen QR display
│ │ └── notifications.tsx # Notifications view
│ └── _layout.tsx # Root layout
├── components/ # Reusable components
│ ├── DigitalIDCard.tsx # Digital ID display
│ ├── QuickActionGrid.tsx # Quick action buttons
│ ├── TripStatusCard.tsx # Trip status display
│ ├── NotificationPreview.tsx # Notification preview
│ ├── TrackingStats.tsx # Location tracking stats
│ └── TestQRCode.tsx # Test QR generator
├── context/ # React Context providers
│ ├── AuthContext.tsx # Authentication state
│ ├── TouristContext.tsx # Tourist data state
│ └── SafetyContext.tsx # Safety score state
├── services/ # Business logic services
│ ├── tripService.ts # Trip management & QR generation
│ ├── locationService.ts # Location tracking
│ └── notificationService.ts # Push notifications
├── types/ # TypeScript type definitions
│ ├── auth.ts # Auth types
│ ├── trip.ts # Trip & destination types
│ └── location.ts # Location types
├── utils/ # Utility functions
│ ├── qrDecoder.ts # QR encoding/decoding
│ └── validation.ts # Input validation
├── hooks/ # Custom React hooks
│ ├── useLocation.ts # Location tracking hook
│ └── useAuth.ts # Authentication hook
├── lib/ # External service configs
│ └── supabase.ts # Supabase client
├── assets/ # Static assets
│ └── images/ # App images & icons
├── tailwind.config.js # Tailwind configuration
├── app.json # Expo configuration
└── package.json # Dependencies


### Data Flow
User Action → Component → Context → Service → Supabase/Local Storage
↓
UI Update ← State Change ← Response
