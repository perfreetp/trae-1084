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
  MessageSquare,
  X,
  Save
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatCurrency, formatDateTime, generateId } from '../../utils';
import type { Claim, Dispute } from '../../types';

const Progress = () => {
  const { claims, accidents, disputes, addDispute, updateClaim, updateAccident } = useAppStore();
  const [selectedClaim, setSelectedClaim] = useState(claims[0]?.id || '');
  const [showCalculate, setShowCalculate] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [calculateAmount, setCalculateAmount] = useState(0);
  const [disputeForm, setDisputeForm] = useState({ title: '', description: '' });

  const currentClaim = claims.find(c => c.id === selectedClaim);
  const accident = accidents.find(a => a.id === currentClaim?.accidentId);
  const claimDisputes = disputes.filter(d => d.claimId === selectedClaim);

  const canCalculate = currentClaim && ['surveying', 'auditing'].includes(currentClaim.status);
  const canClose = currentClaim && currentClaim.status === 'approved' && currentClaim.actualAmount > 0;

  const handleCalculate = () => {
    if (!currentClaim || calculateAmount <= 0) return;

    const updatedAuditNodes = currentClaim.auditNodes.map(node => {
      if (node.id === '3') {
        return { ...node, status: 'completed' as const, time: formatDateTime(new Date().toISOString()), comment: '现场查勘完成' };
      }
      if (node.id === '4') {
        return { ...node, status: 'current' as const, time: formatDateTime(new Date().toISOString()) };
      }
      return node;
    });

    const updatedClaim: Claim = {
      ...currentClaim,
      actualAmount: calculateAmount,
      status: 'auditing',
      auditNodes: updatedAuditNodes
    };

    updateClaim(updatedClaim);
    setShowCalculate(false);
    setCalculateAmount(0);
  };

  const handleCloseCase = () => {
    if (!currentClaim) return;

    const updatedAuditNodes = currentClaim.auditNodes.map(node => {
      if (node.id === '4') {
        return { ...node, status: 'completed' as const, time: formatDateTime(new Date().toISOString()), comment: `赔付金额：${formatCurrency(currentClaim.actualAmount)}` };
      }
      if (node.id === '5') {
        return { ...node, status: 'completed' as const, time: formatDateTime(new Date().toISOString()), comment: '已结案，赔付完成' };
      }
      return node;
    });

    const updatedClaim: Claim = {
      ...currentClaim,
      status: 'closed',
      auditNodes: updatedAuditNodes
    };

    updateClaim(updatedClaim);

    if (accident) {
      updateAccident({
        ...accident,
        status: 'closed'
      });
    }
  };

  const handleSubmitDispute = () => {
    if (!currentClaim || !disputeForm.title || !disputeForm.description) return;

    const newDispute: Dispute = {
      id: generateId(),
      claimId: currentClaim.id,
      claimNo: currentClaim.claimNo,
      title: disputeForm.title,
      description: disputeForm.description,
      status: 'open',
      createTime: new Date().toISOString(),
      handler: '待分配'
    };

    addDispute(newDispute);

    const updatedClaim: Claim = {
      ...currentClaim,
      status: 'disputed'
    };
    updateClaim(updatedClaim);

    setDisputeForm({ title: '', description: '' });
    setShowDispute(false);
  };

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
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                      {currentClaim.surveyTime ? formatDateTime(currentClaim.surveyTime) : '-'}
                    </p>
                  </div>
                </div>

                {canCalculate && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">赔付测算</p>
                        <p className="text-sm text-blue-600">该案件已完成查勘，可以进行赔付金额测算</p>
                      </div>
                      <button 
                        className="btn-primary text-sm"
                        onClick={() => {
                          setCalculateAmount(Math.round(currentClaim.estimatedAmount * 0.8));
                          setShowCalculate(true);
                        }}
                      >
                        <DollarSign className="w-4 h-4 mr-1 inline" />
                        赔付测算
                      </button>
                    </div>
                  </div>
                )}

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
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDispute(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  提交异议
                </button>
                <div className="flex items-center space-x-3">
                  <button className="btn-secondary">
                    <FileText className="w-4 h-4 mr-2 inline" />
                    查看详情
                  </button>
                  {canClose && (
                    <button 
                      className="btn-accent"
                      onClick={handleCloseCase}
                    >
                      <Check className="w-4 h-4 mr-2 inline" />
                      结案确认
                    </button>
                  )}
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

      {showCalculate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">赔付测算</h3>
              <button onClick={() => setShowCalculate(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">预估损失金额</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(currentClaim?.estimatedAmount || 0)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">核定赔付金额（元）</label>
                <input 
                  type="number" 
                  className="input-field text-lg"
                  value={calculateAmount}
                  onChange={(e) => setCalculateAmount(Number(e.target.value))}
                  placeholder="请输入核定赔付金额"
                />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  请根据查勘报告、损失清单和保险条款，合理测算赔付金额。
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowCalculate(false)} className="btn-secondary">取消</button>
              <button onClick={handleCalculate} className="btn-primary">
                <Save className="w-4 h-4 mr-2 inline" />
                保存测算
              </button>
            </div>
          </div>
        </div>
      )}

      {showDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">提交异议</h3>
              <button onClick={() => setShowDispute(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">异议标题</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={disputeForm.title}
                  onChange={(e) => setDisputeForm({ ...disputeForm, title: e.target.value })}
                  placeholder="请简要描述异议内容"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                <textarea 
                  className="input-field h-32"
                  value={disputeForm.description}
                  onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                  placeholder="请详细描述您的异议和诉求"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowDispute(false)} className="btn-secondary">取消</button>
              <button onClick={handleSubmitDispute} className="btn-accent">
                <MessageSquare className="w-4 h-4 mr-2 inline" />
                提交异议
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
