# MSG91 SMS OTP Implementation Guide

## Overview

This guide shows how to implement MSG91 SMS OTP authentication for your restaurant app.

## Your MSG91 Credentials

Based on your screenshot:
- **Auth Key**: `4800******************c2P1` (use your full key)
- **Status**: Active (Admin)
- **IP Security**: OFF

## Backend Implementation

### 1. Install MSG91 Package

```bash
cd server
npm install msg91-sms
```

### 2. Update Environment Variables

Add to `server/.env`:

```env
MSG91_AUTH_KEY=4800******************c2P1
MSG91_SENDER_ID=WAITNT
MSG91_TEMPLATE_ID=your_template_id
```

### 3. Create MSG91 Service

Create `server/services/msg91Service.js`:

```javascript
import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '4800******************c2P1';
const MSG91_BASE_URL = 'https://control.msg91.com/api/v5';

class MSG91Service {
  // Send OTP
  async sendOTP(mobile, otp) {
    try {
      const response = await axios.post(
        `${MSG91_BASE_URL}/otp`,
        {
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: mobile,
          authkey: MSG91_AUTH_KEY,
          otp: otp,
          otp_expiry: 5 // 5 minutes
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'authkey': MSG91_AUTH_KEY
          }
        }
      );

      return {
        success: true,
        message: 'OTP sent successfully',
        data: response.data
      };
    } catch (error) {
      console.error('MSG91 Send OTP Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  }

  // Verify OTP
  async verifyOTP(mobile, otp) {
    try {
      const response = await axios.get(
        `${MSG91_BASE_URL}/otp/verify`,
        {
          params: {
            authkey: MSG91_AUTH_KEY,
            mobile: mobile,
            otp: otp
          }
        }
      );

      return {
        success: true,
        message: 'OTP verified successfully',
        data: response.data
      };
    } catch (error) {
      console.error('MSG91 Verify OTP Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid OTP'
      };
    }
  }

  // Resend OTP
  async resendOTP(mobile) {
    try {
      const response = await axios.post(
        `${MSG91_BASE_URL}/otp/retry`,
        {
          authkey: MSG91_AUTH_KEY,
          mobile: mobile,
          retrytype: 'text' // or 'voice'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'authkey': MSG91_AUTH_KEY
          }
        }
      );

      return {
        success: true,
        message: 'OTP resent successfully',
        data: response.data
      };
    } catch (error) {
      console.error('MSG91 Resend OTP Error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP'
      };
    }
  }

  // Generate random OTP
  generateOTP(length = 6) {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export default new MSG91Service();
```

### 4. Create Authentication Routes

Create `server/routes/msg91Auth.js`:

```javascript
import express from 'express';
import msg91Service from '../services/msg91Service.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Store OTPs temporarily (use Redis in production)
const otpStore = new Map();

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile, name } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'Valid 10-digit mobile number is required'
      });
    }

    // Generate OTP
    const otp = msg91Service.generateOTP();

    // Store OTP with expiry (5 minutes)
    otpStore.set(mobile, {
      otp,
      name,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    // Send OTP via MSG91
    const result = await msg91Service.sendOTP(mobile, otp);

    if (result.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        // For development only - remove in production
        devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP'
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number and OTP are required'
      });
    }

    const storedData = otpStore.get(mobile);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'OTP expired or not found. Please request a new OTP'
      });
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        error: 'OTP expired. Please request a new OTP'
      });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        error: 'Too many failed attempts. Please request a new OTP'
      });
    }

    // Verify OTP
    if (storedData.otp === otp) {
      // Clear OTP
      otpStore.delete(mobile);

      // Generate JWT token
      const token = jwt.sign(
        { mobile, name: storedData.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          mobile,
          name: storedData.name
        }
      });
    } else {
      // Increment attempts
      storedData.attempts += 1;
      otpStore.set(mobile, storedData);

      res.status(400).json({
        success: false,
        error: 'Invalid OTP',
        attemptsLeft: 3 - storedData.attempts
      });
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number is required'
      });
    }

    const storedData = otpStore.get(mobile);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No OTP request found. Please send OTP first'
      });
    }

    // Generate new OTP
    const otp = msg91Service.generateOTP();

    // Update stored OTP
    otpStore.set(mobile, {
      ...storedData,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    // Resend OTP via MSG91
    const result = await msg91Service.sendOTP(mobile, otp);

    if (result.success) {
      res.json({
        success: true,
        message: 'OTP resent successfully',
        // For development only
        devOTP: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
});

export default router;
```

### 5. Update Server.js

Add to `server/server.js`:

```javascript
import msg91AuthRoutes from './routes/msg91Auth.js';

// Add route
app.use('/api/auth', msg91AuthRoutes);
```

## Frontend Implementation

### 1. Update UserLogin Component

Update `client/src/pages/UserLogin.jsx`:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Key, ArrowRight, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function UserLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOTP, setDevOTP] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!name) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/send-otp', {
        mobile,
        name
      });

      if (data.success) {
        setStep('otp');
        setDevOTP(data.devOTP || '');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/verify-otp', {
        mobile,
        otp
      });

      if (data.success) {
        // Store user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate to home
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/resend-otp', {
        mobile
      });

      if (data.success) {
        setDevOTP(data.devOTP || '');
        startResendTimer();
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Welcome to WaitNot
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Dev OTP Display (Development Only) */}
        {devOTP && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
            <strong>Dev OTP:</strong> {devOTP}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-700">
                <span className="px-4 py-3 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 px-4 py-3 focus:outline-none bg-transparent text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                'Sending OTP...'
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                OTP sent to +91 {mobile}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                'Verifying...'
              ) : (
                <>
                  Verify OTP
                  <Key size={20} />
                </>
              )}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setDevOTP('');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                Change Number
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || loading}
                className="text-primary hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <RefreshCw size={16} />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

## MSG91 Dashboard Setup

### 1. Create SMS Template

1. Go to MSG91 Dashboard
2. Navigate to **SMS** > **Templates**
3. Click **Create Template**
4. Template content:
   ```
   Your WaitNot OTP is {#var#}. Valid for 5 minutes. Do not share with anyone.
   ```
5. Get Template ID and add to `.env`

### 2. Configure Sender ID

1. Go to **Settings** > **Sender ID**
2. Add sender ID: `WAITNT` or your preferred name
3. Wait for approval (usually 24-48 hours)

## Testing

### Development Mode:
- OTP is returned in API response for testing
- No actual SMS sent (optional)

### Production Mode:
- Real SMS sent via MSG91
- OTP not returned in response
- Use real mobile numbers

## Security Best Practices

1. **Rate Limiting**: Limit OTP requests per mobile number
2. **OTP Expiry**: Set 5-minute expiry
3. **Attempt Limits**: Max 3 verification attempts
4. **Use Redis**: Store OTPs in Redis instead of Map
5. **HTTPS Only**: Always use HTTPS in production
6. **Hide Auth Key**: Never expose in frontend

## Cost Estimation

MSG91 Pricing (approximate):
- Transactional SMS: ₹0.15 - ₹0.25 per SMS
- OTP SMS: ₹0.20 per SMS
- Bulk rates available

## Next Steps

1. Replace `4800******************c2P1` with your full auth key
2. Create SMS template in MSG91 dashboard
3. Get template ID
4. Update environment variables
5. Test in development mode
6. Deploy to production
