import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Asset, PredictionDirection } from '../../types';
import { formatPrice, formatTime } from '../../utils/formatters';

interface PredictionInputProps {
  currentPrice: number;
  targetPrice: number;
  asset: Asset;
  onLockIn: (prediction: PredictionDirection) => void;
  changeDeadline: number; // 4 minutes - can change prediction
  lockDeadline: number; // 5 minutes - final lock-in
  disabled?: boolean;
  locked?: boolean;
  lockedPrediction?: PredictionDirection | null;
}

export const PredictionInput: React.FC<PredictionInputProps> = ({
  currentPrice,
  targetPrice,
  asset,
  onLockIn,
  changeDeadline,
  lockDeadline,
  disabled = false,
  locked = false,
  lockedPrediction = null,
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionDirection | null>(
    lockedPrediction
  );
  const [timeToChange, setTimeToChange] = useState<number>(0);
  const [timeToLock, setTimeToLock] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const changeRemaining = Math.max(0, Math.floor((changeDeadline - now) / 1000));
      const lockRemaining = Math.max(0, Math.floor((lockDeadline - now) / 1000));

      setTimeToChange(changeRemaining);
      setTimeToLock(lockRemaining);

      if (lockRemaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [changeDeadline, lockDeadline]);

  const handleSelect = (direction: PredictionDirection) => {
    if (!canChange || locked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPrediction(direction);
  };

  const handleLockIn = () => {
    if (!selectedPrediction) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLockIn(selectedPrediction);
  };

  // Determine current phase
  const canChange = timeToChange > 0; // First 4 minutes
  const canLock = timeToLock > 0; // First 5 minutes
  const inLockPhase = !canChange && canLock; // Between 4 and 5 minutes
  const isExpired = !canLock; // After 5 minutes

  const isUrgent = timeToLock <= 30 && timeToLock > 0;
  const isChangeUrgent = timeToChange <= 30 && timeToChange > 0;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>
          {canChange
            ? 'TIME TO CHANGE'
            : inLockPhase
            ? 'TIME TO LOCK IN'
            : 'PREDICTION WINDOW CLOSED'}
        </Text>
        <Text
          style={[
            styles.timer,
            (isUrgent || isChangeUrgent) && styles.timerUrgent,
            isExpired && styles.timerExpired,
          ]}
        >
          {canChange
            ? formatTime(timeToChange)
            : inLockPhase
            ? formatTime(timeToLock)
            : '0:00'}
        </Text>
        {inLockPhase && !locked && (
          <Text style={styles.phaseMessage}>
            Cannot change prediction - lock in now!
          </Text>
        )}
      </View>

      <View style={styles.inputSection}>
        <View style={styles.priceDisplay}>
          <Text style={styles.priceLabel}>CURRENT PRICE</Text>
          <Text style={styles.currentPrice}>{formatPrice(currentPrice, asset)}</Text>
        </View>

        <View style={styles.targetDisplay}>
          <Text style={styles.targetLabel}>TARGET PRICE</Text>
          <Text style={styles.targetPrice}>{formatPrice(targetPrice, asset)}</Text>
          <Text style={styles.questionText}>Will {asset} be OVER or UNDER?</Text>
        </View>

        <View style={styles.predictionContainer}>
          <Text style={styles.predictionLabel}>YOUR PREDICTION</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.predictionButton,
                styles.overButton,
                selectedPrediction === 'OVER' && styles.selectedButton,
                (!canChange || locked) && styles.disabledButton,
              ]}
              onPress={() => handleSelect('OVER')}
              disabled={!canChange || locked || disabled}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText,
                selectedPrediction === 'OVER' && styles.selectedButtonText,
              ]}>
                OVER
              </Text>
              <Text style={[
                styles.buttonSubtext,
                selectedPrediction === 'OVER' && styles.selectedButtonText,
              ]}>
                {'>='} {formatPrice(targetPrice, asset)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.predictionButton,
                styles.underButton,
                selectedPrediction === 'UNDER' && styles.selectedButton,
                (!canChange || locked) && styles.disabledButton,
              ]}
              onPress={() => handleSelect('UNDER')}
              disabled={!canChange || locked || disabled}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText,
                selectedPrediction === 'UNDER' && styles.selectedButtonText,
              ]}>
                UNDER
              </Text>
              <Text style={[
                styles.buttonSubtext,
                selectedPrediction === 'UNDER' && styles.selectedButtonText,
              ]}>
                {'<'} {formatPrice(targetPrice, asset)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.lockButton,
            locked && styles.lockedButton,
            (!selectedPrediction || disabled || locked || isExpired) && styles.disabledLockButton,
          ]}
          onPress={handleLockIn}
          disabled={!selectedPrediction || disabled || locked || isExpired}
          activeOpacity={0.7}
        >
          <Text style={styles.lockButtonText}>
            {locked ? 'LOCKED IN ✓' : 'LOCK IN PREDICTION'}
          </Text>
        </TouchableOpacity>
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
  phaseMessage: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  targetDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#0f0f1a',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  targetLabel: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  targetPrice: {
    color: '#f59e0b',
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  questionText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  predictionButton: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overButton: {
    backgroundColor: '#16213e',
    borderColor: '#22c55e',
  },
  underButton: {
    backgroundColor: '#16213e',
    borderColor: '#ef4444',
  },
  selectedButton: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#e5e5e5',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectedButtonText: {
    color: '#ffffff',
  },
  buttonSubtext: {
    color: '#9ca3af',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  lockButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  lockedButton: {
    backgroundColor: '#22c55e',
  },
  disabledLockButton: {
    opacity: 0.5,
  },
  lockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
