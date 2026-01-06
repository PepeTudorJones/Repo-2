import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Asset } from '../../types';
import { formatPrice, formatTime } from '../../utils/formatters';
import { Button } from '../common';

interface PredictionInputProps {
  currentPrice: number;
  asset: Asset;
  onLockIn: (prediction: number) => void;
  deadline: number;
  disabled?: boolean;
  locked?: boolean;
}

export const PredictionInput: React.FC<PredictionInputProps> = ({
  currentPrice,
  asset,
  onLockIn,
  deadline,
  disabled = false,
  locked = false,
}) => {
  const [prediction, setPrediction] = useState<string>(currentPrice.toFixed(2));
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    setPrediction(currentPrice.toFixed(2));
  }, [currentPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [deadline]);

  const handleAdjust = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = parseFloat(prediction) || currentPrice;
    const newValue = (current + delta).toFixed(2);
    setPrediction(newValue);
  };

  const handleLockIn = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const value = parseFloat(prediction);
    if (!isNaN(value) && value > 0) {
      onLockIn(value);
    }
  };

  const isUrgent = timeRemaining <= 10;
  const isExpired = timeRemaining === 0;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>TIME REMAINING</Text>
        <Text
          style={[
            styles.timer,
            isUrgent && styles.timerUrgent,
            isExpired && styles.timerExpired,
          ]}
        >
          {formatTime(timeRemaining)}
        </Text>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.priceDisplay}>
          <Text style={styles.priceLabel}>CURRENT PRICE</Text>
          <Text style={styles.currentPrice}>{formatPrice(currentPrice, asset)}</Text>
        </View>

        <View style={styles.predictionContainer}>
          <Text style={styles.predictionLabel}>YOUR PREDICTION</Text>

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleAdjust(-100)}
              disabled={disabled || locked}
            >
              <Text style={styles.adjustText}>-100</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleAdjust(-10)}
              disabled={disabled || locked}
            >
              <Text style={styles.adjustText}>-10</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleAdjust(-1)}
              disabled={disabled || locked}
            >
              <Text style={styles.adjustText}>-1</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={prediction}
              onChangeText={setPrediction}
              keyboardType="decimal-pad"
              editable={!disabled && !locked}
            />

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleAdjust(1)}
              disabled={disabled || locked}
            >
              <Text style={styles.adjustText}>+1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleAdjust(10)}
              disabled={disabled || locked}
            >
              <Text style={styles.adjustText}>+10</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => handleAdjust(100)}
              disabled={disabled || locked}
            >
              <Text style={styles.adjustText}>+100</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={locked ? 'LOCKED IN ✓' : 'LOCK IN PREDICTION'}
          onPress={handleLockIn}
          disabled={disabled || locked || isExpired}
          variant={locked ? 'success' : 'primary'}
          size="large"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderTopWidth: 2,
    borderTopColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timer: {
    color: '#10b981',
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  timerUrgent: {
    color: '#f59e0b',
  },
  timerExpired: {
    color: '#ef4444',
  },
  inputSection: {
    gap: 16,
  },
  priceDisplay: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderRadius: 4,
  },
  priceLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentPrice: {
    color: '#e5e5e5',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  predictionContainer: {
    gap: 12,
  },
  predictionLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustButton: {
    backgroundColor: '#16213e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    minWidth: 50,
  },
  adjustText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#0f0f1a',
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#e5e5e5',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
    textAlign: 'center',
    minWidth: 120,
  },
});
