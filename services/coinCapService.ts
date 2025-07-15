import { Asset } from '@/types/coinCap';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINCAP_API_BASE = 'https://api.coincap.io/v2';

// Add timeout to fetch requests
async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Try CoinGecko API first, then fallback to CoinCap
async function fetchFromCoinGecko(): Promise<{ data: Asset }> {
  console.log('Fetching XRP price from CoinGecko API...');
  
  const response = await fetchWithTimeout(`${COINGECKO_API_BASE}/coins/ripple?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.market_data) {
    throw new Error('Invalid CoinGecko response: missing market data');
  }
  
  const marketData = data.market_data;
  
  // Convert CoinGecko format to our Asset format
  const asset: Asset = {
    id: 'xrp',
    rank: data.market_cap_rank?.toString() || '7',
    symbol: 'XRP',
    name: 'XRP',
    supply: marketData.circulating_supply?.toString() || '0',
    maxSupply: marketData.max_supply?.toString() || '100000000000',
    marketCapUsd: marketData.market_cap?.usd?.toString() || '0',
    volumeUsd24Hr: marketData.total_volume?.usd?.toString() || '0',
    priceUsd: marketData.current_price?.usd?.toString() || '0',
    changePercent24Hr: marketData.price_change_percentage_24h?.toString() || '0',
    vwap24Hr: marketData.current_price?.usd?.toString() || '0'
  };
  
  console.log('Successfully fetched XRP data from CoinGecko:', {
    price: asset.priceUsd,
    supply: asset.supply,
    marketCap: asset.marketCapUsd
  });
  return { data: asset };
}

async function fetchFromCoinCap(): Promise<{ data: Asset }> {
  console.log('Fetching XRP price from CoinCap API...');
  
  const timestamp = Date.now();
  const response = await fetchWithTimeout(`${COINCAP_API_BASE}/assets/xrp?t=${timestamp}`);
  
  if (!response.ok) {
    throw new Error(`CoinCap API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.data || typeof data.data.priceUsd !== 'string') {
    throw new Error('Invalid CoinCap response: missing price data');
  }
  
  console.log('Successfully fetched XRP data from CoinCap:', {
    price: data.data.priceUsd,
    supply: data.data.supply,
    marketCap: data.data.marketCapUsd
  });
  return data;
}

export async function fetchXRPPrice(): Promise<{ data: Asset }> {
  const errors: string[] = [];
  
  // Try CoinGecko first
  try {
    return await fetchFromCoinGecko();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown CoinGecko error';
    errors.push(`CoinGecko: ${errorMessage}`);
    console.warn('CoinGecko API failed:', errorMessage);
  }
  
  // Fallback to CoinCap
  try {
    return await fetchFromCoinCap();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown CoinCap error';
    errors.push(`CoinCap: ${errorMessage}`);
    console.warn('CoinCap API failed:', errorMessage);
  }
  
  // If both APIs fail, throw a comprehensive error
  throw new Error(`All APIs failed: ${errors.join(', ')}`);
}