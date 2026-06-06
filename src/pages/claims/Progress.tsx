import { useState, useMemo } from 'react';
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
  Save,
  AlertTriangle,
  History,
  Edit2,
  Upload,
  ExternalLink,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatCurrency, formatDateTime, generateId, downloadFile, generateClosingReportHTML } from '../../utils';
import type { Claim, Dispute, ClosingArchive, Material } from '../../types';

const Progress = () => {
  const navigate = useNavigate();
  const { claims, accidents, disputes, materials, closingArchives, addDispute, updateClaim, updateAccident, addClosingArchive, updateDispute } = useAppStore();
  const [selectedClaim, setSelectedClaim] = useState(claims[0]?.id || '');
  const [showCalculate, setShowCalculate] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showCloseCase, setShowCloseCase] = useState(false);
  const [showClosingInfo, setShowClosingInfo] = useState(false);
  const [showArchiveHistory, setShowArchiveHistory] = useState(false);
  const [showProcessDispute, setShowProcessDispute] = useState<string | null>(null);
  const [showMaterialsBlock, setShowMaterialsBlock] = useState(false);
  const [calculateAmount, setCalculateAmount] = useState(0);
  const [disputeForm, setDisputeForm] = useState({ title: '', description: '' });
  const [disputeProcessForm, setDisputeProcessForm] = useState({ status: 'processing' as 'processing' | 'resolved', conclusion: '' });

  const currentClaim = claims.find(c => c.id === selectedClaim);
  const accident = accidents.find(a => a.id === currentClaim?.accidentId);
  const claimDisputes = disputes.filter(d => d.claimId === selectedClaim);
  const claimMaterials = materials.filter(m => m.accidentId === currentClaim?.accidentId);
  const claimArchives = useMemo(() => 
    closingArchives.filter(a => a.claimId === selectedClaim).sort((a, b) => b.version - a.version),
    [closingArchives, selectedClaim]
  );
  const rejectedMaterials = useMemo(() => 
    claimMaterials.filter(m => m.auditStatus === 'rejected'),
    [claimMaterials]
  );
  const pendingMaterials = useMemo(() => 
    claimMaterials.filter(m => m.auditStatus === 'pending'),
    [claimMaterials]
  );
  const hasBlockedMaterials = rejectedMaterials.length > 0 || pendingMaterials.length > 0;

  const canCalculate = currentClaim && ['surveying', 'auditing'].includes(currentClaim.status) && currentClaim.actualAmount === 0;
  const canApprove = currentClaim && currentClaim.status === 'auditing' && currentClaim.actualAmount > 0;
  const canClose = currentClaim && currentClaim.status === 'approved' && currentClaim.actualAmount > 0 && !hasBlockedMaterials;

  const lossTypeLabels: Record<string, string> = {
    drone: '无人机',
    payload: '载荷设备',
    other: '其他'
  };

  const thirdPartyTypeLabels: Record<string, string> = {
    property: '财产损失',
    person: '人员伤亡'
  };

  const handleDownloadClosingReport = (archiveId?: string) => {
    if (!currentClaim || !accident) return;

    if (archiveId) {
      const archive = claimArchives.find(a => a.id === archiveId);
      if (archive) {
        downloadFile(archive.content, `结案报告书_${currentClaim.claimNo}_v${archive.version}.html`, 'text/html');
        return;
      }
    }

    const latestArchive = claimArchives[0];
    if (latestArchive) {
      downloadFile(latestArchive.content, `结案报告书_${currentClaim.claimNo}_v${latestArchive.version}.html`, 'text/html');
      return;
    }

    const now = new Date().toISOString();
    const html = generateClosingReportHTML({
      claimNo: currentClaim.claimNo,
      reportNo: currentClaim.reportNo,
      location: accident.location,
      accidentTime: formatDateTime(accident.accidentTime),
      actualAmount: currentClaim.actualAmount,
      closeTime: currentClaim.closeTime ? formatDateTime(currentClaim.closeTime) : '-',
      surveyor: currentClaim.surveyor || '-',
      auditNodes: currentClaim.auditNodes,
      disputes: claimDisputes,
      lossItems: accident.lossItems,
      thirdParties: accident.thirdParties,
      generateTime: formatDateTime(now)
    });

    downloadFile(html, `结案报告书_${currentClaim.claimNo}.html`, 'text/html');
  };

  const handleProcessDispute = (disputeId: string) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return;

    const updatedDispute: Dispute = {
      ...dispute,
      status: disputeProcessForm.status,
      conclusion: disputeProcessForm.conclusion,
      updateTime: new Date().toISOString(),
      handler: '理赔专员'
    };
    updateDispute(updatedDispute);
    setShowProcessDispute(null);
    setDisputeProcessForm({ status: 'processing', conclusion: '' });
  };

  const handleDownloadArchive = (archive: ClosingArchive) => {
    downloadFile(archive.content, `结案报告书_${archive.claimNo}_v${archive.version}.html`, 'text/html');
  };

  const handleCalculate = () => {
    if (!currentClaim || calculateAmount <= 0) return;

    const updatedAuditNodes = currentClaim.auditNodes.map(node => {
      if (node.id === '3') {
        return { ...node, status: 'completed' as const, time: formatDateTime(new Date().toISOString()), comment: '现场查勘完成' };
      }
      if (node.id === '4') {
        return { ...node, status: 'current' as const, time: formatDateTime(new Date().toISOString()), comment: `赔付测算：${formatCurrency(calculateAmount)}，等待审核` };
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

  const handleApprove = () => {
    if (!currentClaim) return;

    const updatedAuditNodes = currentClaim.auditNodes.map(node => {
      if (node.id === '4') {
        return { ...node, status: 'completed' as const, time: formatDateTime(new Date().toISOString()), comment: `审核通过，赔付金额：${formatCurrency(currentClaim.actualAmount)}` };
      }
      if (node.id === '5') {
        return { ...node, status: 'current' as const, time: formatDateTime(new Date().toISOString()) };
      }
      return node;
    });

    const updatedClaim: Claim = {
      ...currentClaim,
      status: 'approved',
      auditNodes: updatedAuditNodes
    };

    updateClaim(updatedClaim);
  };

  const handleCloseCase = () => {
    if (!currentClaim || !accident) return;

    const now = new Date().toISOString();
    const version = claimArchives.length + 1;

    const updatedAuditNodes = currentClaim.auditNodes.map(node => {
      if (node.id === '5') {
        return { ...node, status: 'completed' as const, time: formatDateTime(now), comment: '已结案，赔付完成' };
      }
      return node;
    });

    const updatedClaim: Claim = {
      ...currentClaim,
      status: 'closed',
      closeTime: now,
      auditNodes: updatedAuditNodes
    };

    updateClaim(updatedClaim);

    if (accident) {
      updateAccident({
        ...accident,
        status: 'closed'
      });
    }

    const archiveContent = generateClosingReportHTML({
      claimNo: currentClaim.claimNo,
      reportNo: currentClaim.reportNo,
      location: accident.location,
      accidentTime: formatDateTime(accident.accidentTime),
      actualAmount: currentClaim.actualAmount,
      closeTime: formatDateTime(now),
      surveyor: currentClaim.surveyor || '-',
      auditNodes: updatedAuditNodes,
      disputes: claimDisputes,
      lossItems: accident.lossItems,
      thirdParties: accident.thirdParties,
      generateTime: formatDateTime(now)
    });

    const newArchive: ClosingArchive = {
      id: generateId(),
      claimId: currentClaim.id,
      claimNo: currentClaim.claimNo,
      version,
      archiveTime: now,
      actualAmount: currentClaim.actualAmount,
      content: archiveContent
    };
    addClosingArchive(newArchive);

    setShowCloseCase(false);
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

                {hasBlockedMaterials && currentClaim.status === 'approved' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">材料审核未通过，暂无法结案</p>
                          <p className="text-sm text-red-600 mt-1">
                            该案件存在 {rejectedMaterials.length} 项已驳回材料，{pendingMaterials.length} 项待审核材料
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          className="btn-accent text-xs"
                          onClick={() => setShowMaterialsBlock(true)}
                        >
                          查看详情
                        </button>
                        <button 
                          className="btn-secondary text-xs"
                          onClick={() => navigate(`/accident/materials?accidentId=${currentClaim.accidentId}`)}
                        >
                          <Upload className="w-3 h-3 mr-1 inline" />
                          补传材料
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {canApprove && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">审核通过</p>
                        <p className="text-sm text-green-600">赔付测算已完成，核定赔付金额：{formatCurrency(currentClaim.actualAmount)}</p>
                      </div>
                      <button 
                        className="btn-accent text-sm"
                        onClick={handleApprove}
                      >
                        <Check className="w-4 h-4 mr-1 inline" />
                        审核通过
                      </button>
                    </div>
                  </div>
                )}

                {canClose && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-orange-800">待结案</p>
                        <p className="text-sm text-orange-600">审核已通过，可以进行结案确认</p>
                      </div>
                      <button 
                        className="btn-accent text-sm"
                        onClick={() => setShowCloseCase(true)}
                      >
                        <Check className="w-4 h-4 mr-1 inline" />
                        结案确认
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

                {currentClaim.status === 'closed' && claimArchives.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800 flex items-center">
                        <History className="w-5 h-5 mr-2 text-primary-600" />
                        结案书历史版本
                      </h4>
                      <button 
                        className="text-sm text-primary-700 hover:text-primary-800"
                        onClick={() => setShowArchiveHistory(true)}
                      >
                        查看全部
                      </button>
                    </div>
                    <div className="space-y-2">
                      {claimArchives.slice(0, 2).map((archive) => (
                        <div key={archive.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div>
                            <span className="text-sm font-medium text-gray-800">
                              版本 v{archive.version}
                            </span>
                            <span className="text-xs text-gray-500 ml-3">
                              {formatDateTime(archive.archiveTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-green-600 font-medium">
                              {formatCurrency(archive.actualAmount)}
                            </span>
                            <button 
                              className="text-xs text-primary-700 hover:text-primary-800 flex items-center"
                              onClick={() => handleDownloadArchive(archive)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              下载
                            </button>
                          </div>
                        </div>
                      ))}
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
                      <div key={dispute.id} className={`p-4 rounded-lg border ${
                        dispute.status === 'resolved' 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium ${
                            dispute.status === 'resolved' ? 'text-green-800' : 'text-yellow-800'
                          }`}>{dispute.title}</h4>
                          <span className={`status-badge ${
                            dispute.status === 'resolved' ? 'status-active' : 'status-pending'
                          }`}>
                            {dispute.status === 'open' ? '待处理' : dispute.status === 'processing' ? '处理中' : '已解决'}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          dispute.status === 'resolved' ? 'text-green-700' : 'text-yellow-700'
                        }`}>{dispute.description}</p>
                        {dispute.conclusion && (
                          <div className={`mt-3 p-3 rounded-lg text-sm ${
                            dispute.status === 'resolved' 
                              ? 'bg-white text-green-700 border border-green-200' 
                              : 'bg-white text-yellow-700 border border-yellow-200'
                          }`}>
                            <span className="font-medium">处理结论：</span>
                            {dispute.conclusion}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className={`text-xs ${
                            dispute.status === 'resolved' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            <span>处理人：{dispute.handler}</span>
                            <span className="mx-2">|</span>
                            <span>{formatDateTime(dispute.createTime)}</span>
                          </div>
                          {dispute.status !== 'resolved' && (
                            <button 
                              className="text-xs text-primary-700 hover:text-primary-800 flex items-center"
                              onClick={() => {
                                setShowProcessDispute(dispute.id);
                                setDisputeProcessForm({ 
                                  status: dispute.status === 'open' ? 'processing' : 'resolved', 
                                  conclusion: dispute.conclusion || '' 
                                });
                              }}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              处理
                            </button>
                          )}
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
                  {currentClaim.status === 'closed' && (
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowClosingInfo(true)}
                    >
                      <FileText className="w-4 h-4 mr-2 inline" />
                      查看结案书
                    </button>
                  )}
                  {currentClaim.status === 'closed' && (
                    <button className="btn-primary" onClick={handleDownloadClosingReport}>
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

      {showCloseCase && currentClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">结案确认</h3>
              <button onClick={() => setShowCloseCase(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  确认结案后，该赔案将标记为已结案，赔付金额将正式生效。
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">赔案号</span>
                  <span className="font-medium text-gray-800">{currentClaim.claimNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">核定赔付金额</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(currentClaim.actualAmount)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowCloseCase(false)} className="btn-secondary">取消</button>
              <button onClick={handleCloseCase} className="btn-accent">
                <Check className="w-4 h-4 mr-2 inline" />
                确认结案
              </button>
            </div>
          </div>
        </div>
      )}

      {showClosingInfo && currentClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">结案报告书</h3>
              <button onClick={() => setShowClosingInfo(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center border-b border-gray-200 pb-6">
                <h2 className="text-xl font-bold text-gray-800">低空飞行保险理赔结案书</h2>
                <p className="text-sm text-gray-500 mt-2">编号：{currentClaim.claimNo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">报案号</p>
                  <p className="font-medium text-gray-800">{currentClaim.reportNo}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">赔案号</p>
                  <p className="font-medium text-gray-800">{currentClaim.claimNo}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">查勘员</p>
                  <p className="font-medium text-gray-800">{currentClaim.surveyor || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">结案时间</p>
                  <p className="font-medium text-gray-800">{currentClaim.closeTime ? formatDateTime(currentClaim.closeTime) : '-'}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">最终赔付金额</span>
                  <span className="text-2xl font-bold text-green-700">{formatCurrency(currentClaim.actualAmount)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">赔付明细</h4>
                {accident?.lossItems && accident.lossItems.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">损失清单：</p>
                    <div className="space-y-2">
                      {accident.lossItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mr-2">
                              {lossTypeLabels[item.type] || item.type}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              (损坏程度: {item.damageDegree === 'minor' ? '轻微' : item.damageDegree === 'moderate' ? '中度' : '严重'})
                            </span>
                          </div>
                          <span className="text-sm font-medium text-accent-600">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {accident?.thirdParties && accident.thirdParties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">第三方责任：</p>
                    <div className="space-y-2">
                      {accident.thirdParties.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full mr-2">
                              {thirdPartyTypeLabels[item.type] || item.type}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium text-accent-600">
                            {formatCurrency(item.estimatedLoss)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!accident?.lossItems || accident.lossItems.length === 0) && 
                 (!accident?.thirdParties || accident.thirdParties.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">无损失明细</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">审核节点</h4>
                <div className="space-y-2">
                  {currentClaim.auditNodes.map((node) => (
                    <div key={node.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        node.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}>
                        {node.status === 'completed' ? <Check className="w-3 h-3" /> : null}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{node.name}</p>
                        {node.comment && <p className="text-xs text-gray-500 mt-1">{node.comment}</p>}
                      </div>
                      {node.time && <span className="text-xs text-gray-400">{node.time}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  本结案书为正式理赔凭证，如有疑问请联系客服。
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowClosingInfo(false)} className="btn-secondary">关闭</button>
              <button className="btn-primary" onClick={handleDownloadClosingReport}>
                <Download className="w-4 h-4 mr-2 inline" />
                下载结案书
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaterialsBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">材料审核情况</h3>
              <button onClick={() => setShowMaterialsBlock(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {rejectedMaterials.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-3 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    已驳回材料 ({rejectedMaterials.length})
                  </h4>
                  <div className="space-y-2">
                    {rejectedMaterials.map((material) => (
                      <div key={material.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-800">{material.name}</span>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">已驳回</span>
                        </div>
                        <p className="text-sm text-red-600 mt-2">
                          <span className="font-medium">驳回原因：</span>{material.auditRemark}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pendingMaterials.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-700 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    待审核材料 ({pendingMaterials.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingMaterials.map((material) => (
                      <div key={material.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-yellow-800">{material.name}</span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">待审核</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">提示：</span>
                  请前往材料收集页重新上传被驳回的材料，等待审核通过后才能结案。
                </p>
                <button 
                  className="mt-3 btn-primary text-sm"
                  onClick={() => {
                    setShowMaterialsBlock(false);
                    navigate(`/accident/materials?accidentId=${currentClaim?.accidentId}`);
                  }}
                >
                  <Upload className="w-4 h-4 mr-2 inline" />
                  前往补传材料
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowMaterialsBlock(false)} className="btn-secondary">关闭</button>
            </div>
          </div>
        </div>
      )}

      {showArchiveHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-primary-600" />
                结案书历史版本
              </h3>
              <button onClick={() => setShowArchiveHistory(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {claimArchives.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无历史版本</p>
              ) : (
                claimArchives.map((archive) => (
                  <div key={archive.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-800">版本 v{archive.version}</span>
                        <span className="text-xs text-gray-500 ml-3">
                          归档时间：{formatDateTime(archive.archiveTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(archive.actualAmount)}
                        </span>
                        <button 
                          className="btn-primary text-xs"
                          onClick={() => handleDownloadArchive(archive)}
                        >
                          <Download className="w-3 h-3 mr-1 inline" />
                          下载
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowArchiveHistory(false)} className="btn-secondary">关闭</button>
            </div>
          </div>
        </div>
      )}

      {showProcessDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">处理争议</h3>
              <button onClick={() => setShowProcessDispute(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">处理状态</label>
                <select 
                  className="input-field"
                  value={disputeProcessForm.status}
                  onChange={(e) => setDisputeProcessForm({ ...disputeProcessForm, status: e.target.value as 'processing' | 'resolved' })}
                >
                  <option value="processing">处理中</option>
                  <option value="resolved">已解决</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">处理结论</label>
                <textarea 
                  className="input-field h-32"
                  value={disputeProcessForm.conclusion}
                  onChange={(e) => setDisputeProcessForm({ ...disputeProcessForm, conclusion: e.target.value })}
                  placeholder="请填写处理结论和说明"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowProcessDispute(null)} className="btn-secondary">取消</button>
              <button 
                className="btn-primary"
                onClick={() => showProcessDispute && handleProcessDispute(showProcessDispute)}
                disabled={!disputeProcessForm.conclusion.trim()}
              >
                <Save className="w-4 h-4 mr-2 inline" />
                保存处理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
