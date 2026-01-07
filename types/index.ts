export type Asset = 'BTC' | 'ETH' | 'AAPL' | 'SPY';
export type Currency = 'USDC' | 'ETH' | 'POINTS';
export type TournamentStatus = 'SCHEDULED' | 'REGISTERING' | 'RUNNING' | 'LATE_REG' | 'COMPLETED';
export type TableStatus = 'WAITING' | 'PREDICTIONS_OPEN' | 'LOCKED' | 'RESOLVING';
export type SeatStatus = 'EMPTY' | 'ACTIVE' | 'LOCKED_IN' | 'ELIMINATED';
export type LevelDuration = 15 | 30 | 60;
export type PredictionDirection = 'OVER' | 'UNDER';

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
  currentPrediction: PredictionDirection | null; // 'OVER' or 'UNDER'
  isCurrentPlayer: boolean;
  strikes: number; // 0-3, eliminated at 3
  maxStrikes: number; // Always 3 for now
}

export interface Round {
  id: string;
  tableId: string;
  levelNumber: number;
  asset: Asset;
  startPrice: number;
  targetPrice: number; // Binary threshold - predict OVER or UNDER this price
  roundStartTime: number; // When the round starts
  predictionWindowStart: number; // Same as roundStartTime
  predictionChangeDeadline: number; // roundStartTime + 4 minutes (can change prediction)
  predictionLockDeadline: number; // roundStartTime + 5 minutes (final lock-in)
  resolutionTime: number; // roundStartTime + 30 minutes (when round ends and strikes are given)
  actualEndPrice: number | null;
  predictions: Prediction[];
  eliminations: string[]; // playerIds who got their 3rd strike this round
}

export interface Prediction {
  playerId: string;
  playerName: string;
  predictedDirection: PredictionDirection; // 'OVER' or 'UNDER'
  lockedAt: number;
  isCorrect: boolean | null; // True if prediction was right (actualEndPrice vs targetPrice)
  isStrike: boolean | null; // True if prediction was wrong (gets a strike)
  wasEliminated: boolean | null; // True if this strike caused elimination (3rd strike)
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

// Notification Types
export type NotificationType =
  | 'ROUND_STARTING'
  | 'PREDICTION_NEEDED'
  | 'LOCK_DEADLINE_SOON'
  | 'ROUND_RESOLVED'
  | 'STRIKE_RECEIVED'
  | 'ELIMINATION'
  | 'TOURNAMENT_COMPLETE'
  | 'PRIZE_WON';

export interface NotificationData {
  type: NotificationType;
  tournamentId: string;
  tournamentName: string;
  tableId?: string;
  roundId?: string;
  message: string;
  data?: {
    strikes?: number;
    placement?: number;
    prize?: number;
    asset?: Asset;
    targetPrice?: number;
    actualPrice?: number;
    timeRemaining?: number;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  roundStarting: boolean;
  predictionReminders: boolean;
  roundResults: boolean;
  eliminationAlerts: boolean;
  tournamentComplete: boolean;
  friendActivity: boolean;
  quietHoursStart?: number; // Hour (0-23)
  quietHoursEnd?: number; // Hour (0-23)
}
