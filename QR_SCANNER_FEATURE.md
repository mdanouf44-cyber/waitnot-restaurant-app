# QR Scanner Feature

## Overview

Added in-app QR code scanner that allows users to scan restaurant QR codes directly from within the mobile app, providing a seamless experience without needing to use the phone's camera app.

## Features

✅ **In-App Scanner**: Scan QR codes directly within the app
✅ **Two Access Points**: 
   - Scan button on Home page (next to search bar)
   - Scan button in Bottom Navigation bar
✅ **Auto Navigation**: Automatically redirects to restaurant menu after scanning
✅ **Beautiful UI**: Full-screen scanner with visual guides and animations
✅ **Error Handling**: Shows helpful messages if QR code is invalid or camera access denied

## How It Works

1. **User Opens Scanner**:
   - Tap the scan icon (📷) on Home page or Bottom Nav
   - Scanner opens in full-screen mode

2. **Scan QR Code**:
   - Point camera at restaurant QR code
   - Scanner automatically detects and reads the code
   - Visual frame guides user to position QR code correctly

3. **Auto Redirect**:
   - App extracts restaurant ID and table number from QR code
   - Automatically navigates to: `/qr/{restaurantId}/{tableNumber}`
   - User sees the restaurant menu for their table

## QR Code Format

The scanner expects QR codes in this format:
```
https://yourapp.com/qr/restaurantId/tableNumber
```

Example:
```
https://waitnot.com/qr/abc123/5
```

## Files Added/Modified

### New Files:
1. **client/src/components/QRScanner.jsx**
   - Full-screen QR scanner component
   - Camera access and QR code detection
   - Visual scanning frame with animations

### Modified Files:
1. **client/package.json**
   - Added `react-qr-scanner` dependency

2. **client/src/pages/Home.jsx**
   - Added scan button next to search bar
   - Integrated QRScanner component

3. **client/src/components/BottomNav.jsx**
   - Added "Scan" button in bottom navigation
   - Integrated QRScanner component

## User Experience

### Before:
- User scans QR with phone camera
- Opens in browser
- May need to open app manually

### After:
- User opens app
- Taps scan button
- Scans QR code
- Instantly sees menu (stays in app)

## Benefits

1. **Faster**: No browser intermediary
2. **Smoother**: Stays within the app
3. **Better UX**: Native app experience
4. **More Control**: Handle errors gracefully
5. **Offline Ready**: Can cache restaurant data

## Testing

To test the QR scanner:

1. Build and install the APK
2. Open the app
3. Tap the scan icon (on Home or Bottom Nav)
4. Allow camera permissions when prompted
5. Scan a restaurant QR code
6. Verify it navigates to the correct menu page

## Camera Permissions

The app will request camera permission when the scanner is first opened. Make sure to:
- Grant camera permission in Android settings
- Test on a real device (camera doesn't work in emulator)

## Next Steps

Consider adding:
- Flash/torch toggle for low light
- Gallery image scanning (scan from saved images)
- QR code generation for restaurants
- History of scanned restaurants
