import {
  BellRing,
  ChevronRight,
  CircleHelp,
  Download,
  Grid2X2,
  Info,
  LockKeyhole,
  LogIn,
  Palette,
  Settings2,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import PageHeader from "../components/PageHeader";

const SETTINGS = [
  { label: "分类管理", description: "编辑收支分类与图标", icon: Grid2X2, tone: "bg-[#fff3bf] text-[#a97000]" },
  { label: "数据导出", description: "导出 Excel 或 CSV 文件", icon: Download, tone: "bg-[#edf3fb] text-[#5d7fba]" },
  { label: "记账提醒", description: "每天 21:00 提醒我记账", icon: BellRing, tone: "bg-[#fff3e2] text-[#b67824]", badge: "已开启" },
  { label: "外观设置", description: "主题、字号与显示偏好", icon: Palette, tone: "bg-[#f2edfa] text-[#8069b0]" },
  { label: "通用设置", description: "货币、语言与日期格式", icon: Settings2, tone: "bg-[#f5f5f2] text-[#7a7a74]" },
];

const SUPPORT = [
  { label: "帮助与反馈", description: "常见问题与建议反馈", icon: CircleHelp },
  { label: "隐私与安全", description: "数据使用与隐私说明", icon: LockKeyhole },
  { label: "关于小豆记账", description: "当前版本 v0.1.0", icon: Info },
];

function SettingRow({ item, muted = false, last = false }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={`group flex w-full items-center gap-3.5 px-4 py-4 text-left transition hover:bg-[#fafaf8] sm:px-5 ${last ? "" : "border-b border-[#ecece8]"}`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${item.tone || "bg-[#f5f5f2] text-[#777771]"}`}>
        <Icon size={18} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-[#464642]">{item.label}</div>
        <div className="mt-1 truncate text-[10px] text-[#9a9a93] sm:text-[11px]">{item.description}</div>
      </div>
      {item.badge && <span className="rounded-full bg-[#fff3bf] px-2.5 py-1 text-[9px] font-bold text-[#a97000]">{item.badge}</span>}
      <ChevronRight size={16} className={`${muted ? "text-[#ccccC5]" : "text-[#bcbcb5]"} transition group-hover:translate-x-0.5 group-hover:text-[#80807a]`} />
    </button>
  );
}

export default function ProfilePage() {
  return (
    <div className="page-enter mx-auto max-w-[1460px] px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12">
      <PageHeader
        eyebrow="Account"
        title="个人中心"
        description="管理你的账户、数据和个性化偏好。"
      />

      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-8">
          <section className="relative overflow-hidden rounded-[26px] bg-[#ffc928] p-6 text-[#2c2c29] shadow-[0_18px_50px_rgba(146,103,0,0.14)] sm:p-7">
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[30px] border-black/[0.035]" />
            <div className="relative">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-black/[0.05] bg-white/40 text-black/55">
                <UserRound size={30} strokeWidth={1.6} />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-[-0.02em]">游客账户</h2>
              <p className="mt-2 text-xs leading-relaxed text-black/45">登录后即可跨设备同步账本，并启用云端备份。</p>
              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[13px] font-bold text-[#3a3527] shadow-sm transition hover:bg-[#fff9de]"
              >
                <LogIn size={16} strokeWidth={2.2} />
                登录 / 注册
              </button>
              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-black/35">
                <Smartphone size={12} />
                当前数据仅保存在这台设备
              </div>
            </div>
          </section>

          <section className="surface-shadow rounded-[22px] border border-white bg-white p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#fff3bf] text-[#a97000]">
                <ShieldCheck size={19} />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-[#464642]">你的数据很安全</h3>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[#96968f]">本地数据不会上传，开启同步后也会通过加密通道传输。</p>
              </div>
            </div>
          </section>
        </aside>

        <div className="space-y-5">
          <section className="surface-shadow overflow-hidden rounded-[24px] border border-white bg-white">
            <div className="flex items-center justify-between border-b border-[#ecece8] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-[16px] font-bold text-[#2c2c29]">偏好与数据</h2>
                <p className="mt-1 text-[11px] text-[#9a9a93]">管理记账方式和应用体验</p>
              </div>
              <div className="hidden rounded-full bg-[#f7f7f4] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#898983] sm:block">Local mode</div>
            </div>
            <div>
              {SETTINGS.map((item, index) => <SettingRow key={item.label} item={item} last={index === SETTINGS.length - 1} />)}
            </div>
          </section>

          <section className="surface-shadow overflow-hidden rounded-[24px] border border-white bg-white">
            <div className="border-b border-[#ecece8] px-5 py-5 sm:px-6">
              <h2 className="text-[16px] font-bold text-[#2c2c29]">支持与关于</h2>
              <p className="mt-1 text-[11px] text-[#9a9a93]">需要帮助？我们随时在这里</p>
            </div>
            <div>
              {SUPPORT.map((item, index) => <SettingRow key={item.label} item={item} muted last={index === SUPPORT.length - 1} />)}
            </div>
          </section>

          <div className="flex items-center justify-center gap-2 py-2 text-[10px] text-[#acaca5]">
            <ShieldCheck size={12} /> 小豆记账尊重并保护你的隐私
          </div>
        </div>
      </div>
    </div>
  );
}
