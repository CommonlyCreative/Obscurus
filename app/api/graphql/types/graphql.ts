/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Timestamp: { input: number; output: number; }
};

export type Adjustment = {
  __typename?: 'Adjustment';
  _id: Scalars['ID']['output'];
  amount: Scalars['Int']['output'];
  createdAt: Scalars['Timestamp']['output'];
  failureMessage?: Maybe<Scalars['String']['output']>;
  processor?: Maybe<Processor>;
  reason?: Maybe<RefundReason>;
  status: TransactionStatus;
  stripeRefundId: Scalars['String']['output'];
  transaction: Transaction;
  updatedAt: Scalars['Timestamp']['output'];
};

export enum ApplicantStatus {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Selected = 'SELECTED'
}

export type AvailabilityBlock = {
  __typename?: 'AvailabilityBlock';
  day: Day;
  exception?: Maybe<AvailabilityException>;
  timesheets?: Maybe<Array<Timesheet>>;
};

export type AvailabilityBlockInput = {
  day: Day;
  timesheets?: InputMaybe<Array<TimesheetInput>>;
};

export type AvailabilityException = {
  __typename?: 'AvailabilityException';
  date: Scalars['Timestamp']['output'];
  timesheet: Array<Timesheet>;
};

export type Balance = {
  __typename?: 'Balance';
  credits: Scalars['Int']['output'];
  pending: Scalars['Int']['output'];
  winnings: Scalars['Int']['output'];
};

export type BalanceInput = {
  credits?: InputMaybe<Scalars['Int']['input']>;
  pending?: InputMaybe<Scalars['Int']['input']>;
  winnings?: InputMaybe<Scalars['Int']['input']>;
};

export enum BestOf {
  Five = 'FIVE',
  One = 'ONE',
  Three = 'THREE',
  Unlimited = 'UNLIMITED'
}

export enum CardFunding {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
  Prepaid = 'PREPAID',
  Unknown = 'UNKNOWN'
}

export type CreateOrganizationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};

export type CreateScrimmageInput = {
  bestOf?: InputMaybe<BestOf>;
  hostOrg_id?: InputMaybe<Scalars['String']['input']>;
  host_id: Scalars['String']['input'];
  invitations?: InputMaybe<Array<ScrimmageInvitationInput>>;
  isPrivate: Scalars['Boolean']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  opponentOrg_id?: InputMaybe<Scalars['String']['input']>;
  partyCode?: InputMaybe<Scalars['String']['input']>;
  scheduledAt?: InputMaybe<Scalars['Timestamp']['input']>;
  team: Array<Scalars['String']['input']>;
  wagerAmount?: InputMaybe<Scalars['Int']['input']>;
};

export type CreditPurchase = {
  __typename?: 'CreditPurchase';
  _id: Scalars['ID']['output'];
  amountPaidCents: Scalars['Int']['output'];
  createdAt: Scalars['Timestamp']['output'];
  creditTransaction: CreditTransaction;
  credits: Scalars['Int']['output'];
  stripeTransaction: Transaction;
  user: User;
};

export type CreditTransaction = {
  __typename?: 'CreditTransaction';
  _id: Scalars['ID']['output'];
  amount: Scalars['Int']['output'];
  balanceAfter: Scalars['Int']['output'];
  createdAt: Scalars['Timestamp']['output'];
  note?: Maybe<Scalars['String']['output']>;
  stripeTransaction?: Maybe<Transaction>;
  type: CreditTxType;
  user: User;
  wager?: Maybe<Wager>;
};

export enum CreditTxType {
  AdminAdjust = 'ADMIN_ADJUST',
  Purchase = 'PURCHASE',
  WagerLock = 'WAGER_LOCK',
  WagerRefund = 'WAGER_REFUND',
  WagerWin = 'WAGER_WIN'
}

export type Customer = {
  __typename?: 'Customer';
  _id: Scalars['ID']['output'];
  billingAddress?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  email?: Maybe<Scalars['String']['output']>;
  isOnboarded: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  stripeCustomerId: Scalars['String']['output'];
  updatedAt: Scalars['Timestamp']['output'];
  user: User;
};

export type CustomerInput = {
  stripeCustomerId: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};

export enum Day {
  Friday = 'FRIDAY',
  Monday = 'MONDAY',
  Saturday = 'SATURDAY',
  Sunday = 'SUNDAY',
  Thursday = 'THURSDAY',
  Tuesday = 'TUESDAY',
  Wednesday = 'WEDNESDAY'
}

export type Disputes = {
  __typename?: 'Disputes';
  _id: Scalars['ID']['output'];
  creator?: Maybe<User>;
  scrimmage: Scrimmage;
};

export enum EventProcessingStatus {
  Failed = 'FAILED',
  Ignored = 'IGNORED',
  Processed = 'PROCESSED',
  Processing = 'PROCESSING',
  Received = 'RECEIVED'
}

export type ExceptionInput = {
  date: Scalars['Timestamp']['input'];
  day?: InputMaybe<Day>;
  timesheets: Array<TimesheetInput>;
};

export enum InvitationStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Pending = 'PENDING'
}

export type LogStripeEventInput = {
  apiVersion: Scalars['String']['input'];
  eventType: Scalars['String']['input'];
  livemode: Scalars['Boolean']['input'];
  payloadHash: Scalars['String']['input'];
  stripeEventId: Scalars['String']['input'];
};

export type Match = {
  __typename?: 'Match';
  concludedAt?: Maybe<Scalars['Timestamp']['output']>;
  match_id?: Maybe<Scalars['String']['output']>;
  number: Scalars['Int']['output'];
  result?: Maybe<MatchResult>;
  startedAt: Scalars['Timestamp']['output'];
};

export enum MatchResult {
  Cancelled = 'CANCELLED',
  Draw = 'DRAW',
  HostWin = 'HOST_WIN',
  OpponentWin = 'OPPONENT_WIN'
}

export enum MatchSide {
  Host = 'HOST',
  Opponent = 'OPPONENT'
}

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['String']['output']>;
  acceptOrgInvite?: Maybe<OrganizationMember>;
  acceptScrimmageChallenge?: Maybe<Scrimmage>;
  addAvailabilityBlock?: Maybe<Organization>;
  addCorePlayer?: Maybe<Organization>;
  addException?: Maybe<Organization>;
  addNotification?: Maybe<Notification>;
  adjustCredits?: Maybe<CreditTransaction>;
  applyToSubstituteRequest?: Maybe<SubApplicant>;
  assignSubstitute?: Maybe<ScrimmageInvitation>;
  cancelMatch?: Maybe<Scrimmage>;
  cancelOrgRequest?: Maybe<Scalars['Boolean']['output']>;
  cancelScrimmage?: Maybe<Scrimmage>;
  cancelSubstituteRequest?: Maybe<SubstituteRequest>;
  createCustomer?: Maybe<Customer>;
  createOrganization?: Maybe<Organization>;
  createScrimmage?: Maybe<Scrimmage>;
  createSubstituteRequest?: Maybe<SubstituteRequest>;
  createUser?: Maybe<User>;
  declineOrgInvite?: Maybe<Scalars['Boolean']['output']>;
  declineScrimmageChallenge?: Maybe<Scrimmage>;
  deleteOrganization?: Maybe<Scalars['Boolean']['output']>;
  dismissNotification?: Maybe<Scalars['Boolean']['output']>;
  endScrimmage?: Maybe<Scrimmage>;
  inviteMember?: Maybe<OrganizationMember>;
  joinScrimmage?: Maybe<Scrimmage>;
  leaveScrimmage?: Maybe<Scrimmage>;
  logStripeEvent?: Maybe<StripeEvent>;
  logTransaction?: Maybe<Transaction>;
  placeWager?: Maybe<Wager>;
  purchaseCredits?: Maybe<CreditPurchase>;
  readyUp?: Maybe<Scrimmage>;
  removeCorePlayer?: Maybe<Organization>;
  removeMember?: Maybe<Scalars['Boolean']['output']>;
  respondToInvitation?: Maybe<ScrimmageInvitation>;
  reviewOrgRequest?: Maybe<OrgRequest>;
  selectSubstitute?: Maybe<SubstituteRequest>;
  setCoreTeam?: Maybe<Organization>;
  setOnlineStatus?: Maybe<User>;
  setOpponentRoster?: Maybe<Scrimmage>;
  setPartyCode?: Maybe<Scrimmage>;
  settleWagers: Array<Wager>;
  startMatch?: Maybe<Scrimmage>;
  submitMatchResult?: Maybe<Scrimmage>;
  submitOrgRequest?: Maybe<OrgRequest>;
  transferOwnership?: Maybe<Organization>;
  unready?: Maybe<Scrimmage>;
  updateAvailabilityBlocks?: Maybe<Organization>;
  updateMemberRole?: Maybe<OrganizationMember>;
  updateOrganization?: Maybe<Organization>;
  updateRosterSlot?: Maybe<Scrimmage>;
  updateScrimmage?: Maybe<Scrimmage>;
  updateStripeEvent?: Maybe<StripeEvent>;
  updateTransaction?: Maybe<Transaction>;
  updateUser?: Maybe<User>;
};


export type MutationAcceptOrgInviteArgs = {
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationAcceptScrimmageChallengeArgs = {
  org_id: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
};


export type MutationAddAvailabilityBlockArgs = {
  block: AvailabilityBlockInput;
  org_id: Scalars['String']['input'];
};


export type MutationAddCorePlayerArgs = {
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationAddExceptionArgs = {
  excpetion: ExceptionInput;
  org_id: Scalars['String']['input'];
};


export type MutationAddNotificationArgs = {
  input: SendNotificationInput;
};


export type MutationAdjustCreditsArgs = {
  amount: Scalars['Int']['input'];
  note: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationApplyToSubstituteRequestArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  request_id: Scalars['String']['input'];
};


export type MutationAssignSubstituteArgs = {
  invitation_id: Scalars['String']['input'];
  substitute_id: Scalars['String']['input'];
};


export type MutationCancelMatchArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type MutationCancelOrgRequestArgs = {
  request_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationCancelScrimmageArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type MutationCancelSubstituteRequestArgs = {
  request_id: Scalars['String']['input'];
};


export type MutationCreateCustomerArgs = {
  input: CustomerInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
  owner_id: Scalars['String']['input'];
};


export type MutationCreateScrimmageArgs = {
  input: CreateScrimmageInput;
};


export type MutationCreateSubstituteRequestArgs = {
  input: SubstituteRequestInput;
};


export type MutationCreateUserArgs = {
  input: UserInput;
};


export type MutationDeclineOrgInviteArgs = {
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationDeclineScrimmageChallengeArgs = {
  org_id: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
};


export type MutationDeleteOrganizationArgs = {
  org_id: Scalars['String']['input'];
};


export type MutationDismissNotificationArgs = {
  notification_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationEndScrimmageArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type MutationInviteMemberArgs = {
  orgRole: OrgRole;
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationJoinScrimmageArgs = {
  org_id?: InputMaybe<Scalars['String']['input']>;
  scrimmage_id: Scalars['String']['input'];
  team: Array<Scalars['String']['input']>;
};


export type MutationLeaveScrimmageArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type MutationLogStripeEventArgs = {
  input: LogStripeEventInput;
};


export type MutationLogTransactionArgs = {
  transaction: TransactionInput;
};


export type MutationPlaceWagerArgs = {
  input: PlaceWagerInput;
};


export type MutationPurchaseCreditsArgs = {
  input: PurchaseCreditsInput;
};


export type MutationReadyUpArgs = {
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
};


export type MutationRemoveCorePlayerArgs = {
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationRemoveMemberArgs = {
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationRespondToInvitationArgs = {
  input: RespondToInvitationInput;
};


export type MutationReviewOrgRequestArgs = {
  request_id: Scalars['String']['input'];
  reviewNote?: InputMaybe<Scalars['String']['input']>;
  status: OrgRequestStatus;
};


export type MutationSelectSubstituteArgs = {
  request_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationSetCoreTeamArgs = {
  org_id: Scalars['String']['input'];
  user_ids: Array<Scalars['String']['input']>;
};


export type MutationSetOnlineStatusArgs = {
  online: Scalars['Boolean']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationSetOpponentRosterArgs = {
  input: SetOpponentRosterInput;
};


export type MutationSetPartyCodeArgs = {
  partyCode: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
};


export type MutationSettleWagersArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type MutationStartMatchArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type MutationSubmitMatchResultArgs = {
  deadlock_match_id: Scalars['String']['input'];
  match_number: Scalars['Int']['input'];
  result: MatchResult;
  scrimmage_id: Scalars['String']['input'];
};


export type MutationSubmitOrgRequestArgs = {
  input: SubmitOrgRequestInput;
  user_id: Scalars['String']['input'];
};


export type MutationTransferOwnershipArgs = {
  new_owner_id: Scalars['String']['input'];
  org_id: Scalars['String']['input'];
};


export type MutationUnreadyArgs = {
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
};


export type MutationUpdateAvailabilityBlocksArgs = {
  blocks: Array<AvailabilityBlockInput>;
  org_id: Scalars['String']['input'];
};


export type MutationUpdateMemberRoleArgs = {
  orgRole: OrgRole;
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
  org_id: Scalars['String']['input'];
};


export type MutationUpdateRosterSlotArgs = {
  input: UpdateRosterSlotInput;
};


export type MutationUpdateScrimmageArgs = {
  input: UpdateScrimmageInput;
  scrimmage_id: Scalars['String']['input'];
};


export type MutationUpdateStripeEventArgs = {
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  related_transaction_id?: InputMaybe<Scalars['String']['input']>;
  status: EventProcessingStatus;
  stripe_event_id: Scalars['String']['input'];
};


export type MutationUpdateTransactionArgs = {
  input: UpdateTransactionInput;
  transaction_id: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  user_id: Scalars['String']['input'];
};

export type Notification = {
  __typename?: 'Notification';
  _id: Scalars['ID']['output'];
  actionId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  description?: Maybe<Scalars['String']['output']>;
  link?: Maybe<Scalars['String']['output']>;
  recipient: Scalars['String']['output'];
  senderName: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: NotificationType;
};

export enum NotificationType {
  General = 'GENERAL',
  Invitation = 'INVITATION'
}

export enum OrgMemberStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Invited = 'INVITED'
}

export type OrgRequest = {
  __typename?: 'OrgRequest';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  name: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reviewNote?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: OrgRequestStatus;
  updatedAt: Scalars['Timestamp']['output'];
  user: User;
};

export enum OrgRequestStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum OrgRole {
  Manager = 'MANAGER',
  Player = 'PLAYER'
}

export type Organization = {
  __typename?: 'Organization';
  _id: Scalars['ID']['output'];
  blocks: Array<AvailabilityBlock>;
  coreTeam: Array<User>;
  createdAt: Scalars['Timestamp']['output'];
  description?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  members: Array<OrganizationMember>;
  name: Scalars['String']['output'];
  owner: User;
  slug: Scalars['String']['output'];
  updatedAt: Scalars['Timestamp']['output'];
};

export type OrganizationMember = {
  __typename?: 'OrganizationMember';
  joinedAt: Scalars['Timestamp']['output'];
  orgRole: OrgRole;
  status: OrgMemberStatus;
  user: User;
};

export type PlaceWagerInput = {
  leader_id: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
};

export enum Processor {
  Admin = 'ADMIN',
  System = 'SYSTEM',
  User = 'USER'
}

export type PurchaseCreditsInput = {
  credits: Scalars['Int']['input'];
  payment_method_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  getCreditBalance: Scalars['Int']['output'];
  getCreditPurchases: Array<CreditPurchase>;
  getCreditTransactions: Array<CreditTransaction>;
  getCustomer?: Maybe<Customer>;
  getCustomerTransactions: Array<Transaction>;
  getMyOrgRequest?: Maybe<OrgRequest>;
  getNotifications: Array<Notification>;
  getOrgRequests: Array<OrgRequest>;
  getOrgScrimmages?: Maybe<Array<Scrimmage>>;
  getOrgSubstituteRequests: Array<SubstituteRequest>;
  getOrganization?: Maybe<Organization>;
  getOrganizationBySlug?: Maybe<Organization>;
  getOrganizationMembers: Array<OrganizationMember>;
  getOrganizations?: Maybe<Array<Organization>>;
  getPublicScrimmages: Array<Scrimmage>;
  getScrimmage?: Maybe<Scrimmage>;
  getScrimmageInvitations: Array<ScrimmageInvitation>;
  getScrimmageWagers: Array<Wager>;
  getScrimmages: Array<Scrimmage>;
  getStripeEvent?: Maybe<StripeEvent>;
  getSubstituteRequest?: Maybe<SubstituteRequest>;
  getSubstituteRequests: Array<SubstituteRequest>;
  getTransaction?: Maybe<Transaction>;
  getTransactions: Array<Transaction>;
  getUser?: Maybe<User>;
  getUserBySteamId?: Maybe<User>;
  getUserOrgInvitations: Array<Maybe<Organization>>;
  getUserScrimmages: Array<Scrimmage>;
  getUserWagers: Array<Wager>;
  getUsers: Array<User>;
  getWager?: Maybe<Wager>;
  hasUser: Scalars['Boolean']['output'];
  searchOrganizations: Array<Organization>;
};


export type QueryGetCreditBalanceArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetCreditPurchasesArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetCreditTransactionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  user_id: Scalars['String']['input'];
};


export type QueryGetCustomerArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetCustomerTransactionsArgs = {
  customer_id: Scalars['String']['input'];
};


export type QueryGetMyOrgRequestArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetNotificationsArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetOrgRequestsArgs = {
  status?: InputMaybe<OrgRequestStatus>;
};


export type QueryGetOrgScrimmagesArgs = {
  org_id: Scalars['String']['input'];
};


export type QueryGetOrgSubstituteRequestsArgs = {
  org_id: Scalars['String']['input'];
};


export type QueryGetOrganizationArgs = {
  org_id: Scalars['String']['input'];
};


export type QueryGetOrganizationBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetOrganizationMembersArgs = {
  org_id: Scalars['String']['input'];
};


export type QueryGetPublicScrimmagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetScrimmageArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type QueryGetScrimmageInvitationsArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetScrimmageWagersArgs = {
  scrimmage_id: Scalars['String']['input'];
};


export type QueryGetScrimmagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ScrimmageStatus>;
};


export type QueryGetStripeEventArgs = {
  stripe_event_id: Scalars['String']['input'];
};


export type QueryGetSubstituteRequestArgs = {
  request_id: Scalars['String']['input'];
};


export type QueryGetSubstituteRequestsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<SubRequestStatus>;
};


export type QueryGetTransactionArgs = {
  transaction_id: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetUserBySteamIdArgs = {
  steam_id: Scalars['String']['input'];
};


export type QueryGetUserOrgInvitationsArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetUserScrimmagesArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetUserWagersArgs = {
  user_id: Scalars['String']['input'];
};


export type QueryGetWagerArgs = {
  wager_id: Scalars['String']['input'];
};


export type QueryHasUserArgs = {
  user_id?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchOrganizationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};

export type Rank = {
  __typename?: 'Rank';
  name: Scalars['String']['output'];
  ranking?: Maybe<Scalars['Int']['output']>;
};

export enum RefundReason {
  CustomerRequest = 'CUSTOMER_REQUEST',
  Duplicate = 'DUPLICATE',
  Fraudulent = 'FRAUDULENT',
  MatchCancelled = 'MATCH_CANCELLED'
}

export type RespondToInvitationInput = {
  invitation_id: Scalars['String']['input'];
  status: InvitationStatus;
  team?: InputMaybe<TeamInput>;
};

export enum Role {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Moderator = 'MODERATOR',
  Support = 'SUPPORT'
}

export type Scrimmage = {
  __typename?: 'Scrimmage';
  _id: Scalars['ID']['output'];
  bestOf: BestOf;
  createdAt: Scalars['Timestamp']['output'];
  draftLink?: Maybe<Scalars['String']['output']>;
  host: User;
  hostOrg?: Maybe<Organization>;
  hostTeam: Team;
  invitations: Array<ScrimmageInvitation>;
  isPrivate: Scalars['Boolean']['output'];
  matches: Array<Match>;
  note?: Maybe<Scalars['String']['output']>;
  opponentOrg?: Maybe<Organization>;
  opponentTeam?: Maybe<Team>;
  partyCode?: Maybe<Scalars['String']['output']>;
  readyHost: Scalars['Boolean']['output'];
  readyOpponent: Scalars['Boolean']['output'];
  region: Scalars['String']['output'];
  result?: Maybe<ScrimmageResult>;
  scheduledAt?: Maybe<Scalars['Timestamp']['output']>;
  status: ScrimmageStatus;
  updatedAt: Scalars['Timestamp']['output'];
  wagerAmount: Scalars['Int']['output'];
};

export type ScrimmageInvitation = {
  __typename?: 'ScrimmageInvitation';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  respondedAt?: Maybe<Scalars['Timestamp']['output']>;
  scrimmage: Scrimmage;
  side: MatchSide;
  status: InvitationStatus;
  substitute?: Maybe<User>;
  user: User;
};

export type ScrimmageInvitationInput = {
  side: MatchSide;
  user_id: Scalars['String']['input'];
};

export enum ScrimmageResult {
  Cancelled = 'CANCELLED',
  Draw = 'DRAW',
  HostWin = 'HOST_WIN',
  OpponentWin = 'OPPONENT_WIN'
}

export enum ScrimmageStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Open = 'OPEN',
  Pending = 'PENDING',
  Ready = 'READY',
  Scheduled = 'SCHEDULED',
  Scheduling = 'SCHEDULING'
}

export type SendNotificationInput = {
  actionId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  recipient: Scalars['String']['input'];
  senderName: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: NotificationType;
};

export type SetOpponentRosterInput = {
  org_id?: InputMaybe<Scalars['String']['input']>;
  scrimmage_id: Scalars['String']['input'];
  team: Array<Scalars['String']['input']>;
};

export type Stats = {
  __typename?: 'Stats';
  division: Scalars['Int']['output'];
  mmr: Scalars['Int']['output'];
  rank: Rank;
};

export type Steam = {
  __typename?: 'Steam';
  avatar: Scalars['String']['output'];
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type SteamInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type StripeEvent = {
  __typename?: 'StripeEvent';
  _id: Scalars['ID']['output'];
  apiVersion: Scalars['String']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  eventType: Scalars['String']['output'];
  livemode: Scalars['Boolean']['output'];
  payloadHash: Scalars['String']['output'];
  processedAt?: Maybe<Scalars['Timestamp']['output']>;
  processingStatus: EventProcessingStatus;
  receivedAt: Scalars['Timestamp']['output'];
  relatedTransaction?: Maybe<Transaction>;
  retryCount: Scalars['Int']['output'];
  stripeEventId: Scalars['ID']['output'];
};

export type SubApplicant = {
  __typename?: 'SubApplicant';
  _id: Scalars['ID']['output'];
  appliedAt: Scalars['Timestamp']['output'];
  message?: Maybe<Scalars['String']['output']>;
  request: SubstituteRequest;
  status: ApplicantStatus;
  user: User;
};

export enum SubRequestStatus {
  Cancelled = 'CANCELLED',
  Filled = 'FILLED',
  Open = 'OPEN'
}

export type SubmitOrgRequestInput = {
  name: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
};

export type SubstituteRequest = {
  __typename?: 'SubstituteRequest';
  _id: Scalars['ID']['output'];
  applicants: Array<SubApplicant>;
  createdAt: Scalars['Timestamp']['output'];
  filledBy?: Maybe<User>;
  note?: Maybe<Scalars['String']['output']>;
  organization: Organization;
  postedBy: User;
  replacing: User;
  scrimmage: Scrimmage;
  side: MatchSide;
  status: SubRequestStatus;
  updatedAt: Scalars['Timestamp']['output'];
};

export type SubstituteRequestInput = {
  note?: InputMaybe<Scalars['String']['input']>;
  org_id: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
};

export type Team = {
  __typename?: 'Team';
  leader: User;
  members: Array<User>;
  name?: Maybe<Scalars['String']['output']>;
};

export type TeamInput = {
  leader: Scalars['String']['input'];
  members: Array<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Timesheet = {
  __typename?: 'Timesheet';
  endTime: Scalars['Timestamp']['output'];
  startTime: Scalars['Timestamp']['output'];
};

export type TimesheetInput = {
  endTime: Scalars['Timestamp']['input'];
  startTime: Scalars['Timestamp']['input'];
};

export type Transaction = {
  __typename?: 'Transaction';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['Timestamp']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  description?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['Int']['output']>;
  failureCode?: Maybe<Scalars['String']['output']>;
  failureMessage?: Maybe<Scalars['String']['output']>;
  fingerprint?: Maybe<Scalars['ID']['output']>;
  livemode: Scalars['Boolean']['output'];
  method?: Maybe<TransactionMethod>;
  processedAt?: Maybe<Scalars['Timestamp']['output']>;
  receiptUrl?: Maybe<Scalars['String']['output']>;
  refunded?: Maybe<Scalars['Boolean']['output']>;
  refundedAmount?: Maybe<Scalars['Int']['output']>;
  status: TransactionStatus;
  stripeBalanceTransactionId?: Maybe<Scalars['String']['output']>;
  stripeChargeId?: Maybe<Scalars['String']['output']>;
  stripeEventId?: Maybe<Scalars['String']['output']>;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['Int']['output']>;
  tax?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
  type: TransactionType;
  updatedAt: Scalars['Timestamp']['output'];
};

export type TransactionInput = {
  createdAt: Scalars['Timestamp']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['Int']['input']>;
  failureCode?: InputMaybe<Scalars['String']['input']>;
  failureMessage?: InputMaybe<Scalars['String']['input']>;
  fingerprint?: InputMaybe<Scalars['ID']['input']>;
  livemode?: InputMaybe<Scalars['Boolean']['input']>;
  method?: InputMaybe<TransactionMethodInput>;
  processedAt?: InputMaybe<Scalars['Timestamp']['input']>;
  receiptUrl?: InputMaybe<Scalars['String']['input']>;
  refunded?: InputMaybe<Scalars['Boolean']['input']>;
  refundedAmount?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TransactionStatus>;
  stripeBalanceTransactionId?: InputMaybe<Scalars['String']['input']>;
  stripeChargeId?: InputMaybe<Scalars['String']['input']>;
  stripeEventId?: InputMaybe<Scalars['String']['input']>;
  stripePaymentIntentId?: InputMaybe<Scalars['String']['input']>;
  subtotal?: InputMaybe<Scalars['Int']['input']>;
  tax?: InputMaybe<Scalars['Int']['input']>;
  total?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<TransactionType>;
  updatedAt: Scalars['Timestamp']['input'];
};

export type TransactionMethod = {
  __typename?: 'TransactionMethod';
  brand?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  expMonth?: Maybe<Scalars['Int']['output']>;
  expYear?: Maybe<Scalars['Int']['output']>;
  funding?: Maybe<CardFunding>;
  last4?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<TransactionMethodType>;
};

export type TransactionMethodInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  expMonth?: InputMaybe<Scalars['Int']['input']>;
  expYear?: InputMaybe<Scalars['Int']['input']>;
  funding?: InputMaybe<CardFunding>;
  last4?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<TransactionMethodType>;
};

export enum TransactionMethodType {
  Bank = 'BANK',
  Card = 'CARD',
  Wallet = 'WALLET'
}

export enum TransactionStatus {
  Disputed = 'DISPUTED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Successful = 'SUCCESSFUL'
}

export enum TransactionType {
  Deposit = 'DEPOSIT',
  Payout = 'PAYOUT'
}

export type UpdateOrganizationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRosterSlotInput = {
  remove_id: Scalars['String']['input'];
  replace_id: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
};

export type UpdateScrimmageInput = {
  note?: InputMaybe<Scalars['String']['input']>;
  scheduledAt?: InputMaybe<Scalars['Timestamp']['input']>;
  wagerAmount?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTransactionInput = {
  failureCode?: InputMaybe<Scalars['String']['input']>;
  failureMessage?: InputMaybe<Scalars['String']['input']>;
  processedAt?: InputMaybe<Scalars['Timestamp']['input']>;
  receiptUrl?: InputMaybe<Scalars['String']['input']>;
  refunded?: InputMaybe<Scalars['Boolean']['input']>;
  refundedAmount?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<TransactionStatus>;
};

export type UpdateUserInput = {
  balance?: InputMaybe<BalanceInput>;
  bio?: InputMaybe<Scalars['String']['input']>;
  heroes?: InputMaybe<Array<Scalars['Int']['input']>>;
  mmr?: InputMaybe<Scalars['Int']['input']>;
  online?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Role>;
  steam?: InputMaybe<SteamInput>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  balance: Balance;
  bio?: Maybe<Scalars['String']['output']>;
  blockInvites?: Maybe<Scalars['Boolean']['output']>;
  createdAt: Scalars['Timestamp']['output'];
  heroes: Array<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  online: Scalars['Boolean']['output'];
  organization?: Maybe<Organization>;
  region: Scalars['String']['output'];
  role: Role;
  scrimmages: Array<Scrimmage>;
  stats?: Maybe<Stats>;
  steam?: Maybe<Steam>;
  updatedAt: Scalars['Timestamp']['output'];
  verified: Scalars['Boolean']['output'];
};

export type UserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  heroes?: InputMaybe<Array<Scalars['Int']['input']>>;
  mmr?: InputMaybe<Scalars['Int']['input']>;
};

export type Wager = {
  __typename?: 'Wager';
  _id: Scalars['ID']['output'];
  amount: Scalars['Int']['output'];
  createdAt: Scalars['Timestamp']['output'];
  leader: User;
  scrimmage: Scrimmage;
  settledAt?: Maybe<Scalars['Timestamp']['output']>;
  side: MatchSide;
  status: WagerStatus;
};

export enum WagerStatus {
  Locked = 'LOCKED',
  Lost = 'LOST',
  Refunded = 'REFUNDED',
  Won = 'WON'
}

export type GetNavBarUserQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type GetNavBarUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', scrimmages: Array<{ __typename?: 'Scrimmage', status: ScrimmageStatus }> } | null };

export type GetNotificationsQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type GetNotificationsQuery = { __typename?: 'Query', getNotifications: Array<{ __typename?: 'Notification', _id: string, recipient: string, type: NotificationType, title: string, description?: string | null, link?: string | null, senderName: string, createdAt: number }> };

export type DismissNotificationMutationVariables = Exact<{
  user_id: Scalars['String']['input'];
  notification_id: Scalars['String']['input'];
}>;


export type DismissNotificationMutation = { __typename?: 'Mutation', dismissNotification?: boolean | null };

export type AdminReviewOrgRequestMutationVariables = Exact<{
  request_id: Scalars['String']['input'];
  status: OrgRequestStatus;
  reviewNote?: InputMaybe<Scalars['String']['input']>;
}>;


export type AdminReviewOrgRequestMutation = { __typename?: 'Mutation', reviewOrgRequest?: { __typename?: 'OrgRequest', _id: string, name: string, slug: string, user: { __typename?: 'User', _id: string } } | null };

export type AdminCreateOrganizationMutationVariables = Exact<{
  owner_id: Scalars['String']['input'];
  input: CreateOrganizationInput;
}>;


export type AdminCreateOrganizationMutation = { __typename?: 'Mutation', createOrganization?: { __typename?: 'Organization', _id: string, name: string, slug: string } | null };

export type UpdateUserMutationVariables = Exact<{
  user_id: Scalars['String']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', _id: string } | null };

export type FindUserBySteamIdQueryVariables = Exact<{
  steam_id: Scalars['String']['input'];
}>;


export type FindUserBySteamIdQuery = { __typename?: 'Query', getUserBySteamId?: { __typename?: 'User', _id: string, steam?: { __typename?: 'Steam', username: string } | null } | null };

export type OrgAcceptInviteMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
}>;


export type OrgAcceptInviteMutation = { __typename?: 'Mutation', acceptOrgInvite?: { __typename?: 'OrganizationMember', status: OrgMemberStatus } | null };

export type OrgDeclineInviteMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
}>;


export type OrgDeclineInviteMutation = { __typename?: 'Mutation', declineOrgInvite?: boolean | null };

export type UpdateOrgAvailabilityBlocksMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  blocks: Array<AvailabilityBlockInput> | AvailabilityBlockInput;
}>;


export type UpdateOrgAvailabilityBlocksMutation = { __typename?: 'Mutation', updateAvailabilityBlocks?: { __typename?: 'Organization', _id: string } | null };

export type OrgPageQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type OrgPageQuery = { __typename?: 'Query', getOrganizationBySlug?: { __typename?: 'Organization', _id: string, name: string, slug: string, description?: string | null, createdAt: number, owner: { __typename?: 'User', _id: string, name: string }, members: Array<{ __typename?: 'OrganizationMember', orgRole: OrgRole, status: OrgMemberStatus, joinedAt: number, user: { __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null } }>, coreTeam: Array<{ __typename?: 'User', _id: string }>, blocks: Array<{ __typename?: 'AvailabilityBlock', day: Day, timesheets?: Array<{ __typename?: 'Timesheet', startTime: number, endTime: number }> | null }> } | null };

export type OrgPageScrimsQueryVariables = Exact<{
  org_id: Scalars['String']['input'];
}>;


export type OrgPageScrimsQuery = { __typename?: 'Query', getOrgScrimmages?: Array<{ __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, scheduledAt?: number | null, result?: ScrimmageResult | null, createdAt: number, region: string, wagerAmount: number, bestOf: BestOf, note?: string | null, hostOrg?: { __typename?: 'Organization', _id: string, name: string } | null, opponentOrg?: { __typename?: 'Organization', _id: string, name: string } | null, hostTeam: { __typename?: 'Team', name?: string | null, leader: { __typename?: 'User', name: string } }, opponentTeam?: { __typename?: 'Team', name?: string | null, leader: { __typename?: 'User', name: string } } | null }> | null };

export type GetScrimmagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetScrimmagesQuery = { __typename?: 'Query', getScrimmages: Array<{ __typename?: 'Scrimmage', _id: string, createdAt: number, note?: string | null, region: string, hostTeam: { __typename?: 'Team', name?: string | null, leader: { __typename?: 'User', name: string } }, hostOrg?: { __typename?: 'Organization', name: string } | null }>, getUsers: Array<{ __typename?: 'User', _id: string }>, getOrganizations?: Array<{ __typename?: 'Organization', _id: string }> | null };

export type ProfileAcceptOrgInviteMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
}>;


export type ProfileAcceptOrgInviteMutation = { __typename?: 'Mutation', acceptOrgInvite?: { __typename?: 'OrganizationMember', status: OrgMemberStatus } | null };

export type ProfileDeclineOrgInviteMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
}>;


export type ProfileDeclineOrgInviteMutation = { __typename?: 'Mutation', declineOrgInvite?: boolean | null };

export type ProfileRespondToScrimInviteMutationVariables = Exact<{
  invitation_id: Scalars['String']['input'];
  status: InvitationStatus;
}>;


export type ProfileRespondToScrimInviteMutation = { __typename?: 'Mutation', respondToInvitation?: { __typename?: 'ScrimmageInvitation', status: InvitationStatus } | null };

export type GetAllTeamUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllTeamUsersQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'User', _id: string, name: string }> };

export type UpdateProfileMutationVariables = Exact<{
  user_id: Scalars['String']['input'];
  input: UpdateUserInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', _id: string } | null };

export type SetCoreTeamMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_ids: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type SetCoreTeamMutation = { __typename?: 'Mutation', setCoreTeam?: { __typename?: 'Organization', _id: string } | null };

export type InviteOrgMemberMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
  orgRole: OrgRole;
}>;


export type InviteOrgMemberMutation = { __typename?: 'Mutation', inviteMember?: { __typename?: 'OrganizationMember', user: { __typename?: 'User', _id: string } } | null };

export type GetUserQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type GetUserQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', _id: string, updatedAt: number, steam?: { __typename?: 'Steam', id: string } | null } | null };

export type DisbandOrganizationMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
}>;


export type DisbandOrganizationMutation = { __typename?: 'Mutation', deleteOrganization?: boolean | null };

export type RemoveOrgMemberMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
}>;


export type RemoveOrgMemberMutation = { __typename?: 'Mutation', removeMember?: boolean | null };

export type UpdateOrgMemberRoleMutationVariables = Exact<{
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
  orgRole: OrgRole;
}>;


export type UpdateOrgMemberRoleMutation = { __typename?: 'Mutation', updateMemberRole?: { __typename?: 'OrganizationMember', orgRole: OrgRole } | null };

export type EditProfilePageQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type EditProfilePageQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', _id: string, name: string, heroes: Array<number>, bio?: string | null, region: string, stats?: { __typename?: 'Stats', mmr: number } | null, steam?: { __typename?: 'Steam', id: string, username: string, avatar: string } | null, organization?: { __typename?: 'Organization', _id: string, name: string, owner: { __typename?: 'User', _id: string }, members: Array<{ __typename?: 'OrganizationMember', orgRole: OrgRole, status: OrgMemberStatus, user: { __typename?: 'User', _id: string, name: string, stats?: { __typename?: 'Stats', division: number, rank: { __typename?: 'Rank', name: string } } | null } }>, coreTeam: Array<{ __typename?: 'User', _id: string, name: string, stats?: { __typename?: 'Stats', division: number, rank: { __typename?: 'Rank', name: string } } | null }> } | null } | null, getUsers: Array<{ __typename?: 'User', _id: string, name: string, organization?: { __typename?: 'Organization', _id: string, name: string } | null }> };

export type UserProfileQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type UserProfileQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'User', _id: string, name: string, heroes: Array<number>, online: boolean, blockInvites?: boolean | null, steam?: { __typename?: 'Steam', id: string } | null, stats?: { __typename?: 'Stats', division: number, mmr: number, rank: { __typename?: 'Rank', name: string } } | null }>, getUserOrgInvitations: Array<{ __typename?: 'Organization', _id: string, name: string, slug: string, members: Array<{ __typename?: 'OrganizationMember', orgRole: OrgRole, status: OrgMemberStatus, user: { __typename?: 'User', _id: string, name: string } }> } | null>, getScrimmageInvitations: Array<{ __typename?: 'ScrimmageInvitation', _id: string, side: MatchSide, scrimmage: { __typename?: 'Scrimmage', _id: string, scheduledAt?: number | null, host: { __typename?: 'User', name: string }, hostOrg?: { __typename?: 'Organization', name: string, slug: string } | null } }>, getUser?: { __typename?: 'User', _id: string, name: string, region: string, bio?: string | null, stats?: { __typename?: 'Stats', division: number, mmr: number, rank: { __typename?: 'Rank', name: string } } | null, steam?: { __typename?: 'Steam', id: string, avatar: string, username: string } | null, organization?: { __typename?: 'Organization', _id: string, name: string, slug: string, owner: { __typename?: 'User', _id: string, name: string }, members: Array<{ __typename?: 'OrganizationMember', orgRole: OrgRole, status: OrgMemberStatus, user: { __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null } }>, coreTeam: Array<{ __typename?: 'User', _id: string }> } | null, scrimmages: Array<{ __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, result?: ScrimmageResult | null, createdAt: number, hostOrg?: { __typename?: 'Organization', name: string } | null, opponentOrg?: { __typename?: 'Organization', name: string } | null, hostTeam: { __typename?: 'Team', name?: string | null, leader: { __typename?: 'User', name: string }, members: Array<{ __typename?: 'User', _id: string }> }, opponentTeam?: { __typename?: 'Team', name?: string | null, leader: { __typename?: 'User', name: string }, members: Array<{ __typename?: 'User', _id: string }> } | null }> } | null };

export type GetOrgScrimsQueryVariables = Exact<{
  org_id: Scalars['String']['input'];
}>;


export type GetOrgScrimsQuery = { __typename?: 'Query', getOrgScrimmages?: Array<{ __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, scheduledAt?: number | null, region: string, wagerAmount: number, bestOf: BestOf, hostOrg?: { __typename?: 'Organization', _id: string, name: string } | null, opponentOrg?: { __typename?: 'Organization', _id: string, name: string } | null }> | null };

export type ReadyUpMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
}>;


export type ReadyUpMutation = { __typename?: 'Mutation', readyUp?: { __typename?: 'Scrimmage', _id: string, readyHost: boolean, readyOpponent: boolean, status: ScrimmageStatus } | null };

export type UnreadyMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  side: MatchSide;
}>;


export type UnreadyMutation = { __typename?: 'Mutation', unready?: { __typename?: 'Scrimmage', _id: string, readyHost: boolean, readyOpponent: boolean, status: ScrimmageStatus } | null };

export type SetPartyCodeMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  partyCode: Scalars['String']['input'];
}>;


export type SetPartyCodeMutation = { __typename?: 'Mutation', setPartyCode?: { __typename?: 'Scrimmage', _id: string, partyCode?: string | null } | null };

export type StartMatchMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
}>;


export type StartMatchMutation = { __typename?: 'Mutation', startMatch?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, matches: Array<{ __typename?: 'Match', number: number, result?: MatchResult | null, startedAt: number, concludedAt?: number | null, match_id?: string | null }> } | null };

export type CancelMatchMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
}>;


export type CancelMatchMutation = { __typename?: 'Mutation', cancelMatch?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, matches: Array<{ __typename?: 'Match', number: number, result?: MatchResult | null, startedAt: number, concludedAt?: number | null, match_id?: string | null }> } | null };

export type SubmitMatchResultMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  match_number: Scalars['Int']['input'];
  deadlock_match_id: Scalars['String']['input'];
  result: MatchResult;
}>;


export type SubmitMatchResultMutation = { __typename?: 'Mutation', submitMatchResult?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, result?: ScrimmageResult | null, matches: Array<{ __typename?: 'Match', number: number, result?: MatchResult | null, startedAt: number, concludedAt?: number | null, match_id?: string | null }> } | null };

export type EndScrimmageMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
}>;


export type EndScrimmageMutation = { __typename?: 'Mutation', endScrimmage?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type CancelScrimmageMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
}>;


export type CancelScrimmageMutation = { __typename?: 'Mutation', cancelScrimmage?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type LeaveScrimmageMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
}>;


export type LeaveScrimmageMutation = { __typename?: 'Mutation', leaveScrimmage?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type DeclineChallengeMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  org_id: Scalars['String']['input'];
}>;


export type DeclineChallengeMutation = { __typename?: 'Mutation', declineScrimmageChallenge?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type JoinScrimmageMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  org_id?: InputMaybe<Scalars['String']['input']>;
  team: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type JoinScrimmageMutation = { __typename?: 'Mutation', joinScrimmage?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type AcceptChallengeMutationVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
  org_id: Scalars['String']['input'];
}>;


export type AcceptChallengeMutation = { __typename?: 'Mutation', acceptScrimmageChallenge?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type SetOpponentRosterMutationVariables = Exact<{
  input: SetOpponentRosterInput;
}>;


export type SetOpponentRosterMutation = { __typename?: 'Mutation', setOpponentRoster?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus } | null };

export type GetMatchUserBySteamIdQueryVariables = Exact<{
  steam_id: Scalars['String']['input'];
}>;


export type GetMatchUserBySteamIdQuery = { __typename?: 'Query', getUserBySteamId?: { __typename?: 'User', _id: string, name: string, role: Role, online: boolean, steam?: { __typename?: 'Steam', avatar: string } | null } | null };

export type GetViewerOrgQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type GetViewerOrgQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', organization?: { __typename?: 'Organization', _id: string } | null } | null };

export type GetScrimmageDetailQueryVariables = Exact<{
  scrimmage_id: Scalars['String']['input'];
}>;


export type GetScrimmageDetailQuery = { __typename?: 'Query', getScrimmage?: { __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, result?: ScrimmageResult | null, bestOf: BestOf, isPrivate: boolean, scheduledAt?: number | null, wagerAmount: number, partyCode?: string | null, readyHost: boolean, readyOpponent: boolean, note?: string | null, createdAt: number, updatedAt: number, matches: Array<{ __typename?: 'Match', number: number, match_id?: string | null, result?: MatchResult | null, startedAt: number, concludedAt?: number | null }>, host: { __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }, hostOrg?: { __typename?: 'Organization', _id: string, name: string } | null, hostTeam: { __typename?: 'Team', leader: { __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }, members: Array<{ __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }> }, opponentOrg?: { __typename?: 'Organization', _id: string, name: string, coreTeam: Array<{ __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }>, members: Array<{ __typename?: 'OrganizationMember', orgRole: OrgRole, status: OrgMemberStatus, user: { __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null } }> } | null, opponentTeam?: { __typename?: 'Team', leader: { __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }, members: Array<{ __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }> } | null, invitations: Array<{ __typename?: 'ScrimmageInvitation', _id: string, side: MatchSide, status: InvitationStatus, user: { __typename?: 'User', _id: string, name: string } }> } | null };

export type ScrimListQueryVariables = Exact<{ [key: string]: never; }>;


export type ScrimListQuery = { __typename?: 'Query', getScrimmages: Array<{ __typename?: 'Scrimmage', _id: string, status: ScrimmageStatus, createdAt: number, region: string, note?: string | null, bestOf: BestOf, host: { __typename?: 'User', _id: string, name: string }, hostTeam: { __typename?: 'Team', name?: string | null, members: Array<{ __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null, stats?: { __typename?: 'Stats', mmr: number } | null }> } }> };

export type ScrimCalendarQueryVariables = Exact<{ [key: string]: never; }>;


export type ScrimCalendarQuery = { __typename?: 'Query', getScrimmages: Array<{ __typename?: 'Scrimmage', _id: string, scheduledAt?: number | null, status: ScrimmageStatus, createdAt: number, region: string, note?: string | null, bestOf: BestOf, host: { __typename?: 'User', _id: string, name: string }, hostTeam: { __typename?: 'Team', name?: string | null, members: Array<{ __typename?: 'User', _id: string, name: string, steam?: { __typename?: 'Steam', id: string } | null }> }, hostOrg?: { __typename?: 'Organization', name: string } | null, opponentOrg?: { __typename?: 'Organization', name: string } | null, opponentTeam?: { __typename?: 'Team', leader: { __typename?: 'User', name: string } } | null }> };

export type CreateScrimMutationVariables = Exact<{
  input: CreateScrimmageInput;
}>;


export type CreateScrimMutation = { __typename?: 'Mutation', createScrimmage?: { __typename?: 'Scrimmage', _id: string } | null };

export type GetTargetOrgQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type GetTargetOrgQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', organization?: { __typename?: 'Organization', _id: string, name: string } | null } | null };

export type CreateScrimPageQueryVariables = Exact<{
  user_id: Scalars['String']['input'];
}>;


export type CreateScrimPageQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', _id: string, organization?: { __typename?: 'Organization', _id: string, name: string, coreTeam: Array<{ __typename?: 'User', _id: string, name: string, stats?: { __typename?: 'Stats', division: number, rank: { __typename?: 'Rank', name: string, ranking?: number | null } } | null }>, members: Array<{ __typename?: 'OrganizationMember', orgRole: OrgRole, status: OrgMemberStatus, user: { __typename?: 'User', _id: string, name: string, stats?: { __typename?: 'Stats', division: number, rank: { __typename?: 'Rank', name: string, ranking?: number | null } } | null } }> } | null } | null, getOrganizations?: Array<{ __typename?: 'Organization', _id: string, name: string, slug: string, owner: { __typename?: 'User', _id: string, online: boolean }, coreTeam: Array<{ __typename?: 'User', _id: string, name: string }>, blocks: Array<{ __typename?: 'AvailabilityBlock', day: Day, timesheets?: Array<{ __typename?: 'Timesheet', startTime: number, endTime: number }> | null }> }> | null };

export type SearchPageQueryVariables = Exact<{ [key: string]: never; }>;


export type SearchPageQuery = { __typename?: 'Query', getUsers: Array<{ __typename?: 'User', _id: string, name: string, role: Role, online: boolean, heroes: Array<number>, steam?: { __typename?: 'Steam', id: string } | null, stats?: { __typename?: 'Stats', division: number, mmr: number, rank: { __typename?: 'Rank', name: string } } | null, organization?: { __typename?: 'Organization', _id: string, name: string, slug: string } | null }>, getOrganizations?: Array<{ __typename?: 'Organization', _id: string, name: string, slug: string, members: Array<{ __typename?: 'OrganizationMember', status: OrgMemberStatus }> }> | null, getScrimmages: Array<{ __typename?: 'Scrimmage', result?: ScrimmageResult | null, hostOrg?: { __typename?: 'Organization', _id: string } | null, opponentOrg?: { __typename?: 'Organization', _id: string } | null }> };

export type GetFullProfileQueryQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetFullProfileQueryQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', _id: string } | null };

export type SendNotificationMutationVariables = Exact<{
  input: SendNotificationInput;
}>;


export type SendNotificationMutation = { __typename?: 'Mutation', addNotification?: { __typename?: 'Notification', _id: string, recipient: string, type: NotificationType, title: string, description?: string | null, senderName: string, createdAt: number, link?: string | null, actionId?: string | null } | null };


export const GetNavBarUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNavBarUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scrimmages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetNavBarUserQuery, GetNavBarUserQueryVariables>;
export const GetNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"link"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetNotificationsQuery, GetNotificationsQueryVariables>;
export const DismissNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DismissNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notification_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dismissNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"notification_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notification_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}]}]}}]} as unknown as DocumentNode<DismissNotificationMutation, DismissNotificationMutationVariables>;
export const AdminReviewOrgRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminReviewOrgRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"request_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrgRequestStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reviewNote"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reviewOrgRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"request_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"request_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reviewNote"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reviewNote"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<AdminReviewOrgRequestMutation, AdminReviewOrgRequestMutationVariables>;
export const AdminCreateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"owner_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"owner_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"owner_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<AdminCreateOrganizationMutation, AdminCreateOrganizationMutationVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const FindUserBySteamIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindUserBySteamId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"steam_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUserBySteamId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"steam_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"steam_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]}}]} as unknown as DocumentNode<FindUserBySteamIdQuery, FindUserBySteamIdQueryVariables>;
export const OrgAcceptInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrgAcceptInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptOrgInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<OrgAcceptInviteMutation, OrgAcceptInviteMutationVariables>;
export const OrgDeclineInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OrgDeclineInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declineOrgInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}]}]}}]} as unknown as DocumentNode<OrgDeclineInviteMutation, OrgDeclineInviteMutationVariables>;
export const UpdateOrgAvailabilityBlocksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrgAvailabilityBlocks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"blocks"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AvailabilityBlockInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAvailabilityBlocks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"blocks"},"value":{"kind":"Variable","name":{"kind":"Name","value":"blocks"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<UpdateOrgAvailabilityBlocksMutation, UpdateOrgAvailabilityBlocksMutationVariables>;
export const OrgPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrganizationBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgRole"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coreTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"timesheets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]}}]} as unknown as DocumentNode<OrgPageQuery, OrgPageQueryVariables>;
export const OrgPageScrimsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrgPageScrims"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrgScrimmages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"wagerAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bestOf"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]} as unknown as DocumentNode<OrgPageScrimsQuery, OrgPageScrimsQueryVariables>;
export const GetScrimmagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScrimmages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getScrimmages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"OPEN"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"hostTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"region"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<GetScrimmagesQuery, GetScrimmagesQueryVariables>;
export const ProfileAcceptOrgInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProfileAcceptOrgInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptOrgInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ProfileAcceptOrgInviteMutation, ProfileAcceptOrgInviteMutationVariables>;
export const ProfileDeclineOrgInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProfileDeclineOrgInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declineOrgInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}]}]}}]} as unknown as DocumentNode<ProfileDeclineOrgInviteMutation, ProfileDeclineOrgInviteMutationVariables>;
export const ProfileRespondToScrimInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ProfileRespondToScrimInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"invitation_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InvitationStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"respondToInvitation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"invitation_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"invitation_id"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ProfileRespondToScrimInviteMutation, ProfileRespondToScrimInviteMutationVariables>;
export const GetAllTeamUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllTeamUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetAllTeamUsersQuery, GetAllTeamUsersQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const SetCoreTeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCoreTeam"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCoreTeam"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<SetCoreTeamMutation, SetCoreTeamMutationVariables>;
export const InviteOrgMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InviteOrgMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgRole"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrgRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inviteMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"orgRole"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgRole"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]}}]} as unknown as DocumentNode<InviteOrgMemberMutation, InviteOrgMemberMutationVariables>;
export const GetUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const DisbandOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DisbandOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}}]}]}}]} as unknown as DocumentNode<DisbandOrganizationMutation, DisbandOrganizationMutationVariables>;
export const RemoveOrgMemberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveOrgMember"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeMember"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}]}]}}]} as unknown as DocumentNode<RemoveOrgMemberMutation, RemoveOrgMemberMutationVariables>;
export const UpdateOrgMemberRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrgMemberRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orgRole"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrgRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMemberRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"orgRole"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orgRole"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orgRole"}}]}}]}}]} as unknown as DocumentNode<UpdateOrgMemberRoleMutation, UpdateOrgMemberRoleMutationVariables>;
export const EditProfilePageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EditProfilePage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"heroes"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mmr"}}]}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgRole"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coreTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<EditProfilePageQuery, EditProfilePageQueryVariables>;
export const UserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}},{"kind":"Field","name":{"kind":"Name","value":"mmr"}}]}},{"kind":"Field","name":{"kind":"Name","value":"heroes"}},{"kind":"Field","name":{"kind":"Name","value":"online"}},{"kind":"Field","name":{"kind":"Name","value":"blockInvites"}}]}},{"kind":"Field","name":{"kind":"Name","value":"getUserOrgInvitations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgRole"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getScrimmageInvitations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"side"}},{"kind":"Field","name":{"kind":"Name","value":"scrimmage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}},{"kind":"Field","name":{"kind":"Name","value":"mmr"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgRole"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coreTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scrimmages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<UserProfileQuery, UserProfileQueryVariables>;
export const GetOrgScrimsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrgScrims"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrgScrimmages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"wagerAmount"}},{"kind":"Field","name":{"kind":"Name","value":"bestOf"}}]}}]}}]} as unknown as DocumentNode<GetOrgScrimsQuery, GetOrgScrimsQueryVariables>;
export const ReadyUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReadyUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"side"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MatchSide"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readyUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"side"},"value":{"kind":"Variable","name":{"kind":"Name","value":"side"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"readyHost"}},{"kind":"Field","name":{"kind":"Name","value":"readyOpponent"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ReadyUpMutation, ReadyUpMutationVariables>;
export const UnreadyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Unready"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"side"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MatchSide"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unready"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"side"},"value":{"kind":"Variable","name":{"kind":"Name","value":"side"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"readyHost"}},{"kind":"Field","name":{"kind":"Name","value":"readyOpponent"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UnreadyMutation, UnreadyMutationVariables>;
export const SetPartyCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetPartyCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"partyCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPartyCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"partyCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"partyCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"partyCode"}}]}}]}}]} as unknown as DocumentNode<SetPartyCodeMutation, SetPartyCodeMutationVariables>;
export const StartMatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartMatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startMatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"concludedAt"}},{"kind":"Field","name":{"kind":"Name","value":"match_id"}}]}}]}}]}}]} as unknown as DocumentNode<StartMatchMutation, StartMatchMutationVariables>;
export const CancelMatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelMatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelMatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"concludedAt"}},{"kind":"Field","name":{"kind":"Name","value":"match_id"}}]}}]}}]}}]} as unknown as DocumentNode<CancelMatchMutation, CancelMatchMutationVariables>;
export const SubmitMatchResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitMatchResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"match_number"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"deadlock_match_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"result"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MatchResult"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitMatchResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"match_number"},"value":{"kind":"Variable","name":{"kind":"Name","value":"match_number"}}},{"kind":"Argument","name":{"kind":"Name","value":"deadlock_match_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"deadlock_match_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"result"},"value":{"kind":"Variable","name":{"kind":"Name","value":"result"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"concludedAt"}},{"kind":"Field","name":{"kind":"Name","value":"match_id"}}]}}]}}]}}]} as unknown as DocumentNode<SubmitMatchResultMutation, SubmitMatchResultMutationVariables>;
export const EndScrimmageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EndScrimmage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endScrimmage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<EndScrimmageMutation, EndScrimmageMutationVariables>;
export const CancelScrimmageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelScrimmage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelScrimmage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CancelScrimmageMutation, CancelScrimmageMutationVariables>;
export const LeaveScrimmageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LeaveScrimmage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveScrimmage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<LeaveScrimmageMutation, LeaveScrimmageMutationVariables>;
export const DeclineChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeclineChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declineScrimmageChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<DeclineChallengeMutation, DeclineChallengeMutationVariables>;
export const JoinScrimmageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinScrimmage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"team"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinScrimmage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"team"},"value":{"kind":"Variable","name":{"kind":"Name","value":"team"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<JoinScrimmageMutation, JoinScrimmageMutationVariables>;
export const AcceptChallengeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AcceptChallenge"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"acceptScrimmageChallenge"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"org_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"org_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AcceptChallengeMutation, AcceptChallengeMutationVariables>;
export const SetOpponentRosterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetOpponentRoster"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetOpponentRosterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setOpponentRoster"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SetOpponentRosterMutation, SetOpponentRosterMutationVariables>;
export const GetMatchUserBySteamIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMatchUserBySteamId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"steam_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUserBySteamId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"steam_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"steam_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"online"}}]}}]}}]} as unknown as DocumentNode<GetMatchUserBySteamIdQuery, GetMatchUserBySteamIdQueryVariables>;
export const GetViewerOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetViewerOrg"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetViewerOrgQuery, GetViewerOrgQueryVariables>;
export const GetScrimmageDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetScrimmageDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getScrimmage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"scrimmage_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"scrimmage_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"bestOf"}},{"kind":"Field","name":{"kind":"Name","value":"isPrivate"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"wagerAmount"}},{"kind":"Field","name":{"kind":"Name","value":"partyCode"}},{"kind":"Field","name":{"kind":"Name","value":"readyHost"}},{"kind":"Field","name":{"kind":"Name","value":"readyOpponent"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"match_id"}},{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"concludedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"coreTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orgRole"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"invitations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"side"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<GetScrimmageDetailQuery, GetScrimmageDetailQueryVariables>;
export const ScrimListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScrimList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getScrimmages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"OPEN"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mmr"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"bestOf"}}]}}]}}]} as unknown as DocumentNode<ScrimListQuery, ScrimListQueryVariables>;
export const ScrimCalendarDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScrimCalendar"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getScrimmages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"host"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leader"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"bestOf"}}]}}]}}]} as unknown as DocumentNode<ScrimCalendarQuery, ScrimCalendarQueryVariables>;
export const CreateScrimDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateScrim"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateScrimmageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createScrimmage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<CreateScrimMutation, CreateScrimMutationVariables>;
export const GetTargetOrgDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTargetOrg"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<GetTargetOrgQuery, GetTargetOrgQueryVariables>;
export const CreateScrimPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CreateScrimPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"coreTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ranking"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"ranking"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"orgRole"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"online"}}]}},{"kind":"Field","name":{"kind":"Name","value":"coreTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"blocks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"timesheets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateScrimPageQuery, CreateScrimPageQueryVariables>;
export const SearchPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"online"}},{"kind":"Field","name":{"kind":"Name","value":"steam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"division"}},{"kind":"Field","name":{"kind":"Name","value":"mmr"}}]}},{"kind":"Field","name":{"kind":"Name","value":"heroes"}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getOrganizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"getScrimmages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"EnumValue","value":"COMPLETED"}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"result"}},{"kind":"Field","name":{"kind":"Name","value":"hostOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"opponentOrg"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]}}]} as unknown as DocumentNode<SearchPageQuery, SearchPageQueryVariables>;
export const GetFullProfileQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"getFullProfileQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}}]}}]}}]} as unknown as DocumentNode<GetFullProfileQueryQuery, GetFullProfileQueryQueryVariables>;
export const SendNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendNotificationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"recipient"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"senderName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"link"}},{"kind":"Field","name":{"kind":"Name","value":"actionId"}}]}}]}}]} as unknown as DocumentNode<SendNotificationMutation, SendNotificationMutationVariables>;