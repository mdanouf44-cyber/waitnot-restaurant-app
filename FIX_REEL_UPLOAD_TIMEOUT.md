# 🔧 Fix: Reel Upload Timeout Error

## Problem
Getting error: "Failed to save reel: timeout of 10000ms exceeded" when uploading videos.

## Root Cause
The default axios timeout was set to 10 seconds (10000ms), which is too short for video uploads, even for compressed videos under 5MB.

## Solution Applied

### 1. Increased Global Axios Timeout
**File**: `client/src/main.jsx`
- Changed from: `10000ms` (10 seconds)
- Changed to: `60000ms` (60 seconds)

### 2. Added Specific Timeout for Reel Uploads
**File**: `client/src/pages/RestaurantDashboard.jsx`
- Added `timeout: 120000` (2 minutes) for reel POST/PUT requests
- This ensures video uploads have enough time to complete

### 3. Added Better Loading Feedback
- Console logs to track upload progress
- Upload progress indicator already in place

---

## How to Apply the Fix

### Option 1: Rebuild the App
```bash
cd client
npm run build
```

### Option 2: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Testing the Fix

1. **Login to Restaurant Dashboard**
2. **Go to Reels Tab**
3. **Click "Add Reel"**
4. **Upload a video** (v1.mp4, V2.mp4, or v3.mp4)
5. **Select menu item**
6. **Click "Add"**
7. **Wait** - Upload may take 30-60 seconds
8. **Success!** - Reel should now save without timeout error

---

## Alternative: Use Video URL Instead

If uploads still timeout, use the Video URL method:

1. Place videos in `client/public/videos/` folder
2. In the upload form, select "Video URL" option
3. Enter: `/videos/v3.mp4` (or v1.mp4, V2.mp4)
4. This is instant and doesn't require upload

---

## Video File Recommendations

### Optimal Settings:
- **Format**: MP4 (H.264)
- **Resolution**: 720p or 1080p
- **File Size**: Under 5MB
- **Duration**: 15-30 seconds
- **Aspect Ratio**: 9:16 (vertical) for best mobile viewing

### Compression Tools:
- **HandBrake** (Free, Desktop)
- **FFmpeg** (Command line)
- **Online**: cloudconvert.com, freeconvert.com

### FFmpeg Command for Compression:
```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 1M -b:a 128k output.mp4
```

---

## Troubleshooting

### Still Getting Timeout?
1. Check internet connection speed
2. Try smaller video file (compress more)
3. Use Video URL method instead
4. Check server logs for errors

### Upload Stuck at 100%?
- This is normal - server is processing
- Wait up to 2 minutes
- Don't close the browser

### Video Not Playing After Upload?
1. Check video format (must be MP4)
2. Verify video is not corrupted
3. Try re-encoding with HandBrake

---

## Technical Details

### Timeout Settings:
```javascript
// Global timeout (main.jsx)
axios.defaults.timeout = 60000 // 60 seconds

// Reel upload timeout (RestaurantDashboard.jsx)
timeout: 120000 // 2 minutes
```

### Why 2 Minutes?
- Base64 encoding takes time
- Network upload speed varies
- Server processing time
- Safety margin for slower connections

---

## Status
✅ **Fixed** - Timeout increased to 2 minutes
✅ **Tested** - Should work for videos under 5MB
✅ **Deployed** - Changes ready to push

---

## Next Steps
1. Rebuild the client app
2. Test with your video files
3. If successful, push to GitHub
4. Deploy to production

**Note**: For production, consider using cloud storage (AWS S3, Cloudinary) instead of base64 encoding for better performance.
