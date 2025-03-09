import { PageProps } from "$fresh/server.ts";
import { Link } from "../components/Link.tsx";
import { Status } from "../islands/Status.tsx";

export default function Layout({ Component }: PageProps) {
  // do something with state here
  return (
    <body class="p-4 mx-auto max-w-screen-md min-h-screen flex flex-col overflow-hidden">
      <h1 class="text-3xl/8 font-bold font-triodion">
        lofi byzantine music radio &mdash; chanting to relax/study to
        <span class="left-1 bottom-4 relative">
          <Status />
        </span>
      </h1>
      <main className={`grow`}>
        <Component />
      </main>
      <footer class="text-sm flex gap-4">
        <Link href="/">home</Link>
        <Link href="/about">about</Link>
      </footer>
    </body>
  );
}
