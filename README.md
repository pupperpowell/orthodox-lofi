# lofi byzantine chants to relax/study to

This project was made to parody the "lofi hip hop radio beats to relax/study to" genre, and honor the music of the Eastern Orthodox Church — not the other way around.

# Features

1. many hours of public domain byzantine chanting from archive.org.
2. 'lofi' filter (highpass and lowpass). will continue to add layers and effects in the future.
3. in order for the lofi effect to be more pronounced, the strength of the filters and effects need to change noticeably at defined points in the music.
4. solution: for each track, note specific "breakpoints" where the effect of the filters can slide. for example,
   1. key change(s) in psalm 135,
   2. verse changes in Agni Parthene,
   3. breaks of silence,
   4. changes from reading to chanting, etc.

# database

1. the audio is actually being streamed by a icecast server.
2. for interactive elements, database options are being considered

# ui/ux design

1. The background of the entire webpage will be a church iconostasis landscape, but it will be pitch dark with just a light in the corner showing some people chanting at the chant stand. As people view the webpage, candles will be lit that gradually illuminate the church
2. There won’t be any instructions or explanation. Just:
   1. the title of the hymn playing, name of album, year recorded.
   2. Amount of people listening. (corresponds to amt of candles)

- this requires a system of shaders. first of all, the entire canvas is made pitch black. then, candles (or lanterns) are lit that raise the brightness of a specific area (with a warm tone.)
- then, scale the overall brightness of the canvas with the amount of candles.
- for example, 0% brightness at 1 candle and 90% brightness at 100 candles.

# Todo

## Audio

- [ ] Clean up the audio processing graph
- [ ] Break out each audio effect into its own file
- [ ] Add effects like reverb, delay, etc.
- [ ] Add ambient tracks like whispering or shuffling
- [ ] Way to visualize audio graph?

## Backend

- [ ] Move mp3 file collection to a database
- [ ] Figure out how to stream audio from db instead of hosting static files
- [ ] Active user count
- [ ] Parse mp3s for breakpoints (lofi effect changes)

## Overall design / UX

- [ ] Darkening shader
- [ ] Lamp shader (local brightness)
- [ ] Candle shader (flickering, moving flame)
- [ ] Local brightness shader (surrounds candlse, scales with # of active users)
- [ ] Candle placement zones

---

1. Building this design has quickly become more complicated than I expected. There are no easy options that also look good.
2. The most reasonable option is to manually draw the interior of an orthodox church at night - perhaps by coloring over a real image, using a limited color palette and drawing our own

## UI

- [ ] Orthodox church background image
- [ ] "X others are here" counter

---

## Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

```
deno task start
```

This will watch the project directory and restart as necessary.
