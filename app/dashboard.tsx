import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useMyTournamentsStore, TournamentParticipation } from '../stores/myTournamentsStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { formatPrice, formatTime } from '../utils/formatters';
import { Asset } from '../types';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    getActiveTournaments,
    getTournamentsNeedingAttention,
    getWaitingTournaments,
  } = useMyTournamentsStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const needsAttention = getTournamentsNeedingAttention();
  const waiting = getWaitingTournaments();
  const all = getActiveTournaments();
  const completed = all.filter((t) => t.placement !== null);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest tournament data from backend
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTournamentPress = (participation: TournamentParticipation) => {
    if (participation.tableId) {
      router.push(`/table/${participation.tableId}`);
    }
  };

  const handleBrowseTournaments = () => {
    router.push('/lobby');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tournaments</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={handleBrowseTournaments}
        >
          <Text style={styles.browseButtonText}>+ Join New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
        }
      >
        {/* Urgent: Needs Attention */}
        {needsAttention.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠️ NEEDS ATTENTION</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{needsAttention.length}</Text>
              </View>
            </View>
            {needsAttention.map((participation) => (
              <TournamentCard
                key={participation.tournament.id}
                participation={participation}
                onPress={handleTournamentPress}
                urgent
              />
            ))}
          </View>
        )}

        {/* Waiting for Results */}
        {waiting.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⏳ WAITING</Text>
              <Text style={styles.sectionSubtitle}>{waiting.length} active</Text>
            </View>
            {waiting.map((participation) => (
              <TournamentCard
                key={participation.tournament.id}
                participation={participation}
                onPress={handleTournamentPress}
              />
            ))}
          </View>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 COMPLETED</Text>
            {completed.map((participation) => (
              <TournamentCard
                key={participation.tournament.id}
                participation={participation}
                onPress={handleTournamentPress}
                completed
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {all.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Active Tournaments</Text>
            <Text style={styles.emptySubtitle}>
              Join a tournament to start predicting crypto prices!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleBrowseTournaments}
            >
              <Text style={styles.emptyButtonText}>Browse Tournaments</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface TournamentCardProps {
  participation: TournamentParticipation;
  onPress: (participation: TournamentParticipation) => void;
  urgent?: boolean;
  completed?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  participation,
  onPress,
  urgent = false,
  completed = false,
}) => {
  const { tournament, strikes, needsPrediction, predictionDeadline, placement, prize, isEliminated } = participation;
  const now = Date.now();
  const timeRemaining = predictionDeadline ? Math.max(0, Math.floor((predictionDeadline - now) / 1000)) : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        urgent && styles.cardUrgent,
        completed && styles.cardCompleted,
        isEliminated && styles.cardEliminated,
      ]}
      onPress={() => onPress(participation)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {tournament.name}
        </Text>
        <Text style={styles.cardAsset}>{tournament.asset}</Text>
      </View>

      <View style={styles.cardContent}>
        {/* Status Row */}
        <View style={styles.statusRow}>
          {/* Strikes */}
          {!isEliminated && !completed && (
            <View style={styles.strikes}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Text
                  key={index}
                  style={[
                    styles.strikeIndicator,
                    index < strikes && styles.strikeActive,
                  ]}
                >
                  {index < strikes ? '⚠' : '○'}
                </Text>
              ))}
            </View>
          )}

          {/* Players */}
          <Text style={styles.playersText}>
            {tournament.playersRemaining || tournament.currentEntrants} players
          </Text>
        </View>

        {/* Action Required */}
        {urgent && needsPrediction && (
          <View style={styles.urgentBanner}>
            <Text style={styles.urgentText}>
              🎯 Make prediction in {formatTime(timeRemaining)}
            </Text>
          </View>
        )}

        {/* Waiting State */}
        {!urgent && !completed && !isEliminated && (
          <Text style={styles.waitingText}>
            Waiting for next round...
          </Text>
        )}

        {/* Eliminated */}
        {isEliminated && !completed && (
          <View style={styles.eliminatedBanner}>
            <Text style={styles.eliminatedText}>💀 ELIMINATED</Text>
          </View>
        )}

        {/* Completed */}
        {completed && placement && (
          <View style={styles.resultRow}>
            <Text style={styles.placementText}>
              {getPlacementEmoji(placement)} Placed {getPlacementSuffix(placement)}
            </Text>
            {prize && prize > 0 && (
              <Text style={styles.prizeText}>
                +{formatPrice(prize, tournament.asset as Asset)}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getPlacementEmoji = (placement: number): string => {
  if (placement === 1) return '🥇';
  if (placement === 2) return '🥈';
  if (placement === 3) return '🥉';
  return '🏆';
};

const getPlacementSuffix = (placement: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = placement % 100;
  return placement + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  title: {
    color: '#e5e5e5',
    fontSize: 24,
    fontWeight: '700',
  },
  browseButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  badge: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  cardUrgent: {
    borderColor: '#f59e0b',
    backgroundColor: '#16213e',
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardEliminated: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardAsset: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  cardContent: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strikes: {
    flexDirection: 'row',
    gap: 4,
  },
  strikeIndicator: {
    fontSize: 16,
    color: '#9ca3af',
  },
  strikeActive: {
    color: '#f59e0b',
  },
  playersText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  urgentBanner: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  urgentText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  waitingText: {
    color: '#9ca3af',
    fontSize: 13,
    fontStyle: 'italic',
  },
  eliminatedBanner: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  eliminatedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placementText: {
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '600',
  },
  prizeText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#e5e5e5',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
