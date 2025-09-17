import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

const EmailVerificationScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isCodeSent, setIsCodeSent] = React.useState(false);

  const handleSendCode = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Email', 'Please enter a valid email address');
      return;
    }
    setIsCodeSent(true);
    Alert.alert('Email', 'A verification code has been sent to your email');
  };

  const handleVerify = () => {
    if (!code || code.length < 4) {
      Alert.alert('Verification', 'Please enter the verification code');
      return;
    }
    Alert.alert('Success', 'Your email has been verified');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>Enter your email to receive a verification code</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={20} color="#4A90E2" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode}>
              <Text style={styles.primaryButtonText}>Send Code</Text>
            </TouchableOpacity>
          </View>

          {isCodeSent && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <View style={styles.inputWrapper}>
                <Icon name="shield-check" size={20} color="#7B68EE" />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter the code"
                  keyboardType="number-pad"
                  style={styles.textInput}
                  placeholderTextColor="#8E8E93"
                />
              </View>
              <TouchableOpacity style={[styles.primaryButton, styles.verifyButton]} onPress={handleVerify}>
                <Text style={styles.primaryButtonText}>Verify Email</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerRight: { width: 40 },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  inputGroup: { marginTop: 8, marginBottom: 8 },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  verifyButton: { backgroundColor: '#7B68EE' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default EmailVerificationScreen;


