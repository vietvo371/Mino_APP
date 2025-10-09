import { useAlert } from "../component/AlertCustom";
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import ButtonCustom from '../component/ButtonCustom';
import ImagePicker from '../component/ImagePicker';
import LoadingOverlay from '../component/LoadingOverlay';
import { StackScreen } from '../navigation/types';

const EkycSelfieScreen: StackScreen<'EkycSelfie'> = ({ navigation }) => {
  const { showAlert } = useAlert();
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!selfieImage) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to upload selfie image
      // await api.ekyc.uploadSelfie(selfieImage);
      
      // Navigate to next step
      navigation.navigate('EkycInformation');
    } catch (error) {
      console.error('Error uploading selfie:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
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
            <Text style={styles.headerTitle}>Chụp ảnh selfie</Text>
            <Text style={styles.headerSubtitle}>
              We need a clear photo of your face for verification
            </Text>
          </View>
        </Animated.View>

        {/* Selfie Upload */}
        <Animated.View
          style={styles.uploadCard}
          entering={FadeInDown.duration(600).delay(200).springify()}
        >
          <ImagePicker
            imageUri={selfieImage || undefined}
            onImageSelected={setSelfieImage}
            // style={styles.imagePicker}
            // useFrontCamera={true}
            // placeholder={
            //   <View style={styles.placeholderContent}>
            //     <Icon name="face-recognition" size={48} color={theme.colors.primary} />
            //     <Text style={styles.placeholderText}>Take Selfie</Text>
            //   </View>
            // }
          />
        </Animated.View>

        {/* Guidelines */}
        <Animated.View
          style={styles.guidelines}
          entering={FadeInDown.duration(600).delay(400).springify()}
        >
          <Text style={styles.guidelinesTitle}>Hướng dẫn</Text>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Icon name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Face the camera directly</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Icon name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Remove glasses and face masks</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Icon name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.guidelineText}>Keep a neutral expression</Text>
            </View>
          </View>
        </Animated.View>

        {/* Security Note */}
        <Animated.View
          style={styles.securityNote}
          entering={FadeInDown.duration(600).delay(600).springify()}
        >
          <Icon name="shield-check" size={20} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Your selfie will be used only for identity verification and will be stored securely
          </Text>
        </Animated.View>

        {/* Continue Button */}
        <ButtonCustom
          title="Tiếp tục"
          onPress={handleUpload}
          style={styles.continueButton}
          disabled={!selfieImage}
          icon="arrow-right"
        />
      </ScrollView>

      <LoadingOverlay visible={loading} message="Đang tải ảnh selfie..." />
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
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
  },
  uploadCard: {
    marginTop: theme.spacing.xl,
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
  imagePicker: {
    width: '100%',
    height: 300,
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
    gap: theme.spacing.md,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily,
  },
  guidelines: {
    marginTop: theme.spacing.xl,
  },
  guidelinesTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
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
    fontFamily: theme.typography.fontFamily,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.success + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  securityText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  continueButton: {
    height: 56,
  },
});

export default EkycSelfieScreen;
