import { useAlert } from "../component/AlertCustom";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import EventCard from '../component/EventCard';
import Marquee from '../component/Marquee';
import { theme } from '../theme/colors';
import { useTranslation } from '../hooks/useTranslation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getOnboardingData = (t: any) => [
  {
    id: 1,
    title: t('onboarding.welcomeTitle'),
    description: t('onboarding.welcomeDescription'),
    image: require('../assets/images/started/welcome.jpg'),
  },
  {
    id: 2,
    title: t('onboarding.ekycTitle'),
    description: t('onboarding.ekycDescription'),
    image: require('../assets/images/started/ekyc.jpg'),
  },
  {
    id: 3,
    title: t('onboarding.usdtVndTitle'),
    description: t('onboarding.usdtVndDescription'),
    image: require('../assets/images/started/deposit.jpg'),
  },
  {
    id: 4,
    title: t('onboarding.securityTitle'),
    description: t('onboarding.securityDescription'),
    image: require('../assets/images/started/security.jpg'),
  },
];

interface OnboardingScreenProps {
  navigation: any;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { showAlert } = useAlert();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const onboardingData = getOnboardingData(t);

  const handleComplete = async () => {
    try {
      // Lưu trạng thái đã xem onboarding
      await AsyncStorage.setItem('isFirstLaunch', 'false');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  // Ensure activeIndex is always within bounds
  const safeActiveIndex = Math.max(0, Math.min(activeIndex, onboardingData.length - 1));
  const currentItem = onboardingData[safeActiveIndex];

  // Safety check - if no item is available, use the first one
  if (!currentItem) {
    return null; // or a loading state
  }

  return (
    <View style={styles.container}>
      <Animated.Image
        key={currentItem.image}
        source={currentItem.image}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        entering={FadeIn.duration(1000)}
      />

      <View style={styles.overlay} />

      <View style={styles.contentContainer}>
          {/* Top part - Marquee cards */}
          <Animated.View
            style={styles.marqueeContainer}
            entering={FadeInUp.springify().mass(1).damping(30)}
          >
            <Marquee
              items={onboardingData}
              renderItem={({ item }) => <EventCard event={item} />}
              onIndexChange={(index) => {
                const safeIndex = Math.max(0, Math.min(index, onboardingData.length - 1));
                setActiveIndex(safeIndex);
              }}
            />
          </Animated.View>

          {/* Bottom part - Text and button */}
          <View style={styles.bottomContainer}>
            <Animated.Text
              style={styles.title}
              entering={FadeIn.duration(500).delay(500)}
            >
              {currentItem.title}
            </Animated.Text>

            <Animated.Text
              style={styles.description}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}
            >
              {currentItem.description}
            </Animated.Text>

            <View style={styles.paginationContainer}>
              {onboardingData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === safeActiveIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            <AnimatedPressable
              onPress={handleComplete}
              style={styles.button}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}
            >
              <Animated.Text style={styles.buttonText}>
                {t('onboarding.getStarted')}
              </Animated.Text>
            </AnimatedPressable>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.select({
      ios: 'rgba(246, 241, 146, 0.5)',
      android: 'rgba(246, 241, 146, 0.7)',
    }),
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(0, 0, 0, 0.5)',
    }),
  },
  marqueeContainer: {
    height: '50%',
    marginTop: Platform.select({
      ios: 80,
      android: 40,
    }),
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: Platform.select({
      ios: 40,
      android: 24,
    }),
    rowGap: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.white,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textDarkLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textDarkLight,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#FFFF66",
  },
  button: {
    backgroundColor: "#FFFF66",
    paddingVertical: Platform.select({
      ios: 16,
      android: 12,
    }),
    paddingHorizontal: 40,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    alignSelf: 'stretch',
    elevation: Platform.select({
      ios: 0,
      android: 4,
    }),
    ...Platform.select({
      ios: theme.shadows.yellow,
      android: {},
    }),
  },
  buttonText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.secondary,
  },
});
export default OnboardingScreen; 
