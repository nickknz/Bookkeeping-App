import { useId, useState } from "react";
import { AlertCircle, LoaderCircle, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { getCategoryByIcon } from "../data/categories";
import { money } from "../data/format";
import CategoryIcon from "./CategoryIcon";

export default function TransactionItem({
  transaction,
  showBorder = false,
  onEdit,
  onDelete,
}) {
  const category = transaction.category || getCategoryByIcon(transaction.categoryIcon);
  const income = transaction.type === "income";
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const confirmationId = useId();
  const mobileActionsId = useId();
  const transactionLabel = transaction.note || category.name;

  const handleEdit = () => {
    setShowMobileActions(false);
    setConfirmingDelete(false);
    setDeleteError(null);
    onEdit?.(transaction);
  };

  const requestDelete = () => {
    setShowMobileActions(false);
    setConfirmingDelete(true);
    setDeleteError(null);
  };

  const cancelDelete = () => {
    setConfirmingDelete(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (deleting || !onDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(transaction.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "删除失败，请稍后重试");
      setDeleting(false);
    }
  };

  return (
    <div
      className={`group transition-colors hover:bg-[#fafaf8] ${
        showBorder ? "border-b border-[#ecece8]" : ""
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3.5 sm:gap-3.5 sm:px-5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-transform duration-200 group-hover:scale-[1.04]"
          style={{ background: category.bg }}
        >
          <CategoryIcon id={category.icon} color={category.color} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold text-[#343431] sm:text-sm">{transactionLabel}</span>
            {income && (
              <span className="rounded-full bg-[#e8f8ed] px-2 py-0.5 text-[9px] font-bold text-[#15936a]">收入</span>
            )}
          </div>
          <div className="mt-1 truncate text-[11px] text-[#9a9a93]">{category.name} · {transaction.date.replaceAll("-", ".")}</div>
        </div>

        <div className="shrink-0 text-right">
          <div className={`numeric text-[13px] font-bold sm:text-[15px] ${income ? "text-[#15936a]" : "text-[#343431]"}`}>
            {income ? "+" : "−"}¥{money(transaction.amount)}
          </div>
          <div className="mt-1 hidden text-[10px] text-[#aeaEA7] sm:block">{income ? "已入账" : "已支付"}</div>
        </div>

        {(onEdit || onDelete) && (
          <>
            <button
              type="button"
              onClick={() => setShowMobileActions((visible) => !visible)}
              disabled={deleting}
              aria-label={`${transactionLabel}的更多操作`}
              aria-expanded={showMobileActions}
              aria-controls={mobileActionsId}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[#92928b] transition hover:bg-[#f1f1ed] hover:text-[#555550] disabled:cursor-not-allowed disabled:opacity-40 sm:hidden"
            >
              <MoreHorizontal size={17} />
            </button>
            <div className="hidden shrink-0 items-center gap-1 sm:flex" role="group" aria-label="交易操作">
              {onEdit && (
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={deleting}
                  aria-label={`编辑${transactionLabel}`}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#92928b] transition hover:bg-[#fff5cf] hover:text-[#9a6a00] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Pencil size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={requestDelete}
                  disabled={deleting}
                  aria-label={`删除${transactionLabel}`}
                  aria-expanded={confirmingDelete}
                  aria-controls={confirmationId}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#aaa9a2] transition hover:bg-[#fff0ed] hover:text-[#c9573d] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showMobileActions && (
        <div
          id={mobileActionsId}
          className="mx-4 mb-3 grid grid-cols-2 gap-2 rounded-[14px] bg-[#f5f5f2] p-2 sm:hidden"
          role="group"
          aria-label="交易操作"
        >
          {onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="flex min-h-10 items-center justify-center gap-2 rounded-[10px] bg-white px-3 text-[11px] font-bold text-[#6f6f68] shadow-sm transition hover:text-[#9a6a00]"
            >
              <Pencil size={14} /> 编辑
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={requestDelete}
              className="flex min-h-10 items-center justify-center gap-2 rounded-[10px] bg-white px-3 text-[11px] font-bold text-[#bd5b4b] shadow-sm transition hover:bg-[#fff0ed]"
            >
              <Trash2 size={14} /> 删除
            </button>
          )}
        </div>
      )}

      {confirmingDelete && (
        <div
          id={confirmationId}
          aria-busy={deleting}
          role="region"
          aria-label="删除确认"
          className="mx-4 mb-3 rounded-[14px] border border-[#f2d5cf] bg-[#fff8f6] px-3.5 py-3 sm:mx-5 sm:ml-[76px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-[#784b42]">确定删除“{transactionLabel}”？</p>
              <p className="mt-1 text-[10px] text-[#a47b72]">删除后无法撤销，月度汇总也会同步更新。</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="flex h-8 items-center gap-1 rounded-[10px] bg-white px-3 text-[10px] font-bold text-[#777770] shadow-sm transition hover:bg-[#f5f5f2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={12} /> 取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex h-8 items-center gap-1 rounded-[10px] bg-[#d96855] px-3 text-[10px] font-bold text-white transition hover:bg-[#c9573d] disabled:cursor-wait disabled:opacity-70"
              >
                {deleting ? <LoaderCircle size={12} className="animate-spin" /> : <Trash2 size={12} />}
                {deleting ? "删除中..." : deleteError ? "重试删除" : "确认删除"}
              </button>
            </div>
          </div>
          {deleteError && (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-[#bd4f49]">
              <AlertCircle size={12} className="shrink-0" /> {deleteError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
