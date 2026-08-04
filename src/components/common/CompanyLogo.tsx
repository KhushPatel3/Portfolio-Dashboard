import React, { useState } from 'react';

interface CompanyLogoProps {
  ticker: string;
  name?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const BRAND_COLORS: Record<string, string> = {
  NVDA: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  AAPL: 'bg-slate-400/20 text-slate-200 border-slate-400/40',
  MSFT: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  AMZN: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  GOOGL: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  TSLA: 'bg-red-500/20 text-red-400 border-red-500/40',
  META: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  SPY: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
  VOO: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  QQQ: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  NZX: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  BTC: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  ETH: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  ticker,
  name,
  logoUrl,
  className = '',
  size = 'md',
}) => {
  const [error, setError] = useState(false);

  const cleanTicker = (ticker || '').trim().toUpperCase();
  const url = logoUrl || `https://assets.parqet.com/logos/symbol/${cleanTicker}?format=png`;

  let sizeClasses = 'w-7 h-7 text-xs';
  let imgSize = 'w-7 h-7';

  if (size === 'sm') {
    sizeClasses = 'w-5 h-5 text-[10px]';
    imgSize = 'w-5 h-5';
  } else if (size === 'lg') {
    sizeClasses = 'w-9 h-9 text-sm';
    imgSize = 'w-9 h-9';
  } else if (size === 'xl') {
    sizeClasses = 'w-12 h-12 text-base';
    imgSize = 'w-12 h-12';
  }

  const colorStyle = BRAND_COLORS[cleanTicker] || 'bg-slate-800 text-slate-300 border-slate-700';

  if (error || !cleanTicker) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold rounded-lg border shrink-0 ${sizeClasses} ${colorStyle} ${className}`}
        title={name || cleanTicker}
      >
        {cleanTicker.slice(0, 3)}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-lg bg-slate-900 border border-[#262f42] overflow-hidden shrink-0 ${imgSize} ${className}`}
    >
      <img
        src={url}
        alt={`${cleanTicker} logo`}
        className="w-full h-full object-contain p-0.5"
        onError={() => setError(true)}
      />
    </div>
  );
};
