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

export const exportToCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const BOM = '\uFEFF';
  downloadFile(BOM + csvContent, filename, 'text/csv;charset=utf-8');
};

export const generatePolicyReportHTML = (data: {
  policies: any[];
  policyStatusSummary: any[];
  planStatistics: any[];
  operatorStatistics: any[];
  totalPremium: number;
}): string => {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>保单统计报表</title>
<style>
  body { font-family: 'Microsoft YaHei', sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px; color: #333; }
  h1 { text-align: center; color: #0F3460; border-bottom: 3px solid #0F3460; padding-bottom: 15px; }
  h2 { color: #0F3460; border-left: 4px solid #E94560; padding-left: 12px; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
  th { background: #0F3460; color: white; }
  tr:nth-child(even) { background: #f9f9f9; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
  .summary-card { background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center; }
  .summary-card .label { color: #666; font-size: 13px; }
  .summary-card .value { font-weight: bold; font-size: 24px; color: #0F3460; margin-top: 8px; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
</style>
</head>
<body>
  <h1>低空飞行保险 - 保单统计报表</h1>
  
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">总保单数</div>
      <div class="value">${data.policies.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">有效保单</div>
      <div class="value">${data.policies.filter((p: any) => p.status === 'active').length}</div>
    </div>
    <div class="summary-card">
      <div class="label">待审核保单</div>
      <div class="value">${data.policies.filter((p: any) => p.status === 'pending').length}</div>
    </div>
    <div class="summary-card">
      <div class="label">总保费收入</div>
      <div class="value">¥${data.totalPremium.toLocaleString()}</div>
    </div>
  </div>

  <h2>一、按状态汇总</h2>
  <table>
    <thead><tr><th>状态</th><th>保单数</th><th>保费合计</th></tr></thead>
    <tbody>
      ${data.policyStatusSummary.map((s: any) => `
      <tr><td>${s.status}</td><td>${s.count}</td><td>¥${s.premium.toLocaleString()}</td></tr>
      `).join('')}
      <tr style="font-weight: bold; background: #f0f0f0;">
        <td>合计</td><td>${data.policies.length}</td><td>¥${data.totalPremium.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <h2>二、按保障方案汇总</h2>
  <table>
    <thead><tr><th>方案名称</th><th>保单数</th><th>保费合计</th></tr></thead>
    <tbody>
      ${data.planStatistics.map((s: any) => `
      <tr><td>${s.name}</td><td>${s.保单数}</td><td>¥${s.保费.toLocaleString()}</td></tr>
      `).join('')}
    </tbody>
  </table>

  <h2>三、按运营商汇总</h2>
  <table>
    <thead><tr><th>运营商</th><th>保单数</th><th>保费合计</th></tr></thead>
    <tbody>
      ${data.operatorStatistics.map((s: any) => `
      <tr><td>${s.name}</td><td>${s.保单数}</td><td>¥${s.保费.toLocaleString()}</td></tr>
      `).join('')}
    </tbody>
  </table>

  <h2>四、保单明细列表</h2>
  <table>
    <thead><tr><th>保单号</th><th>运营商</th><th>无人机型号</th><th>保障方案</th><th>保费</th><th>状态</th><th>有效期</th></tr></thead>
    <tbody>
      ${data.policies.map((p: any) => `
      <tr>
        <td>${p.policyNo}</td>
        <td>${p.operatorName}</td>
        <td>${p.droneModel}</td>
        <td>${p.planName}</td>
        <td>¥${p.premium.toLocaleString()}</td>
        <td>${{active: '有效', pending: '待审核', renewal: '待续保', expired: '已过期'}[p.status] || p.status}</td>
        <td>${p.startDate} 至 ${p.endDate}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>报表生成时间：${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>`;
};

export const generateClaimReportHTML = (data: {
  claims: any[];
  accidents: any[];
  disputes: any[];
  totalClaimAmount: number;
  settledClaims: number;
}): string => {
  const statusLabels: Record<string, string> = {
    pending: '待处理',
    surveying: '查勘中',
    auditing: '审核中',
    approved: '审核通过',
    paid: '已赔付',
    closed: '已结案',
    disputed: '有争议'
  };

  const closeRate = data.accidents.length > 0 
    ? Math.round((data.settledClaims / data.accidents.length) * 100) 
    : 0;
  const disputeRate = data.claims.length > 0 
    ? Math.round((data.disputes.length / data.claims.length) * 100) 
    : 0;
  const avgClaim = data.settledClaims > 0 
    ? Math.round(data.totalClaimAmount / data.settledClaims) 
    : 0;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>理赔分析报表</title>
<style>
  body { font-family: 'Microsoft YaHei', sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px; color: #333; }
  h1 { text-align: center; color: #0F3460; border-bottom: 3px solid #0F3460; padding-bottom: 15px; }
  h2 { color: #0F3460; border-left: 4px solid #E94560; padding-left: 12px; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
  th { background: #0F3460; color: white; }
  tr:nth-child(even) { background: #f9f9f9; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
  .summary-card { background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center; }
  .summary-card .label { color: #666; font-size: 13px; }
  .summary-card .value { font-weight: bold; font-size: 24px; color: #E94560; margin-top: 8px; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
</style>
</head>
<body>
  <h1>低空飞行保险 - 理赔分析报表</h1>
  
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">总报案数</div>
      <div class="value">${data.accidents.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">总赔案数</div>
      <div class="value">${data.claims.length}</div>
    </div>
    <div class="summary-card">
      <div class="label">已结案数</div>
      <div class="value">${data.settledClaims}</div>
    </div>
    <div class="summary-card">
      <div class="label">总赔付金额</div>
      <div class="value">¥${data.totalClaimAmount.toLocaleString()}</div>
    </div>
  </div>

  <h2>一、关键指标</h2>
  <table>
    <thead><tr><th>指标</th><th>数值</th></tr></thead>
    <tbody>
      <tr><td>结案率</td><td style="font-weight: bold; color: #27AE60;">${closeRate}%</td></tr>
      <tr><td>案均赔付</td><td style="font-weight: bold; color: #0F3460;">¥${avgClaim.toLocaleString()}</td></tr>
      <tr><td>争议率</td><td style="font-weight: bold; color: #E94560;">${disputeRate}%</td></tr>
      <tr><td>待处理案件</td><td>${data.claims.filter((c: any) => ['pending', 'surveying', 'auditing'].includes(c.status)).length}</td></tr>
    </tbody>
  </table>

  <h2>二、赔案明细列表</h2>
  <table>
    <thead><tr><th>赔案号</th><th>报案号</th><th>预估损失</th><th>核定赔付</th><th>查勘员</th><th>状态</th><th>创建时间</th></tr></thead>
    <tbody>
      ${data.claims.map((c: any) => `
      <tr>
        <td>${c.claimNo}</td>
        <td>${c.reportNo}</td>
        <td>¥${c.estimatedAmount.toLocaleString()}</td>
        <td style="color: #27AE60; font-weight: bold;">${c.actualAmount > 0 ? '¥' + c.actualAmount.toLocaleString() : '-'}</td>
        <td>${c.surveyor || '-'}</td>
        <td>${statusLabels[c.status] || c.status}</td>
        <td>${c.createTime}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>三、争议记录</h2>
  ${data.disputes.length === 0 ? '<p style="color: #999; text-align: center; padding: 20px;">暂无争议记录</p>' : `
  <table>
    <thead><tr><th>赔案号</th><th>争议标题</th><th>描述</th><th>状态</th><th>处理人</th><th>创建时间</th></tr></thead>
    <tbody>
      ${data.disputes.map((d: any) => `
      <tr>
        <td>${d.claimNo}</td>
        <td>${d.title}</td>
        <td>${d.description}</td>
        <td>${d.status === 'open' ? '待处理' : d.status === 'processing' ? '处理中' : '已解决'}</td>
        <td>${d.handler}</td>
        <td>${d.createTime}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  `}

  <div class="footer">
    <p>报表生成时间：${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>`;
};

export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateClosingReportHTML = (data: {
  claimNo: string;
  reportNo: string;
  location: string;
  accidentTime: string;
  actualAmount: number;
  closeTime: string;
  surveyor: string;
  auditNodes: any[];
  disputes: any[];
  lossItems?: any[];
  thirdParties?: any[];
  generateTime?: string;
}): string => {
  const lossTypeLabels: Record<string, string> = {
    drone: '无人机',
    payload: '载荷设备',
    other: '其他'
  };
  const thirdPartyTypeLabels: Record<string, string> = {
    property: '财产损失',
    person: '人员伤亡'
  };

  const totalLossEstimate = (data.lossItems || []).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) +
    (data.thirdParties || []).reduce((sum, item) => sum + item.estimatedLoss, 0);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>理赔结案报告书 - ${data.claimNo}</title>
<style>
  body { font-family: 'Microsoft YaHei', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
  h1 { text-align: center; color: #0F3460; border-bottom: 3px solid #0F3460; padding-bottom: 15px; }
  h2 { color: #0F3460; border-left: 4px solid #E94560; padding-left: 12px; margin-top: 30px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
  .info-item { background: #f5f7fa; padding: 12px; border-radius: 6px; }
  .info-label { color: #666; font-size: 13px; }
  .info-value { font-weight: bold; font-size: 15px; margin-top: 4px; }
  .amount-highlight { background: linear-gradient(135deg, #0F3460, #1a4f8a); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
  .amount-highlight .label { font-size: 14px; opacity: 0.9; }
  .amount-highlight .value { font-size: 32px; font-weight: bold; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 14px; }
  th { background: #0F3460; color: white; }
  tr:nth-child(even) { background: #f9f9f9; }
  .audit-node { display: flex; align-items: center; padding: 10px; border-left: 3px solid #27AE60; margin: 8px 0; background: #f0f9f0; }
  .audit-node.completed { border-color: #27AE60; }
  .audit-node .dot { width: 12px; height: 12px; border-radius: 50%; background: #27AE60; margin-right: 12px; }
  .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
  .dispute-item { padding: 10px; background: #fff5f5; border-left: 3px solid #E94560; margin: 8px 0; }
</style>
</head>
<body>
  <h1>低空飞行保险理赔结案报告书</h1>
  <p style="text-align: center; color: #666;">报告编号：${data.claimNo}</p>

  <h2>一、基本信息</h2>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">赔案号</div><div class="info-value">${data.claimNo}</div></div>
    <div class="info-item"><div class="info-label">报案号</div><div class="info-value">${data.reportNo}</div></div>
    <div class="info-item"><div class="info-label">事故地点</div><div class="info-value">${data.location}</div></div>
    <div class="info-item"><div class="info-label">事故时间</div><div class="info-value">${data.accidentTime}</div></div>
    <div class="info-item"><div class="info-label">查勘员</div><div class="info-value">${data.surveyor || '-'}</div></div>
    <div class="info-item"><div class="info-label">结案时间</div><div class="info-value">${data.closeTime}</div></div>
  </div>

  <h2>二、赔付明细</h2>
  
  ${data.lossItems && data.lossItems.length > 0 ? `
  <h3 style="font-size: 15px; color: #0F3460; margin-top: 20px;">2.1 损失清单</h3>
  <table>
    <thead><tr><th>类型</th><th>物品名称</th><th>损坏程度</th><th>数量</th><th>单价</th><th>小计</th></tr></thead>
    <tbody>
      ${data.lossItems.map((item: any) => `
      <tr>
        <td>${lossTypeLabels[item.type] || item.type}</td>
        <td>${item.name}</td>
        <td>${item.damageDegree === 'minor' ? '轻微' : item.damageDegree === 'moderate' ? '中度' : '严重'}</td>
        <td>${item.quantity}</td>
        <td>¥${item.unitPrice.toLocaleString()}</td>
        <td>¥${(item.quantity * item.unitPrice).toLocaleString()}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="color: #999;">无损失清单</p>'}

  ${data.thirdParties && data.thirdParties.length > 0 ? `
  <h3 style="font-size: 15px; color: #0F3460; margin-top: 20px;">2.2 第三方责任</h3>
  <table>
    <thead><tr><th>类型</th><th>名称</th><th>情况描述</th><th>预估损失</th></tr></thead>
    <tbody>
      ${data.thirdParties.map((item: any) => `
      <tr>
        <td>${thirdPartyTypeLabels[item.type] || item.type}</td>
        <td>${item.name}</td>
        <td>${item.description}</td>
        <td>¥${item.estimatedLoss.toLocaleString()}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p style="color: #999;">无第三方责任</p>'}

  <div class="info-grid" style="margin-top: 15px;">
    <div class="info-item"><div class="info-label">损失预估合计</div><div class="info-value" style="color: #E94560;">¥${totalLossEstimate.toLocaleString()}</div></div>
  </div>

  <h2>三、最终赔付</h2>
  <div class="amount-highlight">
    <div class="label">核定赔付金额</div>
    <div class="value">¥${data.actualAmount.toLocaleString()}</div>
  </div>

  <h2>四、审核节点</h2>
  ${data.auditNodes.map((node: any) => `
  <div class="audit-node ${node.status}">
    <div class="dot"></div>
    <div style="flex: 1;">
      <strong>${node.name}</strong>
      ${node.comment ? `<p style="margin: 4px 0 0; color: #666; font-size: 13px;">${node.comment}</p>` : ''}
      ${node.time ? `<p style="margin: 2px 0 0; color: #999; font-size: 12px;">${node.time}</p>` : ''}
    </div>
  </div>
  `).join('')}

  ${data.disputes && data.disputes.length > 0 ? `
  <h2>五、争议记录</h2>
  ${data.disputes.map((d: any) => `
  <div class="dispute-item">
    <strong>${d.title}</strong>
    <p style="margin: 4px 0 0; font-size: 13px;">${d.description}</p>
    <p style="margin: 4px 0 0; color: #666; font-size: 12px;">处理人：${d.handler} | 状态：${d.status === 'open' ? '待处理' : d.status === 'processing' ? '处理中' : '已解决'}</p>
  </div>
  `).join('')}
  ` : ''}

  <div class="footer">
    <p>本结案书为正式理赔凭证，如有疑问请联系客服。</p>
    <p>归档时间：${data.generateTime || new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>`;
};
