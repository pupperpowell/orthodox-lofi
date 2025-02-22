export class HandleGenerator {
  private readonly nouns = [
    "pilgrim",
    "monk",
    "candle",
    "prayer",
    "incense",
    "psalter",
    "icon",
    "cross",
    "bell",
    "dome",
    "altar",
    "chapel",
    "censer",
    "vestment",
    "scroll",
    "iconostasis",
    "chalice",
    "komboskini",
    "bible",
    "gospel",
    "liturgy",
    "hymn",
    "chant",
    "ison",
    "humility",
  ];

  private readonly adjectives = [
    "humble",
    "blessed",
    "pious",
    "devout",
    "reverent",
    "silent",
    "peaceful",
    "ancient",
    "mystical",
    "holy",
    "faithful",
    "graceful",
    "radiant",
    "steadfast",
    "wise",
    "saintly",
    "virtuous",
    "zealous",
    "godly",
    "divine",
    "eternal",
    "sacred",
    "celestial",
    "mystical",
    "ascetic",
    "prayerful",
  ];

  public generateHandle(): string {
    const handle = [
      this.getRandomWord(this.adjectives),
      this.getRandomWord(this.nouns),
      this.getRandomWord(this.adjectives),
      this.getRandomWord(this.nouns),
    ].join("-");

    return handle;
  }

  private getRandomWord(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }
}
