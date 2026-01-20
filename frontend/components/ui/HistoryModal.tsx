"use client";

import React from "react";
import { X, History, User, Clock, MessageSquare, Briefcase } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface HistoryEvent {
    date: string | Date;
    action: string;
    user: string;
    comment?: string;
    incomeId?: number;
    bookingId?: number;
    invoiceId?: number;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    events: HistoryEvent[];
    itemTitle?: string;
    itemSubtitle?: string;
    viewAllLink?: string;
}

export default function HistoryModal({
    isOpen,
    onClose,
    title,
    events,
    itemTitle,
    itemSubtitle,
    viewAllLink
}: HistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[#7c3aed] p-6 text-white relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{title}</h2>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-0.5">Audit Trail & History</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {/* Item Summary */}
                    {(itemTitle || itemSubtitle) && (
                        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            {itemTitle && <h3 className="font-bold text-gray-900">{itemTitle}</h3>}
                            {itemSubtitle && <p className="text-sm text-gray-500 mt-1">{itemSubtitle}</p>}
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>

                        <div className="space-y-8 relative">
                            {events.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No history records found.</p>
                                </div>
                            ) : (
                                events.map((event, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 border-white transition-all group-hover:scale-110 ${event.action.toLowerCase().includes('validated') || event.action.toLowerCase().includes('confirmed')
                                                ? 'bg-green-100 text-green-600'
                                                : event.action.toLowerCase().includes('cancel')
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {event.action.toLowerCase().includes('comment') ? <MessageSquare className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-900 leading-tight">{event.action}</h4>
                                                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full">
                                                    {typeof event.date === 'string' ? event.date : event.date.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-bold uppercase tracking-wider mb-2">
                                                <User className="w-3 h-3" />
                                                By {event.user}
                                            </div>
                                            {event.comment && (
                                                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 italic border border-gray-100 leading-relaxed">
                                                    "{event.comment}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {viewAllLink && (
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                            <a
                                href={viewAllLink}
                                className="text-[var(--color-primary)] font-bold text-sm hover:underline flex items-center gap-2"
                            >
                                <History className="w-4 h-4" />
                                View Full History
                            </a>
                        </div>
                    )}

                    <div className="mt-8">
                        <Button
                            variant="primary"
                            className="w-full py-6 rounded-2xl shadow-lg shadow-purple-500/20 font-bold"
                            onClick={onClose}
                        >
                            Close History
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
