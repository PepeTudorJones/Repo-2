export type Asset = 'BTC' | 'ETH' | 'AAPL' | 'SPY';
export type Currency = 'USDC' | 'ETH' | 'POINTS';
export type TournamentStatus = 'SCHEDULED' | 'REGISTERING' | 'RUNNING' | 'LATE_REG' | 'COMPLETED';
export type TableStatus = 'WAITING' | 'PREDICTIONS_OPEN' | 'LOCKED' | 'RESOLVING';
export type SeatStatus = 'EMPTY' | 'ACTIVE' | 'LOCKED_IN' | 'ELIMINATED';
export type LevelDuration = 15 | 30 | 60;

export interface Tournament {
  id: string;
  name: string;
  asset: Asset;
  buyIn: number;
  currency: Currency;
  guaranteedPrize: number;
  maxEntrants: number;
  currentEntrants: number;
  levelDuration: LevelDuration;
  status: TournamentStatus;
  startTime: number;
  currentLevel: number;
  playersRemaining: number;
  tables: Table[];
}

export interface Table {
  id: string;
  tournamentId: string;
  seats: Seat[];
  currentRound: Round | null;
  status: TableStatus;
}

export interface Seat {
  position: number;
  playerId: string | null;
  playerName: string | null;
  playerAvatar: string | null;
  status: SeatStatus;
  currentPrediction: number | null;
  isCurrentPlayer: boolean;
}

export interface Round {
  id: string;
  tableId: string;
  levelNumber: number;
  asset: Asset;
  startPrice: number;
  predictionDeadline: number;
  resolutionTime: number;
  actualEndPrice: number | null;
  predictions: Prediction[];
  eliminations: string[];
}

export interface Prediction {
  playerId: string;
  playerName: string;
  predictedPrice: number;
  lockedAt: number;
  distance: number | null;
  survived: boolean | null;
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  currency: Currency;
}
