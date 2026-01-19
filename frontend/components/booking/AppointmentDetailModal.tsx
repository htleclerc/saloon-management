"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useResponsive } from "@/context/ThemeProvider";
import {
    Calendar,
    Clock,
    MessageSquare,
    CheckCircle,
    Plus,
    X,
    Edit,
    Trash2,
    AlertCircle,
    History,
    ChevronRight,
    Users
} from "lucide-react";
import { Booking, Service } from "@/types";

interface AppointmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Booking | null;
    servicesList: { id: number; name: string; price: number }[];
    onCancel: (id: number) => void;
    onEdit: (appointment: Booking, targetStep?: number) => void;
    onConfirm?: (id: number) => void;
    onApproveReschedule?: (id: number) => void;
    onRejectReschedule?: (id: number, reason?: string) => void;
    userRole?: string;
    isAdminModified?: boolean;
    isAdmin?: boolean;
}

export default function AppointmentDetailModal({
    isOpen,
    onClose,
    appointment,
    servicesList,
    onCancel,
    onEdit,
    onConfirm,
    onApproveReschedule,
    onRejectReschedule,
    userRole,
    isAdminModified = false,
    isAdmin = false
}: AppointmentDetailModalProps) {
    const [showFullHistory, setShowFullHistory] = useState(false);
    const { isMobile } = useResponsive();

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !appointment) return null;

    const isStaff = isAdmin || userRole === 'manager' || userRole === 'admin';
    const isClientRole = userRole === 'client';

    // Button Logic: canView and isActif
    const valider = {
        canView: isStaff || (isClientRole && isAdminModified),
        isActif: appointment.status === 'Pending'
    };
    const modifier = {
        canView: isStaff || isClientRole,
        isActif: appointment.status !== 'Cancelled'
    };
    const annuler = {
        canView: isStaff || isClientRole,
        isActif: appointment.status !== 'Cancelled'
    };
    const clientAction = {
        canView: isClientRole && appointment.status === 'PendingApproval',
    };
    const manageTeam = {
        canView: isStaff && appointment.status !== 'Cancelled' && appointment.status !== 'Closed',
    };

    const salonName = "Demo Salon"; // In a real app, this would be looked up

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center md:items-center z-[70] p-4 overflow-y-auto animate-in fade-in"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-2xl my-auto overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={(e: any) => e.stopPropagation()}
            >
                {/* Status Banner */}
                <div className={`p-4 flex items-center justify-between ${appointment.status === 'Confirmed' ? 'bg-success' :
                    appointment.status === 'Cancelled' ? 'bg-error' :
                        appointment.status === 'PendingApproval' ? 'bg-warning animate-pulse' :
                            'bg-warning'
                    } text-white`}>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            {appointment.status === 'Confirmed' ? <CheckCircle className="w-5 h-5" /> :
                                appointment.status === 'Cancelled' ? <X className="w-5 h-5" /> :
                                    <Clock className="w-5 h-5" />}
                        </div>
                        <span className="font-bold uppercase tracking-widest text-sm">Appointment {appointment.status}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">When</p>
                                <div className="flex items-center gap-3 text-gray-900">
                                    <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                                    <span className="text-lg font-bold">{appointment.date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-900">
                                    <Clock className="w-5 h-5 text-[var(--color-primary)]" />
                                    <span className="text-lg font-bold">{appointment.time} - {appointment.endTime}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Where</p>
                                <p className="text-lg font-bold text-gray-900">{salonName}</p>
                                <p className="text-sm text-gray-500 italic">Central location, easy access</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client</p>
                                <p className="text-lg font-bold text-gray-900">{appointment.clientName}</p>
                                {appointment.clientPhone && <p className="text-sm text-gray-500">{appointment.clientPhone}</p>}
                            </div>
                        </div>

                        <div className="space-y-4 border-l border-gray-100 md:pl-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Services</p>
                            <div className="space-y-2">
                                {appointment.serviceIds.map((sid: number) => {
                                    const service = servicesList.find(s => s.id === sid);
                                    return (
                                        <div key={sid} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700">{service?.name || "Service"}</span>
                                            <span className="font-bold text-[var(--color-primary)]">€{service?.price || 0}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {manageTeam.canView && (
                                <button
                                    onClick={() => onEdit(appointment, 3)}
                                    className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity mt-3"
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    Manage Team
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Interaction History (Admins only) */}
                    {isAdmin && appointment.interactionHistory.length > 0 && (
                        <div className="space-y-2 relative">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Trail</p>
                                {(appointment.interactionHistory.length > 5 || isMobile) && (
                                    <button
                                        onClick={() => setShowFullHistory(true)}
                                        className="text-xs font-bold text-[var(--color-primary)] hover:opacity-80 flex items-center gap-1 transition-opacity"
                                    >
                                        <History className="w-3 h-3" />
                                        {isMobile ? "View History" : "View All"}
                                    </button>
                                )}
                            </div>

                            {!isMobile && (
                                <div className="space-y-2">
                                    {appointment.interactionHistory.slice(-5).reverse().map((interaction) => (
                                        <div key={interaction.id} className="text-xs flex justify-between gap-4 border-b border-gray-50 pb-1">
                                            <span className="text-gray-500">{new Date(interaction.timestamp).toLocaleString()}</span>
                                            <span className="font-medium text-gray-700">{interaction.action} by {interaction.user}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Staff Comments */}
                    {appointment.comments.length > 0 && (
                        <div className="bg-[var(--color-primary-light)] p-4 rounded-xl space-y-3">
                            <h4 className="flex items-center gap-2 font-bold text-[var(--color-primary)]">
                                <MessageSquare className="w-4 h-4" />
                                {isAdmin ? "Internal Comments" : "Messages from the team"}
                            </h4>
                            <div className="space-y-3">
                                {appointment.comments.map((comment) => (
                                    <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-[var(--color-primary-light)]">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs text-[var(--color-primary)]">{comment.user}</span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(comment.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Full History Overlay - Now placed correctly to cover the whole content area */}
                    {showFullHistory && isAdmin && (
                        <div className="absolute inset-0 bg-white z-20 flex flex-col p-6 md:p-8 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[var(--color-primary-light)] rounded-lg">
                                        <History className="w-5 h-5 text-[var(--color-primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Audit Trail</h3>
                                        <p className="text-xs text-gray-500">Full chronological history</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFullHistory(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {appointment.interactionHistory.slice().reverse().map((interaction) => (
                                    <div key={interaction.id} className="flex gap-4 border-b border-gray-50 pb-3">
                                        <div className="text-[10px] text-gray-400 font-mono w-24 flex-shrink-0 pt-0.5">
                                            {new Date(interaction.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </div>
                                        <div className="text-sm">
                                            <p className="text-gray-800 leading-tight">
                                                {interaction.action}
                                            </p>
                                            <p className="text-[10px] mt-1 font-bold text-[var(--color-primary)] uppercase tracking-wider">
                                                By {interaction.user}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6 mt-4 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    className="w-full border-[var(--color-primary-light)] text-[var(--color-primary)] font-bold py-3"
                                    onClick={() => setShowFullHistory(false)}
                                >
                                    Back to Appointment details
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        {clientAction.canView && (
                            <>
                                <Button
                                    variant="success"
                                    className="flex-1 gap-2 font-bold"
                                    onClick={() => onApproveReschedule && onApproveReschedule(appointment.id)}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve Reschedule
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1 gap-2 font-bold"
                                    onClick={() => onRejectReschedule && onRejectReschedule(appointment.id, "Rejected by client")}
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </Button>
                            </>
                        )}

                        {valider.canView && onConfirm && appointment.status === 'Pending' && (
                            <Button
                                variant="success"
                                className="flex-1 gap-2 font-bold"
                                onClick={() => onConfirm(appointment.id)}
                                disabled={!valider.isActif}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {!valider.isActif ? "Already Confirmed" : "Confirm Appointment"}
                            </Button>
                        )}
                        {modifier.canView && (
                            <Button
                                variant="outline"
                                className="flex-1 border-[var(--color-primary-light)] text-[var(--color-primary)] gap-2 font-bold"
                                onClick={() => onEdit(appointment)}
                                disabled={!modifier.isActif}
                            >
                                <Edit className="w-4 h-4" />
                                {isAdmin ? "Edit Appointment" : "Modify Appointment"}
                            </Button>
                        )}
                        {annuler.canView && (
                            <Button
                                variant="danger"
                                className="flex-1 gap-2 font-bold"
                                onClick={() => onCancel(appointment.id)}
                                disabled={!annuler.isActif}
                            >
                                <Trash2 className="w-4 h-4" />
                                {isAdmin ? "Cancel Appointment" : "Cancel Booking"}
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 justify-center text-xs text-gray-400 italic">
                        <AlertCircle className="w-3 h-3" />
                        {isAdmin ? "Changes are logged for audit purposes." : "Cancellations must be made at least 24h in advance."}
                    </div>
                </div>
            </Card>
        </div>
    );
}
