"use server";

import { grafbase } from "@/lib/database/grafbase";
import { graphql } from "../api/graphql/types";

const ArchiveListQuery = graphql(`
  query ArchiveList($limit: Int) {
    getScrimmages(status: COMPLETED, limit: $limit) {
      _id
      host {
        _id
        name
      }
      hostOrg {
        _id
        name
      }
      opponentOrg {
        _id
        name
      }
      hostTeam {
        name
        members {
          _id
          name
          stats {
            mmr
          }
        }
      }
      opponentTeam {
        name
        members {
          _id
          name
          stats {
            mmr
          }
        }
      }
      status
      result
      bestOf
      region
      note
      wagerAmount
      scheduledAt
      createdAt
      matches {
        number
        result
      }
    }
  }
`);

export const getArchivedScrimmages = async (limit = 500) => {
  const { getScrimmages: scrimmages } = await grafbase.request(ArchiveListQuery, { limit });
  return scrimmages;
};
