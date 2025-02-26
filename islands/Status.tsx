import { useEffect, useState } from "preact/hooks";

const checkStreamStatus = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Error: Server responded with status ${response.status}`);
      return false;
    }

    const data = await response.text();

    try {
      const jsonData = JSON.parse(data);

      // Check if source exists and is not null
      return !!jsonData.icestats &&
        !!jsonData.icestats.source &&
        jsonData.icestats.source !== null;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return false;
    }
  } catch (error) {
    console.error("Error fetching stream status:", error);
    return false;
  }
};

export function Status() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Example usage
    checkStreamStatus("https://lofi.george.wiki/status-json.xsl")
      .then((isUp) => console.log("Stream is up:", isUp));
    const interval = setInterval(() => {
      checkStreamStatus("https://lofi.george.wiki/status-json.xsl")
        .then((isUp) => setIsOnline(isUp));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: isOnline ? "#22c55e" : "#ef4444",
        display: "inline-block",
        animation: "pulse 1.5s ease-in infinite",
      }}
      title={isOnline ? "Stream Online" : "Stream Offline"}
    >
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
