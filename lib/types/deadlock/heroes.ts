export interface HeroStatValue {
    value: number;
    display_stat_name: string;
}

export interface HeroStartingStats {
    max_move_speed: HeroStatValue;
    sprint_speed: HeroStatValue;
    crouch_speed: HeroStatValue;
    move_acceleration: HeroStatValue;
    light_melee_damage: HeroStatValue;
    heavy_melee_damage: HeroStatValue;
    max_health: HeroStatValue;
    weapon_power: HeroStatValue;
    reload_speed: HeroStatValue;
    weapon_power_scale: HeroStatValue;
    proc_build_up_rate_scale: HeroStatValue;
    stamina: HeroStatValue;
    base_health_regen: HeroStatValue;
    stamina_regen_per_second: HeroStatValue;
    ability_resource_max: HeroStatValue;
    ability_resource_regen_per_second: HeroStatValue;
    crit_damage_received_scale: HeroStatValue;
    tech_duration: HeroStatValue;
    tech_range: HeroStatValue;
    [key: string]: HeroStatValue;
}

export interface HeroImages {
    icon_hero_card: string;
    icon_hero_card_webp: string;
    icon_image_small: string;
    icon_image_small_webp: string;
    minimap_image: string;
    minimap_image_webp: string;
    hero_card_critical: string;
    hero_card_critical_webp: string;
    hero_card_gloat: string;
    hero_card_gloat_webp: string;
    top_bar_vertical_image: string;
    top_bar_vertical_image_webp: string;
    background_image: string;
    background_image_webp: string;
    name_image: string;
}

export interface HeroDescription {
    lore: string;
    role: string;
    playstyle: string;
}

export interface HeroItems {
    weapon_primary: string;
    weapon_melee: string;
    ability_mantle: string;
    ability_jump: string;
    ability_slide: string;
    ability_zip_line: string;
    ability_zip_line_boost: string;
    ability_climb_rope: string;
    ability_innate1: string;
    ability_innate2: string;
    ability_innate3: string;
    signature1: string;
    signature2: string;
    signature3: string;
    signature4: string;
    [key: string]: string;
}

export interface HeroItemSlotTier {
    max_purchases_for_tier: number[];
}

export interface HeroItemSlotInfo {
    weapon: HeroItemSlotTier;
    vitality: HeroItemSlotTier;
    spirit: HeroItemSlotTier;
}

export interface HeroPhysics {
    stealth_speed_meters_per_second: number;
}

export interface HeroShopStatDisplayGroup {
    display_stats: string[];
    other_display_stats?: string[];
}

export interface HeroShopStatDisplay {
    spirit_stats_display: HeroShopStatDisplayGroup;
    vitality_stats_display: HeroShopStatDisplayGroup;
    weapon_stats_display?: HeroShopStatDisplayGroup;
}

export interface DeadlockHero {
    id: number;
    class_name: string;
    name: string;
    description: HeroDescription;
    player_selectable: boolean;
    disabled: boolean;
    in_development: boolean;
    needs_testing: boolean;
    assigned_players_only: boolean;
    tags: string[];
    gun_tag: string;
    hideout_rich_presence: string;
    hero_type: string;
    prerelease_only: boolean;
    limited_testing: boolean;
    complexity: number;
    skin: number;
    images: HeroImages;
    items: HeroItems;
    starting_stats: HeroStartingStats;
    item_slot_info: HeroItemSlotInfo;
    physics: HeroPhysics;
    colors: { ui: [number, number, number] };
    shop_stat_display: HeroShopStatDisplay;
}
