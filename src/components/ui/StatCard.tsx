import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = 'blue' }: StatCardProps) => {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trendUp ? '↑' : '↓'}</span>
              <span className="ml-1">{trend}</span>
              <span className="text-gray-400 ml-1">较上月</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
