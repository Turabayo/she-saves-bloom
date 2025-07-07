import { useState, useEffect } from 'react';

interface MomoSessionData {
  subscriptionKey?: string;
  accessToken?: string;
  apiUserId?: string;
  environment?: 'sandbox' | 'production';
  lastUpdated?: number;
}

interface FormData {
  amount: string;
  phone: string;
}

const MOMO_SESSION_KEY = 'momo_session_data';
const MOMO_FORM_KEY = 'momo_form_data';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

export const useMomoSession = () => {
  const [sessionData, setSessionData] = useState<MomoSessionData>({});
  const [formData, setFormData] = useState<FormData>({
    amount: '10',
    phone: '46733123454'
  });

  // Load session data from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(MOMO_SESSION_KEY);
    const savedForm = localStorage.getItem(MOMO_FORM_KEY);
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSessionData(parsed);
      } catch (error) {
        console.error('Error parsing saved session data:', error);
      }
    }

    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData(parsed);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
        // Keep default values if parsing fails
      }
    }
  }, []);

  // Save session data to localStorage
  const saveSessionData = (data: Partial<MomoSessionData>) => {
    const updatedData = {
      ...sessionData,
      ...data,
      lastUpdated: Date.now()
    };
    setSessionData(updatedData);
    localStorage.setItem(MOMO_SESSION_KEY, JSON.stringify(updatedData));
  };

  // Save form data to localStorage
  const saveFormData = (data: FormData) => {
    setFormData(data);
    localStorage.setItem(MOMO_FORM_KEY, JSON.stringify(data));
  };

  // Check if token is valid and not expired
  const isTokenValid = () => {
    if (!sessionData.accessToken) return false;
    
    const lastUpdated = sessionData.lastUpdated || 0;
    const currentTime = Date.now();
    const tokenAge = currentTime - lastUpdated;
    
    // Assume token expires after 1 hour, refresh if older than 55 minutes
    return tokenAge < (55 * 60 * 1000);
  };

  // Refresh session if needed
  const refreshSessionIfNeeded = async () => {
    if (!isTokenValid()) {
      console.log('Token expired or missing, would refresh here in production');
      // In production, this would make an API call to refresh the token
      // For sandbox, we're using a static token
      return false;
    }
    return true;
  };

  // Clear session data
  const clearSession = () => {
    setSessionData({});
    localStorage.removeItem(MOMO_SESSION_KEY);
  };

  // Clear form data
  const clearFormData = () => {
    setFormData({
      amount: '10',
      phone: '46733123454'
    });
    localStorage.removeItem(MOMO_FORM_KEY);
  };

  return {
    sessionData,
    formData,
    saveSessionData,
    saveFormData,
    isTokenValid,
    refreshSessionIfNeeded,
    clearSession,
    clearFormData
  };
};
