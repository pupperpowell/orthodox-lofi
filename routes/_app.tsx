import { type PageProps } from "$fresh/server.ts";
import { VisitorAuth } from "../utils/VisitorAuth.ts";
export default function App({ Component }: PageProps) {
  const visitorAuth = new VisitorAuth();
  visitorAuth.initializeVisitor();

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>orthodox-lofi</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
