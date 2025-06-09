import { PageProps } from "$fresh/server.ts";
import ShareButton from "../islands/ShareButton.tsx";
import ThemeController from "../islands/ThemeController.tsx";

export default function Layout({ Component }: PageProps) {
  // do something with state here
  return (
    <body class="p-4 mx-auto max-w-screen-sm min-h-screen flex flex-col">
      {/* <div class="flex justify-end mb-4">
        <ThemeController />
      </div> */}
      <main class="grow">
        <Component />
      </main>
      <footer >
        <div class="flex w-full flex-col">
          <div class="divider">designed for headphones!</div>
        </div>
        <div className="space-y-2">
          <ShareButton />
          <ThemeController />
        </div>
        {/* <Link href="/about">about</Link> */}
        {/* <Link href="/credits">credits</Link> */}
      </footer>
    </body>
  );
}
