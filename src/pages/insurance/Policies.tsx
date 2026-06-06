import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  Bell,
  ChevronDown
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatCurrency, formatDate } from '../../utils';

const Policies = () => {
  const { policies } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.droneModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renewalPolicies = policies.filter(p => p.status === 'renewal');

  return (
    <div>
      <PageHeader
        title="保单管理"
        description="查看和管理所有无人机保险保单，支持续期、变更等操作。"
        actions={
          <>
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2 inline" />
              导出数据
            </button>
            <button className="btn-primary">
              <FileText className="w-4 h-4 mr-2 inline" />
              批量投保
            </button>
          </>
        }
      />

      {renewalPolicies.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-orange-800">保单续期提醒</p>
              <p className="text-sm text-orange-600">您有 {renewalPolicies.length} 份保单即将到期，请及时处理</p>
            </div>
          </div>
          <button className="btn-outline">
            立即处理
          </button>
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索保单号、企业名称、机型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field pr-10 appearance-none"
                >
                  <option value="all">全部状态</option>
                  <option value="active">有效</option>
                  <option value="pending">待生效</option>
                  <option value="renewal">待续保</option>
                  <option value="expired">已过期</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button className="btn-secondary">
                <Filter className="w-4 h-4 mr-2 inline" />
                筛选
              </button>
            </div>
          </div>
          <button className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            刷新
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保单号</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">投保人</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">无人机机型</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保障方案</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保费</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">保额</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">有效期</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-primary-700">{policy.policyNo}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{policy.operatorName}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{policy.droneModel}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{policy.planName}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-800">{formatCurrency(policy.premium)}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{formatCurrency(policy.coverageAmount)}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    <p>{formatDate(policy.startDate)}</p>
                    <p className="text-gray-400">至 {formatDate(policy.endDate)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={policy.status} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="p-2 text-gray-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {policy.status === 'renewal' && (
                        <button
                          className="p-2 text-accent-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                          title="一键续保"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到符合条件的保单</p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-4">
          <p className="text-sm text-gray-500">
            共 {filteredPolicies.length} 条记录
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">
              上一页
            </button>
            <button className="px-3 py-1 bg-primary-700 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50">
              下一页
            </button>
          </div>
        </div>
      </div>

      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">保单详情</h3>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">保单号</p>
                  <p className="font-medium text-gray-800">{selectedPolicy.policyNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">状态</p>
                  <StatusBadge status={selectedPolicy.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">投保人</p>
                  <p className="font-medium text-gray-800">{selectedPolicy.operatorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">无人机型号</p>
                  <p className="font-medium text-gray-800">{selectedPolicy.droneModel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">保障方案</p>
                  <p className="font-medium text-gray-800">{selectedPolicy.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">保费</p>
                  <p className="font-bold text-primary-700">{formatCurrency(selectedPolicy.premium)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">保障额度</p>
                  <p className="font-medium text-gray-800">{formatCurrency(selectedPolicy.coverageAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">保险期间</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(selectedPolicy.startDate)} 至 {formatDate(selectedPolicy.endDate)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="btn-secondary"
              >
                关闭
              </button>
              <button className="btn-primary">
                下载保单
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
