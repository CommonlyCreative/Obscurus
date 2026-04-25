"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { disconnectSteamAction } from "@/app/profile/[id]/edit/actions";

export function DisconnectSteamButton({ userId }: { userId: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    function handleDisconnect() {
        startTransition(async () => {
            await disconnectSteamAction(userId);
            router.refresh();
        });
    }

    return (
        <button
            onClick={handleDisconnect}
            disabled={pending}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
            {pending ? "Disconnecting…" : "Disconnect"}
        </button>
    );
}
