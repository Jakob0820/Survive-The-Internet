// Testdaten, um direkt in einen bestimmten Screen zu springen (siehe TEST_MODE in App.js)
import { COLOR_OPTIONS, COLOR_IMAGES } from '../constants/colors';
import { ROUND_TYPE } from '../constants/questions';

// true: App startet direkt in TEST_SCREEN mit den Daten unten
export const TEST_MODE = false;
export const TEST_SCREEN = 'result';

// Für mehr Spieler einfach weitere Farbindizes ergänzen (0–7)
export const TEST_PLAYERS = [0, 1, 6, 2, 3].map((colorIndex, i) => ({
  name: `Spieler ${i + 1}`,
  color: COLOR_OPTIONS[colorIndex],
  image: COLOR_IMAGES[colorIndex],
}));

export const TEST_PLAYER_COUNT = 3;

export const TEST_ROUNDS = [ROUND_TYPE.GOFUNDME];

export const TEST_VOTES = [1, 2, 3, 2, 3, 1, 2, 1];
export const TEST_BURNS = [3, 2, 1, 1, 2, 4, 0, 0];

export const TEST_FIRST_ANSWERS = [
  'Ultra geil, macht vor allem Spaß in der Badewanne zu benutzen',
  'Wofür hast du die benutzt?',
  'Entführe die Kinder von deinem Lehrer',
];

export const TEST_RESPONSES = [
  'Turbo Thrustmaster 5000x mit extra Vibrationsfunktion',
  'VR Brille mit cumstains',
  'Kann mir jemand beim lernen meiner Mathearbeit helfen, ich verstehe das einfach nicht...',
];
