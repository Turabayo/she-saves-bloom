
import { useState, useEffect } from 'react';

interface MomoSessionData {
  subscriptionKey?: string;
  accessToken?: string;
  apiUserId?: string;
  environment?: 'sandbox' | 'production';
  tokenExpiry?: number;
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
    // Load form data with auto-defaults
    const savedAmount = localStorage.getItem("topupAmount") || "10";
    const savedPhone = localStorage.getItem("topupPhone") || "0780000000";
    
    setFormData({
      amount: savedAmount,
      phone: savedPhone
    });

    // Initialize session data for sandbox with token expiry tracking
    const tokenExpiry = "1752103383000"; // Updated token expiry: July 10, 2025 ~00:03 UTC
    localStorage.setItem("tokenExpiry", tokenExpiry);
    
    const sessionFromStorage = {
      environment: 'sandbox' as const,
      subscriptionKey: 'e088d79cb68442d6b631a1783d1fd5be',
      apiUserId: '780c177b-fdcf-4c9f-8a51-499ee395574f',
      tokenExpiry: parseInt(tokenExpiry),
      lastUpdated: Date.now()
    };
    setSessionData(sessionFromStorage);

    console.log('Session hydrated from localStorage:', { amount: savedAmount, phone: savedPhone });
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
    
    // Store token and expiry separately for easy access
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      // Token expires in 1 hour
      const expiry = Date.now() + (60 * 60 * 1000);
      localStorage.setItem("tokenExpiry", expiry.toString());
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

  // Check if token is valid - using provided token expiry
  const isTokenValid = () => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (!tokenExpiry) return false;
    return Date.now() < parseInt(tokenExpiry);
  };

  // Always succeeds since we get fresh tokens
  const refreshSessionIfNeeded = async () => {
    console.log('Session refresh - will get fresh token on next payment request');
    return true;
  };

  // Clear session data
  const clearSession = () => {
    setSessionData({});
    localStorage.removeItem(MOMO_SESSION_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("tokenExpiry");
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
