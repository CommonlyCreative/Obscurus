import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { OpenScrimsSection } from "@/components/home/OpenScrimsSection";
import { CtaSection } from "@/components/home/CtaSection";
import { graphql } from "./api/graphql/types";
import { grafbase } from "@/lib/database/grafbase";

const HomePageQuery = graphql(`
  query GetScrimmages {
    getScrimmages(status: OPEN) {
      _id
      hostTeam {
        name
        leader {
            name
        }
      }
      hostOrg {
        name
      }
      createdAt
      note
      region
    }
    getUsers {
        _id
    }
    getOrganizations {
        _id
    }
  }
`);

export default async function HomePage() {
    const { getScrimmages: scrims, getUsers: users, getOrganizations: orgs } = await grafbase.request(HomePageQuery)

    return (
        <main className="flex flex-col flex-1">
            <HeroSection scrims={scrims.length} players={users.length} orgs={orgs?.length ?? 0} />
            <HowItWorksSection />
            <OpenScrimsSection scrims={scrims} />
            <CtaSection />
        </main>
    );
}
