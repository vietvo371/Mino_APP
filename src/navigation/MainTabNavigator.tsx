import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';

import LoadingScreen from '../screens/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import EkycIntroScreen from '../screens/EkycIntroScreen';
import EkycIDCardScreen from '../screens/EkycIDCardScreen';
import EkycSelfieScreen from '../screens/EkycSelfieScreen';
import EkycInformationScreen from '../screens/EkycInformationScreen';
import EkycReviewScreen from '../screens/EkycReviewScreen';
import EkycSuccessScreen from '../screens/EkycSuccessScreen';
import WalletScreen from '../screens/WalletScreen';
import SecurityScreen from '../screens/SecurityScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import HelpScreen from '../screens/HelpScreen';
import BankAccountsScreen from '../screens/BankAccountsScreen';
import TRC20AddressesScreen from '../screens/TRC20AddressesScreen';
import AddBankAccountScreen from '../screens/AddBankAccountScreen';
import AddTRC20AddressScreen from '../screens/AddTRC20AddressScreen';
import EditBankAccountScreen from '../screens/EditBankAccountScreen';
import EditTRC20AddressScreen from '../screens/EditTRC20AddressScreen';
import TransactionScreen from '../screens/TransactionScreen';
import PaymentScreen from '../screens/PaymentScreen';
import DetailHistoryScreen from '../screens/DetailHistoryScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SuccessTransactionDetailScreen from '../screens/SuccessTransactionDetailScreen';
import FailedTransactionDetailScreen from '../screens/FailedTransactionDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const MainTabs = () => {
  const { userRole } = useAuth();

  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: "black",
    tabBarInactiveTintColor: theme.colors.textLight,
    tabBarStyle: {
      backgroundColor: theme.colors.white,
      borderTopColor: theme.colors.border,
      height: 60,
      paddingBottom: 14,
      paddingTop: 8,
      marginBottom: 25,
      elevation: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    tabBarLabelStyle: {
      fontFamily: theme.typography.fontFamily,
      fontSize: 12,
    },
  };

  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Loading" 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        animationTypeForReplace: 'push',
        presentation: 'card',
        contentStyle: {
          backgroundColor: theme.colors.white,
        },
      }}>
      {/* Initial Loading Screen */}
      <Stack.Screen name="Loading" component={LoadingScreen} />
      {/* eKYC Stack */}
      <Stack.Group>
        <Stack.Screen name="EkycIntro" component={EkycIntroScreen} />
        <Stack.Screen name="EkycIDCard" component={EkycIDCardScreen} />
        <Stack.Screen name="EkycSelfie" component={EkycSelfieScreen} />
        <Stack.Screen name="EkycInformation" component={EkycInformationScreen} />
        <Stack.Screen name="EkycReview" component={EkycReviewScreen} />   
        <Stack.Screen name="EkycSuccess" component={EkycSuccessScreen} />
      </Stack.Group>
      {/* Auth Stack */}
      <Stack.Group>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Group>
      {/* Main Stack */}
      <Stack.Group>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="SuccessTransactionDetail" component={SuccessTransactionDetailScreen} />
        <Stack.Screen name="FailedTransactionDetail" component={FailedTransactionDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
        <Stack.Screen name="TRC20Addresses" component={TRC20AddressesScreen} />
        <Stack.Screen name="AddBankAccount" component={AddBankAccountScreen} />
        <Stack.Screen name="AddTRC20Address" component={AddTRC20AddressScreen} />
        <Stack.Screen name="EditBankAccount" component={EditBankAccountScreen} />
        <Stack.Screen name="EditTRC20Address" component={EditTRC20AddressScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="DetailHistory" component={DetailHistoryScreen} />
      </Stack.Group>

    </Stack.Navigator>
  );
};

export default MainNavigator;