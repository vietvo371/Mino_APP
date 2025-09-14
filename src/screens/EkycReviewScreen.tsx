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
import LoadingOverlay from '../component/LoadingOverlay';
import { StackScreen } from '../navigation/types';

const EkycReviewScreen: StackScreen<'EkycReview'> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const mockUserData = {
    fullName: 'John Doe',
    idNumber: '123456789012',
    dateOfBirth: '1990-01-01',
    address: '123 Main Street, City',
    nationality: 'Vietnam',
  };

  const handleSubmit = () => {
    setLoading(true);
    // Giả lập loading 1 giây
    setTimeout(() => {
      setLoading(false);
      navigation.replace('EkycSuccess');
    }, 1000);
  };

  const renderInfoItem = (label: string, value: string) => (
    <Animated.View
      style={styles.infoItem}
      entering={FadeInDown.duration(400).delay(200)}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </Animated.View>
  );

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
            <Text style={styles.headerTitle}>Review Information</Text>
            <Text style={styles.headerSubtitle}>
              Please review your information before submitting
            </Text>
          </View>
        </Animated.View>

        {/* Review Section */}
        <Animated.View
          style={styles.reviewContainer}
          entering={FadeInDown.duration(600).delay(200).springify()}
        >
          {/* ID Card Images */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>ID Card Images</Text>
            <View style={styles.imagePreviewRow}>
              <View style={styles.imagePreview}>
                <Icon name="card-account-details" size={32} color={theme.colors.primary} />
                <Text style={styles.imageLabel}>Front Side</Text>
              </View>
              <View style={styles.imagePreview}>
                <Icon name="card-account-details" size={32} color={theme.colors.primary} />
                <Text style={styles.imageLabel}>Back Side</Text>
              </View>
            </View>
          </View>

          {/* Selfie Image */}
          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Selfie Image</Text>
            <View style={styles.imagePreview}>
              <Icon name="account" size={32} color={theme.colors.primary} />
              <Text style={styles.imageLabel}>Selfie</Text>
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderInfoItem('Full Name', mockUserData.fullName)}
            {renderInfoItem('ID Number', mockUserData.idNumber)}
            {renderInfoItem('Date of Birth', mockUserData.dateOfBirth)}
            {renderInfoItem('Address', mockUserData.address)}
            {renderInfoItem('Nationality', mockUserData.nationality)}
          </View>
        </Animated.View>

        {/* Submit Button */}
        <ButtonCustom
          title="Submit"
          onPress={handleSubmit}
          style={styles.submitButton}
          icon="check"
        />

        {/* Note */}
        <Animated.View
          style={styles.noteContainer}
          entering={FadeInDown.duration(600).delay(400).springify()}
        >
          <Icon name="information" size={20} color={theme.colors.primary} />
          <Text style={styles.noteText}>
            By submitting, you confirm that all provided information is accurate
          </Text>
        </Animated.View>
      </ScrollView>

      <LoadingOverlay visible={loading} message="Submitting..." />
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
  reviewContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
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
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.md,
  },
  imagesSection: {
    marginBottom: theme.spacing.xl,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  imagePreview: {
    flex: 1,
    aspectRatio: 1.6,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  imageLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.medium,
  },
  infoSection: {
    gap: theme.spacing.md,
  },
  infoItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
  },
  submitButton: {
    height: 56,
    marginBottom: theme.spacing.xl,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
  },
  noteText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default EkycReviewScreen;
