
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

export const useMomoSession = () => {
  const [sessionData, setSessionData] = useState<MomoSessionData>({});
  const [formData, setFormData] = useState<FormData>({
    amount: '10',
    phone: '0780000000'
  });

  // Load session data and form data from localStorage on mount
  useEffect(() => {
    // Always hydrate session from localStorage
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      const sessionFromStorage = {
        environment: 'sandbox' as const,
        subscriptionKey: 'e088d79cb68442d6b631a1783d1fd5be',
        accessToken: token,
        apiUserId: '780c177b-fdcf-4c9f-8a51-499ee395574f',
        lastUpdated: Date.now()
      };
      setSessionData(sessionFromStorage);
    }

    // Load form data with auto-defaults
    const savedAmount = localStorage.getItem("topupAmount") || "10";
    const savedPhone = localStorage.getItem("topupPhone") || "0780000000";
    
    setFormData({
      amount: savedAmount,
      phone: savedPhone
    });

    console.log('Session hydrated from localStorage:', { token: !!token, amount: savedAmount, phone: savedPhone });
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
    
    // Store access token separately for easy access
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
  };

  // Save form data to localStorage with auto-save
  const saveFormData = (data: FormData) => {
    setFormData(data);
    localStorage.setItem(MOMO_FORM_KEY, JSON.stringify(data));
    
    // Auto-save individual values
    localStorage.setItem("topupAmount", data.amount);
    localStorage.setItem("topupPhone", data.phone);
    
    console.log('Form data auto-saved:', data);
  };

  // Session is always valid if we have a token
  const isTokenValid = () => {
    const storedToken = localStorage.getItem("accessToken");
    return !!storedToken; // Simplified - always valid if exists
  };

  // Refresh session always succeeds if we have a token
  const refreshSessionIfNeeded = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log('Session refreshed from localStorage');
      return true;
    }
    return false;
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
      phone: '0780000000'
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
