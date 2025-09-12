import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Auth Flow
  Loading: undefined;
  Login: undefined;
  Register: { role: 'farmer' | 'bank' | 'coop' };
  OTPVerification: { identifier: string; type: 'phone' | 'email' };
  Onboarding: undefined;

  // Main Flow
  MainTabs: undefined;
  Home: undefined;
  Profile: undefined;
  History: undefined;
};

export type StackScreen<T extends keyof RootStackParamList> = React.FC<NativeStackScreenProps<RootStackParamList, T>>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 