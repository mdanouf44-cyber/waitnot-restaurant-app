# 🔍 VOICE API ERROR DIAGNOSIS

## ❌ **ERROR RECEIVED**

```json
{
  "action": "error",
  "items": [],
  "table": "",
  "reply": "Sorry, I encountered an error. Please try again.",
  "error": "Internal error",
  "source": "error"
}
```

---

## 🔍 **POSSIBLE CAUSES**

### 1. Restaurant ID doesn't exist
**Issue:** Restaurant with ID "1" not found in database

**Solution:** Use a valid restaurant ID or test without one

**Test:**
```bash
# Try without restaurant ID
curl -X POST https://waitnot-restaurant-app.onrender.com/api/voice/process -H "Content-Type: application/json" -d "{\"command\":\"Hey Aman, get me one pizza\"}"
```

### 2. Hugging Face API Error
**Issue:** Hugging Face API call failing

**Check:**
```bash
curl https://waitnot-restaurant-app.onrender.com/api/voice/health
```

Look for `huggingfaceError` field

### 3. Database Error
**Issue:** Error reading from database

**Check:** Render logs for database errors

### 4. Timeout
**Issue:** Hugging Face taking too long (> 30s)

**Solution:** Wait and try again (first request loads models)

---

## 🔧 **FIXES DEPLOYED**

### Just Deployed (Commit d09c482):
- ✅ Better error logging
- ✅ Database error handling
- ✅ More detailed error messages
- ✅ Restaurant lookup error catching

**Wait 1-2 minutes for Render to redeploy, then test again!**

---

## 🧪 **TESTING STEPS**

### Step 1: Wait for Deployment
```
Check: https://dashboard.render.com
Look for: "Deploy live for commit d09c482"
Wait: 1-2 minutes
```

### Step 2: Test Health Endpoint
```bash
curl https://waitnot-restaurant-app.onrender.com/api/voice/health
```

**Check:**
- `huggingfaceLoaded`: should be `true`
- `huggingfaceError`: should be `null`

### Step 3: Test Voice API Again
```bash
curl -X POST https://waitnot-restaurant-app.onrender.com/api/voice/process -H "Content-Type: application/json" -d "{\"command\":\"Hey Aman, get me one pizza\",\"restaurantId\":\"1\"}"
```

**Now the error message should be more specific!**

### Step 4: Check Render Logs
1. Go to Render dashboard
2. Click on your service
3. View "Logs" tab
4. Look for error details

---

## 📊 **EXPECTED BEHAVIOR AFTER FIX**

### If Restaurant Not Found:
```json
{
  "action": "order",
  "items": [],
  "reply": "Sorry, I couldn't find that item on the menu.",
  "source": "fallback"
}
```

### If Hugging Face Error:
```json
{
  "action": "error",
  "error": "Hugging Face API error: [specific error]",
  "source": "error"
}
```

### If Success:
```json
{
  "action": "order",
  "items": [{"name": "Pizza", "quantity": 1}],
  "reply": "Sure! I've added 1 Pizza to your order.",
  "source": "huggingface-ai"
}
```

---

## 🎯 **ALTERNATIVE TESTS**

### Test 1: Without Restaurant ID
```bash
curl -X POST https://waitnot-restaurant-app.onrender.com/api/voice/process -H "Content-Type: application/json" -d "{\"command\":\"Hey Aman, what's my bill?\"}"
```

This should work even without a restaurant!

### Test 2: Bill Request (Simpler)
```bash
curl -X POST https://waitnot-restaurant-app.onrender.com/api/voice/process -H "Content-Type: application/json" -d "{\"command\":\"Hey Aman, what's my bill?\",\"restaurantId\":\"1\"}"
```

This doesn't need menu items.

### Test 3: Check Logs
```bash
# After running the test, check Render logs immediately
# You should see detailed error information
```

---

## 🔍 **WHAT TO LOOK FOR IN LOGS**

After the fix, logs will show:
```
Voice command received: { command: '...', restaurantId: '1' }
Hugging Face status: { loaded: true, error: null }
Clean command: get me one pizza
Restaurant found: [restaurant name or 'Not found']
Menu items: [number]
```

If error occurs:
```
Voice processing error: [Error object]
Error stack: [Stack trace]
Error details: {
  message: [specific error],
  name: [error type],
  command: [your command],
  restaurantId: [restaurant ID]
}
```

---

## ⏰ **TIMELINE**

| Time | Action | Status |
|------|--------|--------|
| Now | Fix deployed (d09c482) | ✅ |
| +1 min | Render building | 🔄 |
| +2 min | Render live | ⏳ |
| +3 min | Ready to test | 📋 |

---

## 🎯 **NEXT STEPS**

1. **Wait 2 minutes** for Render deployment
2. **Test health endpoint** - Verify huggingfaceLoaded: true
3. **Test voice API again** - Error message will be more specific
4. **Check Render logs** - See detailed error information
5. **Report back** - Share the new error message

---

**The fix is deployed! Wait 2 minutes and test again. The error message will now tell us exactly what's wrong!** 🔍✨

---

*Fix Deployed: November 30, 2025*  
*Commit: d09c482*  
*Status: Waiting for Render deployment*
