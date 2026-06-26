import React from "react";

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { type = "info", message } = toast;
  const isError = type === "error";
  const bgClass = isError ? "bg-red-600 text-white" : "bg-slate-900 text-white";

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl shadow-2xl ring-1 ring-black/10">
      <div className={`${bgClass} px-5 py-4 flex items-start gap-3`}>
        <div className="mt-1 text-xl">
          {isError ? "⚠️" : "ℹ️"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{isError ? "Error" : "Notice"}</p>
          <p className="text-sm leading-relaxed mt-1 wrap-break-word">{message}</p>
        </div>
        <button
          className="ml-auto text-white/80 hover:text-white"
          onClick={onClose}
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
