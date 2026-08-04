import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  accentColor?: 'green' | 'red' | 'blue' | 'yellow' | 'neutral';
  icon?: LucideIcon;
  footnote?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  accentColor = 'neutral',
  icon: Icon,
  footnote,
}) => {
  const accentClasses = {
    green: 'border-l-2 border-l-green-500',
    red: 'border-l-2 border-l-red-500',
    blue: 'border-l-2 border-l-blue-500',
    yellow: 'border-l-2 border-l-yellow-500',
    neutral: 'border-l-2 border-l-[#333333]',
  };

  const iconColors = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    neutral: 'text-gray-400 bg-[#1a1a1a] border-[#262626]',
  };

  return (
    <div
      className={`p-3.5 rounded bg-[#141414] border border-[#262626] ${accentClasses[accentColor]} transition-all hover:border-[#333333] relative overflow-hidden font-sans`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[10px]  tracking-widest text-gray-500 font-semibold uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-1 rounded border ${iconColors[accentColor]}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-lg font-bold  text-white tracking-tight">{value}</div>
        {change && (
          <span
            className={`text-xs  font-bold ${
              isPositive !== undefined
                ? isPositive
                  ? 'text-green-500'
                  : 'text-red-500'
                : 'text-gray-300'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {(subtitle || footnote) && (
        <div className="mt-1 flex items-center justify-between text-[10px]  text-gray-500">
          {subtitle && <span>{subtitle}</span>}
          {footnote && <span className="text-gray-600">{footnote}</span>}
        </div>
      )}
    </div>
  );
};
