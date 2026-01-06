import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText, Rect } from 'react-native-svg';
import { Asset, PricePoint } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { priceService } from '../../services/priceService';

interface PriceChartProps {
  asset: Asset;
  width?: number;
  height?: number;
  myPrediction?: number | null;
  predictions?: Array<{ price: number; playerId: string }>;
  showPredictions?: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  asset,
  width = Dimensions.get('window').width * 0.6,
  height = 300,
  myPrediction,
  predictions = [],
  showPredictions = false,
}) => {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    const loadHistoricalData = async () => {
      const data = await priceService.fetchHistoricalData(asset, '1m', 60);
      setPriceData(data);
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    };

    loadHistoricalData();

    const unsubscribe = priceService.subscribe(asset, (price) => {
      setCurrentPrice(price);
      setPriceData((prev) => {
        const newData = [...prev];
        if (newData.length > 0) {
          const lastPoint = newData[newData.length - 1];
          newData[newData.length - 1] = {
            ...lastPoint,
            close: price,
            high: Math.max(lastPoint.high, price),
            low: Math.min(lastPoint.low, price),
          };
        }
        return newData.slice(-60);
      });
    });

    return () => unsubscribe();
  }, [asset]);

  if (priceData.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const prices = priceData.map((p) => p.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const scaleY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const scaleX = (index: number) => {
    return (index / (priceData.length - 1)) * chartWidth;
  };

  const linePoints = priceData
    .map((point, index) => {
      const x = scaleX(index) + padding;
      const y = scaleY(point.close) + padding;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.header}>
        <Text style={styles.assetLabel}>{asset}/USD</Text>
        <Text style={styles.currentPrice}>{formatPrice(currentPrice, asset)}</Text>
      </View>

      <Svg width={width} height={height - 40}>
        <Rect x={0} y={0} width={width} height={height} fill="#0f0f1a" />

        <Line
          x1={padding}
          y1={padding + chartHeight / 2}
          x2={width - padding}
          y2={padding + chartHeight / 2}
          stroke="#16213e"
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        {myPrediction && (
          <Line
            x1={padding}
            y1={scaleY(myPrediction) + padding}
            x2={width - padding}
            y2={scaleY(myPrediction) + padding}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6,4"
          />
        )}

        {showPredictions &&
          predictions.map((pred, idx) => (
            <Line
              key={`pred-${idx}`}
              x1={padding}
              y1={scaleY(pred.price) + padding}
              x2={width - padding}
              y2={scaleY(pred.price) + padding}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity={0.5}
            />
          ))}

        <Polyline
          points={linePoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />

        {priceData.map((point, index) => {
          if (index % 10 === 0 || index === priceData.length - 1) {
            return (
              <Circle
                key={`point-${index}`}
                cx={scaleX(index) + padding}
                cy={scaleY(point.close) + padding}
                r="3"
                fill="#10b981"
              />
            );
          }
          return null;
        })}

        <SvgText
          x={padding}
          y={padding - 10}
          fill="#9ca3af"
          fontSize="12"
          fontFamily="monospace"
        >
          {formatPrice(maxPrice, asset)}
        </SvgText>

        <SvgText
          x={padding}
          y={height - padding + 20}
          fill="#9ca3af"
          fontSize="12"
          fontFamily="monospace"
        >
          {formatPrice(minPrice, asset)}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#16213e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  assetLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPrice: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 100,
  },
});
