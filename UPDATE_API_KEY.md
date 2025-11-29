# 🔑 UPDATE OPENROUTER API KEY

## 📝 **INSTRUCTIONS**

You need to update the OpenRouter API key in two places:

---

## 1️⃣ **LOCAL ENVIRONMENT (.env file)**

### File: `server/.env`

Update this line:
```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_FULL_KEY_HERE
```

**Your new key starts with:** `sk-or-v1-b88...`

**Replace with your complete key from OpenRouter dashboard.**

---

## 2️⃣ **RENDER ENVIRONMENT VARIABLES**

### Steps:

1. **Go to Render Dashboard**
   ```
   https://dashboard.render.com
   ```

2. **Select Your Service**
   - Find: `waitnot-restaurant-app`
   - Click on it

3. **Go to Environment Tab**
   - Click "Environment" in left sidebar

4. **Update OPENROUTER_API_KEY**
   - Find: `OPENROUTER_API_KEY`
   - Click "Edit"
   - Paste your full key: `sk-or-v1-b88...` (complete key)
   - Click "Save Changes"

5. **Render Will Auto-Redeploy**
   - Wait 1-2 minutes
   - Server will restart with new key

---

## 🔍 **GET YOUR FULL API KEY**

### From OpenRouter Dashboard:

1. Go to: https://openrouter.ai/keys
2. Find your key that starts with `sk-or-v1-b88...`
3. Copy the **complete key** (should be ~70 characters)
4. Paste it in both places above

---

## ✅ **VERIFY KEY IS WORKING**

### After updating:

1. **Check Render Logs**
   ```
   ✅ OpenRouter AI service loaded successfully
   ```

2. **Test Voice Command**
   ```
   "Hey Aman, get me one pizza"
   ```

3. **Check Response**
   ```json
   {
     "source": "ai"  ← AI is working!
   }
   ```

---

## 🚨 **IMPORTANT NOTES**

### Security:
- ⚠️ **Never commit .env file to Git**
- ⚠️ **Keep API key secret**
- ⚠️ **Don't share in screenshots**

### Key Format:
```
sk-or-v1-[64 random characters]
```

Example length: `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`

---

## 📞 **NEED HELP?**

### If key doesn't work:

1. **Verify key is active** on OpenRouter dashboard
2. **Check usage limits** - Make sure you have credits
3. **Try creating new key** if old one expired
4. **Check Render logs** for authentication errors

---

## 🎯 **QUICK STEPS**

1. Get full API key from OpenRouter
2. Update `server/.env` locally
3. Update Render environment variable
4. Wait for Render to redeploy
5. Test voice command
6. Should work! ✅

---

*Note: The key you provided (sk-or-v1-b88...2cb) appears to be truncated. You need the complete key.*
