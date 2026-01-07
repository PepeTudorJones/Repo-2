import { Prediction } from '../types';

export const calculatePredictionDistance = (
  predicted: number,
  actual: number
): number => {
  return Math.abs(predicted - actual);
};

export const calculatePredictionAccuracy = (
  predicted: number,
  actual: number
): number => {
  if (actual === 0) return 0;
  const percentageError = Math.abs((predicted - actual) / actual) * 100;
  return Math.max(0, 100 - percentageError);
};

/**
 * Determines who gets strikes based on binary over/under predictions
 * Everyone who guesses wrong gets a strike
 * Players with 3 strikes are eliminated
 */
export const determineStrikes = (
  predictions: Prediction[],
  actualPrice: number,
  targetPrice: number,
  currentStrikes: Map<string, number> // Current strike count per playerId
): {
  updatedPredictions: Prediction[];
  strikes: Map<string, number>; // Updated strike counts
  eliminations: string[]; // PlayerIds who hit 3 strikes
} => {
  if (predictions.length === 0) {
    return {
      updatedPredictions: [],
      strikes: new Map(currentStrikes),
      eliminations: [],
    };
  }

  // Determine if actual price was OVER or UNDER the target
  const actualResult: 'OVER' | 'UNDER' = actualPrice >= targetPrice ? 'OVER' : 'UNDER';

  // All players with wrong prediction get a strike
  const updatedStrikes = new Map(currentStrikes);
  const eliminations: string[] = [];

  const updatedPredictions = predictions.map((pred) => {
    const isCorrect = pred.predictedDirection === actualResult;
    const isWrong = !isCorrect;

    if (isWrong) {
      const currentStrikeCount = updatedStrikes.get(pred.playerId) || 0;
      const newStrikeCount = currentStrikeCount + 1;
      updatedStrikes.set(pred.playerId, newStrikeCount);

      // Check if this is their 3rd strike
      if (newStrikeCount >= 3) {
        eliminations.push(pred.playerId);
      }

      return {
        ...pred,
        isCorrect: false,
        isStrike: true,
        wasEliminated: newStrikeCount >= 3,
      };
    }

    return {
      ...pred,
      isCorrect: true,
      isStrike: false,
      wasEliminated: false,
    };
  });

  return {
    updatedPredictions,
    strikes: updatedStrikes,
    eliminations,
  };
};

export const calculatePrizeDistribution = (
  totalPrize: number,
  positions: number
): number[] => {
  const payoutStructure: { [key: number]: number[] } = {
    1: [1.0],
    2: [0.65, 0.35],
    3: [0.50, 0.30, 0.20],
    4: [0.45, 0.25, 0.18, 0.12],
    5: [0.40, 0.23, 0.16, 0.12, 0.09],
    6: [0.35, 0.22, 0.15, 0.11, 0.09, 0.08],
    7: [0.32, 0.20, 0.14, 0.11, 0.09, 0.08, 0.06],
    8: [0.30, 0.19, 0.13, 0.10, 0.09, 0.08, 0.06, 0.05],
    9: [0.28, 0.18, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.06],
  };

  const structure = payoutStructure[Math.min(positions, 9)] || payoutStructure[9];
  return structure.map((percentage) => totalPrize * percentage);
};

/**
 * Creates round timing structure for 30-minute rounds
 * - 5 minute prediction window at the start
 * - First 4 minutes: can change prediction
 * - Last 1 minute: locked, cannot change
 * - Remaining 25 minutes: waiting for resolution
 */
export const createRoundTiming = (roundStartTime: number) => {
  return {
    roundStartTime,
    predictionWindowStart: roundStartTime,
    predictionChangeDeadline: roundStartTime + 4 * 60 * 1000, // +4 minutes
    predictionLockDeadline: roundStartTime + 5 * 60 * 1000, // +5 minutes
    resolutionTime: roundStartTime + 30 * 60 * 1000, // +30 minutes
  };
};
