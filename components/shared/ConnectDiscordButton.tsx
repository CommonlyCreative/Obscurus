"use client"

import { authClient } from "@/lib/database/auth-client"
import { Button } from "./Button"
import { DiscordIcon } from "./DiscordIcon"
import { toast } from "sonner"

function ConnectDiscordButton({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
    return (
        <Button onClick={async () => {
            const { data, error } = await authClient.signIn.social({
                provider: "discord",
                callbackURL: "/",
            });
            if (error)
                toast.error(error.message);
        }} variant="discord" size={size}>
            <DiscordIcon />
            Connect Discord
        </Button>
    )
}

export default ConnectDiscordButton
