import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import ButtonCustom from '../component/ButtonCustom';
import ImagePicker from '../component/ImagePicker';
import LoadingOverlay from '../component/LoadingOverlay';
import { StackScreen } from '../navigation/types';

const EkycIDCardScreen: StackScreen<'EkycIDCard'> = ({ navigation }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!frontImage || !backImage) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to upload ID card images
      // await api.ekyc.uploadIdCard('front', frontImage);
      // await api.ekyc.uploadIdCard('back', backImage);
      
      // Navigate to next step
      navigation.navigate('EkycSelfie');
    } catch (error) {
      console.error('Error uploading ID card:', error);
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
            <Text style={styles.headerTitle}>ID Card Upload</Text>
            <Text style={styles.headerSubtitle}>
              Take clear photos of your ID card's front and back
            </Text>
          </View>
        </Animated.View>

        {/* Upload Section */}
        <View style={styles.uploadSection}>
          {/* Front Side */}
          <Animated.View
            style={styles.uploadCard}
            entering={FadeInDown.duration(600).delay(200).springify()}
          >
            <Text style={styles.uploadTitle}>Front Side</Text>
            <ImagePicker
              imageUri={frontImage || undefined}
              onImageSelected={setFrontImage}
              containerStyle={styles.imagePicker}
              isCircle={false}
              size={200}
              placeholder={
                <View style={styles.placeholderContent}>
                  <Icon name="camera-plus-outline" size={32} color={theme.colors.primary} />
                  <Text style={styles.placeholderText}>Take Photo</Text>
                </View>
              }
            />
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={styles.uploadCard}
            entering={FadeInDown.duration(600).delay(400).springify()}
          >
            <Text style={styles.uploadTitle}>Back Side</Text>
            <ImagePicker
              imageUri={backImage || undefined}
              onImageSelected={setBackImage}
              containerStyle={styles.imagePicker}
              isCircle={false}
              size={200}
              placeholder={
                <View style={styles.placeholderContent}>
                  <Icon name="camera-plus-outline" size={32} color={theme.colors.primary} />
                  <Text style={styles.placeholderText}>Take Photo</Text>
                </View>
              }
            />
          </Animated.View>
        </View>

        {/* Guidelines */}
        <Animated.View
          style={styles.guidelines}
          entering={FadeInDown.duration(600).delay(600).springify()}
        >
          <Text style={styles.guidelinesTitle}>Guidelines</Text>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Icon name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Ensure all corners are visible</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Icon name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Good lighting conditions</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Icon name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.guidelineText}>No blur or glare</Text>
            </View>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <ButtonCustom
          title="Continue"
          onPress={handleUpload}
          style={styles.continueButton}
          disabled={!frontImage || !backImage}
          icon="arrow-right"
        />
      </ScrollView>

      <LoadingOverlay visible={loading} message="Uploading ID card..." />
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
  uploadSection: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  uploadCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  uploadTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.md,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  guidelines: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  guidelinesTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.md,
  },
  guidelinesList: {
    gap: theme.spacing.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  guidelineText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.regular,
  },
  continueButton: {
    height: 56,
  },
});

export default EkycIDCardScreen;
