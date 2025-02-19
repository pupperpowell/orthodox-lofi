import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import AudioPlayer from "../islands/AudioPlayer.tsx";

interface Track {
  id: number;
  title: string;
  url: string;
}

export const handler: Handlers<Track[]> = {
  GET(_, ctx) {
    // In a real app, these tracks are fetched from database/API
    const tracks = [
      { id: 1, title: "Byzantine Chant 1", url: "/audio/chant1.mp3" },
    ];
    return ctx.render(tracks);
  },
};

export default function Home({ data: tracks }: PageProps<Track[]>) {
  return (
    <>
      <Head>
        <title>Orthodox Lo-fi</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-4xl font-bold mb-8">Orthodox Lo-fi</h1>
        <AudioPlayer tracks={tracks} />
      </div>
    </>
  );
}
