import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Auth Flow
  Loading: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: { 
    identifier: string; 
    type: 'phone' | 'email';
    flow?: 'register' | 'login';
    registrationData?: any;
  };
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
      id: number;
      id_bank: number;
      name_ekyc: string;
      bank_number: string;
      is_default: number;
      created_at: string;
      updated_at: string;
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
  DetailHistory: {
    transaction: {
      id: string;
      type: 'buy' | 'sell';
      amount: string;
      usdt: string;
      exchangeRate: string;
      status: 'pending' | 'completed' | 'failed';
      date: string;
      time: string;
      transactionId: string;
      fee: string;
      totalAmount: string;
      receiveAddress?: string;
      bankAccount?: string;
      transferInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        transferContent: string;
        amount: string;
      };
    };
  };

  // Settings Flow
  EmailVerification: undefined;
  PhoneVerification: undefined;
  EditProfile: undefined;
  ChangePassword: {
    identifier: string;
    type: 'phone' | 'email';
    flow?: 'register' | 'forgot';
    token: string;
  };
  SuccessTransactionDetail: { 
    transaction?: any; 
    idTransaction?: number; 
    type?: 'buy' | 'sell'; 
  };
  FailedTransactionDetail: { 
    transaction?: any; 
    idTransaction?: number; 
    type?: 'buy' | 'sell'; 
  };
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