import { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Plus,
  Trash2,
  User,
  Building,
  FileText,
  Send,
  ChevronDown,
  X
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAppStore } from '../../store';
import { formatCurrency, generateId, formatDateTime } from '../../utils';
import StatusBadge from '../../components/ui/StatusBadge';
import type { Accident, LossItem, ThirdParty, Claim, AuditNode } from '../../types';

const Report = () => {
  const { accidents, flightTasks, addAccident, addClaim, claims } = useAppStore();
  const [showAddReport, setShowAddReport] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [lossItems, setLossItems] = useState<any[]>([]);
  const [thirdParties, setThirdParties] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    taskId: '',
    accidentTime: '',
    location: '',
    lng: 0,
    lat: 0,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedAccident = accidents.find(a => a.id === showDetail);

  const lossTypeLabels: Record<string, string> = {
    drone: '无人机',
    payload: '载荷设备',
    other: '其他'
  };

  const thirdPartyTypeLabels: Record<string, string> = {
    property: '财产损失',
    person: '人员伤亡'
  };

  const addLossItem = () => {
    setLossItems([...lossItems, { 
      id: generateId(), 
      type: 'drone', 
      name: '', 
      quantity: 1, 
      unitPrice: 0, 
      damageDegree: 'minor' 
    }]);
  };

  const removeLossItem = (id: string) => {
    setLossItems(lossItems.filter(item => item.id !== id));
  };

  const updateLossItem = (index: number, field: string, value: any) => {
    const newItems = [...lossItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLossItems(newItems);
  };

  const addThirdParty = () => {
    setThirdParties([...thirdParties, { 
      id: generateId(), 
      type: 'property', 
      name: '', 
      description: '', 
      estimatedLoss: 0 
    }]);
  };

  const removeThirdParty = (id: string) => {
    setThirdParties(thirdParties.filter(item => item.id !== id));
  };

  const updateThirdParty = (index: number, field: string, value: any) => {
    const newItems = [...thirdParties];
    newItems[index] = { ...newItems[index], [field]: value };
    setThirdParties(newItems);
  };

  const damageDegreeLabels: Record<string, string> = {
    minor: '轻微损坏',
    moderate: '中度损坏',
    severe: '严重损坏',
    total: '全部损失'
  };

  const handleSubmit = async () => {
    if (!formData.taskId || !formData.accidentTime || !formData.location || !formData.description) {
      return;
    }

    setSubmitting(true);

    const selectedTask = flightTasks.find(t => t.id === formData.taskId);
    const reportNo = `REP-${new Date().getFullYear()}-${String(accidents.length + 1).padStart(5, '0')}`;
    const claimNo = `CLA-${new Date().getFullYear()}-${String(claims.length + 1).padStart(5, '0')}`;
    const now = new Date();

    const lossItemsData: LossItem[] = lossItems.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      damageDegree: item.damageDegree
    }));

    const thirdPartiesData: ThirdParty[] = thirdParties.map(item => ({
      id: item.id,
      type: item.type,
      name: item.name,
      description: item.description,
      estimatedLoss: item.estimatedLoss
    }));

    const newAccident: Accident = {
      id: generateId(),
      reportNo,
      taskId: formData.taskId,
      taskName: selectedTask?.taskName || '',
      accidentTime: new Date(formData.accidentTime).toISOString(),
      location: formData.location,
      lng: formData.lng || 116.4074,
      lat: formData.lat || 39.9042,
      description: formData.description,
      lossItems: lossItemsData,
      thirdParties: thirdPartiesData,
      status: 'reported',
      reporter: '张经理',
      reportTime: now.toISOString()
    };

    addAccident(newAccident);

    const totalEstimatedLoss = lossItemsData.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) +
                               thirdPartiesData.reduce((sum, item) => sum + item.estimatedLoss, 0);

    const auditNodes: AuditNode[] = [
      { id: '1', name: '报案登记', role: '系统自动', status: 'completed', time: formatDateTime(now.toISOString()), comment: '报案已提交，等待审核' },
      { id: '2', name: '材料审核', role: '理赔专员', status: 'pending' },
      { id: '3', name: '现场查勘', role: '查勘员', status: 'pending' },
      { id: '4', name: '赔付核算', role: '核赔师', status: 'pending' },
      { id: '5', name: '结案确认', role: '理赔经理', status: 'pending' }
    ];

    const newClaim: Claim = {
      id: generateId(),
      claimNo,
      accidentId: newAccident.id,
      reportNo,
      estimatedAmount: totalEstimatedLoss || 5000,
      actualAmount: 0,
      surveyor: '',
      surveyTime: '',
      auditNodes,
      status: 'pending',
      createTime: now.toISOString()
    };

    addClaim(newClaim);

    setTimeout(() => {
      setSubmitting(false);
      setShowAddReport(false);
      setFormData({
        taskId: '',
        accidentTime: '',
        location: '',
        lng: 0,
        lat: 0,
        description: ''
      });
      setLossItems([]);
      setThirdParties([]);
    }, 1000);
  };

  return (
    <div>
      <PageHeader
        title="事故报案"
        description="记录飞行事故信息，提交损失清单，启动理赔流程。"
        actions={
          <button className="btn-accent" onClick={() => setShowAddReport(true)}>
            <AlertTriangle className="w-4 h-4 mr-2 inline" />
            新建报案
          </button>
        }
      />

      <div className="card mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">报案号</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">关联任务</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">事故地点</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">报案时间</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">报案人</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {accidents.map((accident) => (
                <tr key={accident.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-accent-600">{accident.reportNo}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{accident.taskName}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{accident.location}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{formatDateTime(accident.reportTime)}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{accident.reporter}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={accident.status} />
                  </td>
                  <td className="py-4 px-4">
                    <button 
                      className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                      onClick={() => setShowDetail(accident.id)}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {accidents.length === 0 && (
        <div className="card text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无报案记录，点击右上角按钮新建报案</p>
        </div>
      )}

      {showAddReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">新建事故报案</h3>
              <button onClick={() => setShowAddReport(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-accent-800">
                    请如实填写事故信息，虚假报案将承担相应法律责任。如有人员伤亡，请立即拨打急救电话。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  基本信息
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">关联飞行任务</label>
                    <select 
                      className="input-field"
                      value={formData.taskId}
                      onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                    >
                      <option value="">请选择关联任务</option>
                      {flightTasks.map(task => (
                        <option key={task.id} value={task.id}>{task.taskName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">事故时间</label>
                    <input 
                      type="datetime-local" 
                      className="input-field"
                      value={formData.accidentTime}
                      onChange={(e) => setFormData({ ...formData, accidentTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    事故地点
                  </label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      className="input-field flex-1" 
                      placeholder="请输入或在地图上选择事故地点"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <button className="btn-outline whitespace-nowrap">地图选点</button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">经度</label>
                      <input 
                        type="number" 
                        step="0.000001" 
                        className="input-field text-sm" 
                        placeholder="如：116.4074"
                        value={formData.lng || ''}
                        onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">纬度</label>
                      <input 
                        type="number" 
                        step="0.000001" 
                        className="input-field text-sm" 
                        placeholder="如：39.9042"
                        value={formData.lat || ''}
                        onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">事故描述</label>
                  <textarea 
                    className="input-field h-24" 
                    placeholder="请详细描述事故发生经过、原因等"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">损失清单</h4>
                  <button onClick={addLossItem} className="text-sm text-primary-700 hover:text-primary-800 flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    添加损失项
                  </button>
                </div>
                {lossItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    暂无损失项，点击上方按钮添加
                  </p>
                ) : (
                  <div className="space-y-3">
                    {lossItems.map((item, index) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg relative">
                        <button
                          onClick={() => removeLossItem(item.id)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-5 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">类型</label>
                            <select
                              value={item.type}
                              onChange={(e) => updateLossItem(index, 'type', e.target.value)}
                              className="input-field text-sm"
                            >
                              <option value="drone">无人机</option>
                              <option value="payload">载荷设备</option>
                              <option value="other">其他</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">物品名称</label>
                            <input 
                              type="text" 
                              className="input-field text-sm" 
                              placeholder="如：机身、云台相机"
                              value={item.name}
                              onChange={(e) => updateLossItem(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">数量</label>
                            <input 
                              type="number" 
                              min="1" 
                              className="input-field text-sm"
                              value={item.quantity}
                              onChange={(e) => updateLossItem(index, 'quantity', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">单价（元）</label>
                            <input 
                              type="number" 
                              className="input-field text-sm" 
                              placeholder="0"
                              value={item.unitPrice}
                              onChange={(e) => updateLossItem(index, 'unitPrice', Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">损坏程度</label>
                          <select
                            value={item.damageDegree}
                            onChange={(e) => updateLossItem(index, 'damageDegree', e.target.value)}
                            className="input-field text-sm"
                          >
                            <option value="minor">轻微损坏</option>
                            <option value="moderate">中度损坏</option>
                            <option value="severe">严重损坏</option>
                            <option value="total">全部损失</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">第三方责任</h4>
                  <button onClick={addThirdParty} className="text-sm text-primary-700 hover:text-primary-800 flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    添加第三方
                  </button>
                </div>
                {thirdParties.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    如无第三方责任，可跳过此项
                  </p>
                ) : (
                  <div className="space-y-3">
                    {thirdParties.map((item, index) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg relative">
                        <button
                          onClick={() => removeThirdParty(item.id)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">责任类型</label>
                            <select
                              value={item.type}
                              onChange={(e) => updateThirdParty(index, 'type', e.target.value)}
                              className="input-field text-sm"
                            >
                              <option value="property">财产损失</option>
                              <option value="person">人员伤亡</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">预估损失（元）</label>
                            <input 
                              type="number" 
                              className="input-field text-sm" 
                              placeholder="0"
                              value={item.estimatedLoss}
                              onChange={(e) => updateThirdParty(index, 'estimatedLoss', Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">名称</label>
                          <input 
                            type="text" 
                            className="input-field text-sm" 
                            placeholder="如：XX公司/XX个人"
                            value={item.name}
                            onChange={(e) => updateThirdParty(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">情况描述</label>
                          <textarea 
                            className="input-field text-sm h-20" 
                            placeholder="请描述第三方损失情况"
                            value={item.description}
                            onChange={(e) => updateThirdParty(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowAddReport(false)} className="btn-secondary">取消</button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 inline" />
                    提交报案
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedAccident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">报案详情</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedAccident.reportNo}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">关联任务</p>
                  <p className="font-medium text-gray-800">{selectedAccident.taskName || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">事故时间</p>
                  <p className="font-medium text-gray-800">{formatDateTime(selectedAccident.accidentTime)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">事故地点</p>
                  <p className="font-medium text-gray-800">{selectedAccident.location}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">经纬度</p>
                  <p className="font-medium text-gray-800">{selectedAccident.lng}, {selectedAccident.lat}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">报案人</p>
                  <p className="font-medium text-gray-800">{selectedAccident.reporter}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">状态</p>
                  <StatusBadge status={selectedAccident.status} />
                </div>
              </div>

              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">事故描述</p>
                <p className="text-gray-800">{selectedAccident.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary-600" />
                  损失清单 ({selectedAccident.lossItems?.length || 0} 项)
                </h4>
                {!selectedAccident.lossItems || selectedAccident.lossItems.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    暂无损失项
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedAccident.lossItems.map((item, index) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {lossTypeLabels[item.type] || item.type}
                          </span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            {damageDegreeLabels[item.damageDegree] || item.damageDegree}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                          <span>数量：{item.quantity}</span>
                          <span>单价：{formatCurrency(item.unitPrice)}</span>
                          <span className="font-medium text-accent-600">小计：{formatCurrency(item.quantity * item.unitPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-accent-600" />
                  第三方责任 ({selectedAccident.thirdParties?.length || 0} 项)
                </h4>
                {!selectedAccident.thirdParties || selectedAccident.thirdParties.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
                    无第三方责任
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedAccident.thirdParties.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            {thirdPartyTypeLabels[item.type] || item.type}
                          </span>
                          <span className="font-medium text-accent-600">
                            预估损失：{formatCurrency(item.estimatedLoss)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowDetail(null)} className="btn-primary">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
