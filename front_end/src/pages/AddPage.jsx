import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import CategoryIcon from "../components/CategoryIcon";
import { formatLocalDate } from "../data/month";

export default function AddPage({ categories, onSave, onClose, defaultDate, minDate, maxDate }) {
  const [txType, setTxType] = useState("expense");
  const [selectedCat, setSelectedCat] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(defaultDate || formatLocalDate());
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === txType),
    [categories, txType],
  );
  const isValid = Boolean(selectedCat !== null && amount && Number(amount) > 0);
  const selectedCategory = useMemo(
    () => availableCategories.find((category) => category.id === selectedCat),
    [availableCategories, selectedCat],
  );

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, saving]);

  const switchType = (type) => {
    setTxType(type);
    setSelectedCat(null);
    setSubmitError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValid || saving) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await onSave({
        type: txType,
        categoryId: selectedCat,
        amount: Number(amount),
        note: note.trim() || null,
        date,
      });
      onClose();
    } catch (saveError) {
      setSubmitError(saveError.message || "保存失败，请稍后重试");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-end bg-[#080f1e]/55 backdrop-blur-[2px] lg:items-stretch"
      onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-transaction-title"
        className="flex h-[92svh] w-full max-w-[580px] flex-col overflow-hidden rounded-t-[28px] bg-[#f7f7f5] shadow-[-24px_0_65px_rgba(8,15,30,0.2)] lg:h-full lg:rounded-none"
      >
        <header className="shrink-0 border-b border-[#e9eae6] bg-white px-5 pb-5 pt-4 sm:px-7 lg:pt-7">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#ddded8] lg:hidden" />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b37800]">New transaction</div>
              <h2 id="add-transaction-title" className="mt-1.5 text-[22px] font-bold tracking-[-0.03em] text-[#2c2c29]">记一笔</h2>
              <p className="mt-1 text-[11px] text-[#999992]">记录此刻，让每一笔钱都有迹可循。</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="关闭"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f5f2] text-[#7d7f79] transition hover:bg-[#e9eae6] hover:text-[#343431] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-[14px] bg-[#f5f5f2] p-1">
            {[
              { id: "expense", label: "支出", icon: ArrowUpRight },
              { id: "income", label: "收入", icon: ArrowDownLeft },
            ].map((type) => {
              const active = txType === type.id;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => switchType(type.id)}
                  className={`flex items-center justify-center gap-2 rounded-[11px] py-2.5 text-xs font-bold transition ${
                    active ? "bg-white text-[#343431] shadow-sm" : "text-[#979790] hover:text-[#7a7a74]"
                  }`}
                >
                  <Icon size={15} className={active ? (type.id === "income" ? "text-[#15936a]" : "text-[#df655f]") : ""} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="soft-scrollbar flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[#464642]">选择分类</h3>
                <p className="mt-1 text-[10px] text-[#9a9a93]">这笔钱花在了哪里？</p>
              </div>
              {selectedCategory && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: selectedCategory.color }}>
                  <Check size={13} /> {selectedCategory.name}
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {availableCategories.map((category) => {
                const selected = selectedCat === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCat(category.id)}
                    className={`relative flex min-w-0 flex-col items-center gap-2 rounded-[16px] border px-1 py-3 transition ${
                      selected
                        ? "border-transparent bg-white shadow-[0_8px_20px_rgba(90,68,10,0.08)]"
                        : "border-transparent hover:border-[#e3e4df] hover:bg-white/70"
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-[13px] transition-transform"
                      style={{ color: category.color, background: selected ? category.color : category.bg }}
                    >
                      <CategoryIcon id={category.icon} color={selected ? "#fff" : category.color} />
                    </span>
                    <span className={`w-full truncate text-[10px] ${selected ? "font-bold text-[#464642]" : "font-medium text-[#83837d]"}`}>
                      {category.name}
                    </span>
                    {selected && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full" style={{ background: category.color }} />}
                  </button>
                );
              })}
            </div>
            {!availableCategories.length && (
              <div className="rounded-2xl border border-dashed border-[#d8d8d2] bg-white/60 px-4 py-8 text-center text-xs text-[#96968f]">
                暂无可用分类，请先确认后端分类数据已初始化。
              </div>
            )}
          </section>

          <section className="mt-7 space-y-3.5">
            <div className="rounded-[18px] border border-[#e7e8e3] bg-white p-4 transition focus-within:border-[#e1bd55] focus-within:ring-4 focus-within:ring-[#e6a900]/[0.07]">
              <label htmlFor="transaction-amount" className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a0a099]">金额</label>
              <div className="mt-2 flex items-center">
                <span className="mr-2 text-xl font-semibold text-[#80807a]">¥</span>
                <input
                  id="transaction-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="numeric min-w-0 flex-1 border-0 bg-transparent text-[30px] font-bold tracking-[-0.04em] text-[#2c2c29] outline-none placeholder:text-[#d9dad5]"
                />
                <span className="text-[10px] text-[#a8a8a1]">CNY</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[16px] border border-[#e7e8e3] bg-white px-4 py-3.5 transition focus-within:border-[#e1bd55]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f5f2] text-[#7c7c76]">
                  <AlignLeft size={15} />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold text-[#a5a59e]">备注</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="添加备注"
                    className="mt-1 w-full border-0 bg-transparent text-xs font-semibold text-[#52524d] outline-none placeholder:font-medium placeholder:text-[#c0c0b9]"
                  />
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-[16px] border border-[#e7e8e3] bg-white px-4 py-3.5 transition focus-within:border-[#e1bd55]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f5f2] text-[#7c7c76]">
                  <CalendarDays size={15} />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block text-[9px] font-bold text-[#a5a59e]">日期</span>
                  <input
                    type="date"
                    value={date}
                    min={minDate}
                    max={maxDate}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-1 w-full border-0 bg-transparent text-xs font-semibold text-[#52524d] outline-none"
                  />
                </span>
              </label>
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-[#e7e8e3] bg-white px-5 py-4 sm:px-7 sm:py-5">
          {submitError && (
            <p className="mb-3 rounded-xl bg-[#fff2ef] px-3 py-2.5 text-center text-[11px] font-medium text-[#bd4f49]">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            disabled={!isValid || saving}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ffc928] px-5 py-3.5 text-[13px] font-bold text-[#2c2c29] shadow-[0_10px_25px_rgba(146,103,0,0.14)] transition hover:bg-[#eeb315] disabled:cursor-not-allowed disabled:bg-[#e1e2dd] disabled:text-[#a0a099] disabled:shadow-none"
          >
            {saving ? (
              "正在保存..."
            ) : isValid ? (
              <>
                保存这笔{txType === "expense" ? "支出" : "收入"}
                <ChevronRight size={16} />
              </>
            ) : (
              "请选择分类并填写金额"
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
