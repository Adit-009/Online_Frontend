import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Loader = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState('Waking up server... Please wait');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'https://online-backend-b1qx.onrender.com';

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            navigate('/home');
          }
        }
      } catch (error) {
        setRetryCount(prev => prev + 1);
        if (retryCount > 5) {
          setMessage('Server is starting, please wait a few seconds...');
        }
      }
    };

    const intervalId = setInterval(checkHealth, 2500);

    return () => clearInterval(intervalId);
  }, [navigate, retryCount, API_URL]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
      </div>

      <div className="text-center space-y-4 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Third Eye Computer Education
        </h1>
        <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
          {message}
        </p>
        <div className="w-48 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-primary animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
        </div>
      </div>

      <div className="fixed bottom-8 text-xs text-muted-foreground opacity-50">
        Status: {retryCount > 0 ? `Retrying (Attempt ${retryCount})` : 'Initializing...'}
      </div>
    </div>
  );
};

export default Loader;
