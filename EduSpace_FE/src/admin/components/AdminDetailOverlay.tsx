import React from 'react';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface AdminDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: {
        onApprove?: () => void;
        onReject?: (reason: string) => void;
        isActing?: boolean;
        approveLabel?: string;
        rejectLabel?: string;
    };
}

export function AdminDetailOverlay({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    actions
}: AdminDetailOverlayProps) {
    const [rejectReason, setRejectReason] = React.useState('');
    const [isRejecting, setIsRejecting] = React.useState(false);

    if (!isOpen) return null;

    const handleRejectClick = () => {
        if (!isRejecting) {
            setIsRejecting(true);
        } else {
            actions?.onReject?.(rejectReason);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-500 p-4">
            <div 
                className="absolute inset-0" 
                onClick={onClose}
            />
            <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-20 duration-500 overflow-hidden flex flex-col border border-gray-200">
                {/* Modern Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-white z-10 sticky top-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">{title}</h3>
                        {subtitle && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">{subtitle}</p>}
                    </div>
                    <button 
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 border border-transparent hover:border-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Area - Subtly colored background to make cards pop */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
                    {children}
                </div>

                {/* Refined Footer with Professional Buttons */}
                {actions && (
                    <div className="border-t border-gray-100 bg-white p-6 z-10 sticky bottom-0">
                        {isRejecting && (
                            <div className="mb-6 space-y-1.5 animate-in fade-in slide-in-from-top-4 duration-500">
                                <label className="block text-[13px] font-semibold text-[#374151] ml-1">Lý do từ chối (Bắt buộc)</label>
                                <textarea 
                                    autoFocus
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Vui lòng cung cấp lý do chi tiết để đối tác nắm rõ..."
                                    className="w-full rounded-[12px] border border-[#d1d5db] bg-white flex items-center p-4 text-sm font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none transition-all h-32 resize-none"
                                />
                            </div>
                        )}
                        <div className="flex justify-center items-center gap-4 w-full max-w-2xl mx-auto">
                            {!isRejecting ? (
                                <>
                                    <button
                                        onClick={actions.onApprove}
                                        disabled={actions.isActing}
                                        className="flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl bg-slate-900 text-sm font-bold text-white hover:bg-black hover:shadow-xl hover:shadow-slate-200 transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        {actions.isActing ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        )}
                                        <span>{actions.approveLabel || 'Duyệt hồ sơ'}</span>
                                    </button>
                                    
                                    <button
                                        onClick={handleRejectClick}
                                        disabled={actions.isActing}
                                        className="flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50/30 transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        <XCircle className="h-5 w-5 text-slate-400 group-hover:text-red-500" />
                                        <span>{actions.rejectLabel || 'Từ chối'}</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleRejectClick}
                                        disabled={actions.isActing || !rejectReason.trim()}
                                        className="flex-1 h-14 flex items-center justify-center gap-3 rounded-2xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-600/10 transition-all disabled:opacity-50 active:scale-[0.98]"
                                    >
                                        <XCircle className="h-5 w-5" />
                                        <span>Xác nhận từ chối</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => setIsRejecting(false)}
                                        className="w-32 h-14 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-900 uppercase tracking-widest transition-all"
                                    >
                                        Quay lại
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
