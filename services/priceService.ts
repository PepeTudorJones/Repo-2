import { Asset, PricePoint } from '../types';

type PriceCallback = (price: number) => void;
type CandleCallback = (candle: PricePoint) => void;

class PriceService {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Set<PriceCallback>> = new Map();
  private candleCallbacks: Map<string, Set<CandleCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  connect(asset: Asset): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    const symbol = this.getSymbol(asset);
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@ticker`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`Connected to Binance WebSocket for ${asset}`);
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.c);

        const callbacks = this.callbacks.get(asset);
        if (callbacks) {
          callbacks.forEach((callback) => callback(price));
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.attemptReconnect(asset);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.attemptReconnect(asset);
    }
  }

  private attemptReconnect(asset: Asset): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);

      setTimeout(() => {
        this.connect(asset);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(asset: Asset, callback: PriceCallback): () => void {
    if (!this.callbacks.has(asset)) {
      this.callbacks.set(asset, new Set());
      this.connect(asset);
    }

    const assetCallbacks = this.callbacks.get(asset)!;
    assetCallbacks.add(callback);

    return () => {
      assetCallbacks.delete(callback);
      if (assetCallbacks.size === 0) {
        this.callbacks.delete(asset);
        this.disconnect();
      }
    };
  }

  subscribeToCandlesticks(asset: Asset, interval: string, callback: CandleCallback): () => void {
    const key = `${asset}-${interval}`;
    if (!this.candleCallbacks.has(key)) {
      this.candleCallbacks.set(key, new Set());
    }

    const callbacks = this.candleCallbacks.get(key)!;
    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.candleCallbacks.delete(key);
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async fetchHistoricalData(
    asset: Asset,
    interval: string = '1m',
    limit: number = 100
  ): Promise<PricePoint[]> {
    const symbol = this.getSymbol(asset);
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.map((candle: any) => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
      }));
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return [];
    }
  }

  async getCurrentPrice(asset: Asset): Promise<number> {
    const symbol = this.getSymbol(asset);
    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Failed to fetch current price:', error);
      return 0;
    }
  }

  private getSymbol(asset: Asset): string {
    switch (asset) {
      case 'BTC':
        return 'btcusdt';
      case 'ETH':
        return 'ethusdt';
      default:
        return 'btcusdt';
    }
  }
}

export const priceService = new PriceService();
