import { useEffect, useState } from "preact/hooks";
import PocketBase from "pocketbase";

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setLoading(true);
        const pb = new PocketBase("https://nightbreak.app/");

        // Filter records that have been updated in the last 15 minutes
        const fifteenMinutesAgo = new Date();
        fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

        const records = await pb.collection("lofi").getList(1, 100, {
          filter: `updated >= "${fifteenMinutesAgo.toISOString()}"`,
        });

        setActiveUsers(records.totalItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching active users:", err);
        setError("Could not load active users");
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on mount
    fetchActiveUsers();

    // Set up polling interval (every 60 seconds)
    const interval = setInterval(fetchActiveUsers, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (loading && activeUsers === null) {
    return <div class="text-gray-500 text-sm italic font-triodion">loading...</div>;
  }

  if (error) {
    return null; // Hide component on error
  }

  if (activeUsers === 0) {
    return <div class="text-description font-triodion text-sm">you are the only one here</div>;
  }

  return (
    <div class="text-description font-triodion text-sm">
      <span class="font-medium">{activeUsers}</span>{" "}
      {activeUsers === 1 ? "person is" : "people are"} listening now
    </div>
  );
}
