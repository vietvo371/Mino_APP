import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { componentStyles } from '../theme/components';
import { StackScreen } from '../navigation/types';
import ButtonCustom from '../component/ButtonCustom';

const FAQData = [
  {
    question: 'How do I deposit USDT?',
    answer: 'To deposit USDT, go to Wallet > Deposit > USDT. You can either scan the QR code or copy the wallet address to receive USDT.',
  },
  {
    question: 'How do I withdraw VND to my bank account?',
    answer: 'To withdraw VND, go to Wallet > Withdraw > VND. Select your verified bank account, enter the amount, and confirm the withdrawal.',
  },
  {
    question: 'How do I verify my account?',
    answer: 'To verify your account, go to Profile > Security > KYC Verification. Follow the steps to upload your ID documents and complete facial verification.',
  },
  {
    question: 'What are the transaction fees?',
    answer: 'Transaction fees vary by type: USDT transfers: network fee, VND deposits: free, VND withdrawals: 0.1%. Check our fee schedule for details.',
  },
  {
    question: 'How long do withdrawals take?',
    answer: 'USDT withdrawals: 10-30 minutes depending on network congestion. VND withdrawals to local banks: instant to 24 hours.',
  },
];

const HelpScreen: StackScreen<'Help'> = () => {
  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact us',
      [
        {
          text: 'Live Chat',
          onPress: () => {
            // Implement live chat
            Alert.alert('Opening live chat...');
          },
        },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@mino.com');
          },
        },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL('tel:+1234567890');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.backgroundDark, theme.colors.secondary]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleContactSupport}
            >
              <View style={styles.quickActionIcon}>
                <Icon name="headset" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('UserGuide')}
            >
              <View style={styles.quickActionIcon}>
                <Icon name="book-open-variant" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionText}>User Guide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.quickActionIcon}>
                <Icon name="information" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionText}>About MINO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQData.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqItem,
                  index === expandedIndex && styles.faqItemExpanded,
                ]}
                onPress={() => setExpandedIndex(index === expandedIndex ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Icon
                    name={index === expandedIndex ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={theme.colors.textDarkLight}
                  />
                </View>
                {index === expandedIndex && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Options</Text>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Linking.openURL('mailto:support@mino.com')}
            >
              <View style={styles.menuIcon}>
                <Icon name="email" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Email Support</Text>
                <Text style={styles.menuDescription}>support@mino.com</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Linking.openURL('tel:+1234567890')}
            >
              <View style={styles.menuIcon}>
                <Icon name="phone" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Phone Support</Text>
                <Text style={styles.menuDescription}>+1 234 567 890</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Feedback')}
            >
              <View style={styles.menuIcon}>
                <Icon name="message-text" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Send Feedback</Text>
                <Text style={styles.menuDescription}>Help us improve MINO</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Terms')}
            >
              <View style={styles.menuIcon}>
                <Icon name="file-document" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Terms of Service</Text>
                <Text style={styles.menuDescription}>Read our terms</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Privacy')}
            >
              <View style={styles.menuIcon}>
                <Icon name="shield-lock" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Privacy Policy</Text>
                <Text style={styles.menuDescription}>Read our privacy policy</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },

  // Section Styles
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.lg,
  },

  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },

  // FAQ Styles
  faqList: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
    padding: theme.spacing.lg,
  },
  faqItemExpanded: {
    backgroundColor: theme.colors.backgroundDark,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },

  // Menu List Styles
  menuList: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  menuDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
});

export default HelpScreen;
