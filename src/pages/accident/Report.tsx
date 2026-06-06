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
  ChevronDown
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../utils';
import StatusBadge from '../../components/ui/StatusBadge';

const Report = () => {
  const { accidents, flightTasks } = useAppStore();
  const [showAddReport, setShowAddReport] = useState(false);
  const [lossItems, setLossItems] = useState<any[]>([]);
  const [thirdParties, setThirdParties] = useState<any[]>([]);

  const addLossItem = () => {
    setLossItems([...lossItems, { id: Date.now(), type: 'drone', name: '', quantity: 1, unitPrice: 0, damageDegree: 'minor' }]);
  };

  const removeLossItem = (id: string) => {
    setLossItems(lossItems.filter(item => item.id !== id));
  };

  const addThirdParty = () => {
    setThirdParties([...thirdParties, { id: Date.now(), type: 'property', name: '', description: '', estimatedLoss: 0 }]);
  };

  const removeThirdParty = (id: string) => {
    setThirdParties(thirdParties.filter(item => item.id !== id));
  };

  const damageDegreeLabels: Record<string, string> = {
    minor: '轻微损坏',
    moderate: '中度损坏',
    severe: '严重损坏',
    total: '全部损失'
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
                  <td className="py-4 px-4 text-sm text-gray-700">{accident.reportTime}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{accident.reporter}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={accident.status} />
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-sm text-primary-700 hover:text-primary-800 font-medium">
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">新建事故报案</h3>
              <button onClick={() => setShowAddReport(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
                    <select className="input-field">
                      <option>请选择关联任务</option>
                      {flightTasks.map(task => (
                        <option key={task.id} value={task.id}>{task.taskName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">事故时间</label>
                    <input type="datetime-local" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    事故地点
                  </label>
                  <div className="flex gap-3">
                    <input type="text" className="input-field flex-1" placeholder="请输入或在地图上选择事故地点" />
                    <button className="btn-outline whitespace-nowrap">地图选点</button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">经度</label>
                      <input type="number" step="0.000001" className="input-field text-sm" placeholder="如：116.4074" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">纬度</label>
                      <input type="number" step="0.000001" className="input-field text-sm" placeholder="如：39.9042" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">事故描述</label>
                  <textarea className="input-field h-24" placeholder="请详细描述事故发生经过、原因等" />
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
                              onChange={(e) => {
                                const newItems = [...lossItems];
                                newItems[index].type = e.target.value;
                                setLossItems(newItems);
                              }}
                              className="input-field text-sm"
                            >
                              <option value="drone">无人机</option>
                              <option value="payload">载荷设备</option>
                              <option value="other">其他</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">物品名称</label>
                            <input type="text" className="input-field text-sm" placeholder="如：机身、云台相机" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">数量</label>
                            <input type="number" min="1" className="input-field text-sm" defaultValue="1" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">单价（元）</label>
                            <input type="number" className="input-field text-sm" placeholder="0" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">损坏程度</label>
                          <select
                            value={item.damageDegree}
                            onChange={(e) => {
                              const newItems = [...lossItems];
                              newItems[index].damageDegree = e.target.value;
                              setLossItems(newItems);
                            }}
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
                              onChange={(e) => {
                                const newItems = [...thirdParties];
                                newItems[index].type = e.target.value;
                                setThirdParties(newItems);
                              }}
                              className="input-field text-sm"
                            >
                              <option value="property">财产损失</option>
                              <option value="person">人员伤亡</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">预估损失（元）</label>
                            <input type="number" className="input-field text-sm" placeholder="0" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">名称</label>
                          <input type="text" className="input-field text-sm" placeholder="如：XX公司/XX个人" />
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">情况描述</label>
                          <textarea className="input-field text-sm h-20" placeholder="请描述第三方损失情况" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button onClick={() => setShowAddReport(false)} className="btn-secondary">取消</button>
              <button className="btn-primary">
                <Send className="w-4 h-4 mr-2 inline" />
                提交报案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
