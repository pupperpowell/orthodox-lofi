import { Head } from "$fresh/runtime.ts";
import AudioPlayer from "../islands/AudioPlayer.tsx";
import { Link } from "../components/Link.tsx";
import ActiveListeners from "../islands/ActiveListeners.tsx";
import { Status } from "../islands/Status.tsx";
import LatestCommit from "../islands/LatestCommit.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>orthodox.cafe</title>
        <script
          defer
          src="https://umami.pw1.xyz/script.js"
          data-website-id="1d621ad0-c522-45e0-b890-70854b34a3fc"
        >
        </script>
      </Head>

      <h1 class="text-4xl font-bold font-triodion">
        orthodox.cafe
        <span class="left-1 bottom-4 relative">
          <Status />
        </span>
      </h1>

      <LatestCommit />

      <div class="mt-4">
        <Link href="/about" class="mr-4">about</Link>
        <Link
          href="https://github.com/pupperpowell/orthodox-lofi"
          target="_blank"
        >
          github
        </Link>
      </div>

      <div class="mt-8">
        <AudioPlayer />
      </div>

      <div class="mt-4">
        <ActiveListeners />
      </div>
    </>
  );
}
