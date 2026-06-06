import { useState } from 'react';
import {
  Check,
  Clock,
  ChevronRight,
  FileText,
  DollarSign,
  User,
  Calendar,
  Download,
  MessageSquare
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatCurrency, formatDateTime } from '../../utils';

const Progress = () => {
  const { claims, accidents, disputes } = useAppStore();
  const [selectedClaim, setSelectedClaim] = useState(claims[0]?.id || '');

  const currentClaim = claims.find(c => c.id === selectedClaim);
  const accident = accidents.find(a => a.id === currentClaim?.accidentId);
  const claimDisputes = disputes.filter(d => d.claimId === selectedClaim);

  return (
    <div>
      <PageHeader
        title="赔付进度"
        description="查看赔案审核进度，跟踪赔付状态。"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">赔案列表</h3>
            <div className="space-y-2">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedClaim === claim.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-800">{claim.claimNo}</span>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {accidents.find(a => a.id === claim.accidentId)?.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {currentClaim && (
            <>
              <div className="card">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{currentClaim.claimNo}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      报案号：{currentClaim.reportNo} · 创建时间：{formatDateTime(currentClaim.createTime)}
                    </p>
                  </div>
                  <StatusBadge status={currentClaim.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">预估损失</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(currentClaim.estimatedAmount)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">核定赔付</p>
                    <p className="text-xl font-bold text-green-600 mt-1">
                      {currentClaim.actualAmount > 0 ? formatCurrency(currentClaim.actualAmount) : '-'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">查勘员</p>
                    <p className="text-lg font-medium text-gray-800 mt-1">{currentClaim.surveyor || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">查勘时间</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {currentClaim.surveyTime || '-'}
                    </p>
                  </div>
                </div>

                {accident && (
                  <div className="p-4 bg-primary-50 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">事故信息</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">事故地点：</span>
                        <span className="text-gray-800">{accident.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">事故时间：</span>
                        <span className="text-gray-800">{formatDateTime(accident.accidentTime)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">事故描述：</span>
                        <span className="text-gray-800">{accident.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-6">审核进度</h3>
                <div className="relative">
                  {currentClaim.auditNodes.map((node, index) => (
                    <div key={node.id} className="flex pb-8 last:pb-0">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          node.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : node.status === 'current'
                            ? 'bg-primary-700 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {node.status === 'completed' ? (
                            <Check className="w-5 h-5" />
                          ) : node.status === 'current' ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        {index < currentClaim.auditNodes.length - 1 && (
                          <div className={`w-0.5 flex-1 mt-2 ${
                            node.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800">{node.name}</h4>
                          {node.time && (
                            <span className="text-xs text-gray-400">{node.time}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{node.role}</p>
                        {node.comment && (
                          <p className="text-sm text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
                            {node.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {claimDisputes.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-4">争议记录</h3>
                  <div className="space-y-3">
                    {claimDisputes.map((dispute) => (
                      <div key={dispute.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-yellow-800">{dispute.title}</h4>
                          <span className={`status-badge ${
                            dispute.status === 'resolved' ? 'status-active' : 'status-pending'
                          }`}>
                            {dispute.status === 'open' ? '待处理' : dispute.status === 'processing' ? '处理中' : '已解决'}
                          </span>
                        </div>
                        <p className="text-sm text-yellow-700">{dispute.description}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-yellow-600">
                          <span>处理人：{dispute.handler}</span>
                          <span>{formatDateTime(dispute.createTime)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button className="btn-secondary">
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  提交异议
                </button>
                <div className="flex items-center space-x-3">
                  <button className="btn-secondary">
                    <FileText className="w-4 h-4 mr-2 inline" />
                    查看详情
                  </button>
                  {currentClaim.status === 'closed' && (
                    <button className="btn-primary">
                      <Download className="w-4 h-4 mr-2 inline" />
                      下载结案书
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
