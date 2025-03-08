import { Link } from "../components/Link.tsx";

export default function About() {
  return (
    <>
      <div className="mt-2 mb-8">
        <Link href="/">
          <span>&#10229;</span> back to home
        </Link>
        <h1>about this site</h1>
        <p>
          orthodox.cafe is a website for listening to Byzantine music of the
          Eastern Orthodox Church. There is a respectful touch of audio
          processing to give it a 'lofi' sound, which can be turned off. There
          are also ambient options, like distant rain.
        </p>
        <p>
          I am currently looking to add more music, especially recordings by
          and/or including women. If you are a chanter at your parish and would
          be willing to have your recordings played on this site, I'd love to
          hear from you!
        </p>

        <h2>feedback</h2>
        <p>
          If you have feedback for orthodox.cafe, please{" "}
          <Link href="mailto:george@silentsummit.co">
            email me directly
          </Link>.
        </p>

        <h2>what is byzantine music?</h2>
        <p>
          Byzantine chanting is a "significant cultural tradition and
          comprehensive music system" that revolves around the many hymns and
          services of the Eastern Orthodox Church. It's been around in various
          forms for several thousand years.
        </p>
        <p>
          From the{" "}
          <Link href="https://ich.unesco.org/en/RL/byzantine-chant-01508">
            UNESCO Intangible Cultural Heritage
          </Link>{" "}
          site:
          <blockquote>
            "...it is exclusively vocal music; it is essentially monophonic; the
            chants are codified into an eight-mode or eight-tone system; and the
            chant employs different styles of rhythm to accentuate the desired
            syllables of specific words."
          </blockquote>
        </p>

        <p>
          Further reading:{" "}
          <Link href="https://orthodoxwiki.org/Byzantine_Chant">
            orthodoxwiki.org
          </Link>,{" "}
          <Link href="https://en.wikipedia.org/wiki/Byzantine_music">
            wikipedia.org
          </Link>
          {" "}
        </p>
        <h2>inspiration</h2>
        <p>
          Although there is very little in common between the two, orthodox.cafe
          was inspired by the popular YouTube stream lofi hip hop radio - beats
          to relax/study to.
        </p>
      </div>
    </>
  );
}
