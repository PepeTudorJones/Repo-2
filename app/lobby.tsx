import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { TournamentRow, FilterSidebar } from '../components/lobby';
import { Modal, Button } from '../components/common';
import { useTournamentStore } from '../stores/tournamentStore';
import { Tournament } from '../types';
import { formatCurrency } from '../utils/formatters';

export default function LobbyScreen() {
  const router = useRouter();
  const { getFilteredTournaments } = useTournamentStore();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const tournaments = getFilteredTournaments();

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTournamentPress = (tournament: Tournament) => {
    setSelectedTournament(tournament);
  };

  const handleRegister = () => {
    if (selectedTournament) {
      setSelectedTournament(null);
      router.push(`/table/${selectedTournament.id}`);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.nameHeader]}>Tournament</Text>
      <Text style={styles.headerCell}>Buy-In</Text>
      <Text style={styles.headerCell}>Prize Pool</Text>
      <Text style={styles.headerCell}>Entrants</Text>
      <Text style={styles.headerCell}>Asset</Text>
      <Text style={styles.headerCell}>Status</Text>
      <Text style={[styles.headerCell, styles.timeHeader]}>Time</Text>
    </View>
  );

  const renderTournamentModal = () => {
    if (!selectedTournament) return null;

    return (
      <Modal
        visible={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        title={selectedTournament.name}
        width="70%"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Buy-In:</Text>
            <Text style={styles.modalValue}>
              {formatCurrency(selectedTournament.buyIn)}
            </Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Guaranteed Prize:</Text>
            <Text style={styles.modalValue}>
              {formatCurrency(selectedTournament.guaranteedPrize)}
            </Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Asset:</Text>
            <Text style={styles.modalValue}>{selectedTournament.asset}</Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Level Duration:</Text>
            <Text style={styles.modalValue}>{selectedTournament.levelDuration} minutes</Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Entrants:</Text>
            <Text style={styles.modalValue}>
              {selectedTournament.currentEntrants} / {selectedTournament.maxEntrants}
            </Text>
          </View>

          <View style={styles.payoutSection}>
            <Text style={styles.payoutTitle}>PRIZE BREAKDOWN</Text>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>1st Place:</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(selectedTournament.guaranteedPrize * 0.5)}
              </Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>2nd Place:</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(selectedTournament.guaranteedPrize * 0.3)}
              </Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>3rd Place:</Text>
              <Text style={styles.payoutValue}>
                {formatCurrency(selectedTournament.guaranteedPrize * 0.2)}
              </Text>
            </View>
          </View>

          <Button
            title="REGISTER NOW"
            onPress={handleRegister}
            variant="primary"
            size="large"
          />
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PREDICT MTT</Text>
        <Text style={styles.subtitle}>Tournament Lobby</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sidebar}>
          <FilterSidebar />
        </View>

        <View style={styles.mainArea}>
          {renderHeader()}
          <FlatList
            data={tournaments}
            renderItem={({ item }) => (
              <TournamentRow tournament={item} onPress={() => handleTournamentPress(item)} />
            )}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tournaments available</Text>
              </View>
            }
          />
        </View>
      </View>

      {renderTournamentModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  title: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '20%',
  },
  mainArea: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
  },
  headerCell: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  nameHeader: {
    flex: 2,
    textAlign: 'left',
  },
  timeHeader: {
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalContent: {
    gap: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  modalLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalValue: {
    color: '#e5e5e5',
    fontSize: 14,
    fontWeight: '600',
  },
  payoutSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#16213e',
    borderRadius: 4,
  },
  payoutTitle: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  payoutLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  payoutValue: {
    color: '#f59e0b',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
