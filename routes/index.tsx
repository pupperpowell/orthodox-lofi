import { Head } from "$fresh/runtime.ts";
import AudioPlayer from "../islands/AudioPlayer.tsx";
import ActiveListeners from "../islands/ActiveListeners.tsx";
import LatestCommit from "../islands/LatestCommit.tsx";
import CandleStand from "../islands/CandleStand.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>orthodox.cafe</title>
        {
          /* <script
          defer
          src="https://umami.pw1.xyz/script.js"
          data-website-id="1d621ad0-c522-45e0-b890-70854b34a3fc"
          data-domains="cafe.nightbreak.app,www.cafe.nightbreak.app"
        >
        </script> */
        }
      </Head>

      {Deno.env.get("ENVIRONMENT") == "DEV" &&
        <LatestCommit className="font-triodion" />}

      <ActiveListeners />

      <div>
        <AudioPlayer />
      </div>
    </>
  );
}
