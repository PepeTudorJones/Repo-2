import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { PriceChart, PredictionInput, PlayerSeat } from '../../components/table';
import { useTableStore } from '../../stores/tableStore';
import { formatTimeRemaining } from '../../utils/formatters';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function TableScreen() {
  const { id } = useLocalSearchParams();
  const { currentTable, myPrediction, predictionLocked, setMyPrediction, lockPrediction } =
    useTableStore();

  const [currentPrice, setCurrentPrice] = useState(50000);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  if (!currentTable) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading table...</Text>
      </SafeAreaView>
    );
  }

  const round = currentTable.currentRound;
  const seats = currentTable.seats;

  const handleLockIn = (prediction: number) => {
    setMyPrediction(prediction);
    lockPrediction();
  };

  const renderSeats = () => {
    const totalSeats = 9;
    const seatsToRender = [...seats];

    while (seatsToRender.length < totalSeats) {
      seatsToRender.push({
        position: seatsToRender.length,
        playerId: null,
        playerName: null,
        playerAvatar: null,
        status: 'EMPTY',
        currentPrediction: null,
        isCurrentPlayer: false,
      });
    }

    const topSeats = seatsToRender.slice(0, 3);
    const leftSeats = seatsToRender.slice(3, 5);
    const rightSeats = seatsToRender.slice(5, 7);
    const bottomSeats = seatsToRender.slice(7, 9);

    return (
      <>
        <View style={styles.topSeats}>
          {topSeats.map((seat) => (
            <PlayerSeat
              key={seat.position}
              seat={seat}
              asset={round?.asset}
              showPrediction={currentTable.status === 'RESOLVING'}
            />
          ))}
        </View>

        <View style={styles.middleRow}>
          <View style={styles.leftSeats}>
            {leftSeats.map((seat) => (
              <PlayerSeat
                key={seat.position}
                seat={seat}
                asset={round?.asset}
                showPrediction={currentTable.status === 'RESOLVING'}
              />
            ))}
          </View>

          <View style={styles.chartContainer}>
            <PriceChart
              asset={round?.asset || 'BTC'}
              width={500}
              height={280}
              myPrediction={myPrediction}
              showPredictions={currentTable.status === 'RESOLVING'}
            />
          </View>

          <View style={styles.rightSeats}>
            {rightSeats.map((seat) => (
              <PlayerSeat
                key={seat.position}
                seat={seat}
                asset={round?.asset}
                showPrediction={currentTable.status === 'RESOLVING'}
              />
            ))}
          </View>
        </View>

        <View style={styles.bottomSeats}>
          {bottomSeats.map((seat) => (
            <PlayerSeat
              key={seat.position}
              seat={seat}
              asset={round?.asset}
              showPrediction={currentTable.status === 'RESOLVING'}
            />
          ))}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.tournamentName}>$10 BTC Turbo</Text>
          <Text style={styles.headerDetail}>
            Level {round?.levelNumber || 1} • {formatTimeRemaining(round?.resolutionTime || Date.now())}
          </Text>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.playersRemaining}>
            {seats.filter((s) => s.status !== 'EMPTY' && s.status !== 'ELIMINATED').length} Players
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>YOUR RANK</Text>
          <Text style={styles.headerValue}>3rd</Text>
        </View>
      </View>

      <View style={styles.tableArea}>{renderSeats()}</View>

      <PredictionInput
        currentPrice={currentPrice}
        asset={round?.asset || 'BTC'}
        onLockIn={handleLockIn}
        changeDeadline={round?.predictionChangeDeadline || Date.now() + 4 * 60 * 1000}
        lockDeadline={round?.predictionLockDeadline || Date.now() + 5 * 60 * 1000}
        disabled={currentTable.status !== 'PREDICTIONS_OPEN'}
        locked={predictionLocked}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  headerLeft: {
    flex: 1,
  },
  tournamentName: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerDetail: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  playersRemaining: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerLabel: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerValue: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tableArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  topSeats: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSeats: {
    gap: 20,
  },
  rightSeats: {
    gap: 20,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSeats: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
});
