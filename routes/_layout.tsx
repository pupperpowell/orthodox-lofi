import { PageProps } from "$fresh/server.ts";

export default function Layout({ Component, state }: PageProps) {
  // do something with state here
  return (
    <div class="min-h-screen bg-gray-950 text-white">
      <div class="border-white border-2">
        <Component />
      </div>
    </div>
  );
}
