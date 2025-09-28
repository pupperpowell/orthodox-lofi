import { Link } from "../components/Link.tsx";

export default function About() {
  return (
    <>
      <div className="mt-2 mb-8">
        <Link href="/">
          <span>&#10229;</span> back to home
        </Link>
        <h1 class="mt-12">credits</h1>
        <p>
          Thank you to all the people who encouraged me during the long
          development process. Without your support and enthusiasm, I might have given up.
        </p>
        <p>
          Thank you especially to Alanna who helped me design the audio
          processing and effects.
        </p>
        {
          /* <p>
          This project would not have been possible without the help of several
          people:
          <ul class="list-decimal list-inside pt-2 text-lg">
            <li>
              Aidan, for helping me maintain momentum during the project's long
              and arduous development.
            </li>
            <li>
              Alanna, for helping me with the audio processing / lofi effects,
              and for helping me design other audio effects that have not been
              released yet.
            </li>
            <li>
              Those who have expressed their support and enthusiasm for this
              project, like Peggy, Jenn, Nick, my mom, and others.
            </li>
          </ul>
        </p> */
        }
      </div>
    </>
  );
}
