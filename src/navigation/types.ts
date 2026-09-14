export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: { initialRole?: 'student' | 'alumni' | 'business' | 'admin' };
  VerifyOTP: { email: string; name: string; role: string; code?: string };
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
