import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
}) => {
  const getBadgeStyle = () => {
    const styles = [baseStyles.badge];

    switch (variant) {
      case 'success':
        styles.push(baseStyles.successBadge);
        break;
      case 'warning':
        styles.push(baseStyles.warningBadge);
        break;
      case 'danger':
        styles.push(baseStyles.dangerBadge);
        break;
      case 'info':
        styles.push(baseStyles.infoBadge);
        break;
      default:
        styles.push(baseStyles.defaultBadge);
    }

    if (size === 'small') {
      styles.push(baseStyles.smallBadge);
    }

    return styles;
  };

  const getTextStyle = () => {
    const styles = [baseStyles.text];

    if (size === 'small') {
      styles.push(baseStyles.smallText);
    }

    return styles;
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{label}</Text>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  defaultBadge: {
    backgroundColor: '#1a1a2e',
  },
  successBadge: {
    backgroundColor: '#22c55e',
  },
  warningBadge: {
    backgroundColor: '#f59e0b',
  },
  dangerBadge: {
    backgroundColor: '#ef4444',
  },
  infoBadge: {
    backgroundColor: '#3b82f6',
  },
  smallBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  text: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 9,
  },
});
