import { type PageProps } from "$fresh/server.ts";
// import { VisitorAuth } from "../utils/auth/VisitorAuth.ts";
export default function App({ Component }: PageProps) {
  // Try to sign the user in anonymously
  // const visitorAuth = new VisitorAuth();
  // visitorAuth.initializeVisitor();

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>orthodox.cafe</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="font-sans">
        <Component />
      </body>
    </html>
  );
}
