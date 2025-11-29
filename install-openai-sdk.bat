@echo off
echo ========================================
echo INSTALLING OPENAI SDK FOR OPENROUTER
echo ========================================
echo.

echo Step 1: Installing openai package...
cd server
call npm install openai@^4.20.0
cd ..
echo.

echo Step 2: Adding changes to git...
git add server/package.json server/package-lock.json server/services/openrouter.js
echo.

echo Step 3: Committing changes...
git commit -m "Fix: Switch to OpenAI SDK for OpenRouter integration"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo The OpenAI SDK has been installed and deployed.
echo Render will automatically redeploy in 1-2 minutes.
echo.
echo WHAT WAS CHANGED:
echo - Added openai package (v4.20.0)
echo - Replaced axios with OpenAI SDK
echo - Using official OpenRouter integration method
echo - Better error handling and logging
echo.
echo TEST THE FIX:
echo 1. Wait 2 minutes for Render to redeploy
echo 2. Try voice command: "Hey Aman, get me one pizza"
echo 3. Should work with AI processing now
echo.
pause
