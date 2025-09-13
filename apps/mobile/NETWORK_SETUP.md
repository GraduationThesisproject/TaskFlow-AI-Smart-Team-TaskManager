# 🌐 Network Setup Guide

No more manual IP address changes! This guide shows you how to automatically configure your TaskFlow app for any device.

## 🚀 Quick Setup

### For Physical Devices (Recommended)
```bash
cd apps/mobile
npm run setup-network
```

This automatically:
- ✅ Detects your computer's IP address
- ✅ Generates the correct `.env` file
- ✅ Configures all API endpoints
- ✅ Works with any device on your network

### For Emulators/Simulators
No setup needed! The app automatically detects:
- **Android Emulator**: Uses `10.0.2.2` (host machine)
- **iOS Simulator**: Uses `localhost`
- **Web**: Uses `localhost`

## 📱 How It Works

### Backend (apps/backend)
- **Auto-detects** your network IP address
- **Automatically configures** CORS for all devices
- **No manual changes** needed when switching devices

### Mobile App (apps/mobile)
- **Platform-aware**: Different URLs for Android/iOS/Web
- **Environment-based**: Development vs Production URLs
- **Auto-fallback**: Smart fallbacks if detection fails

## 🔧 Manual Override (If Needed)

If automatic detection doesn't work, you can manually set:

### Backend (.env)
```bash
# Override auto-detected IP
FRONTEND_URL=http://YOUR_IP:5173
BASE_URL=http://YOUR_IP:3001
```

### Mobile App (.env)
```bash
# Override auto-detected IP
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3001/api
EXPO_PUBLIC_BASE_URL=http://YOUR_IP:3001
```

## 🐛 Troubleshooting

### "Connection Refused" Error
1. Make sure backend is running: `cd apps/backend && npm start`
2. Check if IP is correct: `npm run setup-network`
3. Verify firewall settings

### "CORS Error" on Web
1. Backend auto-configures CORS for detected IP
2. If using custom IP, add it to CORS_ORIGIN in backend .env

### "Network Unreachable" on Physical Device
1. Ensure device and computer are on same WiFi
2. Run `npm run setup-network` to get correct IP
3. Check if backend is accessible: `http://YOUR_IP:3001`

## 📋 What's Changed

### Before (Manual)
- ❌ Change IP in 3+ files every time
- ❌ Hardcoded IP addresses
- ❌ Device-specific configurations
- ❌ Easy to forget updates

### After (Automatic)
- ✅ Zero manual configuration
- ✅ Auto-detects network
- ✅ Works on any device
- ✅ Platform-aware URLs
- ✅ One command setup

## 🎯 Supported Platforms

- ✅ **Android Emulator** (10.0.2.2)
- ✅ **iOS Simulator** (localhost)
- ✅ **Web Browser** (localhost)
- ✅ **Physical Android** (auto-detected IP)
- ✅ **Physical iOS** (auto-detected IP)
- ✅ **Any Device** (with setup-network script)

## 🚀 Usage

1. **Start Backend**: `cd apps/backend && npm start`
2. **Setup Mobile**: `cd apps/mobile && npm run setup-network`
3. **Start Mobile**: `npm start`
4. **Connect Any Device**: Scan QR code or use URL

That's it! No more IP address headaches! 🎉
