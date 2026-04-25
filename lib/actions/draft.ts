import { Hero } from "../deadlock";

enum Turn {
    ONE_PICK,
    ONE_BAN,
    TWO_BAN,
    TWO_PICK
}

class Draft {
    private banTurns: number[] | undefined;
    private teamOne: Team;
    private teamTwo: Team;

    constructor(banTurns: number[] | undefined) {
        this.banTurns = banTurns;
        this.teamOne = new Team();
        this.teamTwo = new Team();
    }

    hasBans() {
        return !!this.banTurns;
    }

    getNextTeam() {
        return this.teamOne.getTurnOrder() == this.teamTwo.getTurnOrder() ? this.teamOne : this.teamTwo;
    }

    isBanTurn(x: number) {
        return this.hasBans() && this.banTurns!.includes(x);
    }

    determineTurn() {
        let team = this.getNextTeam();

        if (team.isFinished())return;

        return this.isBanTurn(team.getTurnOrder()) ? team.getBans() : team.getPicks();
    }
}

class Team {
    private picks: Hero[];
    private bans: Hero[];

    constructor() {
        this.picks = [];
        this.bans = [];
    }

    getBans() {
        return this.bans;
    }

    getPicks() {
        return this.picks;
    }

    getTurnOrder() {
        return this.picks.length + this.bans.length;
    }

    isFinished() {
        return this.picks.length == 6;
    }
}