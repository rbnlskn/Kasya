import { useState, useEffect } from 'react';

export const useCurrencyInput = (initialValue: number | string = '') => {
  const format = (value: string | number) => {
    const stringValue = value.toString();
    if (!stringValue) return '';

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
