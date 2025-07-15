export function formatCurrency(value?: string, compact = false): string {
  if (!value) return '-';
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return '-';
  
  if (compact) {
    if (numValue >= 1e12) {
      return `$${(numValue / 1e12).toFixed(2)}T`;
    } else if (numValue >= 1e9) {
      return `$${(numValue / 1e9).toFixed(2)}B`;
    } else if (numValue >= 1e6) {
      return `$${(numValue / 1e6).toFixed(2)}M`;
    } else if (numValue >= 1e3) {
      return `$${(numValue / 1e3).toFixed(2)}K`;
    }
  }
  
  // For regular price display
  if (numValue < 0.01) {
    return `$${numValue.toFixed(6)}`;
  } else if (numValue < 1) {
    return `$${numValue.toFixed(4)}`;
  } else {
    return `$${numValue.toFixed(2)}`;
  }
}

export function formatPercentage(value?: string): string {
  if (!value) return '0.00%';
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return '0.00%';
  
  return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
}

export function formatSupply(value?: string): string {
  if (!value) return '-';
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) return '-';
  
  // XRP supply is typically in the billions
  if (numValue >= 1e9) {
    return `${(numValue / 1e9).toFixed(2)}B XRP`;
  } else if (numValue >= 1e6) {
    return `${(numValue / 1e6).toFixed(2)}M XRP`;
  } else if (numValue >= 1e3) {
    return `${(numValue / 1e3).toFixed(2)}K XRP`;
  } else {
    return `${numValue.toLocaleString()} XRP`;
  }
}