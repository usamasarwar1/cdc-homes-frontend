import React, { useEffect } from "react";

export function Modal({
    open,
    onClose,
    title,
    children,
    }) {
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onClose();
        }
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
            onMouseDown={onClose} // click outside to close
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
            {/* Panel */}
            <div
                className="relative z-10 w-full max-w-2xl rounded-lg bg-background shadow-2xl ring-1 ring-black/10"
                onMouseDown={(e) => e.stopPropagation()} // keep clicks inside from closing
            >
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-600">
                    <h3 id="modal-title" className="text-xl font-semibold  dark:text-white ">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="h-5 w-5 inline-flex items-center justify-center "
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 sm:p-6">{children}</div>
            </div>
        </div>
    );
}

/* --------------------------- Input/Select helpers --------------------------- */
export function Input({
    label, value, onChange, type = "text", min,
}) {
    return (
        <label className="block">
            <span className="text-xs dark:text-white ">{label}</span>
            <input
                type={type}
                min={min}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 dark:bg-background  px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
        </label>
    );
}
export function Select({
    label, value, onChange, options,
}) {
    return (
        <label className="block">
            <span className="text-xs text-slate-600">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}