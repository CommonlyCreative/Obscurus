"use server"

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "@/app/api/graphql/types";

const SearchPageQuery = graphql(`
    query SearchPage {
        getUsers {
            _id
            name
            role
            online
            mmr
            heroes
            organization {
                _id
                name
                slug
            }
        }
        getOrganizations {
            _id
            name
            slug
            members {
                status
            }
        }
        getScrimmages(status: COMPLETED, limit: 1000) {
            result
            hostOrg {
                _id
            }
            opponentOrg {
                _id
            }
        }
    }
`);

export async function getSearchData() {
    return grafbase.request(SearchPageQuery);
}
