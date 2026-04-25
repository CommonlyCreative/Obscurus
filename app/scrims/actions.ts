"use server"

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../api/graphql/types";

const ScrimListPageQuery = graphql(`
  query ScrimList {
    getScrimmages(status: OPEN) {
      _id
      host {
        _id
        name
      }
      hostTeam {
        name
        members {
            _id
            mmr
            name
        }
      }
      status
      createdAt
      region
      note
      bestOf
    }
  }
`);

export const getScrimmageList = async () => {
    const { getScrimmages: scrimmages } = await grafbase.request(ScrimListPageQuery);
    
    return scrimmages;
}