"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket/socket-client";
import type { LiveTeam } from "@/lib/socket/teams";

export function useLiveTeams() {
  const [teams, setTeams] = useState<LiveTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleListed = (data: LiveTeam[]) => {
      setTeams(data);
      setLoading(false);
    };

    socket.on("teams:listed", handleListed);
    socket.emit("teams:list");

    return () => {
      socket.off("teams:listed", handleListed);
    };
  }, []);

  function refresh() {
    setLoading(true);
    socket.emit("teams:list");
  }

  return { teams, loading, refresh };
}
