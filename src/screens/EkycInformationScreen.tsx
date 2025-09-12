import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import ButtonCustom from '../component/ButtonCustom';
import InputCustom from '../component/InputCustom';
import DatePicker from '../component/DatePicker';
import LoadingOverlay from '../component/LoadingOverlay';
import { StackScreen } from '../navigation/types';

const EkycInformationScreen: StackScreen<'EkycInformation'> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    nationality: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.idNumber) {
      newErrors.idNumber = 'ID number is required';
    } else if (!/^\d{9,12}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'Invalid ID number format';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (!formData.nationality) {
      newErrors.nationality = 'Nationality is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to submit personal information
      // await api.ekyc.verifyInformation(formData);
      
      // Navigate to review screen
      navigation.navigate('EkycReview');
    } catch (error) {
      console.error('Error submitting information:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.primary + '15', theme.colors.white]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={styles.header}
          entering={FadeInDown.duration(600).springify()}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Personal Information</Text>
            <Text style={styles.headerSubtitle}>
              Please verify your personal information
            </Text>
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={styles.formContainer}
          entering={FadeInDown.duration(600).delay(200).springify()}
        >
          <InputCustom
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(value) => setFormData({ ...formData, fullName: value })}
            error={errors.fullName}
            leftIcon="account"
            required
          />

          <InputCustom
            label="ID Number"
            placeholder="Enter your ID number"
            value={formData.idNumber}
            onChangeText={(value) => setFormData({ ...formData, idNumber: value })}
            error={errors.idNumber}
            leftIcon="card-account-details"
            keyboardType="number-pad"
            required
          />

          <DatePicker
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
            error={errors.dateOfBirth}
            required
          />

          <InputCustom
            label="Address"
            placeholder="Enter your current address"
            value={formData.address}
            onChangeText={(value) => setFormData({ ...formData, address: value })}
            error={errors.address}
            leftIcon="map-marker"
            multiline
            required
          />

          <InputCustom
            label="Nationality"
            placeholder="Enter your nationality"
            value={formData.nationality}
            onChangeText={(value) => setFormData({ ...formData, nationality: value })}
            error={errors.nationality}
            leftIcon="flag"
            required
          />
        </Animated.View>

        {/* Note */}
        <Animated.View
          style={styles.noteContainer}
          entering={FadeInDown.duration(600).delay(400).springify()}
        >
          <Icon name="information" size={20} color={theme.colors.primary} />
          <Text style={styles.noteText}>
            Please ensure all information matches your ID card exactly
          </Text>
        </Animated.View>

        {/* Continue Button */}
        <ButtonCustom
          title="Continue"
          onPress={handleSubmit}
          style={styles.continueButton}
          icon="arrow-right"
          gradient
        />
      </ScrollView>

      <LoadingOverlay visible={loading} message="Submitting information..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary + '10',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary + '10',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  formContainer: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  noteText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
  continueButton: {
    height: 56,
  },
});

export default EkycInformationScreen;
