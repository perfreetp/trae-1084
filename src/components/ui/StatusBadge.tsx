import { statusLabels } from '../../data/mockData';
import { getStatusClass } from '../../utils';

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
}

const StatusBadge = ({ status, customLabel }: StatusBadgeProps) => {
  const label = customLabel || statusLabels[status] || status;
  const className = getStatusClass(status);
  
  return (
    <span className={`status-badge ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
