import { Head } from "$fresh/runtime.ts";
import { Link } from "../components/Link.tsx";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="">
        <Link href="/">
          <span>&#10229;</span> back to home
        </Link>
        <h1>page not found</h1>
        <p>
          you have reached a page that doesn't exist.
        </p>
      </div>
    </>
  );
}
