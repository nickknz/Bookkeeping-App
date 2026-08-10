import { AlertCircle, RefreshCw } from "lucide-react";

export function PageLoadingState() {
  return (
    <div className="mx-auto max-w-[1460px] animate-pulse px-4 pt-[92px] sm:px-6 lg:px-9 lg:py-9 xl:px-12" role="status">
      <div className="h-3 w-20 rounded-full bg-[#e3e4df]" />
      <div className="mt-4 h-8 w-52 rounded-xl bg-[#e3e4df]" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-lg bg-[#e9eae6]" />
      <div className="mt-8 grid gap-5 xl:grid-cols-5">
        <div className="h-72 rounded-[26px] bg-[#eeeeda] xl:col-span-3" />
        <div className="h-72 rounded-[26px] bg-white xl:col-span-2" />
      </div>
      <span className="sr-only">正在加载账本数据</span>
    </div>
  );
}

export function PageErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[720px] items-center justify-center px-5 pt-[68px] lg:pt-0">
      <div className="surface-shadow w-full rounded-[24px] border border-white bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff2ef] text-[#d45c55]">
          <AlertCircle size={22} />
        </div>
        <h2 className="mt-5 text-lg font-bold text-[#2c2c29]">暂时无法读取账本</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#8d8d86]">{message || "请确认后端服务已经启动，然后重试。"}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#ffc928] px-5 py-2.5 text-xs font-bold text-[#2c2c29]"
        >
          <RefreshCw size={14} /> 重新加载
        </button>
      </div>
    </div>
  );
}
