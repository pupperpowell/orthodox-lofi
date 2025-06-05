# lofi byzantine music radio — chanting to relax/study to

[orthodox.cafe](https://orthodox.cafe) is a website for listening to Byzantine
music of the Eastern Orthodox Church. There is a respectful touch of audio
processing to give it a 'lofi' sound, which can be turned off. There are also
ambient options, like distant rain.

This is the core function of the site, although I hope to add many more hidden
features.

## Inspiration

Although there is very little in common between the two,
[orthodox.cafe](https://orthodox.cafe) was inspired by the popular YouTube
stream
[lofi hip hop radio - beats to relax/study to](https://www.youtube.com/watch?v=jfKfPfyJRdk).

## Feedback

**If you have feedback for [orthodox.cafe](https://orthodox.cafe), please
[email me directly](mailto:george@silentsummit.co).** Include in the subject
line: **\[orthodox.cafe feedback\]** and it'll be moved to my highest priority
mailbox. I love feedback, so don't hesitate to let me know your thoughts! Be
mean if you have to!

## Guiding principles

[orthodox.cafe](https://orthodox.cafe) has three principles that guide its
design:

1. [Stillness](https://www.oca.org/reflections/fr.-john-breck/on-silence-and-stillness)
   (ἡσυχία):
   - _stillness, rest, quiet, silence_
   - _bodily rest combined with creative tension_
   - _openness to the divine (mystical) presence and to prayer_
2. Mystery:
   - _having a spiritual meaning or reality that is neither apparent to the
     senses nor obvious to the intelligence_
3. Community:
   - _intimate fellowship or rapport_

Building software often feels like sitting at a blank canvas where anything is
possible. But just because you can build anything doesn't mean you should. The
magical slabs of metal and glass we carry in our pockets can do anything, and as
a result, we use them to do nothing.

Setting limits and guidelines for what the site does will help it do those
things better.

### Stillness

Stillness (in the context of the Greek ἡσυχία, peacefulness) is facing the
tension that comes with ignoring distractions. In a way, it's about being bored.
Most modern technology is designed to relieve that tension, and we love it. But
stillness is about facing that boredom like an old Western duel: standing in the
middle of the road, taking ten steps away each, and turning around to look
boredom in the eye as he reaches behind him for his revolver. The sun is
setting, and the streets are empty, and all you see is boredom's silhouette
standing down the road from you. And your hands are shaking, and your mind is
racing, but you don't turn and run; you keep your hand on your revolver when
finally he whips his hand out from behind his back and you still don't move
because his hand is empty.

Anyways, stillness as a guiding principle for
[orthodox.cafe](https://orthodox.cafe) means it should be simple in function and
transparent in its purpose.

Its purpose is to provide a consistent and respectful listening experience.
Respectful means both respectful to the listener and the music itself.

## What is Byzantine chanting?

Byzantine chanting is a "significant cultural tradition and comprehensive music
system" surrounding and involving the many hymns and services of the Eastern
Orthodox Church. It's been around in various forms for several thousand years.

From the UNESCO
[Intangible Cultural Heritage](https://ich.unesco.org/en/RL/byzantine-chant-01508)
site:

> "...it is exclusively vocal music; it is essentially monophonic; the chants
> are codified into an eight-mode or eight-tone system; and the chant employs
> different styles of rhythm to accentuate the desired syllables of specific
> words."

There are other, more Americanized ways of singing hymns and services, and
there's nothing wrong with them in the slightest. I just prefer to listen to
Byzantine chant, so I didn't include any of the western music that is common
among Greek churches here in New England. There are many Byzantine chant albums
that were recorded as a performance instead of as prayer, and I tried to avoid
those wherever possible. As a result, most of the audio on
[orthodox.cafe](https://orthodox.cafe) is performed by various groups of
all-male monastics from Greece.

I am currently looking to add more music as performed by women, a mix of women
and men, and also other languages, especially Arabic. If you know of any (that's
public domain, or who I could reach out to the rights holders for permission to
play on this site), please let me know!

Further reading: [orthodoxwiki.org](https://orthodoxwiki.org/Byzantine_Chant),
[wikipedia](https://en.wikipedia.org/wiki/Byzantine_music)

## Technical architecture

The [orthodox.cafe](https://orthodox.cafe) client (what you see when you visit
the webpage) was built with the [Deno Fresh](https://fresh.deno.dev/) web
framework, which uses [Preact](https://preactjs.com/) as the frontend framework,
[Deno](https://deno.com/) as the server runtime, and Typescript as the language
tying it all together. Not too long ago, I assumed most websites were built with
vanilla HTML and Javascript, so I'm proud of everything I've learned since then.

The music was sourced from archive.org and YouTube and plays on an Icecast web
radio 24/7. The scripting language used to assemble playlists and scheduling is
Liquidsoap. I pay roughly $10 a month in server costs, but this could be $0 if I
hosted it on a laptop in my closet. I don't know how much bandwidth will cost
because as of writing this, version 1 of the site has not been released yet.

---

_I'm currently looking for roles in product design or full-stack development —
anything from contract work to full-time positions — and can be reached via
[email](mailto:george@silentsummit.co)._
