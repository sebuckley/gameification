import { simpleIceBreakers } from "./IceBreakers/simple";
import { randomIceBreakers } from "./IceBreakers/random";
import { choiceIceBreakers } from "./IceBreakers/choice";
import { revealIceBreakers } from "./IceBreakers/reveal";
import { performanceIceBreakers } from "./IceBreakers/performance";

export const iceBreakers = [
  ...simpleIceBreakers,
  ...randomIceBreakers,
  ...choiceIceBreakers,
  ...revealIceBreakers,
  ...performanceIceBreakers
];