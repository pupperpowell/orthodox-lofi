// components/LatestCommit.tsx
import { useEffect, useState } from "preact/hooks";

interface LatestCommitProps {
  className?: string;
}

export default function LatestCommit({ className = "" }: LatestCommitProps) {
  const [commitMessage, setCommitMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommitMessage() {
      try {
        const response = await fetch("/api/latest-commit");
        const data = await response.json();

        if (response.ok) {
          setCommitMessage(data.message);
        } else {
          setError(data.error || "Failed to fetch commit message");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    }

    fetchCommitMessage();
  }, []);

  if (loading) return <div className={className}>Loading commit info...</div>;
  if (error) return <div className={className}>Error: {error}</div>;

  return (
    <div className={className}>
      <p>{commitMessage}</p>
    </div>
  );
}
