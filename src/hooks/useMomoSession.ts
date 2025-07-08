
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
    phone: '0780000000' // MTN Rwanda test number
  });

  // Load session data and form data from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(MOMO_SESSION_KEY);
    const savedForm = localStorage.getItem(MOMO_FORM_KEY);
    
    // Load saved amount and phone from localStorage
    const savedAmount = localStorage.getItem("topupAmount") || "10";
    const savedPhone = localStorage.getItem("topupPhone") || "0780000000";
    
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setSessionData(parsed);
      } catch (error) {
        console.error('Error parsing saved session data:', error);
      }
    }

    // Use localStorage values if available, otherwise use defaults
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData(parsed);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
        // Use localStorage values as fallback
        setFormData({
          amount: savedAmount,
          phone: savedPhone
        });
      }
    } else {
      // Initialize with localStorage values
      setFormData({
        amount: savedAmount,
        phone: savedPhone
      });
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
    
    // Also save access token separately for easy access
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
  };

  // Save form data to localStorage
  const saveFormData = (data: FormData) => {
    setFormData(data);
    localStorage.setItem(MOMO_FORM_KEY, JSON.stringify(data));
    
    // Also save individual values
    localStorage.setItem("topupAmount", data.amount);
    localStorage.setItem("topupPhone", data.phone);
  };

  // Check if token is valid and not expired
  const isTokenValid = () => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) return false;
    
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
    localStorage.removeItem("accessToken");
  };

  // Clear form data
  const clearFormData = () => {
    setFormData({
      amount: '10',
      phone: '0780000000' // Reset to MTN Rwanda test number
    });
    localStorage.removeItem(MOMO_FORM_KEY);
    localStorage.removeItem("topupAmount");
    localStorage.removeItem("topupPhone");
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
