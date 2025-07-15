export interface Asset {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
}

export interface HistoryData {
  priceUsd: string;
  time: number;
  date: string;
}

export interface CoinCapResponse<T> {
  data: T;
  timestamp: number;
}

export interface CoinCapHistoryResponse {
  data: HistoryData[];
  timestamp: number;
}