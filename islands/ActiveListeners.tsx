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

          // Check if source exists and is not null
          if (
            !!jsonData.icestats &&
            !!jsonData.icestats.source &&
            jsonData.icestats.source !== null
          ) {
            setError(null);
            return jsonData.icestats.source[0].listeners +
              jsonData.icestats.source[1].listeners;
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
    }, 15000);
  }, []);

  if (error) {
    return null;
  }

  const content = activeUsers === 0
    ? (
      <div class="font-triodion">
        there's nobody listening right now. is this thing on?
      </div>
    )
    : (
      <div class="font-triodion">
        <span class="font-medium">{activeUsers}</span>{" "}
        {activeUsers === 1 ? "person is" : "people are"} listening now
      </div>
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
