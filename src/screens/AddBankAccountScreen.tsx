import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const BANKS = [
  'Vietcombank',
  'Techcombank',
  'MB Bank',
  'ACB',
  'VPBank',
  'BIDV',
  // Add other banks
];

const AddBankAccountScreen = () => {
  const navigation = useNavigation();
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [showBankList, setShowBankList] = useState(false);

  const handleSave = () => {
    // Validate and save bank account
    if (!selectedBank || !accountNumber || !accountName) {
      // Show error
      return;
    }
    // Save and navigate back
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bank Account</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Bank Selection */}
        <Text style={styles.label}>Bank</Text>
        <TouchableOpacity 
          style={styles.bankSelector}
          onPress={() => setShowBankList(!showBankList)}
        >
          <Text style={selectedBank ? styles.selectedText : styles.placeholderText}>
            {selectedBank || 'Select bank'}
          </Text>
          <Icon name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showBankList && (
          <View style={styles.bankList}>
            {BANKS.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={styles.bankItem}
                onPress={() => {
                  setSelectedBank(bank);
                  setShowBankList(false);
                }}
              >
                <Text style={[
                  styles.bankItemText,
                  selectedBank === bank && styles.selectedBankText
                ]}>
                  {bank}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Account Number */}
        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={styles.input}
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder="Enter account number"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        {/* Account Name */}
        <Text style={styles.label}>Account Holder Name</Text>
        <TextInput
          style={styles.input}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Enter account holder name"
          autoCapitalize="characters"
          placeholderTextColor="#999"
        />

        {/* Default Account Toggle */}
        <View style={styles.defaultContainer}>
          <View>
            <Text style={styles.defaultTitle}>Set as default account</Text>
            <Text style={styles.defaultDescription}>
              This account will be selected by default when withdrawing
            </Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            Please check account information carefully before saving to ensure accurate transaction processing
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: wp('4%'),
    color: '#4A90E2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  placeholderText: {
    color: '#999',
    fontSize: wp('4%'),
  },
  selectedText: {
    color: '#000',
    fontSize: wp('4%'),
  },
  bankList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: 8,
    maxHeight: hp('30%'),
  },
  bankItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bankItemText: {
    fontSize: wp('4%'),
    color: '#000',
  },
  selectedBankText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  input: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: wp('4%'),
    color: '#000',
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  defaultTitle: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  defaultDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    maxWidth: wp('60%'),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 8,
  },
});

export default AddBankAccountScreen;
