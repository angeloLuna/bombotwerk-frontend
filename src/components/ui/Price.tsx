import React from 'react';

interface PriceProps {
  amount: number;
  className?: string;
  currency?: string;
}

const Price: React.FC<PriceProps> = ({
  amount,
  className = '',
  currency = 'MXN',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Format as dollar currency
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <span className={`font-sans tracking-wide ${className}`}>
      {formatted} {currency}
    </span>
  );
};

export default Price;
