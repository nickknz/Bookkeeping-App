import { Bell, Search } from "lucide-react";

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#b37800]">{eyebrow}</div>}
        <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#2c2c29] sm:text-[30px]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[#81817b] sm:text-sm">{description}</p>}
      </div>
      <div className="flex items-center gap-2.5">
        {children}
        <button
          type="button"
          aria-label="搜索"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e6e1] bg-white text-[#7d7f79] shadow-sm transition hover:border-[#cfd1ca] hover:text-[#2c2c29]"
        >
          <Search size={17} />
        </button>
        <button
          type="button"
          aria-label="通知"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e6e1] bg-white text-[#7d7f79] shadow-sm transition hover:border-[#cfd1ca] hover:text-[#2c2c29]"
        >
          <Bell size={17} />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#ef7b72] ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
