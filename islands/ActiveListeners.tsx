import { useEffect, useState } from "preact/hooks";

export default function ActiveListeners() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkListeners = async (): Promise<number> => {
      try {
        // Use the new API endpoint for listener count
        const response = await fetch("/api/listeners");

        if (!response.ok) {
          console.error(
            `Error: Server responded with status ${response.status}`,
          );
          setError("Could not load active users");
          return -1;
        }

        const data = await response.json();
        
        if (data && typeof data.count === 'number') {
          console.log(`[ActiveListeners] Received listener count: ${data.count}`);
          setError(null);
          return data.count;
        } else {
          console.error("Invalid response format:", data);
          setError("Invalid response format");
          return -1;
        }
      } catch (error) {
        console.error("Error fetching listeners:", error);
        setError("Error fetching listeners");
        return -1;
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    const fetchInitialData = async () => {
      const count = await checkListeners();
      setActiveUsers(count);
    };

    fetchInitialData();

    // Set up polling interval
    const intervalId = setInterval(async () => {
      const count = await checkListeners();
      setActiveUsers(count);
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
