// Example component showing how to add a device to database from frontend
"use client";
import { useState } from "react";

export default function AddDeviceButton({ 
  deviceData 
}: { 
  deviceData: {
    name: string;
    type: string;
    status: string;
    location: string;
    ipAddress: string;
    macAddress: string;
    serialNumber: string;
    firmwareVersion: string;
    ownerId: string;
  }
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addDeviceToDatabase = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/device/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ Device added to database! Cache updated: ${result.cacheUpdated}`);
      } else {
        setMessage(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={addDeviceToDatabase}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding to DB...' : 'Add to Database'}
      </button>
      
      {message && (
        <p className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
