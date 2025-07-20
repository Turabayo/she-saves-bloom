
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useDevice = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');

  useEffect(() => {
    const checkPlatform = async () => {
      const isNativeApp = Capacitor.isNativePlatform();
      const currentPlatform = Capacitor.getPlatform();
      
      setIsNative(isNativeApp);
      setPlatform(currentPlatform as 'web' | 'ios' | 'android');
    };

    checkPlatform();
  }, []);

  return {
    isNative,
    platform,
    isWeb: platform === 'web',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android'
  };
};
