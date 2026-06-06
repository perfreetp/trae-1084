import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Plane,
  AlertTriangle,
  Upload,
  Search,
  TrendingUp,
  BarChart3,
  Shield
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '首页概览' },
  { 
    label: '投保管理',
    icon: Shield,
    children: [
      { path: '/insurance/apply', icon: FilePlus, label: '投保申请' },
      { path: '/insurance/policies', icon: FileText, label: '保单管理' },
    ]
  },
  { path: '/flight/tasks', icon: Plane, label: '飞行任务' },
  { 
    label: '理赔服务',
    icon: AlertTriangle,
    children: [
      { path: '/accident/report', icon: AlertTriangle, label: '事故报案' },
      { path: '/accident/materials', icon: Upload, label: '材料收集' },
      { path: '/claims/survey', icon: Search, label: '查勘协同' },
      { path: '/claims/progress', icon: TrendingUp, label: '赔付进度' },
    ]
  },
  { path: '/statistics', icon: BarChart3, label: '统计台账' },
];

interface MenuItem {
  path?: string;
  icon: any;
  label: string;
  children?: { path: string; icon: any; label: string }[];
}

const Sidebar = () => {
  const renderMenuItem = (item: MenuItem) => {
    if (item.children) {
      return (
        <div key={item.label} className="mb-2">
          <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </div>
          <div className="space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  `flex items-center px-6 py-2.5 text-sm rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-700 text-white shadow-md'
                      : 'text-gray-300 hover:bg-primary-800 hover:text-white'
                  }`
                }
              >
                <child.icon className="w-4 h-4 mr-3" />
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path!}
        className={({ isActive }) =>
          `flex items-center px-3 py-2.5 text-sm rounded-md transition-all duration-200 mb-1 ${
            isActive
              ? 'bg-primary-700 text-white shadow-md'
              : 'text-gray-300 hover:bg-primary-800 hover:text-white'
          }`
        }
      >
        <item.icon className="w-4 h-4 mr-3" />
        {item.label}
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-primary-900 min-h-screen flex flex-col">
      <div className="p-5 border-b border-primary-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">低空飞行保险</h1>
            <p className="text-xs text-gray-400">理赔服务平台</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map(renderMenuItem)}
      </nav>
      
      <div className="p-4 border-t border-primary-800">
        <div className="bg-primary-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">张</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">张经理</p>
              <p className="text-xs text-gray-400">理赔专员</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
