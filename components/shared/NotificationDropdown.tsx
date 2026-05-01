"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrayElement, cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/utils";
import { dismissNotification, getAllNotifications } from "@/app/actions";
import { GetNotificationsQuery } from "@/app/api/graphql/types/graphql";
import { toast } from "sonner";
import { socket } from "@/lib/socket/socket-client";

type Notifications = GetNotificationsQuery["getNotifications"]
type Notification = ArrayElement<Notifications>

function BellIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
                d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5v2.75L2 10.5h12l-1.5-1.75V6A4.5 4.5 0 0 0 8 1.5z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
            />
            <path
                d="M6.5 12.5a1.5 1.5 0 0 0 3 0"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function NotificationRow({
    n,
    onDismiss,
    onClose,
}: {
    n: Notification;
    onDismiss: (id: string) => void;
    onClose: () => void;
}) {
    const isInvitation = n.type === "INVITATION";
    const dot = (
        <div
            className={cn(
                "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                isInvitation ? "bg-primary" : "bg-edge",
            )}
        />
    );

    const meta = (
        <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-foreground leading-tight">{n.title}</span>
                <span className="text-[10px] text-muted shrink-0 mt-0.5">
                    {formatTimeAgo(new Date(n.createdAt))}
                </span>
            </div>
            <p className="text-xs text-dimmed mt-0.5 leading-relaxed">{n.description}</p>
            <p className="text-[10px] text-muted mt-1">From {n.senderName}</p>
        </div>
    );

    if (n.link || isInvitation) {
        return (
            <div className="group flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                {dot}
                <Link
                    href={n.link ?? `/profile/${n.recipient}`}
                    className="flex-1 min-w-0"
                    onClick={() => {
                        if (!isInvitation) onDismiss(n._id);
                        onClose();
                    }}
                >
                    {meta}
                </Link>
                <button
                    onClick={() => onDismiss(n._id)}
                    className="shrink-0 text-muted hover:text-foreground transition-colors mt-0.5 opacity-0 group-hover:opacity-100"
                    aria-label="Dismiss"
                >
                    <CloseIcon />
                </button>
            </div>
        );
    }

    return (
        <div className="group flex items-start gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
            {dot}
            <div className="flex-1 min-w-0">{meta}</div>
            <button
                onClick={() => onDismiss(n._id)}
                className="shrink-0 text-muted hover:text-foreground transition-colors mt-0.5 opacity-0 group-hover:opacity-100"
                aria-label="Dismiss"
            >
                <CloseIcon />
            </button>
        </div>
    );
}

export function NotificationDropdown({ userId }: { userId: string }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notifications | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }

        function handleNotification(data: Notification) {
            setNotifications(prev => [...(prev ?? []), data]);
        };

        (async function () {
            const notifications = await getAllNotifications(userId);
            setNotifications(notifications);
        })();

        socket.on("notify", handleNotification);

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            socket.off("notify", handleNotification);
        }
    }, []);

    async function dismiss(id: string) {
        const { dismissNotification: dismiss } = await dismissNotification(id, userId);
        if (dismiss) {
            setNotifications(prev => (prev ?? []).filter(n => n._id !== id));
        } else toast.error("There was an issue dismissing notification.")
    }

    const loading = notifications === null;
    const count = notifications?.length ?? 0;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="relative cursor-pointer flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface transition-colors text-muted hover:text-foreground"
                aria-label="Notifications"
            >
                <BellIcon />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-primary text-background text-[10px] font-black flex items-center justify-center px-0.5 leading-none">
                        {count > 9 ? "9+" : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-80 bg-surface border border-edge rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-edge flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Notifications</span>
                        {!loading && count > 0 && (
                            <span className="text-xs text-muted">{count} unread</span>
                        )}
                    </div>

                    {loading ? (
                        <div className="divide-y divide-edge">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3">
                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-edge animate-pulse" />
                                    <div className="flex-1 space-y-2 pt-0.5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="h-2.5 rounded bg-edge animate-pulse" style={{ width: `${55 + i * 12}%` }} />
                                            <div className="h-2 w-8 rounded bg-edge animate-pulse shrink-0" />
                                        </div>
                                        <div className="h-2 rounded bg-edge animate-pulse" style={{ width: `${80 - i * 8}%` }} />
                                        <div className="h-2 w-16 rounded bg-edge animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications!.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-xs text-muted">You're all caught up.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-edge max-h-96 overflow-y-auto no-scrollbar">
                            {notifications.sort((a, b) => b.createdAt - a.createdAt).map(n => (
                                <NotificationRow
                                    key={n._id}
                                    n={n}
                                    onDismiss={dismiss}
                                    onClose={() => setOpen(false)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
