import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';

const FAQ_ITEMS = [
  {
    id: '1',
    category: 'Tài khoản',
    questions: [
      {
        id: '1-1',
        question: 'Làm thế nào để xác thực tài khoản?',
        answer: 'Để xác thực tài khoản, bạn cần cung cấp CCCD/CMND và chụp ảnh selfie.',
      },
      {
        id: '1-2',
        question: 'Quên mật khẩu phải làm sao?',
        answer: 'Bạn có thể sử dụng chức năng Quên mật khẩu và làm theo hướng dẫn.',
      },
    ],
  },
  {
    id: '2',
    category: 'Giao dịch',
    questions: [
      {
        id: '2-1',
        question: 'Phí giao dịch là bao nhiêu?',
        answer: 'Phí giao dịch được tính dựa trên loại giao dịch và số lượng.',
      },
      {
        id: '2-2',
        question: 'Thời gian xử lý giao dịch?',
        answer: 'Thời gian xử lý thông thường từ 5-10 phút tùy loại giao dịch.',
      },
    ],
  },
];

const CONTACT_METHODS = [
  {
    id: 'email',
    title: 'Email',
    description: 'support@mino.com',
    icon: 'email',
  },
  {
    id: 'phone',
    title: 'Hotline',
    description: '1900 xxxx',
    icon: 'phone',
  },
  {
    id: 'chat',
    title: 'Chat trực tuyến',
    description: 'Hỗ trợ 24/7',
    icon: 'message-text',
  },
];

const HelpScreen = () => {
  const navigation = useNavigation();
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ giúp</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Icon name="magnify" size={20} color="#8E8E93" />
          <Text style={styles.searchPlaceholder}>Tìm kiếm câu hỏi...</Text>
        </TouchableOpacity>

        {/* FAQ Sections */}
        {FAQ_ITEMS.map(category => (
          <View key={category.id} style={styles.section}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
            >
              <Text style={styles.categoryTitle}>{category.category}</Text>
              <Icon
                name={expandedCategory === category.id ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#8E8E93"
              />
            </TouchableOpacity>

            {expandedCategory === category.id && (
              <View style={styles.questionList}>
                {category.questions.map(item => (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.questionItem}
                      onPress={() => setExpandedQuestion(
                        expandedQuestion === item.id ? null : item.id
                      )}
                    >
                      <Text style={styles.questionText}>{item.question}</Text>
                      <Icon
                        name={expandedQuestion === item.id ? 'minus' : 'plus'}
                        size={20}
                        color="#8E8E93"
                      />
                    </TouchableOpacity>
                    {expandedQuestion === item.id && (
                      <View style={styles.answerContainer}>
                        <Text style={styles.answerText}>{item.answer}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
          <View style={styles.contactList}>
            {CONTACT_METHODS.map(method => (
              <TouchableOpacity key={method.id} style={styles.contactItem}>
                <View style={[styles.contactIcon, { backgroundColor: '#4A90E215' }]}>
                  <Icon name={method.icon} size={24} color="#4A90E2" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  questionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    marginRight: 16,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  answerText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  contactList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default HelpScreen;