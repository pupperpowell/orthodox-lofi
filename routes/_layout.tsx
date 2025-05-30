import { PageProps } from "$fresh/server.ts";
import ShareButton from "../islands/ShareButton.tsx";

export default function Layout({ Component }: PageProps) {
  // do something with state here
  return (
    <body class="p-4 py-12 mx-auto max-w-screen-sm min-h-screen flex flex-col">
      <main className={`grow`}>
        <Component />
      </main>
      <footer class="text-lg flex gap-4">
        <ShareButton />
        {/* <Link href="/about">about</Link> */}
        {/* <Link href="/credits">credits</Link> */}
      </footer>
    </body>
  );
}
