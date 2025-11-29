@echo off
echo ========================================
echo TESTING VOICE API
echo ========================================
echo.

echo Test 1: Health Check
echo URL: https://waitnot-restaurant-app.onrender.com/api/voice/health
echo.
curl -s https://waitnot-restaurant-app.onrender.com/api/voice/health
echo.
echo.

echo Test 2: Voice Command
echo URL: https://waitnot-restaurant-app.onrender.com/api/voice/process
echo Command: "Hey Aman, get me one pizza"
echo.
curl -s -X POST https://waitnot-restaurant-app.onrender.com/api/voice/process ^
  -H "Content-Type: application/json" ^
  -d "{\"command\":\"Hey Aman, get me one pizza\",\"restaurantId\":\"1\"}"
echo.
echo.

echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo If you see JSON responses above, the API is working!
echo.
echo Expected in response:
echo - "action": "order" or "error"
echo - "source": "ai" or "fallback"
echo - "reply": "Sure! I've added..."
echo.
pause
