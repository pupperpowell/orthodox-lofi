import { useEffect, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { appState } from "../utils/AppContext.tsx";

const getTimeOfDay = (): string => {
    if (!IS_BROWSER) return "day";
    const hours = new Date().getHours();
    if (hours < 6) return "night";
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
    const { isOutside, isRaining } = appState.value;

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
        if (!isOutside) return "You are standing inside the church.";
        return "You are standing outside.";
    };

    const getGreeting = () => {
        switch (timeOfDay) {
            case "night":
                return "Good night";
            case "morning":
                return "Good morning";
            case "afternoon":
                return "Good afternoon";
            case "evening":
                return "Good evening";
        }
    };


    return (
        <div class="p-4 mb-4 text-3xl border-white border-2 rounded-lg shadow-md text-center">
            <h1 class="text-2xl font-bold mb-2">
                {getGreeting()}, visitor.
            </h1>
            <p class="mb-2 text-xl">
                Welcome to St. George Church. It's a {season} {timeOfDay}.
                {" "}
                {getWeatherDescription()}
            </p>
            <p>
                {getLocationDescription()}
            </p>
        </div>
    );
}
