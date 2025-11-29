@echo off
echo ========================================
echo HUGGING FACE VOICE ASSISTANT SETUP
echo ========================================
echo.

echo This script will help you set up Hugging Face AI backend.
echo.

echo Step 1: Get your Hugging Face API Key
echo ----------------------------------------
echo 1. Go to: https://huggingface.co/settings/tokens
echo 2. Click "New token"
echo 3. Name: "Waitnot Voice Assistant"
echo 4. Type: "Read"
echo 5. Copy the token
echo.
set /p HF_KEY="Paste your Hugging Face API key here: "
echo.

echo Step 2: Updating .env file...
echo ----------------------------------------
cd server
(
echo PORT=5000
echo JWT_SECRET=waitnot_jwt_secret_key_2024
echo NODE_ENV=development
echo.
echo # Razorpay Configuration
echo RAZORPAY_KEY_ID=rzp_test_RkqqfmhBYvh7c5
echo RAZORPAY_KEY_SECRET=U7pcwC3yR7T8rKUch0GEkFqc
echo.
echo # MSG91 SMS Configuration
echo MSG91_AUTH_KEY=480068AuNZVGZoLD69289ec2P1
echo.
echo # Hugging Face AI Configuration
echo HUGGINGFACE_API_KEY=%HF_KEY%
echo USE_AI_PROCESSING=true
) > .env
cd ..
echo [OK] .env file updated
echo.

echo Step 3: Committing changes...
echo ----------------------------------------
git add server/services/huggingface.js
git add server/routes/voice.js
git add server/.env
git add HUGGINGFACE_INTEGRATION.md
git add setup-huggingface.bat
echo.

git commit -m "Switch to Hugging Face AI backend for voice assistant"
echo.

echo Step 4: Pushing to GitHub...
echo ----------------------------------------
git push origin main
echo.

echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Update Render Environment Variables:
echo    - Go to: https://dashboard.render.com
echo    - Select your service
echo    - Go to Environment tab
echo    - Add: HUGGINGFACE_API_KEY = %HF_KEY%
echo    - Add: USE_AI_PROCESSING = true
echo    - Save (will auto-redeploy)
echo.
echo 2. Wait 2-3 minutes for deployment
echo.
echo 3. Test health endpoint:
echo    https://waitnot-restaurant-app.onrender.com/api/voice/health
echo.
echo 4. Test voice command in your app!
echo.
echo See HUGGINGFACE_INTEGRATION.md for full documentation.
echo.
pause
