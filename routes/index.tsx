import { Head } from "$fresh/runtime.ts";
import AudioPlayer from "../islands/AudioPlayer.tsx";
import { Link } from "../components/Link.tsx";
import ActiveListeners from "../islands/ActiveListeners.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>orthodox.cafe</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <h1 class="text-4xl font-bold mb-8 font-triodion">orthodox.cafe</h1>

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
      </div>
    </>
  );
}
