import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId, WithId } from "mongodb";
import { DBCustomer } from "./datasources/customer";
import { DBScrimmage, DBTeam } from "./datasources/scrimmage";
import { DBUser } from "./datasources/user";
import { DBOrganization, DBOrganizationMember } from "./datasources/organization";
import { DBStripeEvent } from "./datasources/stripe-event";
import { DBWager, DBCreditTransaction, DBCreditPurchase } from "./datasources/wager";
import { DBTransaction } from "./datasources/transaction";
import {
    User, Scrimmage, Match, Transaction, Organization, OrganizationMember,
    Wager, CreditTransaction, CreditPurchase, StripeEvent,
    WagerStatus, CreditTxType, MatchSide, ScrimmageResult,
    Resolvers,
    Customer,
    ScrimmageStatus,
    OrgRequest,
} from "./server";
import { asyncMap } from "@/lib/utils";
import { getStatlockerRank } from "@/lib/actions/deadlockapi";
import { convertSteam64toSteam32, getRankByMMR } from "@/lib/deadlock";

const TimestampScalar = new GraphQLScalarType({
    name: "Timestamp",
    description: "Unix milliseconds as an integer",
    serialize(value) {
        if (typeof value === "number") return Math.trunc(value);
        if (value instanceof Date) return value.getTime();
        throw new Error("Timestamp must be a number or Date");
    },
    parseValue(value) {
        if (typeof value === "number") return Math.trunc(value);
        throw new Error("Timestamp must be a number");
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) return parseInt(ast.value, 10);
        throw new Error("Timestamp literal must be an integer");
    },
});

export const resolvers: Resolvers = {

    Timestamp: TimestampScalar,

    // =========================================================================
    // Field resolvers — User
    // =========================================================================
    User: {
        scrimmages: async (parent, _, { dataSources: { scrimmages } }) => {
            const user = parent as any as DBUser;
            try {
                
                return (await Promise.all(user.scrimmages.map(scrimmage_id => scrimmages.getGraphQLScrimmage(scrimmage_id)))).filter((x): x is WithId<Scrimmage> => !!x)
            } catch (error) {
                throw new Error(`Failed to fetch scrimmages for user ${user._id}: ${error}`);
            }
        },
        stats: async (parent, _, { dataSources: { users } }) => {
            const user = parent as any as DBUser;
            if (!user.steam)return null;
            const stat = await getStatlockerRank(convertSteam64toSteam32(user.steam.id))
            if (!stat)return null;
            const rankDisplay = getRankByMMR(stat.averageMatchRankNumber)
            if (!rankDisplay)return null;
            return { mmr: stat.averageMatchRankNumber, ...rankDisplay }
        },
        organization: async (parent, _, { dataSources: { organizations } }) => {
            const user = parent as any as DBUser;
            if (!user.organization)return null;
            return organizations.getOrganization(user.organization) as any as Promise<WithId<Organization> | null>
        },
    },

    // =========================================================================
    // Field resolvers — Scrimmage / Team / Match
    // =========================================================================
    Scrimmage: {
        host: async (parent, _, { dataSources: { users } }) => {
            const scrimmage = parent as any as DBScrimmage;
            const user = await users.getGraphQLUser(scrimmage.host);
            if (!user) throw new Error("Failed to fetch scrimmage host");
            return user;
        },
        hostOrg: async (parent, _, { dataSources: { organizations } }) => {
            const scrimmage = parent as any as DBScrimmage;
            if (!scrimmage.hostOrg) return null;
            return organizations.getOrganization(scrimmage.hostOrg) as any as Promise<WithId<Organization> | null>;
        },
        opponentOrg: async (parent, _, { dataSources: { organizations } }) => {
            const scrimmage = parent as any as DBScrimmage;
            if (!scrimmage.opponentOrg) return null;
            return organizations.getOrganization(scrimmage.opponentOrg) as any as Promise<WithId<Organization> | null>;
        },
        opponentTeam: (parent) => {
            const scrimmage = parent as any as DBScrimmage;
            return (scrimmage.opponentTeam ?? null) as any;
        },
        result: (parent) => {
            const scrimmage = parent as any as DBScrimmage;
            return (scrimmage.result ?? null) as ScrimmageResult | null;
        },
        readyHost: (parent) => !!(parent as any as DBScrimmage).readyHost,
        readyOpponent: (parent) => !!(parent as any as DBScrimmage).readyOpponent,
        partyCode: (parent) => (parent as any as DBScrimmage).partyCode ?? null,
        invitations: (parent) => {
            const scrim = parent as any as DBScrimmage;
            return (scrim.invitations ?? []).map(inv => ({
                ...inv,
                _scrimmageId: scrim._id.toString(),
            })) as any;
        },
    },
    Team: {
        leader: async (parent, _, { dataSources: { users } }) => {
            const team = parent as any as DBTeam;
            const user = await users.getGraphQLUser(team.leader);
            if (!user) throw new Error("Failed to fetch team leader");
            return user;
        },
        members: async (parent, _, { dataSources: { users } }) => {
            const team = parent as any as DBTeam;
            return Promise.all(
                team.members.map(async (user_id) => {
                    const user = await users.getGraphQLUser(user_id);
                    if (!user) throw new Error(`Failed to fetch team member ${user_id}`);
                    return user;
                })
            );
        },
    },

    // =========================================================================
    // Field resolvers — Customer
    // =========================================================================
    Customer: {
        user: async (parent, _, { dataSources: { users } }) => {
            const customer = parent as any as DBCustomer;
            const user = await users.getGraphQLUser(customer.user);
            if (!user) throw new Error("Failed to fetch customer user");
            return user;
        },
    },

    // =========================================================================
    // Field resolvers — Transaction / StripeEvent
    // =========================================================================
    Transaction: {
        customer: async (parent, _, { dataSources: { customers } }) => {
            const transaction = parent as any as DBTransaction;
            if (!transaction.customer) return null;
            const customer = await customers.getGraphQLCustomer(transaction.customer);
            if (!customer) throw new Error("Failed to fetch transaction customer");
            return customer;
        },
    },
    StripeEvent: {
        relatedTransaction: async (parent, _, { dataSources: { transactions } }) => {
            const event = parent as any as DBStripeEvent;
            if (!event.relatedTransaction) return null;
            const tx = await transactions.getTransaction(event.relatedTransaction);
            return tx as any as Transaction ?? null;
        },
    },

    // =========================================================================
    // Field resolvers — Organization
    // =========================================================================
    Organization: {
        owner: async (parent, _, { dataSources: { users } }) => {
            const org = parent as any as DBOrganization;
            const user = await users.getGraphQLUser(org.owner);
            if (!user) throw new Error("Failed to fetch org owner");
            return user;
        },
        members: (parent) => {
            const org = parent as any as DBOrganization;
            return org.members as any as OrganizationMember[];
        },
        coreTeam: async (parent, _, { dataSources: { users } }) => {
            const org = parent as any as DBOrganization;
            if (!org.coreTeam?.length) return [];
            return Promise.all(
                org.coreTeam.map(async (id) => {
                    const user = await users.getGraphQLUser(id);
                    if (!user) throw new Error(`Core team player ${id} not found`);
                    return user;
                })
            );
        },
    },
    OrganizationMember: {
        user: async (parent, _, { dataSources: { users } }) => {
            const member = parent as any as DBOrganizationMember;
            const user = await users.getGraphQLUser(member.user);
            if (!user) throw new Error("Failed to fetch member user");
            return user;
        },
    },
    OrgRequest: {
        user: async (parent, _, { dataSources: { users } }) => {
            const req = parent as any as { user: string };
            const user = await users.getGraphQLUser(req.user);
            if (!user) throw new Error("Failed to fetch org request user");
            return user;
        },
    },

    // =========================================================================
    // Field resolvers — ScrimmageInvitation
    // =========================================================================
    ScrimmageInvitation: {
        scrimmage: async (parent, _, { dataSources: { scrimmages } }) => {
            const inv = parent as any;
            const scrimmageId = inv._scrimmageId;
            const s = await scrimmages.getGraphQLScrimmage(scrimmageId);
            if (!s) throw new Error("Invitation scrimmage not found");
            return s;
        },
        user: async (parent, _, { dataSources: { users } }) => {
            const inv = parent as any as { user: string };
            const user = await users.getGraphQLUser(inv.user);
            if (!user) throw new Error("Failed to fetch invitation user");
            return user;
        },
        organization: async (parent, _, { dataSources: { organizations } }) => {
            const inv = parent as any as { organization: string };
            const org = await organizations.getOrganization(inv.organization)
            return org as any as WithId<Organization> | null;
        },
    },

    // =========================================================================
    // Field resolvers — Wager / CreditTransaction / CreditPurchase
    // =========================================================================
    Wager: {
        scrimmage: async (parent, _, { dataSources: { scrimmages } }) => {
            const wager = parent as any as DBWager;
            const s = await scrimmages.getGraphQLScrimmage(wager.scrimmage);
            if (!s) throw new Error("Failed to fetch wager scrimmage");
            return s;
        },
        leader: async (parent, _, { dataSources: { users } }) => {
            const wager = parent as any as DBWager;
            const user = await users.getGraphQLUser(wager.leader);
            if (!user) throw new Error("Failed to fetch wager leader");
            return user;
        },
    },
    CreditTransaction: {
        user: async (parent, _, { dataSources: { users } }) => {
            const tx = parent as any as DBCreditTransaction;
            const user = await users.getGraphQLUser(tx.user);
            if (!user) throw new Error("Failed to fetch credit transaction user");
            return user;
        },
        wager: async (parent, _, { dataSources: { wagers } }) => {
            const tx = parent as any as DBCreditTransaction;
            if (!tx.wager) return null;
            return wagers.getWager(tx.wager) as any as Promise<Wager | null>;
        },
        stripeTransaction: async (parent, _, { dataSources: { transactions } }) => {
            const tx = parent as any as DBCreditTransaction;
            if (!tx.stripeTransaction) return null;
            return transactions.getTransaction(tx.stripeTransaction) as any as Promise<Transaction | null>;
        },
    },
    CreditPurchase: {
        user: async (parent, _, { dataSources: { users } }) => {
            const purchase = parent as any as DBCreditPurchase;
            const user = await users.getGraphQLUser(purchase.user);
            if (!user) throw new Error("Failed to fetch credit purchase user");
            return user;
        },
        stripeTransaction: async (parent, _, { dataSources: { transactions } }) => {
            const purchase = parent as any as DBCreditPurchase;
            const tx = await transactions.getTransaction(purchase.stripeTransaction);
            if (!tx) throw new Error("Failed to fetch credit purchase stripe transaction");
            return tx as any as Transaction;
        },
        creditTransaction: async (parent, _, { dataSources: { wagers } }) => {
            const purchase = parent as any as DBCreditPurchase;
            const tx = await wagers.getCreditTransaction(purchase.creditTransaction);
            if (!tx) throw new Error("Failed to fetch credit purchase credit transaction");
            return tx as any as CreditTransaction;
        },
    },

    // =========================================================================
    // Queries
    // =========================================================================
    Query: {
        // --- Users ---
        getUsers: async (_, __, { dataSources: { users } }) => {
            return users.getUsers().map(p => p as any as User).toArray();
        },
        getUser: async (_, { user_id }, { dataSources: { users } }) => {
            const user = await users.getGraphQLUser(user_id);
            return user;
        },
        hasUser: async (_, { user_id }, { dataSources: { users } }) => {
            return !!user_id && !!(await users.getUserByUserId(user_id));
        },
        getCustomer: async (_, { user_id }, { dataSources: { customers } }) => {
            return customers.getCustomerByProfile(user_id) as any as Promise<WithId<Customer> | null>;
        },
        getUserBySteamId: async (_, { steam_id }, { dataSources: { users } }) => {
            return users.getUserFrom({ "steam.id": steam_id }) as any as Promise<WithId<User> | null>;
        },

        // --- Scrimmages ---
        getScrimmages: async (_, { status, limit }, { dataSources: { scrimmages } }) => {
            const scrims = await scrimmages.getScrimmages().map(s => s as any as WithId<Scrimmage>).limit(limit ?? 0).toArray();
            return scrims.filter(scrim => !status || scrim.status === status);
        },
        getScrimmage: async (_, { scrimmage_id }, { dataSources: { scrimmages } }) => {
            const s = await scrimmages.getGraphQLScrimmage(scrimmage_id);
            if (!s) throw new Error(`Scrimmage ${scrimmage_id} not found`);
            return s;
        },
        getOrgScrimmages: async (_, { org_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.getOrgScrimmages(org_id) as any as Promise<WithId<Scrimmage>[]>;
        },

        // --- Transactions ---
        getTransactions: (_, __, { dataSources: { transactions } }) => {
            return transactions.getTransactions().map(t => t as any as WithId<Transaction>).toArray();
        },
        getTransaction: async (_, { transaction_id }, { dataSources: { transactions } }) => {
            return transactions.getTransaction(transaction_id) as any as Promise<WithId<Transaction> | null>;
        },
        getCustomerTransactions: async (_, { customer_id }, { dataSources: { transactions } }) => {
            return transactions.getCustomerTransactions(customer_id) as any as Promise<WithId<Transaction>[]>;
        },
        getStripeEvent: async (_, { stripe_event_id }, { dataSources: { stripeEvents } }) => {
            return stripeEvents.getStripeEvent(stripe_event_id) as any as Promise<WithId<StripeEvent> | null>;
        },

        // --- Organizations ---
        getUserOrgInvitations: async (_, { user_id }, { dataSources: { organizations } }) => {
            return organizations.getUserOrgInvitations(user_id) as any as Promise<Organization[]>;
        },
        searchOrganizations: async (_, { query, limit }, { dataSources: { organizations } }) => {
            return organizations.searchOrganizations(query, limit ?? undefined) as any as Promise<Organization[]>;
        },
        getOrganization: async (_, { org_id }, { dataSources: { organizations } }) => {
            return organizations.getOrganization(org_id) as any as Promise<WithId<Organization> | null>;
        },
        getOrganizationBySlug: async (_, { slug }, { dataSources: { organizations } }) => {
            return organizations.getOrganizationBySlug(slug) as any as Promise<WithId<Organization> | null>;
        },
        getOrganizationMembers: async (_, { org_id }, { dataSources: { organizations } }) => {
            return organizations.getOrganizationMembers(org_id) as any as Promise<OrganizationMember[]>;
        },
        getOrganizations: async (_, __, { dataSources: { organizations } }) => {
            return organizations.getOrganizations() as any as Promise<Organization[]>;
        },

        // --- Org Requests ---
        getMyOrgRequest: async (_, { user_id }, { dataSources: { orgRequests } }) => {
            return (orgRequests as any).getUserRequest(user_id);
        },
        getOrgRequests: async (_, { status }, { dataSources: { orgRequests } }) => {
            return (orgRequests as any).getRequests(status ?? undefined);
        },

        // --- Scrimmage Invitations ---
        getScrimmageInvitations: async (_, { user_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.getScrimmageInvitations(user_id) as any;
        },

        // --- Notifications ---
        getNotifications: async (_, { user_id }, { dataSources: { notifications } }) => {
            return notifications.getNotifications(user_id) as any;
        },

        // --- Wagers ---
        getWager: async (_, { wager_id }, { dataSources: { wagers } }) => {
            return wagers.getWager(wager_id) as any as Promise<Wager | null>;
        },
        getScrimmageWagers: async (_, { scrimmage_id }, { dataSources: { wagers } }) => {
            return wagers.getScrimmageWagers(scrimmage_id) as any as Promise<WithId<Wager>[]>;
        },
        getUserWagers: async (_, { user_id }, { dataSources: { wagers } }) => {
            return wagers.getProfileWagers(user_id) as any as Promise<WithId<Wager>[]>;
        },
        getCreditTransactions: async (_, { user_id, limit }, { dataSources: { wagers } }) => {
            return wagers.getCreditTransactions(user_id, limit ?? undefined) as any as Promise<WithId<CreditTransaction>[]>;
        },
        getCreditBalance: async (_, { user_id }, { dataSources: { users } }) => {
            const user = await users.getGraphQLUser(user_id);
            if (!user) throw new Error(`User ${user_id} not found`);
            return user.balance.credits;
        },
        getCreditPurchases: async (_, { user_id }, { dataSources: { wagers } }) => {
            return wagers.getCreditPurchases(user_id) as any as Promise<WithId<CreditPurchase>[]>;
        },
    },

    // =========================================================================
    // Mutations
    // =========================================================================
    Mutation: {
        // --- Notifications ---
        addNotification: async (_, { input }, { dataSources: { notifications } }) => {
            const notification = await notifications.addNotification(input);
            return { ...notification, _id: notification._id.toString() };
        },
        dismissNotification: async (_, { notification_id, user_id }, { dataSources: { notifications } }) => {
            return await notifications.dismissNotification(notification_id, user_id);
        },
        // --- Users ---
        createUser: (_, { input }, { dataSources: { users } }) => {
            return users.createUser(input) as any as User;
        },
        updateUser: async (_, { user_id, input }, { dataSources: { users } }) => {
            return users.updateUserById(user_id, input) as any as Promise<User | null>;
        },
        setOnlineStatus: async (_, { user_id, online }, { dataSources: { users } }) => {
            return users.setOnlineStatus(user_id, online) as any as Promise<User | null>;
        },
        createCustomer: async (_, { input }, { dataSources: { customers } }) => {
            return customers.createCustomer(input) as any as Promise<Customer>;
        },

        // --- Scrimmages ---
        createScrimmage: (_, { input }, { dataSources: { scrimmages, users } }) => {
            const s = scrimmages.createScrimmage(input);
            input.team.forEach(id => users.addScrimmageToUser(id, s._id.toString()))
            if (!s) throw new Error("Failed to create scrimmage");
            return s as any as Scrimmage;
        },
        updateScrimmage: async (_, { scrimmage_id, input }, { dataSources: { scrimmages } }) => {
            return scrimmages.updateScrimmageById(scrimmage_id, input) as any;
        },
        cancelScrimmage: async (_, { scrimmage_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.cancelScrimmage(scrimmage_id) as any;
        },
        joinScrimmage: async (_, { scrimmage_id, org_id, team }, { dataSources: { scrimmages, users } }) => {
            team.forEach(member => {
                users.addScrimmageToUser(member, scrimmage_id)
            })
            return scrimmages.joinScrimmage(scrimmage_id, org_id ?? undefined, team) as any;
        },
        leaveScrimmage: async (_, { scrimmage_id }, { dataSources: { scrimmages, users } }) => {
            const { members: ids, scrim } = await scrimmages.leaveScrimmage(scrimmage_id)
            if (ids) {
                console.log("ids", ids)
                for (const id of ids) {
                    try {
                        const obj = new ObjectId(id)
                        users.removeScrimmageFromUser(obj, scrimmage_id)
                    } catch (err) {}
                }
            }
            return scrim as any as WithId<Scrimmage> | null;
        },
        acceptScrimmageChallenge: async (_, { scrimmage_id, user_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.acceptScrimmageChallenge(scrimmage_id, user_id) as any;
        },
        declineScrimmageChallenge: async (_, { scrimmage_id, user_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.declineScrimmageChallenge(scrimmage_id, user_id) as any;
        },
        setOpponentRoster: async (_, { input }, { dataSources: { scrimmages } }) => {
            const { scrimmage_id, leader_id, team } = input;
            return scrimmages.setOpponentRoster(scrimmage_id, leader_id, team) as any;
        },
        updateRosterSlot: async (_, { input }, { dataSources: { scrimmages } }) => {
            const { scrimmage_id, side, remove_id, replace_id } = input;
            return scrimmages.updateRosterSlot(scrimmage_id, side, remove_id, replace_id) as any;
        },
        readyUp: async (_, { scrimmage_id, side }, { dataSources: { scrimmages, users } }) => {
            const scrimmage = await scrimmages.readyUp(scrimmage_id, side);

            if (scrimmage?.status === ScrimmageStatus.Active) {
                scrimmage.opponentTeam?.members.forEach(id => users.addScrimmageToUser(id, scrimmage_id))
            }

            return scrimmage as any;
        },
        unready: async (_, { scrimmage_id, side }, { dataSources: { scrimmages } }) => {
            const scrimmage = scrimmages.unready(scrimmage_id, side)

            return scrimmage as any as Scrimmage;
        },
        setPartyCode: async (_, { scrimmage_id, partyCode }, { dataSources: { scrimmages } }) => {
            return scrimmages.setPartyCode(scrimmage_id, partyCode) as any;
        },
        startMatch: async (_, { scrimmage_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.startMatch(scrimmage_id) as any as Promise<WithId<Scrimmage> | null>;
        },
        cancelMatch: async (_, { scrimmage_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.cancelMatch(scrimmage_id) as any as Promise<WithId<Scrimmage> | null>;
        },
        submitMatchResult: async (_, { scrimmage_id, match_number, deadlock_match_id, result }, { dataSources: { scrimmages } }) => {
            return scrimmages.submitMatchResult(scrimmage_id, match_number, deadlock_match_id, result) as any;
        },
        endScrimmage: async (_, { scrimmage_id }, { dataSources: { scrimmages } }) => {
            return scrimmages.endScrimmage(scrimmage_id) as any;
        },

        // --- Transactions ---
        logTransaction: (_, { transaction }, { dataSources: { transactions } }) => {
            return transactions.createGraphQLTransaction(transaction);
        },
        updateTransaction: async (_, { transaction_id, input }, { dataSources: { transactions } }) => {
            const tx = await transactions.updateGraphQLTransaction(transaction_id, input);
            return tx ?? null;
        },
        logStripeEvent: async (_, { input }, { dataSources: { stripeEvents } }) => {
            return stripeEvents.createStripeEvent(input) as any as Promise<StripeEvent>;
        },
        updateStripeEvent: async (_, { stripe_event_id, status, related_transaction_id, errorMessage }, { dataSources: { stripeEvents } }) => {
            return stripeEvents.updateStripeEvent(stripe_event_id, status, related_transaction_id, errorMessage) as any as Promise<StripeEvent | null>;
        },

        // --- Organizations ---
        createOrganization: async (_, { owner_id, input }, { dataSources: { organizations, users } }) => {
            const organization = await organizations.createOrganization(owner_id, input);

            if (!await users.addOrganizationToUser(owner_id, organization._id.toString())) {
                throw new Error(`Unable to add organization to owner: ${owner_id}`)
            }

            return organization as any as Organization;
        },
        updateOrganization: async (_, { org_id, input }, { dataSources: { organizations } }) => {
            return organizations.updateOrganization(org_id, input) as any as Promise<Organization | null>;
        },
        deleteOrganization: async (_, { org_id }, { dataSources: { organizations, users } }) => {
            await users.removeOrganizationFromAllMembers(org_id);
            return organizations.deleteOrganization(org_id);
        },
        transferOwnership: async (_, { org_id, new_owner_id }, { dataSources: { organizations } }) => {
            return organizations.transferOwnership(org_id, new_owner_id) as any as Promise<Organization | null>;
        },
        inviteMember: async (_, { org_id, user_id, orgRole }, { dataSources: { organizations } }) => {
            return organizations.inviteMember(org_id, user_id, orgRole) as any as Promise<OrganizationMember | null>;
        },
        acceptOrgInvite: async (_, { org_id, user_id }, { dataSources: { organizations } }) => {
            return organizations.acceptOrgInvite(org_id, user_id) as any as Promise<OrganizationMember | null>;
        },
        declineOrgInvite: async (_, { org_id, user_id }, { dataSources: { organizations } }) => {
            return organizations.declineOrgInvite(org_id, user_id) as any as Promise<boolean>;
        },
        removeMember: async (_, { org_id, user_id }, { dataSources: { organizations } }) => {
            return organizations.removeMember(org_id, user_id) as any as Promise<boolean>;
        },
        updateMemberRole: async (_, { org_id, user_id, orgRole }, { dataSources: { organizations } }) => {
            return organizations.updateMemberRole(org_id, user_id, orgRole) as any as Promise<OrganizationMember | null>;
        },
        setCoreTeam: async (_, { org_id, user_ids }, { dataSources: { organizations } }) => {
            return organizations.setCoreTeam(org_id, user_ids) as any as Promise<Organization | null>;
        },
        addCorePlayer: async (_, { org_id, user_id }, { dataSources: { organizations } }) => {
            return organizations.addCorePlayer(org_id, user_id) as any as Promise<Organization | null>;
        },
        removeCorePlayer: async (_, { org_id, user_id }, { dataSources: { organizations } }) => {
            return organizations.removeCorePlayer(org_id, user_id) as any as Promise<Organization | null>;
        },
        updateAvailabilityBlocks: async (_, { org_id, blocks }, { dataSources: { organizations } }) => {
            return await organizations.updateAvailabilityBlocks(org_id, blocks) as any as WithId<Organization> | null;
        },
        // updateAvailabilityBlock: async (_, { org_id, block }, { dataSources: { organizations } }) => {
        //     const org = await organizations.addAvailabilityBlock(org_id, block);
        //     return org as any as WithId<Organization> | null;
        // },
        addException: async (_, { org_id, excpetion }, { dataSources: { organizations } }) => {
            return organizations.addException(org_id, excpetion) as any as Promise<WithId<Organization> | null>;
        },
        // --- Scrimmage Invitations ---
        respondToInvitation: async (_, { input }, { dataSources: { scrimmages } }) => {
            return scrimmages.respondToInvitation(input.scrimmage_id, input.user_id, input.status) as any;
        },

        // --- Org Requests ---
        submitOrgRequest: async (_, { user_id, input }, { dataSources: { orgRequests } }) => {
            return orgRequests.submitRequest(user_id, input) as any as OrgRequest;
        },
        cancelOrgRequest: async (_, { request_id, user_id }, { dataSources: { orgRequests } }) => {
            return orgRequests.cancelRequest(request_id, user_id);
        },
        reviewOrgRequest: async (_, { request_id, status, reviewNote }, { dataSources: { orgRequests } }) => {
            return orgRequests.reviewRequest(request_id, status, reviewNote ?? undefined) as any as OrgRequest;
        },

        // --- Wagers ---
        placeWager: async (_, { input }, { dataSources: { wagers, users } }) => {
            const { scrimmage_id, leader_id, side } = input;
            const user = await users.getGraphQLUser(leader_id);
            if (!user) throw new Error(`Leader ${leader_id} not found`);
            return wagers.createWager(scrimmage_id, leader_id, side, 0) as any as Promise<Wager>;
        },
        purchaseCredits: async (_, { input }, { dataSources: { transactions, wagers, users } }) => {
            const { user_id, credits } = input;
            if (credits % 100 !== 0) throw new Error("Credits must be purchased in multiples of 100 (100 = $1)");

            const user = await users.getGraphQLUser(user_id);
            if (!user) throw new Error(`User ${user_id} not found`);

            const stripeTx = transactions.createTransaction({
                customer: undefined,
                type: undefined,
                status: undefined,
                livemode: false,
                total: credits,
                currency: "usd",
                description: `${credits} credits purchase`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });

            const newBalance = (user.balance.credits ?? 0) + credits;

            const creditTx = await wagers.createCreditTransaction(
                user_id,
                CreditTxType.Purchase,
                credits,
                newBalance,
                { stripeTransaction_id: stripeTx._id.toString() },
            );

            const purchase = await wagers.createCreditPurchase(
                user_id,
                credits,
                credits,
                stripeTx._id.toString(),
                creditTx._id.toString(),
            );

            await users.updateUserById(user_id, {
                balance: { credits: newBalance, pending: user.balance.pending, winnings: user.balance.winnings },
            });

            return purchase as any as CreditPurchase;
        },
        settleWagers: async (_, { scrimmage_id }, { dataSources: { scrimmages, wagers, users } }) => {
            const scrimmage = await scrimmages.getGraphQLScrimmage(scrimmage_id);
            if (!scrimmage) throw new Error(`Scrimmage ${scrimmage_id} not found`);
            if (!scrimmage.result) throw new Error("Scrimmage has no confirmed result yet");

            const scrimmageWagers = await wagers.getScrimmageWagers(scrimmage_id);
            if (!scrimmageWagers.length) return [];

            const now = Date.now();
            const settled: Wager[] = [];

            for (const wager of scrimmageWagers) {
                const isWinner =
                    (scrimmage.result === "HOST_WIN" && wager.side === MatchSide.Host) ||
                    (scrimmage.result === "OPPONENT_WIN" && wager.side === MatchSide.Opponent) ||
                    scrimmage.result === "CANCELLED";

                if (scrimmage.result === "CANCELLED") {
                    const updated = await wagers.updateWagerStatus(wager._id, WagerStatus.Refunded, now);
                    const user = await users.getGraphQLUser(wager.leader);
                    if (user) {
                        const newBalance = user.balance.credits + wager.amount;
                        await users.updateUserById(wager.leader, {
                            balance: { credits: newBalance, pending: Math.max(0, user.balance.pending - wager.amount), winnings: user.balance.winnings },
                        });
                        await wagers.createCreditTransaction(
                            wager.leader, CreditTxType.WagerRefund, wager.amount, newBalance,
                            { wager_id: wager._id.toString() },
                        );
                    }
                    if (updated) settled.push(updated as any as Wager);
                } else if (isWinner) {
                    const payout = wager.amount * 2;
                    const updated = await wagers.updateWagerStatus(wager._id, WagerStatus.Won, now);
                    const user = await users.getGraphQLUser(wager.leader);
                    if (user) {
                        const newBalance = user.balance.credits + payout;
                        await users.updateUserById(wager.leader, {
                            balance: { credits: newBalance, pending: Math.max(0, user.balance.pending - wager.amount), winnings: user.balance.winnings + payout },
                        });
                        await wagers.createCreditTransaction(
                            wager.leader, CreditTxType.WagerWin, payout, newBalance,
                            { wager_id: wager._id.toString() },
                        );
                    }
                    if (updated) settled.push(updated as any as Wager);
                } else {
                    const updated = await wagers.updateWagerStatus(wager._id, WagerStatus.Lost, now);
                    const user = await users.getGraphQLUser(wager.leader);
                    if (user) {
                        await users.updateUserById(wager.leader, {
                            balance: { credits: user.balance.credits, pending: Math.max(0, user.balance.pending - wager.amount), winnings: user.balance.winnings },
                        });
                    }
                    if (updated) settled.push(updated as any);
                }
            }

            return settled;
        },
        adjustCredits: async (_, { user_id, amount, note }, { dataSources: { users, wagers } }) => {
            const user = await users.getGraphQLUser(user_id);
            if (!user) throw new Error(`User ${user_id} not found`);

            const newBalance = user.balance.credits + amount;
            await users.updateUserById(user_id, {
                balance: { credits: newBalance, pending: user.balance.pending, winnings: user.balance.winnings },
            });

            const creditTx = await wagers.createCreditTransaction(
                user_id, CreditTxType.AdminAdjust, amount, newBalance, { note },
            );
            return creditTx as any as CreditTransaction;
        },
    },
}
