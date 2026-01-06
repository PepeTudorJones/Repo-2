import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Badge } from '../common';
import { Seat } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface PlayerSeatProps {
  seat: Seat;
  revealedPrice?: number | null;
  asset?: string;
  showPrediction?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  seat,
  revealedPrice,
  asset = 'BTC',
  showPrediction = false,
}) => {
  const isEmpty = seat.status === 'EMPTY';
  const isEliminated = seat.status === 'ELIMINATED';
  const isLockedIn = seat.status === 'LOCKED_IN';

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyPlaceholder}>
          <Text style={styles.emptyText}>EMPTY</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isEliminated && styles.eliminatedContainer]}>
      <View style={styles.avatarContainer}>
        <Avatar
          name={seat.playerName || 'Player'}
          imageUrl={seat.playerAvatar}
          size={60}
          isActive={seat.isCurrentPlayer}
        />
        {isEliminated && (
          <View style={styles.eliminatedOverlay}>
            <Text style={styles.eliminatedText}>✕</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.playerName, isEliminated && styles.eliminatedText]}
          numberOfLines={1}
        >
          {seat.playerName}
        </Text>

        {isLockedIn && !showPrediction && (
          <Badge label="LOCKED IN" variant="success" size="small" />
        )}

        {showPrediction && seat.currentPrediction && (
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionLabel}>Predicted:</Text>
            <Text style={styles.predictionValue}>
              {formatPrice(seat.currentPrediction, asset as any)}
            </Text>
            {revealedPrice && (
              <Text style={styles.distanceText}>
                ±{formatPrice(Math.abs(seat.currentPrediction - revealedPrice), asset as any)}
              </Text>
            )}
          </View>
        )}

        {isEliminated && (
          <Badge label="ELIMINATED" variant="danger" size="small" />
        )}

        {seat.status === 'ACTIVE' && !isLockedIn && (
          <Text style={styles.statusText}>Thinking...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    minWidth: 120,
  },
  eliminatedContainer: {
    opacity: 0.4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  eliminatedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliminatedText: {
    color: '#ef4444',
    fontSize: 32,
    fontWeight: '700',
  },
  emptyPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#1a1a2e',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
  },
  info: {
    alignItems: 'center',
    gap: 4,
  },
  playerName: {
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusText: {
    color: '#9ca3af',
    fontSize: 11,
    fontStyle: 'italic',
  },
  predictionContainer: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  predictionLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginBottom: 2,
  },
  predictionValue: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  distanceText: {
    color: '#9ca3af',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
