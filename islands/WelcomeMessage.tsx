import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { appState } from "../utils/AppContext.tsx";

const getTimeOfDay = (): string => {
    if (!IS_BROWSER) return "day";
    const hours = new Date().getHours();
    if (hours < 2) return "evening";
    if (hours < 12) return "morning";
    if (hours < 18) return "afternoon";
    return "evening";
};

const getSeason = (): string => {
    if (!IS_BROWSER) return "";
    const month = new Date().getMonth();
    if (month < 2 || month > 10) return "winter";
    if (month < 5) return "spring";
    if (month < 8) return "summer";
    return "autumn";
};

export default function WelcomeMessage() {
    // Access shared state from signals
    // We can get isOutside, isRaining, and isWindowOpen directly from appState.value
    // And the toggle functions: appState.value.toggleRain, appState.value.toggleWindow, appState.value.toggleOutside
    const { isOutside, isRaining, isWindowOpen, connectedUsers } = appState.value;

    const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
    const [season, setSeason] = useState(getSeason());

    useEffect(() => {
        const updateTime = () => {
            setTimeOfDay(getTimeOfDay());
            setSeason(getSeason());
        };

        const intervalId = setInterval(updateTime, 60000); // Update every minute
        return () => clearInterval(intervalId);
    }, []);

    const getWeatherDescription = () => {
        if (isRaining) return "It's raining. ";
        return "The sky is clear. ";
    };

    return (
        <div class="p-4 mb-4 border-white border-2 rounded-lg shadow-md text-center">
            <h1 class="text-3xl font-bold mb-2">
                You are standing {" "}
                <span
                    class={`clickable-text ${!appState.value.isConnected || !appState.value.isPlaying ? 'disabled' : ''}`}
                    onClick={() => {
                        if (appState.value.isConnected && appState.value.isPlaying) {
                            appState.value.toggleOutside?.();
                        }
                    }}
                >
                    {isOutside ? "outside" : "inside"}
                </span> the church of St. George, near the back. It's a {season} {timeOfDay}, and {" "}
                {/* {!isOutside && (
                    <span>
                        The window is{" "}
                        <span
                            class={`clickable-text ${!appState.value.isConnected || !appState.value.isPlaying ? 'disabled' : ''}`}
                            onClick={() => {
                                if (appState.value.isConnected && appState.value.isPlaying) {
                                    appState.value.toggleWindow?.();
                                }
                            }}
                        >
                            {isWindowOpen ? "open" : "closed"}
                        </span>
                        .{" "}
                    </span>
                )} */}
                {isRaining ? "it's " : "the sky is "}
                <span
                    class={`clickable-text ${!appState.value.isConnected || !appState.value.isPlaying ? 'disabled' : ''}`}
                    onClick={() => {
                        if (appState.value.isConnected && appState.value.isPlaying) {
                            appState.value.toggleRain?.();
                        }
                    }}
                >
                    {isRaining ? "raining" : "clear"}
                </span>.
            </h1>
            <p class="mb-2 text-xl">
                {connectedUsers > 1 && (
                    <span>
                        There {connectedUsers < 2 ? "is" : "are"} {connectedUsers - 1} {connectedUsers < 2 ? "other" : "others"} here.
                    </span>
                )}
            </p>
        </div>
    );
}
