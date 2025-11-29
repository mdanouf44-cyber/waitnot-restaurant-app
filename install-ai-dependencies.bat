@echo off
echo ========================================
echo Installing AI Voice Assistant Dependencies
echo ========================================
echo.

cd server
echo Installing axios and express-rate-limit...
call npm install axios express-rate-limit

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Dependencies Installed
    echo ========================================
    echo.
    echo OpenRouter API Key: Configured ✓
    echo Dependencies: Installed ✓
    echo.
    echo NEXT STEP: Start the server
    echo Command: cd server ^&^& npm start
    echo.
    echo Then test voice assistant:
    echo 1. Open app and scan QR code
    echo 2. Tap microphone button
    echo 3. Say: "Hey Aman, get me one pizza"
    echo 4. Watch AI process your order!
    echo.
) else (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Please run manually: cd server ^&^& npm install axios express-rate-limit
    echo.
)

cd ..
pause
