# 🧪 QUICK TEST GUIDE - Voice API Fix

## ⏱️ **WAIT 2 MINUTES FIRST**

Render is deploying commit f75afc2 right now...

---

## 🎯 **3-STEP TEST**

### Step 1: Open App
```
https://waitnot-restaurant-app.onrender.com
```

### Step 2: Navigate to Restaurant
- Click any restaurant from home page
- Or scan a QR code

### Step 3: Test Voice
1. Click microphone button 🎤
2. Say: **"Hey Aman, get me one pizza"**
3. Check if item is added to cart

---

## ✅ **SUCCESS INDICATORS**

You'll know it's working when:
- ✅ Microphone button turns green
- ✅ Beep sound plays
- ✅ Voice says "Yes, I'm listening"
- ✅ Item appears in cart
- ✅ Voice confirms the order

---

## 🔍 **CHECK NETWORK TAB**

1. Open DevTools (F12)
2. Go to Network tab
3. Try voice command
4. Find: `/api/voice/process`
5. Check: **Status should be 200** (not 500)

---

## 📊 **EXPECTED RESPONSE**

### With AI (Best Case):
```json
{
  "action": "order",
  "items": [{"name": "Pizza", "quantity": 1, "price": 299}],
  "reply": "Sure! I've added 1 Pizza to your order.",
  "source": "ai"
}
```

### With Fallback (Still Good):
```json
{
  "action": "order",
  "items": [{"name": "Pizza", "quantity": 1, "price": 299}],
  "reply": "Sure! I've added 1 Pizza to your order.",
  "source": "fallback"
}
```

### With Error (Graceful):
```json
{
  "action": "error",
  "items": [],
  "reply": "Sorry, I encountered an error. Please try again.",
  "source": "error"
}
```

### ❌ **NEVER:**
```
500 Internal Server Error
```

---

## 🚨 **IF NOT WORKING**

1. **Wait longer** - Render can take 3-5 minutes
2. **Clear cache** - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check Render** - Dashboard should show "Live"
4. **Check logs** - Look for OpenRouter status message
5. **Try again** - Sometimes first request is slow

---

## 📞 **REPORT RESULTS**

### ✅ If Working:
```
SUCCESS! Voice assistant is working.
- Command: "Hey Aman, get me one pizza"
- Result: Item added to cart
- Source: ai / fallback
- Status: 200
```

### ❌ If Not Working:
```
ISSUE: Still having problems
- Error: [paste error message]
- Status: [200/500/other]
- Console: [paste console errors]
- Logs: [paste Render logs]
```

---

## ⏰ **TIMELINE**

- 6:53 PM - Fix pushed to GitHub ✅
- 6:54 PM - Render started deploying 🔄
- 6:56 PM - Expected live ⏳
- 6:58 PM - Ready to test 🧪

**Current time: Check your clock!**

---

**Good luck! The fix should be working now!** 🎉

*Test after: 6:56 PM GMT*  
*Expected: 100% success*
