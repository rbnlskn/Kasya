import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/number';

export const useCurrencyInput = (initialValue: number | string = '') => {
  const format = (value: string | number) => {
    const stringValue = value.toString();
    if (!stringValue) return '';

    // Allow entering a decimal point
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

  const [formattedValue, setFormattedValue] = useState(format(initialValue));

  useEffect(() => {
    // On mount, if there's an initial value, format it fully.
    if (initialValue) {
        setFormattedValue(formatCurrency(initialValue));
    } else {
        setFormattedValue('');
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormattedValue(format(e.target.value));
  };

  const handleBlur = () => {
      if (formattedValue) {
          setFormattedValue(formatCurrency(rawValue));
      }
  };

  const rawValue = parseFloat(formattedValue.replace(/,/g, '')) || 0;

  return {
    value: formattedValue,
    rawValue,
    onChange: handleChange,
    onBlur: handleBlur,
    setValue: (val: string | number) => {
        // When setting the value programmatically, apply full currency format
        if(val) {
          setFormattedValue(formatCurrency(val));
        } else {
          setFormattedValue('');
        }
    },
  };
};
