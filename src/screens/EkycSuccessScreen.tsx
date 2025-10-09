import { useAlert } from "../component/AlertCustom";
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import ButtonCustom from '../component/ButtonCustom';
import { StackScreen } from '../navigation/types';

const { width, height } = Dimensions.get('window');

const EkycSuccessScreen: StackScreen<'EkycSuccess'> = ({ navigation }) => {
  const { showAlert } = useAlert();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={styles.successIcon}
          entering={FadeIn.duration(1000).delay(500)}
        >
          <View style={styles.iconCircle}>
            <Icon name="check" size={64} color={theme.colors.success} />
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View
          style={styles.messageContainer}
          entering={FadeInDown.duration(800).delay(800)}
        >
          <Text style={styles.title}>Xác thực hoàn tất!</Text>
          <Text style={styles.subtitle}>
            Your identity has been successfully verified. You now have full access to all features.
          </Text>
        </Animated.View>

        {/* Features List */}
        <Animated.View
          style={styles.featuresList}
          entering={FadeInDown.duration(800).delay(1000)}
        >
          <View style={styles.featureItem}>
            <Icon name="shield-check" size={24} color={theme.colors.success} />
            <Text style={styles.featureText}>Bảo mật được cải thiện</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="cash-multiple" size={24} color={theme.colors.success} />
            <Text style={styles.featureText}>Giới hạn giao dịch được tăng</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="account-check" size={24} color={theme.colors.success} />
            <Text style={styles.featureText}>Trạng thái tài khoản được xác thực</Text>
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(1200)}
          style={styles.buttonContainer}
        >
          <ButtonCustom
            title="Tiếp tục đến ứng dụng"
            onPress={() => navigation.replace('MainTabs')}
            style={styles.continueButton}
            icon="arrow-right"
          />
        </Animated.View>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  successIcon: {
    marginBottom: theme.spacing.xl * 2,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.success + '30',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.success,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl * 2,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  featuresList: {
    width: '100%',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl * 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
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
  featureText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
    height: 56,
  },
});

export default EkycSuccessScreen;
