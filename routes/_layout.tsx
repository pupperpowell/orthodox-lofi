import { PageProps } from "$fresh/server.ts";
import { Link } from "../components/Link.tsx";
import { Status } from "../islands/Status.tsx";

export default function Layout({ Component }: PageProps) {
  // do something with state here
  return (
    <div class="p-2 mx-auto max-w-screen-lg min-h-screen flex flex-col border-2 border-gray-200 overflow-hidden">
      <h1 class="text-3xl/8 font-bold font-triodion">
        lofi byzantine music radio &mdash; chanting to relax/study to
        <span class="left-1 bottom-4 relative">
          <Status />
        </span>
      </h1>
      <main className={`grow`}>
        <Component />
      </main>
      <footer class="text-sm">
        <Link href="/about">about</Link>
      </footer>
    </div>
  );
}
