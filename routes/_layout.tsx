import { PageProps } from "$fresh/server.ts";
import ShareButton from "../islands/ShareButton.tsx";

export default function Layout({ Component }: PageProps) {
  // do something with state here
  return (
    <body class="p-4 mx-auto max-w-screen-sm min-h-screen flex flex-col">
      <main class="grow">
        <Component />
      </main>
      <footer >
        <ShareButton />
        {/* <Link href="/about">about</Link> */}
        {/* <Link href="/credits">credits</Link> */}
      </footer>
    </body>
  );
}
