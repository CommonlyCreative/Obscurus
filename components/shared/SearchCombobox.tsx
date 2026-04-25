"use client"

import { useRouter } from "next/navigation";
import { Search, User, Building2 } from "lucide-react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxCollection,
    ComboboxEmpty,
    ComboboxSeparator,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";

export type SearchPlayerItem = { _id: string; name: string; type: "player" };
export type SearchOrgItem = { _id: string; name: string; type: "org"; slug: string };
export type SearchItem = SearchPlayerItem | SearchOrgItem;

export type SearchGroup = {
    label: string;
    sectionType: "players" | "orgs";
    items: SearchItem[];
};

function getHref(item: SearchItem): string {
    if (item.type === "player") return `/profile/${item._id}`;
    return `/org/${item.slug}`;
}

export function SearchCombobox({ groups }: { groups: SearchGroup[] }) {
    const router = useRouter();

    return (
        <Combobox items={groups}>
            <ComboboxInput
                className="w-full"
                placeholder="Search players and organizations..."
                showTrigger={false}
                showClear
            >
                <InputGroupAddon>
                    <Search className="size-4 text-muted" />
                </InputGroupAddon>
            </ComboboxInput>
            <ComboboxContent>
                <ComboboxEmpty>No results found.</ComboboxEmpty>
                <ComboboxList>
                    {(group: SearchGroup) => (
                        <ComboboxGroup key={group.label} items={group.items}>
                            {group.sectionType === "orgs" && <ComboboxSeparator />}
                            <ComboboxLabel>{group.label}</ComboboxLabel>
                            <ComboboxCollection>
                                {(item: SearchItem) => (
                                    <ComboboxItem
                                        key={item._id}
                                        value={item.name}
                                        className="data-highlighted:bg-accent/10 cursor-pointer"
                                        onClick={() => router.push(getHref(item))}
                                    >
                                        {item.type === "player"
                                            ? <User className="size-3.5 text-muted shrink-0" />
                                            : <Building2 className="size-3.5 text-muted shrink-0" />
                                        }
                                        {item.name}
                                    </ComboboxItem>
                                )}
                            </ComboboxCollection>
                        </ComboboxGroup>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
