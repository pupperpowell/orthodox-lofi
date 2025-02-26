import { useEffect, useState } from "preact/hooks";
import PocketBase from "pocketbase";

export default function ActiveListeners() {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pb = new PocketBase("https://nightbreak.app/");

    const calculateActiveListeners = async () => {
      try {
        const fifteenMinutesAgo = new Date(
          new Date().getTime() - 15 * 60 * 1000,
        ).toISOString().slice(0, 19).replace("T", " ");

        const records = await pb.collection("lofi").getList(1, 100, {
          filter: `updated >= "${fifteenMinutesAgo}"`,
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

    calculateActiveListeners();

    pb.collection("lofi").subscribe("*", () => {
      calculateActiveListeners();
    }).then(() => {
      return () => {
        console.log("Unsubscribing from realtime updates");
        pb.collection("lofi").unsubscribe("*");
      };
    });
  }, []);

  if (error) {
    return null;
  }

  const content = activeUsers === 1
    ? (
      <div class="font-triodion">
        you are the only one here
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
