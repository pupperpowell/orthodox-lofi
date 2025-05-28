import { useState, useEffect } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

interface WelcomeMessageProps {
    inside: boolean;
    raining: boolean;
}

const getTimeOfDay = (): string => {
    if (!IS_BROWSER) return "day";
    const hours = new Date().getHours();
    if (hours < 6) return "night";
    if (hours < 12) return "morning";
    if (hours < 18) return "afternoon";
    return "evening";
};

const getSeason = (): string => {
    if (!IS_BROWSER) return "spring";
    const month = new Date().getMonth();
    if (month < 2 || month > 10) return "winter";
    if (month < 5) return "spring";
    if (month < 8) return "summer";
    return "autumn";
};

export default function WelcomeMessage({ inside, raining }: WelcomeMessageProps) {
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
        if (raining) return "It's raining.";
        return "The sky is clear.";
    };

    const getLocationDescription = () => {
        if (inside) return "You are inside the chapel.";
        return "You are standing outside the chapel.";
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
        <div class="p-4 bg-gray-100 rounded-lg shadow-md text-center">
            <h1 class="text-2xl font-bold mb-2">
                {getGreeting()}, dear visitor.
            </h1>
            <p class="text-gray-700 mb-2">
                Welcome to St. George Chapel. It's a {season} {timeOfDay}. {getWeatherDescription()}
            </p>
            <p class="text-gray-700">
                {getLocationDescription()}
            </p>
        </div>
    );
}
