import { Head } from "$fresh/runtime.ts";
import AudioPlayer from "../islands/AudioPlayer.tsx";
import LatestCommit from "../islands/LatestCommit.tsx";
import NewAudioPlayer from "../islands/NewAudioPlayer.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>orthodox.cafe</title>

        <script
          defer
          src="https://umami.pw1.xyz/script.js"
          data-website-id="b99bf8e9-7ddc-4fdc-968b-fc90ac5ed4ea"
          data-domains="cafe.nightbreak.app,www.cafe.nightbreak.app"
        >
        </script>

        <script
          defer
          src="https://umami.pw1.xyz/script.js"
          data-website-id="9db30029-96c3-4f08-86c1-f931c37a73f7"
          data-domains="orthodox.cafe,www.orthodox.cafe"
        >
        </script>
      </Head>

      {Deno.env.get("ENVIRONMENT") == "DEV" &&
        <LatestCommit className="font-triodion" />}

      <div>
        <AudioPlayer />
      </div>

      <div>
        <NewAudioPlayer />
      </div>
    </>
  );
}
