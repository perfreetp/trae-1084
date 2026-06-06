import { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  User,
  Clock,
  FileText,
  Plus,
  CheckCircle,
  MessageSquare,
  Phone,
  X
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatDateTime, generateId } from '../../utils';
import type { Survey, Claim } from '../../types';

const Survey = () => {
  const { claims, accidents, surveys, addSurvey, updateClaim, updateAccident } = useAppStore();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAssignSurveyor, setShowAssignSurveyor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    claimId: '',
    surveyorId: '',
    surveyDate: '',
    surveyTime: '',
    location: '',
    remark: ''
  });

  const surveyors = [
    { id: '1', name: '刘查勘', phone: '138****1111', status: 'available' },
    { id: '2', name: '王查勘', phone: '138****2222', status: 'busy' },
    { id: '3', name: '李查勘', phone: '138****3333', status: 'available' },
  ];

  const surveyClaims = claims.filter(c => ['pending', 'surveying'].includes(c.status));
  
  const today = new Date().toISOString().split('T')[0];
  const todaySurveys = surveys.filter(s => s.surveyTime.startsWith(today));

  const handleAssignSurveyor = (claimId: string, surveyorId: string) => {
    const claim = claims.find(c => c.id === claimId);
    const surveyor = surveyors.find(s => s.id === surveyorId);
    if (!claim || !surveyor) return;

    const updatedClaim: Claim = {
      ...claim,
      surveyor: surveyor.name,
      status: 'surveying'
    };
    updateClaim(updatedClaim);

    const accident = accidents.find(a => a.id === claim.accidentId);
    if (accident) {
      updateAccident({
        ...accident,
        status: 'surveying'
      });
    }

    setShowAssignSurveyor(null);
  };

  const handleStartSurvey = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;

    const updatedAuditNodes = claim.auditNodes.map(node => {
      if (node.id === '3') {
        return { ...node, status: 'current' as const, time: formatDateTime(new Date().toISOString()) };
      }
      if (node.id === '2') {
        return { ...node, status: 'completed' as const, time: formatDateTime(new Date().toISOString()), comment: '材料审核通过' };
      }
      return node;
    });

    const updatedClaim: Claim = {
      ...claim,
      status: 'surveying',
      surveyTime: new Date().toISOString(),
      auditNodes: updatedAuditNodes
    };
    updateClaim(updatedClaim);
  };

  const handleScheduleSubmit = () => {
    if (!formData.claimId || !formData.surveyorId || !formData.surveyDate || !formData.surveyTime || !formData.location) {
      return;
    }

    const surveyor = surveyors.find(s => s.id === formData.surveyorId);
    const claim = claims.find(c => c.id === formData.claimId);
    
    const surveyDateTime = new Date(`${formData.surveyDate}T${formData.surveyTime}`);

    const newSurvey: Survey = {
      id: generateId(),
      claimId: formData.claimId,
      surveyor: surveyor?.name || '',
      surveyTime: surveyDateTime.toISOString(),
      location: formData.location,
      report: formData.remark,
      photos: [],
      status: 'scheduled'
    };

    addSurvey(newSurvey);

    if (claim) {
      const updatedClaim: Claim = {
        ...claim,
        surveyor: surveyor?.name || '',
        surveyTime: surveyDateTime.toISOString(),
        status: 'surveying'
      };
      updateClaim(updatedClaim);

      const accident = accidents.find(a => a.id === claim.accidentId);
      if (accident) {
        updateAccident({
          ...accident,
          status: 'surveying'
        });
      }
    }

    setFormData({
      claimId: '',
      surveyorId: '',
      surveyDate: '',
      surveyTime: '',
      location: '',
      remark: ''
    });
    setShowSchedule(false);
  };

  return (
    <div>
      <PageHeader
        title="查勘协同"
        description="安排查勘任务，记录查勘情况，协同处理赔案。"
        actions={
          <button className="btn-primary" onClick={() => setShowSchedule(true)}>
            <Plus className="w-4 h-4 mr-2 inline" />
            预约查勘
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-gray-800">待查勘案件</h3>
          {surveyClaims.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无待查勘案件</p>
            </div>
          ) : (
            surveyClaims.map((claim) => {
              const accident = accidents.find(a => a.id === claim.accidentId);
              const scheduledSurvey = surveys.find(s => s.claimId === claim.id && s.status === 'scheduled');
              return (
                <div key={claim.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-800">{claim.claimNo}</h4>
                        <StatusBadge status={claim.status} />
                        {scheduledSurvey && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            已预约：{formatDateTime(scheduledSurvey.surveyTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{accident?.reportNo} · {accident?.location}</p>
                      {claim.surveyor && (
                        <p className="text-xs text-primary-600 mt-1">查勘员：{claim.surveyor}</p>
                      )}
                    </div>
                    {!claim.surveyor ? (
                      <button 
                        className="btn-outline text-sm"
                        onClick={() => setShowAssignSurveyor(claim.id)}
                      >
                        分配查勘员
                      </button>
                    ) : (
                      <button 
                        className="btn-primary text-sm"
                        onClick={() => handleStartSurvey(claim.id)}
                      >
                        开始查勘
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {accident?.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {accident && formatDateTime(accident.accidentTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {accident?.reporter}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      {accident?.lossItems.length} 项损失
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{accident?.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="text-sm text-primary-700 hover:text-primary-800 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        发送通知
                      </button>
                      <button className="text-sm text-primary-700 hover:text-primary-800 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        联系报案人
                      </button>
                    </div>
                  </div>

                  {showAssignSurveyor === claim.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">选择查勘员</h5>
                      <div className="space-y-2">
                        {surveyors.filter(s => s.status === 'available').map(surveyor => (
                          <button
                            key={surveyor.id}
                            onClick={() => handleAssignSurveyor(claim.id, surveyor.id)}
                            className="w-full p-3 flex items-center justify-between bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-medium">{surveyor.name.charAt(0)}</span>
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-800 text-sm">{surveyor.name}</p>
                                <p className="text-xs text-gray-500">{surveyor.phone}</p>
                              </div>
                            </div>
                            <span className="status-badge status-active">空闲</span>
                          </button>
                        ))}
                      </div>
                      <button 
                        onClick={() => setShowAssignSurveyor(null)}
                        className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">查勘员排班</h3>
            <div className="space-y-3">
              {surveyors.map((surveyor) => (
                <div key={surveyor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {surveyor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{surveyor.name}</p>
                      <p className="text-xs text-gray-500">{surveyor.phone}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${surveyor.status === 'available' ? 'status-active' : 'status-pending'}`}>
                    {surveyor.status === 'available' ? '空闲' : '忙碌'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">今日查勘日程</h3>
            <div className="space-y-3">
              {todaySurveys.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">今日无查勘安排</p>
              ) : (
                todaySurveys.map((survey) => {
                  const claim = claims.find(c => c.id === survey.claimId);
                  return (
                    <div key={survey.id} className="p-3 border-l-4 border-primary-700 bg-gray-50 rounded-r-lg">
                      <p className="font-medium text-gray-800 text-sm">{claim?.claimNo}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {survey.surveyTime.split('T')[1].substring(0, 5)} - {survey.location}
                      </p>
                      <p className="text-xs text-gray-500">查勘员：{survey.surveyor}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">补充材料通知</h3>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">CLA-2024-00002</p>
                <p className="text-xs text-yellow-600 mt-1">需补充：维修报价单、购买发票</p>
                <p className="text-xs text-yellow-500 mt-1">已发送 2 天</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">CLA-2024-00003</p>
                <p className="text-xs text-blue-600 mt-1">需补充：第三方伤情鉴定</p>
                <p className="text-xs text-blue-500 mt-1">已发送 1 天</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">预约查勘</h3>
              <button onClick={() => setShowSchedule(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">选择案件</label>
                <select 
                  className="input-field"
                  value={formData.claimId}
                  onChange={(e) => setFormData({ ...formData, claimId: e.target.value })}
                >
                  <option value="">请选择赔案</option>
                  {surveyClaims.map(c => (
                    <option key={c.id} value={c.id}>{c.claimNo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">查勘员</label>
                <select 
                  className="input-field"
                  value={formData.surveyorId}
                  onChange={(e) => setFormData({ ...formData, surveyorId: e.target.value })}
                >
                  <option value="">请选择查勘员</option>
                  {surveyors.filter(s => s.status === 'available').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">查勘日期</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={formData.surveyDate}
                    onChange={(e) => setFormData({ ...formData, surveyDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">查勘时间</label>
                  <input 
                    type="time" 
                    className="input-field"
                    value={formData.surveyTime}
                    onChange={(e) => setFormData({ ...formData, surveyTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">查勘地点</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="请输入查勘地点"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea 
                  className="input-field h-24" 
                  placeholder="请输入查勘备注信息"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowSchedule(false)} className="btn-secondary">取消</button>
              <button onClick={handleScheduleSubmit} className="btn-primary">确认预约</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Survey;
