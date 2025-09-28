import { Head } from "$fresh/runtime.ts";
import LatestCommit from "../islands/LatestCommit.tsx";
import AudioPlayer from "../islands/AudioPlayer.tsx";
import WelcomeMessage from "../islands/WelcomeMessage.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>lofi byzantine music radio</title>
        <meta name="description" content="byzantine music soundscape to relax/study/pray to" />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://orthodox.cafe" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="lofi byzantine music radio" />
        <meta property="og:description" content="byzantine music soundscape to relax/study/pray to" />
        <meta property="og:image" content="church.jpg" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="orthodox.cafe" />
        <meta property="twitter:url" content="https://orthodox.cafe" />
        <meta name="twitter:title" content="lofi byzantine music radio" />
        <meta name="twitter:description" content="byzantine music soundscape to relax/study/pray to" />
        <meta name="twitter:image" content="church.jpg" />

        {/* <script
          defer
          src="https://umami.pw1.xyz/script.js"
          data-website-id="b99bf8e9-7ddc-4fdc-968b-fc90ac5ed4ea"
          data-domains="cafe.nightbreak.app,www.cafe.nightbreak.app,cafe.pw1.xyz"
        >
        </script> */}

        <script
          defer
          src="https://umami.pw1.xyz/script.js"
          data-website-id="9db30029-96c3-4f08-86c1-f931c37a73f7"
          data-domains="orthodox.cafe,www.orthodox.cafe"
        >
        </script>
      </Head >

      <div>
        <WelcomeMessage />
        <AudioPlayer />
      </div>

      {
        Deno.env.get("ENVIRONMENT") == "DEV" &&
        <span> latest commit: {" "}
          <LatestCommit className="font-triodion inline-block" />
        </span>
      }

    </>
  );
}
