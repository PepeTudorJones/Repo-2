import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTournamentStore } from '../stores/tournamentStore';
import { useTableStore } from '../stores/tableStore';
import { initializeMockData } from '../utils/mockData';

export default function RootLayout() {
  const { setTournaments } = useTournamentStore();
  const { setCurrentTable } = useTableStore();

  useEffect(() => {
    const { tournaments, table } = initializeMockData();
    setTournaments(tournaments);
    setCurrentTable(table);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f0f1a' },
        }}
      >
        <Stack.Screen name="lobby" options={{ title: 'Tournament Lobby' }} />
        <Stack.Screen name="table/[id]" options={{ title: 'Table' }} />
      </Stack>
    </>
  );
}
