import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenText,
  ChevronRight,
  CircleUserRound,
  Home,
  Plus,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

const TABS = [
  { path: "/", label: "总览", icon: Home },
  { path: "/budget", label: "月度预算", mobileLabel: "预算", icon: Target },
  { path: "/chart", label: "数据分析", mobileLabel: "分析", icon: BarChart3 },
  { path: "/ledger", label: "我的账本", mobileLabel: "账本", icon: BookOpenText },
  { path: "/me", label: "个人中心", mobileLabel: "我的", icon: CircleUserRound },
];

function Brand({ compact = false }) {
  return (
    <div className={`flex items-center ${compact ? "gap-2.5" : "gap-3"}`}>
      <div className={`${compact ? "h-9 w-9 rounded-xl" : "h-10 w-10 rounded-[14px]"} flex items-center justify-center bg-[#ffc928] text-[#2c2c29]`}>
        <WalletCards size={compact ? 19 : 21} strokeWidth={2.2} />
      </div>
      <div>
        <div className={`${compact ? "text-[15px]" : "text-[17px]"} font-bold tracking-[-0.02em] text-[#2c2c29]`}>小豆记账</div>
        {!compact && <div className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-[#777770]">SMART FINANCE</div>}
      </div>
    </div>
  );
}

export default function Sidebar({ onAddClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goTo = (path) => navigate(path);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col overflow-hidden border-r border-[#ecece8] bg-white lg:flex">
        <div className="px-7 pb-9 pt-7">
          <Brand />
        </div>

        <div className="px-4">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#74746d]">工作台</div>
          <nav className="space-y-1.5" aria-label="主导航">
            {TABS.map((tab) => {
              const active = pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => goTo(tab.path)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-[#fff3bf] text-[#2c2c29]"
                      : "text-[#565651] hover:bg-[#f7f7f5] hover:text-[#343431]"
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.2 : 1.9} className={active ? "text-[#9f6c00]" : "text-[#777770] group-hover:text-[#4f4f49]"} />
                  <span className="flex-1">{tab.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[#ffc928] shadow-[0_0_0_4px_rgba(255,201,40,0.16)]" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mx-4 mt-auto rounded-2xl border border-[#f3e4a7] bg-[#fff9de] p-4">
          <div className="mb-3 flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#b67d00] shadow-sm">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#4b4533]">每一笔，都算数</div>
              <div className="mt-1 text-[11px] leading-relaxed text-[#999078]">持续记录，慢慢看见生活的答案。</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ffc928] px-4 py-3 text-[13px] font-bold text-[#2c2c29] transition hover:bg-[#f2b800]"
          >
            <Plus size={17} strokeWidth={2.5} />
            记一笔
          </button>
        </div>

        <button
          type="button"
          onClick={() => goTo("/me")}
          className="mx-4 my-4 flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[#f7f7f5]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2f2ef] text-[#85857f]">
            <CircleUserRound size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#55554f]">游客账户</div>
            <div className="mt-0.5 text-[10px] text-[#7d7d76]">本地数据</div>
          </div>
          <ChevronRight size={15} className="text-[#9c9b94]" />
        </button>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#ecece8] bg-white/95 px-5 backdrop-blur lg:hidden">
        <Brand compact />
        <button
          type="button"
          onClick={onAddClick}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-[#ffc928] px-3.5 text-xs font-bold text-[#2c2c29]"
        >
          <Plus size={16} strokeWidth={2.5} />
          记一笔
        </button>
      </header>

      <nav
        className="fixed inset-x-3 bottom-3 z-50 grid h-[66px] grid-cols-5 items-center rounded-[20px] border border-white/70 bg-white/95 px-2 shadow-[0_16px_45px_rgba(76,63,24,0.16)] backdrop-blur-xl lg:hidden"
        aria-label="移动端导航"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => goTo(tab.path)}
              aria-current={active ? "page" : undefined}
              className={`flex h-full flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition ${active ? "text-[#8f6100]" : "text-[#66665f]"}`}
            >
              <span className={`flex h-7 w-10 items-center justify-center rounded-full transition ${active ? "bg-[#fff3bf]" : ""}`}>
                <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
              </span>
              {tab.mobileLabel || tab.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
