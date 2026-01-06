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

export const determineSurvivors = (
  predictions: Prediction[],
  actualPrice: number,
  eliminationCount: number
): Prediction[] => {
  const sortedPredictions = [...predictions].sort((a, b) => {
    const distanceA = calculatePredictionDistance(a.predictedPrice, actualPrice);
    const distanceB = calculatePredictionDistance(b.predictedPrice, actualPrice);
    return distanceA - distanceB;
  });

  return sortedPredictions.map((pred, index) => ({
    ...pred,
    distance: calculatePredictionDistance(pred.predictedPrice, actualPrice),
    survived: index < predictions.length - eliminationCount,
  }));
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

export const getEliminationCount = (
  playersRemaining: number,
  levelNumber: number
): number => {
  if (playersRemaining <= 3) return 1;
  if (playersRemaining <= 9) return 1;
  if (levelNumber < 3) return 1;
  if (levelNumber < 6) return 2;
  return Math.max(1, Math.floor(playersRemaining * 0.2));
};
