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
    const { isOutside, isRaining, isWindowOpen } = appState.value;

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
        if (isRaining) return "It's raining.";
        return "The sky is clear.";
    };

    const getLocationDescription = () => {
        if (!isOutside) return "inside";
        return "outside";
    };

    const getGreeting = () => {
        switch (timeOfDay) {
            case "morning":
                return "Good morning";
            case "afternoon":
                return "Good afternoon";
            case "evening":
                return "Good evening";
        }
    };


    return (
        <div class="p-4 mb-4 card text-3xl border-white border-2 rounded-lg shadow-md text-center">
            <h1 class="text-2xl font-bold mb-2">
                {getGreeting()}, visitor.
                You are standing {getLocationDescription()} the church of St. George. It's a {season} {timeOfDay}.
            </h1>
            <p class="mb-2 text-xl">
                {getWeatherDescription()}
            </p>
            {/* Added buttons to control audio states */}
            <div class="flex justify-center space-x-2 mt-4">
                <button
                    type="button"
                    class="btn btn-sm rounded-full"
                    onClick={() => appState.value.toggleRain?.()}
                    disabled={!appState.value.isConnected || !appState.value.isPlaying}
                >
                    {isRaining ? "Stop Rain" : "Start Rain"}
                </button>
                <button
                    type="button"
                    class="btn btn-sm rounded-full"
                    onClick={() => appState.value.toggleWindow?.()}
                    disabled={!appState.value.isConnected || !appState.value.isPlaying || isOutside}
                >
                    {isWindowOpen ? "Close Window" : "Open Window"}
                </button>
                <button
                    type="button"
                    class="btn btn-sm rounded-full"
                    onClick={() => appState.value.toggleOutside?.()}
                    disabled={!appState.value.isConnected || !appState.value.isPlaying}
                >
                    {isOutside ? "Step Inside" : "Step Outside"}
                </button>
            </div>
            {/* <button type="button"></button>  This line seems to have been a temporary addition, removing it for now unless it's intended */}
        </div>
    );
}
