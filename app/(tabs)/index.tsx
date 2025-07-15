import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, RefreshCw, Wifi, WifiOff, DollarSign, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { fetchXRPPrice } from '@/services/coinCapService';
import { formatCurrency, formatPercentage, formatSupply } from '@/utils/formatters';

export default function XRPTrackerScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: priceData, 
    isLoading: isPriceLoading, 
    error: priceError,
    refetch: refetchPrice,
    dataUpdatedAt,
    isError: isPriceError
  } = useQuery({
    queryKey: ['xrpPrice'],
    queryFn: fetchXRPPrice,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // 15 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refetchPrice();
    setRefreshing(false);
  }, [refetchPrice]);

  const handleManualRefresh = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    refetchPrice();
  };

  // Safe parsing of price change percentage
  const priceChangePercent = priceData?.data?.changePercent24Hr 
    ? parseFloat(priceData.data.changePercent24Hr) 
    : 0;
  const priceChangeIsPositive = priceChangePercent >= 0;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '';

  // Get current price in USD
  const currentPriceUSD = priceData?.data?.priceUsd ? parseFloat(priceData.data.priceUsd) : 0;

  // Error state
  if (isPriceError && !priceData) {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8A2BE2" />
        }
      >
        <View style={styles.container}>
          <LinearGradient
            colors={['#1E1E2E', '#2D2D44']}
            style={styles.card}
          >
            <View style={styles.errorContainer}>
              <AlertCircle size={48} color="#F44336" />
              <Text style={styles.errorTitle}>Unable to Load XRP Data</Text>
              <Text style={styles.errorMessage}>
                {priceError instanceof Error ? priceError.message : 'Network error occurred'}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={handleManualRefresh}
                disabled={isPriceLoading}
              >
                <RefreshCw size={20} color="#fff" />
                <Text style={styles.retryButtonText}>
                  {isPriceLoading ? 'Retrying...' : 'Try Again'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8A2BE2" />
      }
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#1E1E2E', '#2D2D44']}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>XRP</Text>
              <Text style={styles.cardSubtitle}>Ripple</Text>
            </View>
            
            <View style={styles.statusContainer}>
              {isPriceError ? (
                <View style={styles.offlineBadge}>
                  <WifiOff size={14} color="#FF9800" />
                  <Text style={styles.offlineText}>Error</Text>
                </View>
              ) : (
                <View style={styles.onlineBadge}>
                  <Wifi size={14} color="#4CAF50" />
                  <Text style={styles.onlineText}>Live</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            {isPriceLoading && !priceData ? (
              <ActivityIndicator size="large" color="#8A2BE2" />
            ) : (
              <>
                <View style={styles.priceRow}>
                  <DollarSign size={32} color="#8A2BE2" />
                  <Text style={styles.priceText}>
                    {currentPriceUSD.toFixed(4)}
                  </Text>
                  <Text style={styles.currencyLabel}>USD</Text>
                </View>
                <View style={styles.changeContainer}>
                  {priceChangeIsPositive ? (
                    <ArrowUp size={20} color="#4CAF50" />
                  ) : (
                    <ArrowDown size={20} color="#F44336" />
                  )}
                  <Text 
                    style={[
                      styles.changeText, 
                      {color: priceChangeIsPositive ? '#4CAF50' : '#F44336'}
                    ]}
                  >
                    {formatPercentage(priceData?.data?.changePercent24Hr)} (24h)
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Market Cap (USD)</Text>
              <Text style={styles.statValue}>
                {formatCurrency(priceData?.data?.marketCapUsd, true)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volume 24h (USD)</Text>
              <Text style={styles.statValue}>
                {formatCurrency(priceData?.data?.volumeUsd24Hr, true)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Circulating Supply</Text>
              <Text style={styles.statValue}>
                {formatSupply(priceData?.data?.supply)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Market Rank</Text>
              <Text style={styles.statValue}>
                #{priceData?.data?.rank || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.lastUpdated}>
              Last updated: {lastUpdated}
            </Text>
            {isPriceError && (
              <Text style={styles.errorNote}>
                Warning: Data may be outdated due to API issues
              </Text>
            )}
          </View>
        </LinearGradient>

        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleManualRefresh}
          disabled={isPriceLoading}
        >
          <RefreshCw size={20} color="#fff" />
          <Text style={styles.refreshButtonText}>
            {isPriceLoading ? 'Updating...' : 'Refresh Current Price'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 18,
    color: '#aaa',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  onlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offlineText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 8,
  },
  currencyLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8A2BE2',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  footerContainer: {
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  errorNote: {
    fontSize: 10,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});