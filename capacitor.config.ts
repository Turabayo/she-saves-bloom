
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f57f84ba56c24aa5bd1d0f19d5ef2b7f',
  appName: 'shesaves',
  webDir: 'dist',
  server: {
    url: 'https://f57f84ba-56c2-4aa5-bd1d-0f19d5ef2b7f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
