import { Suspense } from "react";
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

export default function HomePage() {
    return (
        <main className="flex flex-col flex-1">
            <Suspense fallback={<HomeSkeleton />}>
                <HomeContent />
            </Suspense>
        </main>
    );
}

async function HomeContent() {
    const { getScrimmages: scrims, getUsers: users, getOrganizations: orgs } = await grafbase.request(HomePageQuery);
    return (
        <>
            <HeroSection scrims={scrims.length} players={users.length} orgs={orgs?.length ?? 0} />
            <HowItWorksSection />
            <OpenScrimsSection scrims={scrims} />
            <CtaSection />
        </>
    );
}

function HomeSkeleton() {
    return (
        <div className="animate-pulse flex flex-col flex-1">
            <div className="min-h-96 flex items-center justify-center px-4">
                <div className="w-full max-w-3xl mx-auto text-center space-y-4">
                    <div className="h-14 bg-surface-2 rounded-lg w-3/4 mx-auto" />
                    <div className="h-5 bg-surface-2 rounded-lg w-1/2 mx-auto" />
                    <div className="h-5 bg-surface-2 rounded-lg w-2/5 mx-auto" />
                    <div className="flex gap-3 justify-center pt-2">
                        <div className="h-10 w-36 bg-surface-2 rounded-md" />
                        <div className="h-10 w-32 bg-surface-2 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}
