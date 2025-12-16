import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/number';

export const useCurrencyInput = (initialValue: number | string = '') => {
  const format = (value: string | number) => {
    const stringValue = value.toString();
    if (!stringValue) return '';

    if (stringValue.endsWith('.')) {
        const justNumber = stringValue.replace(/[^\d]/g, '');
        return justNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.';
    }

    let [integer, decimal] = stringValue.replace(/[^\d.]/g, '').split('.');

    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (decimal !== undefined) {
      decimal = decimal.substring(0, 2);
      return `${integer}.${decimal}`;
    }

    return integer;
  };

  const [formattedValue, setFormattedValue] = useState(() => initialValue ? formatCurrency(initialValue) : '');
  const rawValue = parseFloat(formattedValue.replace(/,/g, '')) || 0;

  useEffect(() => {
    const numericInitial = parseFloat(String(initialValue).replace(/,/g, '')) || 0;

    if (numericInitial !== rawValue) {
        setFormattedValue(initialValue ? formatCurrency(initialValue) : '');
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormattedValue(format(e.target.value));
  };

  const handleBlur = () => {
      if (formattedValue || rawValue > 0) {
          setFormattedValue(formatCurrency(rawValue));
      }
  };

  const setValue = (val: string | number) => {
      if(val) {
        setFormattedValue(formatCurrency(val));
      } else {
        setFormattedValue('');
      }
  };

  return {
    value: formattedValue,
    rawValue,
    onChange: handleChange,
    onBlur: handleBlur,
    setValue,
  };
};
