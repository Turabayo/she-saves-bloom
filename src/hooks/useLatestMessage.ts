import { useState, useEffect } from 'react';

export const useLatestMessage = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://jvtpxaojthbojgtkrqfe.functions.supabase.co/get-lovable-message");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse as JSON first, fallback to text
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
        setMessage(data.message || data.content || data.text || JSON.stringify(data));
      } else {
        data = await response.text();
        setMessage(data);
      }
    } catch (err) {
      console.error('Error fetching latest message:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch latest message');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestMessage();
  }, []);

  return { message, loading, error, refetch: fetchLatestMessage };
};