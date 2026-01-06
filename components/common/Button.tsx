import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  const getButtonStyle = () => {
    const styles = [baseStyles.button];

    switch (variant) {
      case 'primary':
        styles.push(baseStyles.primaryButton);
        break;
      case 'secondary':
        styles.push(baseStyles.secondaryButton);
        break;
      case 'danger':
        styles.push(baseStyles.dangerButton);
        break;
      case 'success':
        styles.push(baseStyles.successButton);
        break;
    }

    switch (size) {
      case 'small':
        styles.push(baseStyles.smallButton);
        break;
      case 'medium':
        styles.push(baseStyles.mediumButton);
        break;
      case 'large':
        styles.push(baseStyles.largeButton);
        break;
    }

    if (disabled || loading) {
      styles.push(baseStyles.disabledButton);
    }

    return styles;
  };

  const getTextStyle = () => {
    const styles = [baseStyles.text];

    switch (size) {
      case 'small':
        styles.push(baseStyles.smallText);
        break;
      case 'medium':
        styles.push(baseStyles.mediumText);
        break;
      case 'large':
        styles.push(baseStyles.largeText);
        break;
    }

    return styles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const baseStyles = StyleSheet.create({
  button: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  successButton: {
    backgroundColor: '#22c55e',
  },
  disabledButton: {
    opacity: 0.5,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});
