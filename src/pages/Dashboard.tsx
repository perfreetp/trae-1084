import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Shield,
  AlertTriangle,
  DollarSign,
  FilePlus,
  Plane,
  Clock,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../components/ui/StatCard';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import { useAppStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { mockChartData, mockStatistics } from '../data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { policies, accidents, claims } = useAppStore();

  const quickActions = [
    { icon: FilePlus, label: '新建投保', path: '/insurance/apply', color: 'bg-primary-700 hover:bg-primary-800' },
    { icon: AlertTriangle, label: '事故报案', path: '/accident/report', color: 'bg-accent-500 hover:bg-accent-600' },
    { icon: Plane, label: '添加任务', path: '/flight/tasks', color: 'bg-green-600 hover:bg-green-700' },
    { icon: BarChart3, label: '查看统计', path: '/statistics', color: 'bg-purple-600 hover:bg-purple-700' },
  ];

  const recentPolicies = policies.slice(0, 4);
  const recentAccidents = accidents.slice(0, 4);

  return (
    <div>
      <PageHeader
        title="工作台"
        description="欢迎回来，张经理！这是您今日的工作概览。"
        actions={
          <button className="btn-primary">
            <FilePlus className="w-4 h-4 mr-2 inline" />
            新建投保
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="有效保单"
          value={mockStatistics.activePolicies}
          icon={Shield}
          trend="12%"
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="累计保费"
          value={formatCurrency(mockStatistics.totalPremium)}
          icon={DollarSign}
          trend="8%"
          trendUp={true}
          color="green"
        />
        <StatCard
          title="待处理案件"
          value={mockStatistics.pendingClaims}
          icon={Clock}
          trend="2"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">业务趋势</h3>
              <select className="text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>近8个月</option>
                <option>近12个月</option>
                <option>本年度</option>
              </select>
            </div>
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
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="policies"
                    name="投保数"
                    stroke="#0F3460"
                    strokeWidth={2}
                    dot={{ fill: '#0F3460', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="claims"
                    name="理赔数"
                    stroke="#E94560"
                    strokeWidth={2}
                    dot={{ fill: '#E94560', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <div className="card h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`${action.color} text-white p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
                >
                  <action.icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">保费收入分布</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData.slice(0, 4)}>
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="premium" fill="#0F3460" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">最近保单</h3>
            <button
              onClick={() => navigate('/insurance/policies')}
              className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center"
            >
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {recentPolicies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/insurance/policies')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{policy.policyNo}</p>
                    <p className="text-xs text-gray-500">{policy.droneModel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{formatCurrency(policy.premium)}</p>
                  <StatusBadge status={policy.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">最新报案</h3>
            <button
              onClick={() => navigate('/accident/report')}
              className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center"
            >
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {recentAccidents.map((accident) => (
              <div
                key={accident.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate('/claims/progress')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{accident.reportNo}</p>
                    <p className="text-xs text-gray-500">{formatDate(accident.accidentTime)} · {accident.location}</p>
                  </div>
                </div>
                <StatusBadge status={accident.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
