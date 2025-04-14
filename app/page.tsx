import Hero from "@/app/(home)/_components/hero";
import Image from "next/image";
import GuildFeatures from "./(home)/_components/guild-features";
import GuildStats from "./(home)/_components/guild-stats";
import GuildActivities from "./(home)/_components/guild-activites";
import JoinGuild from "./(home)/_components/join-guild";

export default function Home() {
  return (
    <>
      <Hero />
      <GuildFeatures />
      <GuildStats />
      <GuildActivities />
      <JoinGuild />
    </>
  );
}
