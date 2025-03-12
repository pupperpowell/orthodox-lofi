import { useEffect, useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { AudioStreamer } from "../utils/AudioStreamer.ts";
// import RainPlayer from "./RainPlayer.tsx";
import { VolumeSlider } from "../components/VolumeSlider.tsx";

const disableVolumeControl = () => {
  const userAgent = navigator.userAgent;
  return userAgent.includes("iPhone");
};

export default function AudioPlayer() {
  // General state variables
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamer, setStreamer] = useState<AudioStreamer | null>(null);
  const [lofiActive, setLofiActive] = useState(true);

  // Volume control state variables
  const [volume, setVolume] = useState(1);
  const [disableVolumeControls, setDisableVolumeControls] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volumeExpanded, setVolumeExpanded] = useState(false); // change to false for production

  const handlePlay = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);

      if (!streamer) {
        const audioStreamer = new AudioStreamer();
        console.log("Created AudioStreamer");

        audioStreamer.setLofi(lofiActive);

        await audioStreamer.startStream();
        setStreamer(audioStreamer);

        setIsPlaying(true);
        // } else { // Old functionality when play/pause was the same button
        //   if (isPlaying) { // Not currently used
        //     streamer.pauseStream();

        //     setIsPlaying(false);
        //   } else { // Not currently used
        //     await streamer.startStream();

        //     setIsPlaying(true);
        //   }
        // }
      }
    } catch (error) {
      console.error("Playback failed:", error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeButton = () => {
    if (disableVolumeControls) {
      if (muted) {
        streamer?.setVolume(volume);
        setMuted(false);
      } else {
        streamer?.setVolume(0);
        setMuted(true);
      }
    } else {
      setVolumeExpanded(!volumeExpanded);
    }
  };

  // Disable volume if iPhone
  useEffect(() => {
    setDisableVolumeControls(disableVolumeControl());
  }, []);

  // Update the streamer volume when the volume state changes
  useEffect(() => {
    if (streamer) {
      streamer.setVolume(volume);
    }
  }, [volume, streamer]);

  const handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setVolume(parseFloat(target.value));
  };

  // Toggle lofi
  const handleLofiToggle = () => {
    if (streamer) {
      streamer.setLofi(!lofiActive);
    }
    setLofiActive(!lofiActive);
  };

  const handleStop = () => {
    if (streamer) {
      streamer.stopStream();
      setStreamer(null);
      setIsPlaying(false);
    }
  };

  return (
    <div
      class={`space-y-4 relative ${disableVolumeControls ? "mt-8" : "mt-16"}`}
    >
      <div class={`volume-slider ${volumeExpanded ? "expanded" : ""}`}>
        <div class="flex relative my-4">
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onInput={handleVolumeChange}
            class={`w-full`}
          />
          {disableVolumeControls && (
            <div class="text-s text-white">
              Use iPhone volume buttons
            </div>
          )}
          <span class="font-inter pl-2 min-w-[60px]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
      <style>
        {`
        @keyframes blink {
          0% { opacity: 0; }

          100% { opacity: 1; }
        }
        .dot {
          animation: blink 1s infinite;
          display: inline;
          margin-left: 0.2rem;
        }
      `}
      </style>
      {/* 1st row div */}
      <div class="flex">
        {/* volume button container */}
        <div class={`grow-2 mr-2 ${disableVolumeControls ? "hidden" : ""}`}>
          <Button
            onClick={handleVolumeButton}
            onTouchEnd={() => {
              handleVolumeButton;
            }}
            class="btn touch-manipulation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-gray-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clip-rule="evenodd"
              />
            </svg>
          </Button>
        </div>
        {/* play button container */}
        <div
          class={`flex-grow mr-2 grow-6 ${
            !isPlaying ? "" : "opacity-50 pointer-events-none"
          }`}
        >
          <Button
            data-umami-event="Play button clicked"
            onClick={handlePlay}
            // onTouchStart={(e) => {
            //   e.preventDefault();
            //   handlePlay();
            // }}
            disabled={isLoading || isPlaying}
            class="btn touch-manipulation"
          >
            {isLoading
              ? (
                <>
                  loading
                  <span class="dot" style={{ animationDelay: "0s" }}>.</span>
                  <span class="dot" style={{ animationDelay: "0.2s" }}>.</span>
                  <span class="dot" style={{ animationDelay: "0.4s" }}>.</span>
                </>
              )
              : isPlaying
              ? <span>playing &#9205;</span>
              : <span>play &#9205;</span>}
          </Button>
        </div>
        {/* second button container */}
        <div
          class={`${isPlaying ? "" : "opacity-50 pointer-events-none"}`}
        >
          <Button
            data-umami-event="Stop button clicked"
            onClick={handleStop}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStop();
            }}
            class={`btn touch-manipulation`}
          >
            <span>stop &#9209;</span>
          </Button>
        </div>
      </div>
      {/* 2nd row div */}
      <div class="flex items-center space-x-2">
        <Button
          data-umami-event="Lofi toggled"
          onClick={handleLofiToggle}
          onTouchStart={(e) => {
            e.preventDefault();
            handleLofiToggle();
          }}
          class="btn touch-manipulation"
        >
          lofi: <span class={lofiActive ? "text-green-500" : ""}>on</span>/
          <span class={!lofiActive ? "text-rose-300" : ""}>off</span>
        </Button>
      </div>
      {disableVolumeControls && (
        <div class="text-s text-white">
          (Use physical volume buttons)
        </div>
      )}
    </div>
  );
}
