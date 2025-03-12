import { useEffect, useState } from "preact/hooks";

export default function ActiveListeners() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStreamListneners = async (url: string): Promise<number> => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          console.error(
            `Error: Server responded with status ${response.status}`,
          );
          setError("Could not load active users");
          return -1;
        }

        const data = await response.text();

        try {
          const jsonData = JSON.parse(data);

          if (!!jsonData.icestats && !!jsonData.icestats.source) {
            setError(null);
            // Find the source with the specific listenurl
            const mainStream = jsonData.icestats.source.find(
              (source: any) =>
                source.listenurl === "http://lofi.george.wiki:1025/stream",
            );
            return mainStream ? mainStream.listeners : -1;
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          setError("Error parsing JSON");
        }
      } catch (error) {
        console.error("Error fetching stream status:", error);
        setError("Error fetching stream status");
      } finally {
        setLoading(false);
      }
      return -1;
    };

    // Initial fetch moved inside useEffect to avoid unnecessary delay
    const fetchInitialData = async () => {
      const initialActiveUsers = await checkStreamListneners(
        "https://lofi.george.wiki/status-json.xsl",
      );
      setActiveUsers(initialActiveUsers);
    };

    fetchInitialData();

    setInterval(async () => {
      const activeUsers = await checkStreamListneners(
        "https://lofi.george.wiki/status-json.xsl",
      );
      setActiveUsers(activeUsers);
    }, 5000);
  }, []);

  if (error) {
    return null;
  }

  const content = activeUsers === 0
    ? (
      <p class="font-triodion">
        there's nobody listening right now.
      </p>
    )
    : (
      <p class="font-triodion">
        <span class="font-medium">{activeUsers}</span>{" "}
        {activeUsers === 1 ? "person is" : "people are"} listening now
      </p>
    );

  return (
    <div
      class="transition-opacity duration-1000"
      style={{ opacity: loading ? 0 : 1 }}
    >
      {content}
    </div>
  );
}
