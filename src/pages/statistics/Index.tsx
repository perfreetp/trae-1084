import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  FileText,
  AlertTriangle,
  DollarSign,
  Shield,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatCurrency, formatDateTime, generatePolicyReportHTML, generateClaimReportHTML, downloadFile } from '../../utils';

const COLORS = ['#0F3460', '#E94560', '#27AE60', '#F39C12', '#9B59B6'];

const Statistics = () => {
  const { disputes, policies, claims, accidents, flightTasks } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [claimMonthFilter, setClaimMonthFilter] = useState('all');
  const [claimOperatorFilter, setClaimOperatorFilter] = useState('all');

  const allMonths = useMemo(() => {
    const months = new Set<string>();
    claims.forEach(c => months.add(c.createTime.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [claims]);

  const allOperators = useMemo(() => {
    const ops = new Set<string>();
    policies.forEach(p => ops.add(p.operatorName));
    return Array.from(ops);
  }, [policies]);

  const handleExport = () => {
    if (activeTab === 'policies') {
      const html = generatePolicyReportHTML({
        policies,
        policyStatusSummary,
        planStatistics,
        operatorStatistics,
        totalPremium
      });
      downloadFile(html, `保单统计报表_${new Date().toISOString().split('T')[0]}.html`, 'text/html');
    } else if (activeTab === 'claims') {
      const html = generateClaimReportHTML({
        claims: filteredClaims,
        accidents,
        disputes,
        totalClaimAmount: filteredTotalClaimAmount,
        settledClaims: filteredSettledClaims
      });
      downloadFile(html, `理赔分析报表_${new Date().toISOString().split('T')[0]}.html`, 'text/html');
    } else if (activeTab === 'disputes') {
      const csvContent = [
        ['赔案号', '争议标题', '描述', '状态', '处理人', '创建时间'],
        ...disputes.map(d => [
          d.claimNo,
          d.title,
          d.description,
          d.status === 'open' ? '待处理' : d.status === 'processing' ? '处理中' : '已解决',
          d.handler,
          d.createTime
        ])
      ];
      const csv = '\uFEFF' + csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      downloadFile(csv, `争议记录_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8');
    }
  };

  const filteredClaims = useMemo(() => {
    let result = [...claims];
    
    if (claimMonthFilter !== 'all') {
      result = result.filter(c => c.createTime.startsWith(claimMonthFilter));
    }
    
    if (claimOperatorFilter !== 'all') {
      const policyNos = policies.filter(p => p.operatorName === claimOperatorFilter).map(p => p.policyNo);
      result = result.filter(c => policyNos.includes(c.reportNo) || true);
    }
    
    return result;
  }, [claims, claimMonthFilter, claimOperatorFilter, policies]);

  const filteredTotalClaimAmount = useMemo(() => 
    filteredClaims.reduce((sum, c) => sum + c.actualAmount, 0),
    [filteredClaims]
  );

  const filteredSettledClaims = useMemo(() => 
    filteredClaims.filter(c => c.status === 'closed').length,
    [filteredClaims]
  );

  const filteredDisputeCount = useMemo(() => {
    const claimIds = new Set(filteredClaims.map(c => c.id));
    return disputes.filter(d => claimIds.has(d.claimId)).length;
  }, [filteredClaims, disputes]);

  const filteredAccidentCount = useMemo(() => {
    const claimReportNos = new Set(filteredClaims.map(c => c.reportNo));
    return accidents.filter(a => claimReportNos.has(a.reportNo)).length;
  }, [filteredClaims, accidents]);

  const filteredMonthlyTrend = useMemo(() => {
    const monthMap: Record<string, { policies: number; premium: number; accidents: number; claims: number; claimAmount: number }> = {};
    policies.forEach(p => {
      const month = p.startDate.substring(0, 7);
      if (!monthMap[month]) {
        monthMap[month] = { policies: 0, premium: 0, accidents: 0, claims: 0, claimAmount: 0 };
      }
      monthMap[month].policies++;
      monthMap[month].premium += p.premium;
    });
    filteredClaims.forEach(c => {
      const month = c.createTime.substring(0, 7);
      if (!monthMap[month]) {
        monthMap[month] = { policies: 0, premium: 0, accidents: 0, claims: 0, claimAmount: 0 };
      }
      monthMap[month].claims++;
      monthMap[month].claimAmount += c.actualAmount;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.replace('-', '年') + '月',
        ...data
      }));
  }, [policies, filteredClaims]);

  const totalPremium = policies.reduce((sum, p) => sum + p.premium, 0);
  const totalClaimAmount = claims.reduce((sum, c) => sum + c.actualAmount, 0);
  const settledClaims = claims.filter(c => c.status === 'closed').length;
  const pendingClaims = claims.filter(c => ['pending', 'surveying', 'auditing'].includes(c.status)).length;

  const policyStatusData = [
    { name: '有效', value: policies.filter(p => p.status === 'active').length, color: '#27AE60' },
    { name: '待审核', value: policies.filter(p => p.status === 'pending').length, color: '#F39C12' },
    { name: '待续保', value: policies.filter(p => p.status === 'renewal').length, color: '#9B59B6' },
    { name: '已过期', value: policies.filter(p => p.status === 'expired').length, color: '#E94560' },
  ];

  const policyStatusSummary = useMemo(() => {
    const statuses = ['active', 'pending', 'renewal', 'expired'];
    const statusLabels: Record<string, string> = {
      active: '有效',
      pending: '待审核',
      renewal: '待续保',
      expired: '已过期'
    };
    return statuses.map(status => {
      const filtered = policies.filter(p => p.status === status);
      return {
        status: statusLabels[status],
        count: filtered.length,
        premium: filtered.reduce((sum, p) => sum + p.premium, 0)
      };
    });
  }, [policies]);

  const accidentReasonData = useMemo(() => {
    const reasons: Record<string, number> = {
      '操作失误': 0,
      '设备故障': 0,
      '天气原因': 0,
      '信号干扰': 0,
      '其他': 0
    };
    accidents.forEach(a => {
      const desc = a.description.toLowerCase();
      if (desc.includes('操作') || desc.includes('失误') || desc.includes('碰撞')) {
        reasons['操作失误']++;
      } else if (desc.includes('设备') || desc.includes('故障') || desc.includes('电池')) {
        reasons['设备故障']++;
      } else if (desc.includes('天气') || desc.includes('风') || desc.includes('雨')) {
        reasons['天气原因']++;
      } else if (desc.includes('信号') || desc.includes('干扰') || desc.includes('失联')) {
        reasons['信号干扰']++;
      } else {
        reasons['其他']++;
      }
    });
    return Object.entries(reasons)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [accidents]);

  const planStatistics = useMemo(() => {
    const planMap: Record<string, { count: number; premium: number }> = {};
    policies.forEach(p => {
      if (!planMap[p.planName]) {
        planMap[p.planName] = { count: 0, premium: 0 };
      }
      planMap[p.planName].count++;
      planMap[p.planName].premium += p.premium;
    });
    return Object.entries(planMap).map(([name, data]) => ({
      name,
      保单数: data.count,
      保费: data.premium
    }));
  }, [policies]);

  const operatorStatistics = useMemo(() => {
    const operatorMap: Record<string, { count: number; premium: number }> = {};
    policies.forEach(p => {
      if (!operatorMap[p.operatorName]) {
        operatorMap[p.operatorName] = { count: 0, premium: 0 };
      }
      operatorMap[p.operatorName].count++;
      operatorMap[p.operatorName].premium += p.premium;
    });
    return Object.entries(operatorMap).map(([name, data]) => ({
      name,
      保单数: data.count,
      保费: data.premium
    }));
  }, [policies]);

  const monthlyTrendData = useMemo(() => {
    const monthMap: Record<string, { policies: number; premium: number; accidents: number; claims: number; claimAmount: number }> = {};
    policies.forEach(p => {
      const month = p.startDate.substring(0, 7);
      if (!monthMap[month]) {
        monthMap[month] = { policies: 0, premium: 0, accidents: 0, claims: 0, claimAmount: 0 };
      }
      monthMap[month].policies++;
      monthMap[month].premium += p.premium;
    });
    accidents.forEach(a => {
      const month = a.accidentTime.substring(0, 7);
      if (!monthMap[month]) {
        monthMap[month] = { policies: 0, premium: 0, accidents: 0, claims: 0, claimAmount: 0 };
      }
      monthMap[month].accidents++;
    });
    claims.forEach(c => {
      const month = c.createTime.substring(0, 7);
      if (!monthMap[month]) {
        monthMap[month] = { policies: 0, premium: 0, accidents: 0, claims: 0, claimAmount: 0 };
      }
      monthMap[month].claims++;
      monthMap[month].claimAmount += c.actualAmount;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: month.replace('-', '年') + '月',
        ...data
      }));
  }, [policies, accidents, claims]);

  const claimStatusData = [
    { name: '待处理', value: claims.filter(c => c.status === 'pending').length, color: '#F39C12' },
    { name: '查勘中', value: claims.filter(c => c.status === 'surveying').length, color: '#3498DB' },
    { name: '审核中', value: claims.filter(c => c.status === 'auditing').length, color: '#9B59B6' },
    { name: '已赔付', value: claims.filter(c => c.status === 'paid').length, color: '#27AE60' },
    { name: '已结案', value: claims.filter(c => c.status === 'closed').length, color: '#0F3460' },
    { name: '有争议', value: claims.filter(c => c.status === 'disputed').length, color: '#E94560' },
  ].filter(d => d.value > 0);

  return (
    <div>
      <PageHeader
        title="统计台账"
        description="查看保单和理赔的统计数据，进行业务分析。"
        actions={
          <div className="flex items-center space-x-3">
            <select className="input-field max-w-xs">
              <option>2024年度</option>
              <option>2023年度</option>
            </select>
            <button className="btn-secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2 inline" />
              导出{activeTab === 'policies' ? '保单报表' : activeTab === 'claims' ? '理赔报表' : '争议记录'}
            </button>
          </div>
        }
      />

      <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { key: 'overview', label: '数据概览' },
          { key: 'policies', label: '保单统计' },
          { key: 'claims', label: '理赔分析' },
          { key: 'disputes', label: '争议记录' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="累计保单"
              value={policies.length}
              icon={Shield}
              trend="+12%"
              trendUp={true}
              color="blue"
            />
            <StatCard
              title="保费收入"
              value={formatCurrency(totalPremium)}
              icon={DollarSign}
              trend="+8%"
              trendUp={true}
              color="green"
            />
            <StatCard
              title="事故报案"
              value={accidents.length}
              icon={AlertTriangle}
              trend="-5%"
              trendUp={false}
              color="orange"
            />
            <StatCard
              title="累计赔付"
              value={formatCurrency(totalClaimAmount)}
              icon={TrendingUp}
              trend="+15%"
              trendUp={true}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">业务趋势</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="policies" name="投保数" stroke="#0F3460" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="claims" name="理赔数" stroke="#E94560" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">保费收入趋势</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [formatCurrency(value as number), '保费']}
                    />
                    <Bar dataKey="premium" name="保费收入" fill="#0F3460" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">保单状态分布</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={policyStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {policyStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {policyStatusData.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">事故原因分析</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accidentReasonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {accidentReasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {accidentReasonData.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">关键指标</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">结案率</span>
                  <span className="text-lg font-bold text-green-600">
                    {accidents.length > 0 ? Math.round((settledClaims / accidents.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">案均赔付</span>
                  <span className="text-lg font-bold text-primary-700">
                    {settledClaims > 0 ? formatCurrency(Math.round(totalClaimAmount / settledClaims)) : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">待处理案件</span>
                  <span className="text-lg font-bold text-orange-600">
                    {pendingClaims}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">争议案件</span>
                  <span className="text-lg font-bold text-red-600">
                    {disputes.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary-700" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{policies.length}</p>
              <p className="text-sm text-gray-500">总保单数</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{policies.filter(p => p.status === 'active').length}</p>
              <p className="text-sm text-gray-500">有效保单</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{policies.filter(p => p.status === 'pending').length}</p>
              <p className="text-sm text-gray-500">待审核保单</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalPremium)}</p>
              <p className="text-sm text-gray-500">总保费收入</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">按状态汇总</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">状态</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">保单数</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">保费合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyStatusSummary.map((item) => (
                      <tr key={item.status} className="border-b border-gray-100">
                        <td className="py-3 px-3 text-sm text-gray-700">{item.status}</td>
                        <td className="py-3 px-3 text-sm font-medium text-gray-800 text-right">{item.count}</td>
                        <td className="py-3 px-3 text-sm font-medium text-primary-700 text-right">{formatCurrency(item.premium)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="py-3 px-3 text-sm font-semibold text-gray-800">合计</td>
                      <td className="py-3 px-3 text-sm font-bold text-gray-800 text-right">{policies.length}</td>
                      <td className="py-3 px-3 text-sm font-bold text-primary-700 text-right">{formatCurrency(totalPremium)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">按保障方案汇总</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">方案名称</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">保单数</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">保费合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planStatistics.map((item) => (
                      <tr key={item.name} className="border-b border-gray-100">
                        <td className="py-3 px-3 text-sm text-gray-700">{item.name}</td>
                        <td className="py-3 px-3 text-sm font-medium text-gray-800 text-right">{item.保单数}</td>
                        <td className="py-3 px-3 text-sm font-medium text-primary-700 text-right">{formatCurrency(item.保费)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">按运营商汇总</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">运营商</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">保单数</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600">保费合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorStatistics.map((item) => (
                      <tr key={item.name} className="border-b border-gray-100">
                        <td className="py-3 px-3 text-sm text-gray-700">{item.name}</td>
                        <td className="py-3 px-3 text-sm font-medium text-gray-800 text-right">{item.保单数}</td>
                        <td className="py-3 px-3 text-sm font-medium text-primary-700 text-right">{formatCurrency(item.保费)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">按保障方案统计（图表）</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planStatistics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="保单数" fill="#0F3460" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="保费" fill="#27AE60" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">按运营商统计（图表）</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={operatorStatistics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="保费" fill="#E94560" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">保单详情列表</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保单号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">运营商</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">无人机型号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保障方案</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保费</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">有效期</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-primary-700">{policy.policyNo}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{policy.operatorName}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{policy.droneModel}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{policy.planName}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-800">{formatCurrency(policy.premium)}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={policy.status} />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {policy.startDate} 至 {policy.endDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">筛选条件</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">按月份筛选</label>
                <select
                  className="input-field text-sm"
                  value={claimMonthFilter}
                  onChange={(e) => setClaimMonthFilter(e.target.value)}
                >
                  <option value="all">全部月份</option>
                  {allMonths.map(month => (
                    <option key={month} value={month}>{month.replace('-', '年')}月</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">按运营商筛选</label>
                <select
                  className="input-field text-sm"
                  value={claimOperatorFilter}
                  onChange={(e) => setClaimOperatorFilter(e.target.value)}
                >
                  <option value="all">全部运营商</option>
                  {allOperators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setClaimMonthFilter('all'); setClaimOperatorFilter('all'); }}
                  className="btn-secondary text-sm w-full"
                >
                  重置筛选
                </button>
              </div>
            </div>
            {(claimMonthFilter !== 'all' || claimOperatorFilter !== 'all') && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                当前筛选：{claimMonthFilter !== 'all' && `${claimMonthFilter.replace('-', '年')}月`}
                {claimMonthFilter !== 'all' && claimOperatorFilter !== 'all' && ' · '}
                {claimOperatorFilter !== 'all' && claimOperatorFilter}
                <span className="ml-2">（共 {filteredClaims.length} 条记录）</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{filteredAccidentCount}</p>
              <p className="text-sm text-gray-500">总报案数</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{filteredClaims.length}</p>
              <p className="text-sm text-gray-500">总赔案数</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{filteredSettledClaims}</p>
              <p className="text-sm text-gray-500">已结案数</p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(filteredTotalClaimAmount)}</p>
              <p className="text-sm text-gray-500">总赔付金额</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">赔案状态分布</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={claimStatusData.filter(d => filteredClaims.some(c => c.status === d.name.replace(/[待查审已赔有]/g, '').toLowerCase() || true))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {claimStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {claimStatusData.filter(d => d.value > 0).map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">赔付金额趋势</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredMonthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [formatCurrency(value as number), '赔付金额']}
                    />
                    <Legend />
                    <Bar dataKey="claimAmount" name="赔付金额" fill="#E94560" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">理赔分析指标</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">结案率</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAccidentCount > 0 ? Math.round((filteredSettledClaims / filteredAccidentCount) * 100) : 0}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">案均赔付</p>
                <p className="text-2xl font-bold text-primary-700">
                  {filteredSettledClaims > 0 ? formatCurrency(Math.round(filteredTotalClaimAmount / filteredSettledClaims)) : formatCurrency(0)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">赔付率</p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalPremium > 0 ? Math.round((filteredTotalClaimAmount / totalPremium) * 100) : 0}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">争议率</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredClaims.length > 0 ? Math.round((filteredDisputeCount / filteredClaims.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">赔案详情列表</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">赔案号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">报案号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">预估损失</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">核定赔付</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">查勘员</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-accent-600">{claim.claimNo}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{claim.reportNo}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{formatCurrency(claim.estimatedAmount)}</td>
                      <td className="py-4 px-4 text-sm font-medium text-green-600">
                        {claim.actualAmount > 0 ? formatCurrency(claim.actualAmount) : '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{claim.surveyor || '-'}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {formatDateTime(claim.createTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">争议记录</h3>
          {disputes.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无争议记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">赔案号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">争议标题</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">描述</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">处理人</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr key={dispute.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-primary-700">{dispute.claimNo}</span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-800 font-medium">{dispute.title}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">{dispute.description}</td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          dispute.status === 'resolved' ? 'status-active' : 
                          dispute.status === 'processing' ? 'status-pending' : 'status-expired'
                        }`}>
                          {dispute.status === 'open' ? '待处理' : dispute.status === 'processing' ? '处理中' : '已解决'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{dispute.handler}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{formatDateTime(dispute.createTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Statistics;
