import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, BookOpen, User, Plus } from 'lucide-react';

const TABS = [
  { path: "/",       label: "首页", icon: Home },
  { path: "/chart",  label: "图表", icon: BarChart2 },
  { path: "/ledger", label: "账本", icon: BookOpen },
  { path: "/me",     label: "我的", icon: User },
];

export default function Sidebar({ onAddClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="w-[250px] h-full bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <span className="text-2xl">💰</span>
        <span className="text-[18px] font-bold text-gray-800">记账本</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        {TABS.map((t) => {
          const active = pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className="w-full flex items-center gap-3 px-4 py-[11px] rounded-xl mb-1 border-0 cursor-pointer text-left transition-all duration-150 relative"
              style={{
                background: active ? "#FFF7ED" : "transparent",
                color: active ? "#FF9800" : "#6B7280",
              }}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full bg-[#FF9800]" />
              )}
              <t.icon size={20} strokeWidth={1.8} color={active ? "#FF9800" : "#9CA3AF"} />
              <span className={`text-[14px] ${active ? "font-semibold" : "font-medium"}`}>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Add button */}
      <div className="px-5 py-6">
        <button
          onClick={onAddClick}
          className="w-full py-[11px] rounded-xl border-0 cursor-pointer text-white text-[15px] font-semibold flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #FFC107, #FF9800)" }}
        >
          <Plus size={18} strokeWidth={2.5} color="#fff" />
          记一笔
        </button>
      </div>
    </div>
  );
}
