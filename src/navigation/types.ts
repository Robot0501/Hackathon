import type { RegistrationPayload } from '../lib/authService';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: { initialRole?: 'student' | 'alumni' | 'business' } | undefined;
  VerifyOTP: { email: string; mode: 'register' | 'login'; registration?: RegistrationPayload };
  Main: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Opportunities: undefined;
  Network: undefined;
  AI: undefined;
  Profile: undefined;
  Admin: undefined;
};
