import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './route';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  addCorePlayer?: Maybe<Organization>;
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
  sendNotification?: Maybe<Notification>;
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


export type MutationAddCorePlayerArgs = {
  org_id: Scalars['String']['input'];
  user_id: Scalars['String']['input'];
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


export type MutationSendNotificationArgs = {
  input: SendNotificationInput;
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
  description: Scalars['String']['output'];
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
  description: Scalars['String']['input'];
  link?: InputMaybe<Scalars['String']['input']>;
  recipient: Scalars['String']['input'];
  senderName: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: NotificationType;
};

export type SetOpponentRosterInput = {
  org_id: Scalars['String']['input'];
  scrimmage_id: Scalars['String']['input'];
  team: Array<Scalars['String']['input']>;
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
  createdAt: Scalars['Timestamp']['output'];
  heroes: Array<Scalars['Int']['output']>;
  mmr: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  online: Scalars['Boolean']['output'];
  organization?: Maybe<Organization>;
  region?: Maybe<Scalars['String']['output']>;
  role: Role;
  scrimmages: Array<Scrimmage>;
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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Adjustment: ResolverTypeWrapper<Adjustment>;
  ApplicantStatus: ApplicantStatus;
  Balance: ResolverTypeWrapper<Balance>;
  BalanceInput: BalanceInput;
  BestOf: BestOf;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CardFunding: CardFunding;
  CreateOrganizationInput: CreateOrganizationInput;
  CreateScrimmageInput: CreateScrimmageInput;
  CreditPurchase: ResolverTypeWrapper<CreditPurchase>;
  CreditTransaction: ResolverTypeWrapper<CreditTransaction>;
  CreditTxType: CreditTxType;
  Customer: ResolverTypeWrapper<Customer>;
  CustomerInput: CustomerInput;
  Disputes: ResolverTypeWrapper<Disputes>;
  EventProcessingStatus: EventProcessingStatus;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvitationStatus: InvitationStatus;
  LogStripeEventInput: LogStripeEventInput;
  Match: ResolverTypeWrapper<Match>;
  MatchResult: MatchResult;
  MatchSide: MatchSide;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Notification: ResolverTypeWrapper<Notification>;
  NotificationType: NotificationType;
  OrgMemberStatus: OrgMemberStatus;
  OrgRequest: ResolverTypeWrapper<OrgRequest>;
  OrgRequestStatus: OrgRequestStatus;
  OrgRole: OrgRole;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationMember: ResolverTypeWrapper<OrganizationMember>;
  PlaceWagerInput: PlaceWagerInput;
  Processor: Processor;
  PurchaseCreditsInput: PurchaseCreditsInput;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RefundReason: RefundReason;
  RespondToInvitationInput: RespondToInvitationInput;
  Role: Role;
  Scrimmage: ResolverTypeWrapper<Scrimmage>;
  ScrimmageInvitation: ResolverTypeWrapper<ScrimmageInvitation>;
  ScrimmageInvitationInput: ScrimmageInvitationInput;
  ScrimmageResult: ScrimmageResult;
  ScrimmageStatus: ScrimmageStatus;
  SendNotificationInput: SendNotificationInput;
  SetOpponentRosterInput: SetOpponentRosterInput;
  Steam: ResolverTypeWrapper<Steam>;
  SteamInput: SteamInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StripeEvent: ResolverTypeWrapper<StripeEvent>;
  SubApplicant: ResolverTypeWrapper<SubApplicant>;
  SubRequestStatus: SubRequestStatus;
  SubmitOrgRequestInput: SubmitOrgRequestInput;
  SubstituteRequest: ResolverTypeWrapper<SubstituteRequest>;
  SubstituteRequestInput: SubstituteRequestInput;
  Team: ResolverTypeWrapper<Team>;
  TeamInput: TeamInput;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionInput: TransactionInput;
  TransactionMethod: ResolverTypeWrapper<TransactionMethod>;
  TransactionMethodInput: TransactionMethodInput;
  TransactionMethodType: TransactionMethodType;
  TransactionStatus: TransactionStatus;
  TransactionType: TransactionType;
  UpdateOrganizationInput: UpdateOrganizationInput;
  UpdateRosterSlotInput: UpdateRosterSlotInput;
  UpdateScrimmageInput: UpdateScrimmageInput;
  UpdateTransactionInput: UpdateTransactionInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User>;
  UserInput: UserInput;
  Wager: ResolverTypeWrapper<Wager>;
  WagerStatus: WagerStatus;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Adjustment: Adjustment;
  Balance: Balance;
  BalanceInput: BalanceInput;
  Boolean: Scalars['Boolean']['output'];
  CreateOrganizationInput: CreateOrganizationInput;
  CreateScrimmageInput: CreateScrimmageInput;
  CreditPurchase: CreditPurchase;
  CreditTransaction: CreditTransaction;
  Customer: Customer;
  CustomerInput: CustomerInput;
  Disputes: Disputes;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LogStripeEventInput: LogStripeEventInput;
  Match: Match;
  Mutation: Record<PropertyKey, never>;
  Notification: Notification;
  OrgRequest: OrgRequest;
  Organization: Organization;
  OrganizationMember: OrganizationMember;
  PlaceWagerInput: PlaceWagerInput;
  PurchaseCreditsInput: PurchaseCreditsInput;
  Query: Record<PropertyKey, never>;
  RespondToInvitationInput: RespondToInvitationInput;
  Scrimmage: Scrimmage;
  ScrimmageInvitation: ScrimmageInvitation;
  ScrimmageInvitationInput: ScrimmageInvitationInput;
  SendNotificationInput: SendNotificationInput;
  SetOpponentRosterInput: SetOpponentRosterInput;
  Steam: Steam;
  SteamInput: SteamInput;
  String: Scalars['String']['output'];
  StripeEvent: StripeEvent;
  SubApplicant: SubApplicant;
  SubmitOrgRequestInput: SubmitOrgRequestInput;
  SubstituteRequest: SubstituteRequest;
  SubstituteRequestInput: SubstituteRequestInput;
  Team: Team;
  TeamInput: TeamInput;
  Timestamp: Scalars['Timestamp']['output'];
  Transaction: Transaction;
  TransactionInput: TransactionInput;
  TransactionMethod: TransactionMethod;
  TransactionMethodInput: TransactionMethodInput;
  UpdateOrganizationInput: UpdateOrganizationInput;
  UpdateRosterSlotInput: UpdateRosterSlotInput;
  UpdateScrimmageInput: UpdateScrimmageInput;
  UpdateTransactionInput: UpdateTransactionInput;
  UpdateUserInput: UpdateUserInput;
  User: User;
  UserInput: UserInput;
  Wager: Wager;
}>;

export type AdjustmentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Adjustment'] = ResolversParentTypes['Adjustment']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  failureMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  processor?: Resolver<Maybe<ResolversTypes['Processor']>, ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['RefundReason']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TransactionStatus'], ParentType, ContextType>;
  stripeRefundId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  transaction?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
}>;

export type BalanceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']> = ResolversObject<{
  credits?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pending?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  winnings?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type CreditPurchaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreditPurchase'] = ResolversParentTypes['CreditPurchase']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amountPaidCents?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  creditTransaction?: Resolver<ResolversTypes['CreditTransaction'], ParentType, ContextType>;
  credits?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stripeTransaction?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type CreditTransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreditTransaction'] = ResolversParentTypes['CreditTransaction']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  balanceAfter?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['CreditTxType'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  wager?: Resolver<Maybe<ResolversTypes['Wager']>, ParentType, ContextType>;
}>;

export type CustomerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Customer'] = ResolversParentTypes['Customer']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  billingAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isOnboarded?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeCustomerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type DisputesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Disputes'] = ResolversParentTypes['Disputes']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  creator?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  scrimmage?: Resolver<ResolversTypes['Scrimmage'], ParentType, ContextType>;
}>;

export type MatchResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Match'] = ResolversParentTypes['Match']> = ResolversObject<{
  concludedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  match_id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes['MatchResult']>, ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  acceptOrgInvite?: Resolver<Maybe<ResolversTypes['OrganizationMember']>, ParentType, ContextType, RequireFields<MutationAcceptOrgInviteArgs, 'org_id' | 'user_id'>>;
  acceptScrimmageChallenge?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationAcceptScrimmageChallengeArgs, 'org_id' | 'scrimmage_id'>>;
  addCorePlayer?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationAddCorePlayerArgs, 'org_id' | 'user_id'>>;
  adjustCredits?: Resolver<Maybe<ResolversTypes['CreditTransaction']>, ParentType, ContextType, RequireFields<MutationAdjustCreditsArgs, 'amount' | 'note' | 'user_id'>>;
  applyToSubstituteRequest?: Resolver<Maybe<ResolversTypes['SubApplicant']>, ParentType, ContextType, RequireFields<MutationApplyToSubstituteRequestArgs, 'request_id'>>;
  assignSubstitute?: Resolver<Maybe<ResolversTypes['ScrimmageInvitation']>, ParentType, ContextType, RequireFields<MutationAssignSubstituteArgs, 'invitation_id' | 'substitute_id'>>;
  cancelMatch?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationCancelMatchArgs, 'scrimmage_id'>>;
  cancelOrgRequest?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationCancelOrgRequestArgs, 'request_id' | 'user_id'>>;
  cancelScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationCancelScrimmageArgs, 'scrimmage_id'>>;
  cancelSubstituteRequest?: Resolver<Maybe<ResolversTypes['SubstituteRequest']>, ParentType, ContextType, RequireFields<MutationCancelSubstituteRequestArgs, 'request_id'>>;
  createCustomer?: Resolver<Maybe<ResolversTypes['Customer']>, ParentType, ContextType, RequireFields<MutationCreateCustomerArgs, 'input'>>;
  createOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationCreateOrganizationArgs, 'input' | 'owner_id'>>;
  createScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationCreateScrimmageArgs, 'input'>>;
  createSubstituteRequest?: Resolver<Maybe<ResolversTypes['SubstituteRequest']>, ParentType, ContextType, RequireFields<MutationCreateSubstituteRequestArgs, 'input'>>;
  createUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  declineOrgInvite?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeclineOrgInviteArgs, 'org_id' | 'user_id'>>;
  declineScrimmageChallenge?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationDeclineScrimmageChallengeArgs, 'org_id' | 'scrimmage_id'>>;
  deleteOrganization?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteOrganizationArgs, 'org_id'>>;
  dismissNotification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDismissNotificationArgs, 'notification_id' | 'user_id'>>;
  endScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationEndScrimmageArgs, 'scrimmage_id'>>;
  inviteMember?: Resolver<Maybe<ResolversTypes['OrganizationMember']>, ParentType, ContextType, RequireFields<MutationInviteMemberArgs, 'orgRole' | 'org_id' | 'user_id'>>;
  joinScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationJoinScrimmageArgs, 'scrimmage_id' | 'team'>>;
  leaveScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationLeaveScrimmageArgs, 'scrimmage_id'>>;
  logStripeEvent?: Resolver<Maybe<ResolversTypes['StripeEvent']>, ParentType, ContextType, RequireFields<MutationLogStripeEventArgs, 'input'>>;
  logTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<MutationLogTransactionArgs, 'transaction'>>;
  placeWager?: Resolver<Maybe<ResolversTypes['Wager']>, ParentType, ContextType, RequireFields<MutationPlaceWagerArgs, 'input'>>;
  purchaseCredits?: Resolver<Maybe<ResolversTypes['CreditPurchase']>, ParentType, ContextType, RequireFields<MutationPurchaseCreditsArgs, 'input'>>;
  readyUp?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationReadyUpArgs, 'scrimmage_id' | 'side'>>;
  removeCorePlayer?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationRemoveCorePlayerArgs, 'org_id' | 'user_id'>>;
  removeMember?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveMemberArgs, 'org_id' | 'user_id'>>;
  respondToInvitation?: Resolver<Maybe<ResolversTypes['ScrimmageInvitation']>, ParentType, ContextType, RequireFields<MutationRespondToInvitationArgs, 'input'>>;
  reviewOrgRequest?: Resolver<Maybe<ResolversTypes['OrgRequest']>, ParentType, ContextType, RequireFields<MutationReviewOrgRequestArgs, 'request_id' | 'status'>>;
  selectSubstitute?: Resolver<Maybe<ResolversTypes['SubstituteRequest']>, ParentType, ContextType, RequireFields<MutationSelectSubstituteArgs, 'request_id' | 'user_id'>>;
  sendNotification?: Resolver<Maybe<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<MutationSendNotificationArgs, 'input'>>;
  setCoreTeam?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationSetCoreTeamArgs, 'org_id' | 'user_ids'>>;
  setOnlineStatus?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationSetOnlineStatusArgs, 'online' | 'user_id'>>;
  setOpponentRoster?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationSetOpponentRosterArgs, 'input'>>;
  setPartyCode?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationSetPartyCodeArgs, 'partyCode' | 'scrimmage_id'>>;
  settleWagers?: Resolver<Array<ResolversTypes['Wager']>, ParentType, ContextType, RequireFields<MutationSettleWagersArgs, 'scrimmage_id'>>;
  startMatch?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationStartMatchArgs, 'scrimmage_id'>>;
  submitMatchResult?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationSubmitMatchResultArgs, 'deadlock_match_id' | 'match_number' | 'result' | 'scrimmage_id'>>;
  submitOrgRequest?: Resolver<Maybe<ResolversTypes['OrgRequest']>, ParentType, ContextType, RequireFields<MutationSubmitOrgRequestArgs, 'input' | 'user_id'>>;
  transferOwnership?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationTransferOwnershipArgs, 'new_owner_id' | 'org_id'>>;
  unready?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationUnreadyArgs, 'scrimmage_id' | 'side'>>;
  updateMemberRole?: Resolver<Maybe<ResolversTypes['OrganizationMember']>, ParentType, ContextType, RequireFields<MutationUpdateMemberRoleArgs, 'orgRole' | 'org_id' | 'user_id'>>;
  updateOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<MutationUpdateOrganizationArgs, 'input' | 'org_id'>>;
  updateRosterSlot?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationUpdateRosterSlotArgs, 'input'>>;
  updateScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<MutationUpdateScrimmageArgs, 'input' | 'scrimmage_id'>>;
  updateStripeEvent?: Resolver<Maybe<ResolversTypes['StripeEvent']>, ParentType, ContextType, RequireFields<MutationUpdateStripeEventArgs, 'status' | 'stripe_event_id'>>;
  updateTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<MutationUpdateTransactionArgs, 'input' | 'transaction_id'>>;
  updateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'input' | 'user_id'>>;
}>;

export type NotificationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  actionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  link?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recipient?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  senderName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['NotificationType'], ParentType, ContextType>;
}>;

export type OrgRequestResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OrgRequest'] = ResolversParentTypes['OrgRequest']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrgRequestStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type OrganizationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  coreTeam?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['OrganizationMember']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
}>;

export type OrganizationMemberResolvers<ContextType = Context, ParentType extends ResolversParentTypes['OrganizationMember'] = ResolversParentTypes['OrganizationMember']> = ResolversObject<{
  joinedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  orgRole?: Resolver<ResolversTypes['OrgRole'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrgMemberStatus'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  getCreditBalance?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryGetCreditBalanceArgs, 'user_id'>>;
  getCreditPurchases?: Resolver<Array<ResolversTypes['CreditPurchase']>, ParentType, ContextType, RequireFields<QueryGetCreditPurchasesArgs, 'user_id'>>;
  getCreditTransactions?: Resolver<Array<ResolversTypes['CreditTransaction']>, ParentType, ContextType, RequireFields<QueryGetCreditTransactionsArgs, 'user_id'>>;
  getCustomer?: Resolver<Maybe<ResolversTypes['Customer']>, ParentType, ContextType, RequireFields<QueryGetCustomerArgs, 'user_id'>>;
  getCustomerTransactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QueryGetCustomerTransactionsArgs, 'customer_id'>>;
  getMyOrgRequest?: Resolver<Maybe<ResolversTypes['OrgRequest']>, ParentType, ContextType, RequireFields<QueryGetMyOrgRequestArgs, 'user_id'>>;
  getNotifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<QueryGetNotificationsArgs, 'user_id'>>;
  getOrgRequests?: Resolver<Array<ResolversTypes['OrgRequest']>, ParentType, ContextType, Partial<QueryGetOrgRequestsArgs>>;
  getOrgScrimmages?: Resolver<Maybe<Array<ResolversTypes['Scrimmage']>>, ParentType, ContextType, RequireFields<QueryGetOrgScrimmagesArgs, 'org_id'>>;
  getOrgSubstituteRequests?: Resolver<Array<ResolversTypes['SubstituteRequest']>, ParentType, ContextType, RequireFields<QueryGetOrgSubstituteRequestsArgs, 'org_id'>>;
  getOrganization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryGetOrganizationArgs, 'org_id'>>;
  getOrganizationBySlug?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QueryGetOrganizationBySlugArgs, 'slug'>>;
  getOrganizationMembers?: Resolver<Array<ResolversTypes['OrganizationMember']>, ParentType, ContextType, RequireFields<QueryGetOrganizationMembersArgs, 'org_id'>>;
  getOrganizations?: Resolver<Maybe<Array<ResolversTypes['Organization']>>, ParentType, ContextType>;
  getPublicScrimmages?: Resolver<Array<ResolversTypes['Scrimmage']>, ParentType, ContextType, Partial<QueryGetPublicScrimmagesArgs>>;
  getScrimmage?: Resolver<Maybe<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<QueryGetScrimmageArgs, 'scrimmage_id'>>;
  getScrimmageInvitations?: Resolver<Array<ResolversTypes['ScrimmageInvitation']>, ParentType, ContextType, RequireFields<QueryGetScrimmageInvitationsArgs, 'user_id'>>;
  getScrimmageWagers?: Resolver<Array<ResolversTypes['Wager']>, ParentType, ContextType, RequireFields<QueryGetScrimmageWagersArgs, 'scrimmage_id'>>;
  getScrimmages?: Resolver<Array<ResolversTypes['Scrimmage']>, ParentType, ContextType, Partial<QueryGetScrimmagesArgs>>;
  getStripeEvent?: Resolver<Maybe<ResolversTypes['StripeEvent']>, ParentType, ContextType, RequireFields<QueryGetStripeEventArgs, 'stripe_event_id'>>;
  getSubstituteRequest?: Resolver<Maybe<ResolversTypes['SubstituteRequest']>, ParentType, ContextType, RequireFields<QueryGetSubstituteRequestArgs, 'request_id'>>;
  getSubstituteRequests?: Resolver<Array<ResolversTypes['SubstituteRequest']>, ParentType, ContextType, Partial<QueryGetSubstituteRequestsArgs>>;
  getTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QueryGetTransactionArgs, 'transaction_id'>>;
  getTransactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType>;
  getUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserArgs, 'user_id'>>;
  getUserBySteamId?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserBySteamIdArgs, 'steam_id'>>;
  getUserOrgInvitations?: Resolver<Array<Maybe<ResolversTypes['Organization']>>, ParentType, ContextType, RequireFields<QueryGetUserOrgInvitationsArgs, 'user_id'>>;
  getUserScrimmages?: Resolver<Array<ResolversTypes['Scrimmage']>, ParentType, ContextType, RequireFields<QueryGetUserScrimmagesArgs, 'user_id'>>;
  getUserWagers?: Resolver<Array<ResolversTypes['Wager']>, ParentType, ContextType, RequireFields<QueryGetUserWagersArgs, 'user_id'>>;
  getUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  getWager?: Resolver<Maybe<ResolversTypes['Wager']>, ParentType, ContextType, RequireFields<QueryGetWagerArgs, 'wager_id'>>;
  hasUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, Partial<QueryHasUserArgs>>;
  searchOrganizations?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType, RequireFields<QuerySearchOrganizationsArgs, 'query'>>;
}>;

export type ScrimmageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Scrimmage'] = ResolversParentTypes['Scrimmage']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  bestOf?: Resolver<ResolversTypes['BestOf'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  draftLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  host?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  hostOrg?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  hostTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType>;
  invitations?: Resolver<Array<ResolversTypes['ScrimmageInvitation']>, ParentType, ContextType>;
  isPrivate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  matches?: Resolver<Array<ResolversTypes['Match']>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  opponentOrg?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  opponentTeam?: Resolver<Maybe<ResolversTypes['Team']>, ParentType, ContextType>;
  partyCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  readyHost?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  readyOpponent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  region?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  result?: Resolver<Maybe<ResolversTypes['ScrimmageResult']>, ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ScrimmageStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  wagerAmount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type ScrimmageInvitationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ScrimmageInvitation'] = ResolversParentTypes['ScrimmageInvitation']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  respondedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  scrimmage?: Resolver<ResolversTypes['Scrimmage'], ParentType, ContextType>;
  side?: Resolver<ResolversTypes['MatchSide'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['InvitationStatus'], ParentType, ContextType>;
  substitute?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type SteamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Steam'] = ResolversParentTypes['Steam']> = ResolversObject<{
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type StripeEventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['StripeEvent'] = ResolversParentTypes['StripeEvent']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  apiVersion?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errorMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eventType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  livemode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  payloadHash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  processedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  processingStatus?: Resolver<ResolversTypes['EventProcessingStatus'], ParentType, ContextType>;
  receivedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  relatedTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  retryCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stripeEventId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
}>;

export type SubApplicantResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubApplicant'] = ResolversParentTypes['SubApplicant']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  appliedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  request?: Resolver<ResolversTypes['SubstituteRequest'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ApplicantStatus'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
}>;

export type SubstituteRequestResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubstituteRequest'] = ResolversParentTypes['SubstituteRequest']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  applicants?: Resolver<Array<ResolversTypes['SubApplicant']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  filledBy?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  postedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  replacing?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  scrimmage?: Resolver<ResolversTypes['Scrimmage'], ParentType, ContextType>;
  side?: Resolver<ResolversTypes['MatchSide'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubRequestStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
}>;

export type TeamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = ResolversObject<{
  leader?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TransactionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer?: Resolver<Maybe<ResolversTypes['Customer']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  failureCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  failureMessage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fingerprint?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  livemode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  method?: Resolver<Maybe<ResolversTypes['TransactionMethod']>, ParentType, ContextType>;
  processedAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  receiptUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refunded?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  refundedAmount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TransactionStatus'], ParentType, ContextType>;
  stripeBalanceTransactionId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeChargeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripeEventId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stripePaymentIntentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtotal?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tax?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TransactionType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
}>;

export type TransactionMethodResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TransactionMethod'] = ResolversParentTypes['TransactionMethod']> = ResolversObject<{
  brand?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  expYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  funding?: Resolver<Maybe<ResolversTypes['CardFunding']>, ParentType, ContextType>;
  last4?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['TransactionMethodType']>, ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Balance'], ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  heroes?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  mmr?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  online?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  scrimmages?: Resolver<Array<ResolversTypes['Scrimmage']>, ParentType, ContextType>;
  steam?: Resolver<Maybe<ResolversTypes['Steam']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type WagerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Wager'] = ResolversParentTypes['Wager']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  leader?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  scrimmage?: Resolver<ResolversTypes['Scrimmage'], ParentType, ContextType>;
  settledAt?: Resolver<Maybe<ResolversTypes['Timestamp']>, ParentType, ContextType>;
  side?: Resolver<ResolversTypes['MatchSide'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['WagerStatus'], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  Adjustment?: AdjustmentResolvers<ContextType>;
  Balance?: BalanceResolvers<ContextType>;
  CreditPurchase?: CreditPurchaseResolvers<ContextType>;
  CreditTransaction?: CreditTransactionResolvers<ContextType>;
  Customer?: CustomerResolvers<ContextType>;
  Disputes?: DisputesResolvers<ContextType>;
  Match?: MatchResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  OrgRequest?: OrgRequestResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationMember?: OrganizationMemberResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Scrimmage?: ScrimmageResolvers<ContextType>;
  ScrimmageInvitation?: ScrimmageInvitationResolvers<ContextType>;
  Steam?: SteamResolvers<ContextType>;
  StripeEvent?: StripeEventResolvers<ContextType>;
  SubApplicant?: SubApplicantResolvers<ContextType>;
  SubstituteRequest?: SubstituteRequestResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  Transaction?: TransactionResolvers<ContextType>;
  TransactionMethod?: TransactionMethodResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Wager?: WagerResolvers<ContextType>;
}>;

