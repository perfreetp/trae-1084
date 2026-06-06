import { Bell, Search, ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: '保单即将到期', content: 'POL-2023-00156 保单将在3天后到期', time: '10分钟前', type: 'warning' },
    { id: 2, title: '新的报案', content: 'ACC-2024-00004 待分配查勘员', time: '30分钟前', type: 'info' },
    { id: 3, title: '赔付已到账', content: 'CLA-2024-00001 赔款已支付完成', time: '2小时前', type: 'success' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <button className="lg:hidden p-2 hover:bg-gray-100 rounded-md">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索保单、报案号..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">通知中心</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                      <span className="text-xs text-gray-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notif.content}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-primary-700 hover:text-primary-800 font-medium w-full text-center">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">张</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">张经理</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
