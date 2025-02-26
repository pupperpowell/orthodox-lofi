import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component }: PageProps) {
  // do something with state here
  return (
    <div class="p-4 mx-auto max-w-screen-lg">
      <Component />
    </div>
  );
}
