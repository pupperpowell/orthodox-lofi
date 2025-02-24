import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import AudioPlayer from "../islands/AudioPlayer.tsx";
import ActiveUsers from "../islands/ActiveUsers.tsx";
import { Description } from "../components/Description.tsx";
import { Link } from "../components/Link.tsx";
import { Track } from "../utils/track.ts";

export const handler: Handlers<Track[]> = {
  GET(_, ctx) {
    // In a real app, these tracks are fetched from database/API
    const tracks = [
      { id: 1, title: "Psalm 135", url: "/audio/chant1.mp3" },
      { id: 2, title: "Soson Kyrie", url: "/audio/chant3.mp3" },
    ];
    return ctx.render(tracks);
  },
};

export default function Home() {
  return (
    <>
      <Head>
        <title>orthodox.cafe</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-5xl font-bold mb-8 font-triodion">orthodox.cafe</h1>
        
        <div class="mb-6">
          <Description>
            Byzantine chants with lo-fi filters - perfect for studying, prayer, or relaxation.
          </Description>
          
          <div class="mt-4">
            <Link href="/about" class="mr-4">about</Link>
            <Link href="https://github.com/pupperpowell/orthodox-lofi" target="_blank">github</Link>
          </div>
        </div>
        
        <div class="mb-4">
          <ActiveUsers />
        </div>
        
        <AudioPlayer />
      </div>
    </>
  );
}
