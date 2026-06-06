export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'status-active',
    expired: 'status-expired',
    pending: 'status-pending',
    renewal: 'status-renewal',
    reported: 'status-reported',
    surveying: 'status-surveying',
    auditing: 'status-auditing',
    settled: 'status-settled',
    closed: 'status-closed',
    in_progress: 'status-active',
    scheduled: 'status-pending',
    completed: 'status-settled',
    cancelled: 'status-expired',
    low: 'risk-low',
    medium: 'risk-medium',
    high: 'risk-high',
    approved: 'status-active',
    rejected: 'status-expired'
  };
  return statusMap[status] || 'status-pending';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
