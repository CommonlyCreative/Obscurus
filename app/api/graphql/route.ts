import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import fs from "fs"
import path from "path";
import { client, db } from "@/lib/database/mongo";
import { ScrimmageDataSource } from "./datasources/scrimmage";
import { resolvers } from "./resolvers";
import { TransactionDataSource } from "./datasources/transaction";
import { CustomerDataSource } from "./datasources/customer";
import { OrganizationDataSource } from "./datasources/organization";
import { StripeEventDataSource } from "./datasources/stripe-event";
import { WagerDataSource } from "./datasources/wager";
import { UserDataSource } from "./datasources/user";
import { OrgRequestDataSource } from "./datasources/org-request";
import { NotificationDataSource } from "./datasources/notification";

const typeDefs       = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/default.graphql"))
const profileDefs    = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/users.graphql"))
const transactionDefs = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/transactions.graphql"))
const scrimmageDefs  = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/scrimmages.graphql"))
const orgDefs        = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/organization.graphql"))
const orgRequestDefs   = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/org-request.graphql"))
const notificationDefs = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/notification.graphql"))
const wagerDefs        = fs.readFileSync(path.join(process.cwd(), "/app/api/graphql/graphs/wager.graphql"))

export interface Context {
    dataSources: {
        users: UserDataSource
        scrimmages: ScrimmageDataSource
        transactions: TransactionDataSource
        customers: CustomerDataSource
        organizations: OrganizationDataSource
        orgRequests: OrgRequestDataSource
        notifications: NotificationDataSource
        stripeEvents: StripeEventDataSource
        wagers: WagerDataSource
    }
}

const server = new ApolloServer<Context>({
    resolvers: [resolvers],
    typeDefs: [
        typeDefs.toString(),
        profileDefs.toString(),
        transactionDefs.toString(),
        scrimmageDefs.toString(),
        orgDefs.toString(),
        orgRequestDefs.toString(),
        notificationDefs.toString(),
        wagerDefs.toString(),
    ],
    introspection: true,
});
const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
    context: async (req, res) => {
        return {
            req,
            res,
            dataSources: {
                users:         new UserDataSource(db.collection("user")),
                scrimmages:    new ScrimmageDataSource(db.collection("scrimmages")),
                transactions:  new TransactionDataSource(db.collection("transactions")),
                customers:     new CustomerDataSource(db.collection("customers")),
                organizations: new OrganizationDataSource(db.collection("organizations")),
                orgRequests:   new OrgRequestDataSource(db.collection("organization_requests")),
                notifications: new NotificationDataSource(db.collection("notifications")),
                stripeEvents:  new StripeEventDataSource(db.collection("stripe_events")),
                wagers:        new WagerDataSource(
                    db.collection("wagers"),
                    db.collection("credit_transactions"),
                    db.collection("credit_purchases"),
                ),
            }
        }
    },
});

export async function GET(request: Request) {
    // if (request.headers.get("Authorization") !== process.env.AUTHORIZATION)
    //     return NextResponse.json({ error: "Not authorized." }, { status: 401 })
    return handler(request)
}

export async function POST(request: Request) {
    // if (request.headers.get("Authorization") !== process.env.AUTHORIZATION)
    //     return NextResponse.json({ error: "Not authorized." }, { status: 401 })
    return handler(request)
}

export const revalidate = 0;