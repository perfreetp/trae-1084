import { useState } from 'react';
import {
  Plane,
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  Shield,
  Eye,
  X
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAppStore } from '../../store';
import { formatDateTime, generateId } from '../../utils';
import type { FlightTask } from '../../types';

const Tasks = () => {
  const { flightTasks, policies, addFlightTask } = useAppStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [formData, setFormData] = useState({
    taskName: '',
    policyId: '',
    startTime: '',
    endTime: '',
    location: '',
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    riskNote: ''
  });

  const riskLevelLabels: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = () => {
    if (!formData.taskName || !formData.policyId || !formData.startTime || !formData.endTime || !formData.location) {
      return;
    }

    const selectedPolicy = policies.find(p => p.id === formData.policyId);
    
    const newTask: FlightTask = {
      id: generateId(),
      taskName: formData.taskName,
      policyId: formData.policyId,
      policyNo: selectedPolicy?.policyNo || '',
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      location: formData.location,
      riskLevel: formData.riskLevel,
      riskNote: formData.riskNote,
      status: 'scheduled'
    };

    addFlightTask(newTask);
    
    setFormData({
      taskName: '',
      policyId: '',
      startTime: '',
      endTime: '',
      location: '',
      riskLevel: 'low',
      riskNote: ''
    });
    setShowAddTask(false);
  };

  return (
    <div>
      <PageHeader
        title="飞行任务关联"
        description="管理飞行任务，关联对应保单，记录风险备注。"
        actions={
          <button className="btn-primary" onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-2 inline" />
            新建任务
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flightTasks.map((task) => (
          <div key={task.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{task.taskName}</h3>
                <p className="text-sm text-gray-500">{task.policyNo}</p>
              </div>
              <StatusBadge status={task.status} />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                {task.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                {formatDateTime(task.startTime)}
              </div>
              <div className="flex items-center space-x-3">
                <div className={`status-badge risk-${task.riskLevel}`}>
                  {riskLevelLabels[task.riskLevel]}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-1 text-primary-500" />
                  已关联保单
                </div>
              </div>
            </div>
            
            {task.riskNote && (
              <div className="p-3 bg-yellow-50 rounded-lg mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">{task.riskNote}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {formatDateTime(task.startTime).split(' ')[0]} - {formatDateTime(task.endTime).split(' ')[0]}
              </span>
              <button className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                查看详情
              </button>
            </div>
          </div>
        ))}
      </div>

      {flightTasks.length === 0 && (
        <div className="card text-center py-12">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无飞行任务，点击右上角按钮创建</p>
        </div>
      )}

      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">新建飞行任务</h3>
              <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="请输入任务名称"
                  value={formData.taskName}
                  onChange={(e) => handleInputChange('taskName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联保单</label>
                <select 
                  className="input-field"
                  value={formData.policyId}
                  onChange={(e) => handleInputChange('policyId', e.target.value)}
                >
                  <option value="">请选择保单</option>
                  {policies.map(policy => (
                    <option key={policy.id} value={policy.id}>{policy.policyNo} - {policy.droneModel}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input 
                    type="datetime-local" 
                    className="input-field"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input 
                    type="datetime-local" 
                    className="input-field"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">飞行区域</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="请输入飞行区域"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">风险等级</label>
                <select 
                  className="input-field"
                  value={formData.riskLevel}
                  onChange={(e) => handleInputChange('riskLevel', e.target.value)}
                >
                  <option value="low">低风险</option>
                  <option value="medium">中风险</option>
                  <option value="high">高风险</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">风险备注</label>
                <textarea 
                  className="input-field h-24" 
                  placeholder="请输入风险注意事项"
                  value={formData.riskNote}
                  onChange={(e) => handleInputChange('riskNote', e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowAddTask(false)} className="btn-secondary">取消</button>
              <button onClick={handleCreateTask} className="btn-primary">创建任务</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
