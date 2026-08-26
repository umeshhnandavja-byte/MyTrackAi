import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, LineChart, Network, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PendingTasks from './pages/PendingTasks';
import Analytics from './pages/Analytics';
import PlanningBoard from './pages/PlanningBoard';
import SettingsPage from './pages/Settings';

function Sidebar() {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/pending', icon: <CheckSquare size={20} />, label: 'Todo List' },
    { to: '/analytics', icon: <LineChart size={20} />, label: 'Analytics' },
    { to: '/planning', icon: <Network size={20} />, label: 'Planning Board' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-surface border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <CheckSquare className="text-secondary" />
          MyTrackAi
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background text-gray-200">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pending" element={<PendingTasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/planning" element={<PlanningBoard />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
