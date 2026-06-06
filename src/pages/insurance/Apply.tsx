import { useState } from 'react';
import {
  Plane,
  Shield,
  Calculator,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  X
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAppStore } from '../../store';
import { mockInsurancePlans } from '../../data/mockData';
import { formatCurrency } from '../../utils';

const steps = [
  { id: 1, title: '机型登记', icon: Plane },
  { id: 2, title: '方案比选', icon: Shield },
  { id: 3, title: '在线报价', icon: Calculator },
  { id: 4, title: '提交投保', icon: FileCheck },
];

const Apply = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [drones, setDrones] = useState<any[]>([
    { id: '1', model: '大疆 M300 RTK', serialNumber: 'SN-DJI-M300-001', payload: '禅思 H20T', value: 128000 }
  ]);
  const [showAddDrone, setShowAddDrone] = useState(false);
  const [newDrone, setNewDrone] = useState({ model: '', serialNumber: '', payload: '', value: 0 });
  const [quoteResult, setQuoteResult] = useState<any>(null);

  const handleNext = () => {
    if (currentStep === 2 && selectedPlan) {
      const plan = mockInsurancePlans.find(p => p.id === selectedPlan);
      if (plan) {
        const totalValue = drones.reduce((sum, d) => sum + d.value, 0);
        const premium = Math.round(plan.basePremium * (1 + totalValue / 500000));
        setQuoteResult({
          plan: plan.name,
          coverageAmount: plan.coverageAmount,
          basePremium: plan.basePremium,
          adjustedPremium: premium,
          drones: drones.length,
          totalValue
        });
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleAddDrone = () => {
    if (newDrone.model && newDrone.serialNumber) {
      setDrones([...drones, { ...newDrone, id: Date.now().toString() }]);
      setNewDrone({ model: '', serialNumber: '', payload: '', value: 0 });
      setShowAddDrone(false);
    }
  };

  const handleRemoveDrone = (id: string) => {
    setDrones(drones.filter(d => d.id !== id));
  };

  return (
    <div>
      <PageHeader
        title="投保申请"
        description="登记无人机信息，选择保障方案，获取在线报价，完成投保。"
      />

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-primary-700 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  currentStep >= step.id ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">登记投保无人机</h3>
            
            <div className="space-y-3 mb-6">
              {drones.map((drone) => (
                <div key={drone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Plane className="w-6 h-6 text-primary-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{drone.model}</p>
                      <p className="text-sm text-gray-500">SN: {drone.serialNumber} | {drone.payload}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-800">{formatCurrency(drone.value)}</span>
                    <button onClick={() => handleRemoveDrone(drone.id)} className="text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showAddDrone ? (
              <div className="p-4 border-2 border-dashed border-primary-300 rounded-lg bg-primary-50 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">添加无人机</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">机型</label>
                    <input
                      type="text"
                      value={newDrone.model}
                      onChange={(e) => setNewDrone({...newDrone, model: e.target.value})}
                      className="input-field"
                      placeholder="如：大疆 Mavic 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">序列号</label>
                    <input
                      type="text"
                      value={newDrone.serialNumber}
                      onChange={(e) => setNewDrone({...newDrone, serialNumber: e.target.value})}
                      className="input-field"
                      placeholder="无人机序列号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">载荷设备</label>
                    <input
                      type="text"
                      value={newDrone.payload}
                      onChange={(e) => setNewDrone({...newDrone, payload: e.target.value})}
                      className="input-field"
                      placeholder="如：禅思相机"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">购置价值（元）</label>
                    <input
                      type="number"
                      value={newDrone.value || ''}
                      onChange={(e) => setNewDrone({...newDrone, value: Number(e.target.value)})}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleAddDrone} className="btn-primary">
                    <Check className="w-4 h-4 mr-2 inline" />确认添加
                  </button>
                  <button onClick={() => setShowAddDrone(false)} className="btn-secondary">
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddDrone(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                添加无人机
              </button>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">选择保障方案</h3>
            <p className="text-gray-500 mb-6">根据您的无人机价值和使用场景，选择最适合的保险方案</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockInsurancePlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-primary-700 bg-primary-50 shadow-lg'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{plan.name}</h4>
                      <p className="text-sm text-gray-500">{plan.provider}</p>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="w-6 h-6 bg-primary-700 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-primary-700">{formatCurrency(plan.basePremium)}</span>
                    <span className="text-gray-500 text-sm ml-1">/ 年起</span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">保障范围：</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.coverage.map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">保额：{formatCurrency(plan.coverageAmount)}</p>
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && quoteResult && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">在线报价</h3>
            
            <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-200">方案名称</p>
                  <p className="text-xl font-bold">{quoteResult.plan}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-200">预估保费</p>
                  <p className="text-3xl font-bold">{formatCurrency(quoteResult.adjustedPremium)}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">投保无人机</p>
                <p className="text-xl font-bold text-gray-800">{quoteResult.drones} 架</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">设备总价值</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(quoteResult.totalValue)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">保障额度</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(quoteResult.coverageAmount)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">基础保费</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(quoteResult.basePremium)}</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>温馨提示：</strong>以上报价为预估保费，最终保费以保险公司核保结果为准。保费根据无人机价值、使用场景、飞行区域等因素综合计算。
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">确认投保信息</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">投保人信息</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">企业名称</p>
                    <p className="font-medium text-gray-800">飞翔航空科技有限公司</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">联系人</p>
                    <p className="font-medium text-gray-800">张经理</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">联系电话</p>
                    <p className="font-medium text-gray-800">138****8888</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">电子邮箱</p>
                    <p className="font-medium text-gray-800">zhang@example.com</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">投保方案</h4>
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-primary-700">{quoteResult?.plan || '专业保障计划'}</p>
                      <p className="text-sm text-gray-600">保障额度：{formatCurrency(quoteResult?.coverageAmount || 2000000)}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary-700">{formatCurrency(quoteResult?.adjustedPremium || 5800)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1" defaultChecked />
                <p className="text-sm text-gray-600">
                  我已阅读并同意《保险条款》和《隐私政策》，确认所填信息真实有效。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft className="w-4 h-4 mr-2 inline" />
            上一步
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 2 && !selectedPlan}
              className={`btn-primary ${currentStep === 2 && !selectedPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-2 inline" />
            </button>
          ) : (
            <button className="btn-accent">
              <FileCheck className="w-4 h-4 mr-2 inline" />
              提交投保申请
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apply;
