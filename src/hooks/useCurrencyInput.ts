import { useState, useEffect } from 'react';

export const useCurrencyInput = (initialValue: number | string = '') => {
  const format = (value: string) => {
    if (!value) return '';
    let [integer, decimal] = value.replace(/[^\d.]/g, '').split('.');
    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (decimal) {
      decimal = decimal.substring(0, 2);
    }
    return decimal === undefined ? integer : `${integer}${decimal ? '.' : ''}${decimal || ''}`;
  };

  const [formattedValue, setFormattedValue] = useState(format(initialValue.toString()));

  useEffect(() => {
    setFormattedValue(format(initialValue.toString()));
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormattedValue(format(e.target.value));
  };

  const rawValue = parseFloat(formattedValue.replace(/,/g, '')) || 0;

  return {
    value: formattedValue,
    rawValue,
    onChange: handleChange,
    setValue: (val: string) => setFormattedValue(format(val)),
  };
};
