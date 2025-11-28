import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine, Camera } from 'lucide-react';

const QRScanner = ({ onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
      );
      
      setScanning(true);
      setError('');
    } catch (err) {
      console.error('Scanner start error:', err);
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Scanner stop error:', err);
      }
    }
  };

  const onScanSuccess = (decodedText) => {
    try {
      // Extract restaurant ID and table number from URL
      // Expected format: https://yourapp.com/qr/restaurantId/tableNumber
      const match = decodedText.match(/\/qr\/([^\/]+)\/([^\/]+)/);
      
      if (match) {
        const restaurantId = match[1];
        const tableNumber = match[2];
        
        // Stop scanner before navigation
        stopScanner();
        
        // Navigate to QR order page
        navigate(`/qr/${restaurantId}/${tableNumber}`);
        onClose();
      } else {
        setError('Invalid QR code. Please scan a valid restaurant QR code.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('QR processing error:', err);
      setError('Failed to process QR code');
    }
  };

  const onScanFailure = (error) => {
    // Ignore scan failures (happens when no QR code is in view)
  };

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera size={24} className="text-red-500" />
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <div className="w-full max-w-md px-4">
          <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>
          
          {/* Scanning Animation Overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/30 rounded-2xl relative">
                {/* Corner decorations */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl"></div>
                
                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-scan"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 text-white p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <ScanLine className="text-red-500 animate-pulse" size={32} />
        </div>
        <p className="text-sm text-gray-300 mb-1">
          Position the QR code within the frame
        </p>
        <p className="text-xs text-gray-500">
          The scanner will automatically detect the code
        </p>
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
