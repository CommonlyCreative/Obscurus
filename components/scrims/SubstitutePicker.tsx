"use client";

import { ArrayElement } from "@/lib/utils";
import { UserRoundPlus } from "lucide-react";
import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";

export interface SubstituteCandidate {
    _id: string;
    name: string;
    organization: { _id: string; name: string } | null;
}

type GroupedCandidates = { key: string; label: string; items: SubstituteCandidate[] }[];

function groupCandidates(candidates: SubstituteCandidate[]): GroupedCandidates {
    const freeAgents = candidates.filter((c) => !c.organization);
    const byOrg = new Map<string, { label: string; items: SubstituteCandidate[] }>();
    for (const c of candidates) {
        if (!c.organization) continue;
        const existing = byOrg.get(c.organization._id);
        if (existing) existing.items.push(c);
        else byOrg.set(c.organization._id, { label: c.organization.name, items: [c] });
    }
    const groups: GroupedCandidates = [];
    if (freeAgents.length > 0) groups.push({ key: "free-agents", label: "Free Agents", items: freeAgents });
    for (const [key, group] of byOrg) groups.push({ key, ...group });
    return groups;
}

// Search box for filling an open roster slot with a player from outside the org — a
// free agent or someone on another team's roster. Picking one adds them straight to
// the scrimmage roster (see the roster grid above this) — there's no separate bench;
// `candidates` should already exclude anyone currently on the roster.
export function SubstitutePicker({
    candidates,
    disabled,
    onAdd,
}: {
    candidates: SubstituteCandidate[];
    disabled?: boolean;
    onAdd: (candidate: SubstituteCandidate) => void;
}) {
    const groups = groupCandidates(candidates);

    return (
        <Combobox items={groups}>
            <ComboboxInput
                disabled={disabled}
                placeholder={disabled ? "Roster is full" : "Search free agents or players from other teams…"}
            >
                <InputGroupAddon>
                    <UserRoundPlus />
                </InputGroupAddon>
            </ComboboxInput>
            <ComboboxContent>
                <ComboboxEmpty>No players found.</ComboboxEmpty>
                <ComboboxList>
                    {(group: ArrayElement<GroupedCandidates>, index: number) => (
                        <ComboboxGroup key={group.key} items={group.items}>
                            <ComboboxLabel>{group.label}</ComboboxLabel>
                            <ComboboxCollection>
                                {(item: SubstituteCandidate) => (
                                    <ComboboxItem
                                        className="data-highlighted:bg-accent/10"
                                        key={item._id}
                                        value={item.name}
                                        onClick={() => onAdd(item)}
                                    >
                                        {item.name}
                                    </ComboboxItem>
                                )}
                            </ComboboxCollection>
                            {index < groups.length - 1 && <ComboboxSeparator />}
                        </ComboboxGroup>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
