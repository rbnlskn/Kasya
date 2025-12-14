export const formatCurrency = (value: number | string, includeDecimals: boolean = true): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;

  if (isNaN(numericValue)) {
    return includeDecimals ? '0.00' : '0';
  }

  const options = includeDecimals
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { minimumFractionDigits: 0, maximumFractionDigits: 0 };

  return new Intl.NumberFormat('en-US', options).format(numericValue);
};
