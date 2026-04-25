import { GraphQLClient } from 'graphql-request'
import { constructURL } from '../utils'

// export { gql } from 'graphql-request'

export const grafbase = new GraphQLClient(
    constructURL("/api/graphql"),
    {
        headers: {
            authorization: String(process.env.AUTHORIZATION),
        },
        next: {
            revalidate: 0,
            tags: ["graphql"]
        }
    },
)