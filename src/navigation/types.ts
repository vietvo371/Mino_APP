import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Auth Flow
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { identifier: string; type: 'phone' | 'email' };
  Onboarding: undefined;
  ForgotPassword: undefined;
  
  // eKYC Flow
  EkycIntro: undefined;
  EkycIDCard: undefined;
  EkycSelfie: undefined;
  EkycInformation: undefined;
  EkycReview: undefined;
  EkycSuccess: undefined;

  // Main Flow
  MainTabs: undefined;
  Home: undefined;
  Profile: undefined;
  History: undefined;
  Wallet: undefined;
  Transaction: undefined;
  Deposit: undefined;
  Withdraw: undefined;
  BankAccounts: undefined;
  TRC20Addresses: undefined;
  AddBankAccount: undefined;
  AddTRC20Address: undefined; 
  EditBankAccount: {
    account: {
      id: string;
      bank: string;
      accountNumber: string;
      accountName: string;
      isDefault?: boolean;
    };
  };
  EditTRC20Address: {
    address: {
      id: string;
      name: string;
      address: string;
      isDefault?: boolean;
    };
  };
  Payment: {
    paymentInfo: {
      type: 'buy' | 'sell';
      amount: string;
      rate: number;
    };
  };

  // Settings Flow
  Settings: undefined;
  Security: undefined;
  Notifications: undefined;
  Help: undefined;
};

export type StackScreen<T extends keyof RootStackParamList> = React.FC<NativeStackScreenProps<RootStackParamList, T>>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 