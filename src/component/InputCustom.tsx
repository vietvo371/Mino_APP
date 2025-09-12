import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

interface InputCustomProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  required?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled';
  darkMode?: boolean;
  helper?: string;
  success?: boolean;
}

const InputCustom: React.FC<InputCustomProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  darkMode = false,
  helper,
  success = false,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          darkMode && styles.labelDark,
          labelStyle
        ]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        darkMode && styles.inputContainerDark,
        variant === 'filled' && (darkMode ? styles.inputContainerFilledDark : styles.inputContainerFilled),
        error ? styles.inputError : success && styles.inputContainerSuccess,
      ]}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={darkMode ? theme.colors.textDarkLight : theme.colors.textLight}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            darkMode && styles.inputDark,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={darkMode ? theme.colors.textDarkLight : theme.colors.textLight}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}>
            <Icon
              name={rightIcon}
              size={20}
              color={darkMode ? theme.colors.textDarkLight : theme.colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helper && (
        <Text style={[
          styles.helperText,
          darkMode && styles.helperTextDark
        ]}>
          {helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  labelDark: {
    color: theme.colors.textDark,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  inputContainerDark: {
    borderColor: theme.colors.borderDark,
    backgroundColor: theme.colors.secondary,
  },
  inputContainerFilled: {
    backgroundColor: theme.colors.backgroundDark,
    borderWidth: 0,
  },
  inputContainerFilledDark: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 0,
  },
  inputContainerSuccess: {
    borderColor: theme.colors.success,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
  },
  inputDark: {
    color: theme.colors.textDark,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  leftIcon: {
    marginLeft: theme.spacing.md,
  },
  rightIconContainer: {
    padding: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  helperTextDark: {
    color: theme.colors.textDarkLight,
  },
});

export default InputCustom;

