import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Asset, TournamentStatus } from '../../types';
import { useTournamentStore } from '../../stores/tournamentStore';

const ASSETS: Asset[] = ['BTC', 'ETH'];
const STATUSES: TournamentStatus[] = ['REGISTERING', 'RUNNING', 'LATE_REG'];

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters } = useTournamentStore();

  const handleAssetFilter = (asset: Asset | null) => {
    setFilters({ asset });
  };

  const handleStatusFilter = (status: TournamentStatus | null) => {
    setFilters({ status });
  };

  const handleClearFilters = () => {
    setFilters({
      asset: null,
      status: null,
      minBuyIn: 0,
      maxBuyIn: 10000,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FILTERS</Text>
        <TouchableOpacity onPress={handleClearFilters}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ASSET</Text>
        <TouchableOpacity
          style={[styles.filterButton, !filters.asset && styles.activeFilter]}
          onPress={() => handleAssetFilter(null)}
        >
          <Text style={[styles.filterText, !filters.asset && styles.activeFilterText]}>
            All Assets
          </Text>
        </TouchableOpacity>
        {ASSETS.map((asset) => (
          <TouchableOpacity
            key={asset}
            style={[styles.filterButton, filters.asset === asset && styles.activeFilter]}
            onPress={() => handleAssetFilter(asset)}
          >
            <Text
              style={[styles.filterText, filters.asset === asset && styles.activeFilterText]}
            >
              {asset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STATUS</Text>
        <TouchableOpacity
          style={[styles.filterButton, !filters.status && styles.activeFilter]}
          onPress={() => handleStatusFilter(null)}
        >
          <Text style={[styles.filterText, !filters.status && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        {STATUSES.map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filters.status === status && styles.activeFilter]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text
              style={[styles.filterText, filters.status === status && styles.activeFilterText]}
            >
              {status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BUY-IN RANGE</Text>
        <View style={styles.rangeInfo}>
          <Text style={styles.rangeText}>
            ${filters.minBuyIn} - ${filters.maxBuyIn}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#16213e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  title: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  clearButton: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#16213e',
    borderRadius: 4,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#10b981',
  },
  filterText: {
    color: '#e5e5e5',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterText: {
    fontWeight: '700',
  },
  rangeInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#16213e',
    borderRadius: 4,
  },
  rangeText: {
    color: '#e5e5e5',
    fontSize: 13,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
