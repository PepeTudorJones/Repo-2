import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Tournament } from '../../types';
import { Badge } from '../common';
import { formatCurrency, formatPlayerCount, formatDate } from '../../utils/formatters';

interface TournamentRowProps {
  tournament: Tournament;
  onPress: () => void;
}

export const TournamentRow: React.FC<TournamentRowProps> = ({ tournament, onPress }) => {
  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'REGISTERING':
        return <Badge label="REGISTERING" variant="success" size="small" />;
      case 'RUNNING':
        return <Badge label="RUNNING" variant="warning" size="small" />;
      case 'LATE_REG':
        return <Badge label="LATE REG" variant="info" size="small" />;
      case 'COMPLETED':
        return <Badge label="COMPLETED" variant="default" size="small" />;
      default:
        return null;
    }
  };

  const getLevelDurationLabel = () => {
    switch (tournament.levelDuration) {
      case 15:
        return 'Turbo';
      case 30:
        return 'Regular';
      case 60:
        return 'Deep Stack';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.nameCell}>
        <Text style={styles.tournamentName}>{tournament.name}</Text>
        <Text style={styles.levelType}>{getLevelDurationLabel()}</Text>
      </View>

      <View style={styles.cell}>
        <Text style={styles.buyIn}>{formatCurrency(tournament.buyIn)}</Text>
      </View>

      <View style={styles.cell}>
        <Text style={styles.prize}>{formatCurrency(tournament.guaranteedPrize)}</Text>
      </View>

      <View style={styles.cell}>
        <Text style={styles.entrants}>
          {formatPlayerCount(tournament.currentEntrants, tournament.maxEntrants)}
        </Text>
      </View>

      <View style={styles.assetCell}>
        <View style={styles.assetBadge}>
          <Text style={styles.assetText}>{tournament.asset}</Text>
        </View>
      </View>

      <View style={styles.statusCell}>{getStatusBadge()}</View>

      <View style={styles.timeCell}>
        <Text style={styles.timeText}>
          {tournament.status === 'SCHEDULED'
            ? formatDate(tournament.startTime)
            : tournament.status === 'RUNNING'
            ? `L${tournament.currentLevel}`
            : '—'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
    backgroundColor: '#1a1a2e',
  },
  nameCell: {
    flex: 2,
    gap: 4,
  },
  tournamentName: {
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '600',
  },
  levelType: {
    color: '#9ca3af',
    fontSize: 11,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  buyIn: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  prize: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  entrants: {
    color: '#e5e5e5',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  assetCell: {
    flex: 0.8,
    alignItems: 'center',
  },
  assetBadge: {
    backgroundColor: '#16213e',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  assetText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
  },
  timeCell: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
