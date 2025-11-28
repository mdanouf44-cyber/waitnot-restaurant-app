import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-scanner';
import { X, ScanLine } from 'lucide-react';

const QRScanner = ({ onClose }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleScan = (result) => {
    if (result) {
      try {
        const url = result.text || result;
        
        // Extract restaurant ID and table number from URL
        // Expected format: https://yourapp.com/qr/restaurantId/tableNumber
        const match = url.match(/\/qr\/([^\/]+)\/([^\/]+)/);
        
        if (match) {
          const restaurantId = match[1];
          const tableNumber = match[2];
          
          // Navigate to QR order page
          navigate(`/qr/${restaurantId}/${tableNumber}`);
          onClose();
        } else {
          setError('Invalid QR code. Please scan a valid restaurant QR code.');
        }
      } catch (err) {
        setError('Failed to process QR code');
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setError('Camera access denied or not available');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="w-full max-w-md aspect-square relative">
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            constraints={{
              video: { facingMode: 'environment' }
            }}
          />
          
          {/* Scanning Frame Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white rounded-2xl">
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-500 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-500 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-500 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-500 rounded-br-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-900 text-white p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <ScanLine className="text-red-500 animate-pulse" size={32} />
        </div>
        <p className="text-sm text-gray-300">
          Position the QR code within the frame
        </p>
        {error && (
          <p className="mt-2 text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
