import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarCheck2,
  ChevronRight,
  MoreHorizontal,
  PlaneTakeoff,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { money } from "../data/format";

const BOOKS = [
  {
    id: 1,
    name: "日常生活",
    description: "餐饮、通勤与日常采购",
    count: 16,
    amount: 5243.5,
    icon: BookOpenText,
    color: "#e6a900",
    bg: "#fff3bf",
    updated: "今天 14:32",
  },
  {
    id: 2,
    name: "工作账户",
    description: "报销、设备与项目开销",
    count: 0,
    amount: 0,
    icon: BriefcaseBusiness,
    color: "#587fbd",
    bg: "#edf3fb",
    updated: "尚无记录",
  },
  {
    id: 3,
    name: "旅行计划",
    description: "旅途预算与花销归档",
    count: 0,
    amount: 0,
    icon: PlaneTakeoff,
    color: "#b27a2b",
    bg: "#fbf3e6",
    updated: "尚无记录",
  },
];

export default function LedgerPage() {
  return (
    <div className="page-enter mx-auto max-w-[1460px] px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12">
      <PageHeader
        eyebrow="Ledger"
        title="我的账本"
        description="把不同用途的收支分开管理，每一本都清清楚楚。"
      >
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl bg-[#ffc928] px-4 text-xs font-bold text-[#2c2c29] shadow-[0_8px_20px_rgba(146,103,0,0.14)] transition hover:bg-[#eeb315]"
        >
          <Plus size={15} strokeWidth={2.5} />
          新建账本
        </button>
      </PageHeader>

      <section className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
        <div className="relative min-h-[240px] overflow-hidden rounded-[26px] bg-[#ffc928] p-6 text-[#2c2c29] shadow-[0_18px_55px_rgba(146,103,0,0.15)] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[38px] border-black/[0.035]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-black/45">
                <WalletCards size={15} />
                全部账本概览
              </div>
              <div className="rounded-full bg-white/40 px-3 py-1.5 text-[10px] font-semibold text-black/55">数据已更新</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-black/40">本月总支出</div>
              <div className="numeric mt-2 text-[38px] font-bold tracking-[-0.04em] sm:text-[44px]">
                <span className="mr-1.5 text-lg font-medium text-black/45">¥</span>{money(5243.5)}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-9 gap-y-3 border-t border-black/[0.08] pt-4 text-xs">
              <span className="text-black/40">账本总数 <b className="ml-2 text-black/80">3</b></span>
              <span className="text-black/40">本月记录 <b className="ml-2 text-black/80">16 笔</b></span>
              <span className="text-black/40">主要账本 <b className="ml-2 text-[#5c4700]">日常生活</b></span>
            </div>
          </div>
        </div>

        <div className="surface-shadow flex flex-col justify-between rounded-[26px] border border-white bg-white p-6 sm:p-7">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#fff3bf] text-[#a97000]">
              <CalendarCheck2 size={20} />
            </div>
            <button type="button" aria-label="更多" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a1a19a] transition hover:bg-[#f7f7f5]">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="my-7">
            <h2 className="text-[17px] font-bold text-[#2c2c29]">本月记账进度</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#92928b]">已连续记账 8 天，继续保持这个好习惯。</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold">
              <span className="text-[#9a9a93]">月度目标</span>
              <span className="numeric text-[#a97000]">8 / 20 天</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#ecece8]">
              <div className="h-full w-[40%] rounded-full bg-[#e6a900]" />
            </div>
          </div>
        </div>
      </section>

      <section className="surface-shadow overflow-hidden rounded-[24px] border border-white bg-white">
        <div className="flex items-center justify-between border-b border-[#ecece8] px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-[16px] font-bold text-[#2c2c29]">全部账本</h2>
            <p className="mt-1 text-[11px] text-[#9a9a93]">3 本账本 · 16 笔记录</p>
          </div>
          <button type="button" className="flex items-center gap-1.5 text-xs font-bold text-[#a97000]">
            管理账本 <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
          {BOOKS.map((book) => {
            const Icon = book.icon;
            return (
              <button
                key={book.id}
                type="button"
                className="group relative overflow-hidden rounded-[20px] border border-[#e9eae6] bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#d9dad5] hover:shadow-[0_14px_30px_rgba(90,68,10,0.07)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[15px]" style={{ color: book.color, background: book.bg }}>
                    <Icon size={21} />
                  </div>
                  <ChevronRight size={18} className="mt-1 text-[#c6c6bf] transition group-hover:translate-x-1 group-hover:text-[#80807a]" />
                </div>
                <div className="mt-5">
                  <h3 className="text-[15px] font-bold text-[#343431]">{book.name}</h3>
                  <p className="mt-1.5 text-[11px] text-[#979790]">{book.description}</p>
                </div>
                <div className="mt-6 flex items-end justify-between border-t border-[#ecece8] pt-4">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#afafa8]">累计支出</div>
                    <div className="numeric mt-1.5 text-lg font-bold text-[#343431]">¥{money(book.amount)}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] text-[#9a9a93]">
                      <ReceiptText size={12} /> {book.count} 笔
                    </div>
                    <div className="mt-1.5 text-[9px] text-[#b4b4ad]">{book.updated}</div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100" style={{ background: book.color }} />
              </button>
            );
          })}

          <button
            type="button"
            className="flex min-h-[240px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[#cfd1ca] bg-[#fafaf8] p-5 text-center transition hover:border-[#d8b44a] hover:bg-[#fff9e8] xl:hidden"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#a97000] shadow-sm">
              <Plus size={18} />
            </div>
            <div className="mt-3 text-sm font-bold text-[#5c5c56]">创建新账本</div>
            <div className="mt-1 text-[10px] text-[#9a9a93]">为新的计划单独记账</div>
          </button>
        </div>
      </section>
    </div>
  );
}
