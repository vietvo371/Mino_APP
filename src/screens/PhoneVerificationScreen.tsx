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

const PhoneVerificationScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [isCodeSent, setIsCodeSent] = React.useState(false);

  const handleSendCode = () => {
    if (!phone || phone.length < 8) {
      Alert.alert('Phone', 'Please enter a valid phone number');
      return;
    }
    setIsCodeSent(true);
    Alert.alert('Phone', 'An OTP has been sent to your phone');
  };

  const handleVerify = () => {
    if (!code || code.length < 4) {
      Alert.alert('Verification', 'Please enter the OTP code');
      return;
    }
    Alert.alert('Success', 'Your phone number has been verified');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phone Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>Enter your phone number to receive an OTP</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={20} color="#34C759" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                style={styles.textInput}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode}>
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </TouchableOpacity>
          </View>

          {isCodeSent && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>OTP Code</Text>
              <View style={styles.inputWrapper}>
                <Icon name="shield-key" size={20} color="#7B68EE" />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter the OTP"
                  keyboardType="number-pad"
                  style={styles.textInput}
                  placeholderTextColor="#8E8E93"
                />
              </View>
              <TouchableOpacity style={[styles.primaryButton, styles.verifyButton]} onPress={handleVerify}>
                <Text style={styles.primaryButtonText}>Verify Phone</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  headerRight: { width: 40 },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 } }),
  },
  title: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 16 },
  inputGroup: { marginTop: 8, marginBottom: 8 },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textInput: { flex: 1, color: '#000', fontSize: 16 },
  primaryButton: { marginTop: 12, backgroundColor: '#4A90E2', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  verifyButton: { backgroundColor: '#7B68EE' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default PhoneVerificationScreen;


