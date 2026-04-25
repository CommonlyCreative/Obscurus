// ─── Deadlock match metadata types ───────────────────────────────────────────

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface DeathDetail {
    game_time_s: number;
    time_to_kill_s: number;
    killer_player_slot: number;
    death_pos: Vec3;
    killer_pos: Vec3;
    death_duration_s: number;
}

export interface ItemPurchase {
    game_time_s: number;
    item_id: number;
    upgrade_id: number;
    sold_time_s: number;
    flags: number;
    imbued_ability_id: number;
    upgrade_info: number;
}

export interface GoldSource {
    source: number;
    kills: number | null;
    damage: number | null;
    gold: number;
    gold_orbs: number | null;
}

export interface CustomUserStat {
    id: number;
    value: number;
}

export interface PlayerStat {
    time_stamp_s: number;
    net_worth: number;
    gold_player: number;
    gold_player_orbs: number;
    gold_lane_creep_orbs: number;
    gold_neutral_creep_orbs: number;
    gold_boss: number;
    gold_boss_orb: number;
    gold_treasure: number;
    gold_denied: number;
    gold_death_loss: number;
    gold_lane_creep: number;
    gold_neutral_creep: number;
    kills: number;
    deaths: number;
    assists: number;
    creep_kills: number;
    neutral_kills: number;
    possible_creeps: number;
    creep_damage: number;
    player_damage: number;
    neutral_damage: number;
    boss_damage: number;
    denies: number;
    player_healing: number;
    ability_points: number;
    self_healing: number;
    player_damage_taken: number;
    max_health: number;
    weapon_power: number;
    tech_power: number;
    shots_hit: number;
    shots_missed: number;
    damage_absorbed: number;
    absorption_provided: number;
    hero_bullets_hit: number;
    hero_bullets_hit_crit: number;
    heal_prevented: number;
    heal_lost: number;
    damage_mitigated: number;
    level: number;
    player_barriering: number;
    teammate_healing: number;
    teammate_barriering: number;
    self_damage: number;
    bullet_kills: number;
    melee_kills: number;
    ability_kills: number;
    headshot_kills: number;
    gold_sources: GoldSource[];
    custom_user_stats: CustomUserStat[];
}

export interface AbilityStat {
    ability_id: number;
    ability_value: number;
}

export interface Accolade {
    accolade_id: number;
    accolade_stat_value: number;
    accolade_threshold_achieved: number;
}

export interface Ping {
    ping_type: number;
    ping_data: number;
    game_time_s: number;
}

export interface PowerUpBuff {
    type: string;
    value: number;
    is_permanent: boolean;
}

export interface HeroData {
    hero_xp: number;
    hero_equips: unknown | null;
}

export interface MatchPlayer {
    account_id: number;
    player_slot: number;
    team: number;
    kills: number;
    deaths: number;
    assists: number;
    net_worth: number;
    hero_id: number;
    last_hits: number;
    denies: number;
    ability_points: number;
    assigned_lane: number;
    level: number;
    rewards_eligible: boolean;
    abandon_match_time_s: number | null;
    mvp_rank: number | null;
    earned_holiday_award_2025: unknown | null;
    hero_data: HeroData;
    death_details: DeathDetail[];
    items: ItemPurchase[];
    stats: PlayerStat[];
    ability_stats: AbilityStat[];
    stats_type_stat: number[];
    book_rewards: unknown[];
    player_tracked_stats: unknown[];
    accolades: Accolade[];
    pings: Ping[];
    power_up_buffs: PowerUpBuff[];
}

export interface Objective {
    legacy_objective_id: number | null;
    destroyed_time_s: number;
    creep_damage: number;
    creep_damage_mitigated: number | null;
    player_damage: number;
    player_damage_mitigated: number | null;
    first_damage_time_s: number;
    team_objective_id: number;
    team: number;
    player_spirit_damage: number;
}

export interface MatchPause {
    game_time_s: number;
    pause_duration_s: number;
    player_slot: number;
}

export interface MatchCustomUserStat {
    id: number;
    name: string;
}

export interface MidBoss {
    team_killed: number;
    team_claimed: number;
    destroyed_time_s: number;
}

export interface Team {
    team: number;
    team_tracked_stats: unknown[];
}

export interface DamageToPlayer {
    target_player_slot: number;
    damage: number[];
}

export interface DamageSource {
    damage_to_players: DamageToPlayer[];
    source_details_index: number;
}

export interface DamageDealer {
    dealer_player_slot: number;
    damage_sources: DamageSource[];
}

export interface DamageMatrix {
    damage_dealers: DamageDealer[];
    sample_time_s: number[];
    source_details: unknown[];
}

export interface PlayerPath {
    player_slot: number;
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    x_pos: number[];
    y_pos: number[];
}

export interface MatchPaths {
    version: number;
    interval_s: number;
    x_resolution: number;
    y_resolution: number;
    paths: PlayerPath[];
}

export interface MatchInfo {
    duration_s: number;
    match_outcome: number;
    winning_team: number;
    start_time: number;
    match_id: number;
    legacy_objectives_mask: unknown | null;
    game_mode: number;
    match_mode: number;
    objectives: Objective[];
    match_paths: MatchPaths;
    damage_matrix: DamageMatrix;
    match_pauses: MatchPause[];
    custom_user_stats: MatchCustomUserStat[];
    watched_death_replays: unknown[];
    objectives_mask_team0: number;
    objectives_mask_team1: number;
    mid_boss: MidBoss[];
    is_high_skill_range_parties: boolean;
    low_pri_pool: boolean;
    new_player_pool: boolean;
    average_badge_team0: number;
    average_badge_team1: number;
    game_mode_version: number;
    rewards_eligible: boolean;
    not_scored: boolean;
    team_score: unknown[];
    match_tracked_stats: unknown[];
    teams: Team[];
    bot_difficulty: number;
    street_brawl_rounds: unknown[];
    players: MatchPlayer[];
}

export interface DeadlockMatch {
    match_info: MatchInfo;
    hero_build_ids: Record<string, unknown>;
    banned_hero_ids: number[];
}
