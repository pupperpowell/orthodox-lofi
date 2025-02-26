import { useEffect, useState } from "preact/hooks";
import PocketBase from "pocketbase";

export default function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pb = new PocketBase("https://nightbreak.app/");

    const calculateActiveUsers = async () => {
      try {
        const fifteenMinutesAgo = new Date(Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDay(),
          new Date().getUTCHours(),
          new Date().getUTCMinutes() - 15,
        ));

        const records = await pb.collection("lofi").getList(1, 100, {
          filter: `updated >= "${fifteenMinutesAgo.toISOString()}"`,
        });

        setActiveUsers(records.totalItems);
        console.log("Active users:", records.totalItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching active users:", err);
        setError("Could not load active users");
      } finally {
        setLoading(false);
      }
    };

    // Initial calculation
    calculateActiveUsers();

    // Subscribe to realtime updates
    pb.collection("lofi").subscribe("*", () => {
      calculateActiveUsers();
    }).then(() => {
      // Store the unsubscribe function for cleanup
      return () => {
        console.log("Unsubscribing from realtime updates");
        pb.collection("lofi").unsubscribe("*");
      };
    });
  }, []);

  if (loading && activeUsers === null) {
    return <div class="text-gray-300 font-triodion">loading...</div>;
  }

  if (error) {
    return null;
  }

  if (activeUsers === 0) {
    return (
      <div class="font-triodion">
        you are the only one here
      </div>
    );
  }

  return (
    <div class="font-triodion">
      <span class="font-medium">{activeUsers}</span>{" "}
      {activeUsers === 1 ? "person is" : "people are"} listening now
    </div>
  );
}
