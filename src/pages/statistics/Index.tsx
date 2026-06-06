import { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { mockStatistics, mockChartData, statusLabels } from '../../data/mockData';
import { formatCurrency, formatDateTime } from '../../utils';

const COLORS = ['#0F3460', '#E94560', '#27AE60', '#F39C12', '#9B59B6'];

const accidentReasonData = [
  { name: '操作失误', value: 8 },
  { name: '设备故障', value: 5 },
  { name: '天气原因', value: 4 },
  { name: '信号干扰', value: 3 },
  { name: '其他', value: 3 },
];

const Statistics = () => {
  const { disputes, policies, claims } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  const policyStatusData = [
    { name: '有效', value: policies.filter(p => p.status === 'active').length },
    { name: '待生效', value: policies.filter(p => p.status === 'pending').length },
    { name: '待续保', value: policies.filter(p => p.status === 'renewal').length },
    { name: '已过期', value: policies.filter(p => p.status === 'expired').length },
  ];

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
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2 inline" />
              导出报表
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
              value={mockStatistics.totalPolicies}
              icon={Shield}
              trend="12%"
              trendUp={true}
              color="blue"
            />
            <StatCard
              title="保费收入"
              value={formatCurrency(mockStatistics.totalPremium)}
              icon={DollarSign}
              trend="8%"
              trendUp={true}
              color="green"
            />
            <StatCard
              title="事故报案"
              value={mockStatistics.totalAccidents}
              icon={AlertTriangle}
              trend="5%"
              trendUp={false}
              color="orange"
            />
            <StatCard
              title="累计赔付"
              value={formatCurrency(mockStatistics.totalClaimAmount)}
              icon={TrendingUp}
              trend="15%"
              trendUp={true}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">业务趋势</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
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
                  <BarChart data={mockChartData}>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {policyStatusData.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }} />
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
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }} />
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
                    {Math.round((mockStatistics.settledClaims / mockStatistics.totalAccidents) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">案均赔付</span>
                  <span className="text-lg font-bold text-primary-700">
                    {formatCurrency(Math.round(mockStatistics.totalClaimAmount / mockStatistics.settledClaims))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">待处理案件</span>
                  <span className="text-lg font-bold text-orange-600">
                    {mockStatistics.pendingClaims}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">争议案件</span>
                  <span className="text-lg font-bold text-red-600">
                    {mockStatistics.disputeCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">争议记录</h3>
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
        </div>
      )}

      {(activeTab === 'policies' || activeTab === 'claims') && (
        <div className="card">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {activeTab === 'policies' ? '保单统计' : '理赔分析'}详细报表
            </p>
            <p className="text-sm text-gray-400">
              该模块正在完善中，更多统计维度即将上线...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
