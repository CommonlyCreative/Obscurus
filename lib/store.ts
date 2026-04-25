import { add } from 'lodash';
import { create } from 'zustand'
import { User } from './database/auth';

type TeamState = {
    team: Team;
    isConstructed: boolean;

    setLeader: (leader: User | null) => void;
    addMember: (member: User) => void;
    removeAllMembers: () => void;
    updateMembers: (newMembers: User[]) => void;
    createTeam: (leader: User) => void;
    joinTeam: (team: Team, member: User) => void;
}

type Team = {
    leader: User | null;
    members: User[];
}

export const useTeam = create<TeamState>((set) => ({
    team: {
        leader: null,
        members: [],
    },
    isConstructed: false,

    createTeam: (leader: User) => set({ team: { leader, members: [leader] }, isConstructed: true }),
    joinTeam: (team: Team) => set((state: TeamState) => ({ team })),
    setLeader: (leader: User | null) => set((state: TeamState) => ({ team: { ...state.team, leader } })),
    addMember: (member: User) => set((state: TeamState) => ({ team: { ...state.team, members: [...state.team.members, member] } })),
    removeAllMembers: () => set((state: TeamState) => ({ team: { ...state.team, members: [] } })),
    updateMembers: (newMembers: User[]) => set((state: TeamState) => ({ team: { ...state.team, members: newMembers } })),
}))