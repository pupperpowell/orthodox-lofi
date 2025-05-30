/**
 * A button that activates the native sharing mechanism of the device
 * And copies the URL to the clipboard if sharing is unavailable
 */
import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact";
import { Button } from "../components/Button.tsx";

interface ShareButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title = "Orthodox Lofi",
  text = "Byzantine music to relax/study to",
  url,
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  // Determine if sharing is supported
  useEffect(() => {
    setShareSupported(
      typeof navigator !== "undefined" && !!navigator.share,
    );
  }, []);

  // Reset status messages after 2 seconds
  useEffect(() => {
    if (shared || copied) {
      const timer = setTimeout(() => {
        setShared(false);
        setCopied(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shared, copied]);

  const shareUrl = url ||
    (typeof window !== "undefined" ? globalThis.location.href : "");

  const handleShare = async () => {
    try {
      if (shareSupported) {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to clipboard if sharing fails
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Share this page"
      data-umami-event="Share button clicked"
      class="btn w-full rounded-full"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <span>
          {copied ? "link copied to clipboard!" : "listen with a friend"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 50 50"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z" />
          <path d="M24 7h2v21h-2z" />
          <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z" />
        </svg>
      </div>
    </button>
  );
}
