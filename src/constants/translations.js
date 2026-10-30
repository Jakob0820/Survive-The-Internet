import { createContext, useContext } from 'react';

export const DEFAULT_LANGUAGE = 'de';

// Sprachnamen stehen immer in der jeweiligen Sprache selbst
export const LANGUAGES = [
    { code: 'de', label: 'Deutsch' },
    { code: 'en', label: 'English' },
];

const TRANSLATIONS = {
    de: {
        'common.back': 'ZURÜCK',
        'common.mainMenu': 'HAUPTMENÜ',
        'common.yes': 'JA',
        'common.no': 'NEIN',
        'common.player': 'Spieler {number}',
        'common.nextRound': 'Nächste Runde',

        'main.local': '▶   LOKALES SPIEL',
        'main.online': '▶   ONLINE',
        'main.options': '⚙   OPTIONEN',

        'options.title': 'OPTIONEN',
        'options.volume': 'Lautstärke',
        'options.sound': 'Soundeffekte',
        'options.music': 'Musik',
        'options.vibration': 'Vibration',
        'options.language': 'SPRACHE',

        'language.title': 'Sprache',

        'confirm.title': 'Bist du sicher?',
        'confirm.message': 'Deine Einstellungen werden nicht gespeichert',

        'settings.title': 'Einstellungen',
        'settings.roundDuration': 'Rundendauer',
        'settings.unlimited': 'Unbegrenzt',
        'settings.seconds': '{seconds} Sek.',
        'settings.playerCount': 'Spieleranzahl',
        'settings.createRoom': 'RAUM ERSTELLEN',
        'settings.joinRoom': 'RAUM BEITRETEN',
        'settings.next': 'WEITER',
        'settings.gameMode': 'SPIELMODUS',

        'rounds.title': 'Spielmodis',
        'rounds.random': 'Zufällige Reihenfolge',
        'rounds.count': 'Rundendauer',
        'rounds.round': ' Runde',
        'rounds.save': 'SPEICHERN',

        'setup.name': 'Name:',
        'setup.namePlaceholder': 'Namen eingeben',
        'setup.color': 'Farbe wählen:',
        'setup.nextPlayer': 'NÄCHSTER SPIELER ▶',
        'setup.startGame': 'SPIEL STARTEN ',
        'setup.prevPlayer': '◀ SPIELER ZURÜCK',

        'game.turn': '{name} ist dran!',
        'game.question': 'Frage',
        'game.showQuestion': 'Frage anzeigen',
        'game.commentPlaceholder': 'Schreibe einen Kommentar',
        'game.nextPlayer': 'Nächster Spieler',
        'game.finish': 'Fertigstellen',
        'game.quit': 'SPIEL BEENDEN',

        'answer.done': 'GESCHAFFT!',
        'answer.doneMessage': 'Jetzt ist es an der Zeit die Antworten aus dem Kontext zu reißen!',

        'transition.round': 'Runde {number}',
        'transition.evaluation': 'Na dann wollen wir uns mal ansehen, was ihr geschaffen habt!',
        'transition.showResult': 'ERGEBNIS ANZEIGEN',

        'result.currentPoints': 'AKTUELLE PUNKTE',
        'result.playAgain': 'NOCHMAL SPIELEN',
        'result.nextRound': 'NÄCHSTE RUNDE',

        'evaluation.dateTime': '{date}, {time} Uhr',
        'evaluation.checkedIn': 'Eingecheckt bei:',
        'evaluation.like': '👍 Like',
        'evaluation.comment': '💬 Kommentar',
        'evaluation.share': '↗ Teilen',
        'evaluation.views': '{views} Aufrufe',
        'evaluation.recommends': 'empfiehlt',
        'evaluation.navWorld': 'Welt',
        'evaluation.navMoney': 'Geld',
        'evaluation.navFood': 'Essen',
        'evaluation.askPlayer': 'Frag {name} etwas!',
        'evaluation.askedAgo': 'Vor {hours} Stunden gestellt',
        'evaluation.funds': '{amount}€',
        'evaluation.raised': 'Bisher gesammelt',
        'evaluation.supporters': 'Unterstützer',
        'evaluation.helpNow': 'JETZT\nHELFEN',
        'evaluation.search': 'Wonach suchst du?',
        'evaluation.addToCart': 'IN DEN WARENKORB',
        'evaluation.noVotes': 'Keine Stimmen',
        'evaluation.score': 'PUNKTZAHL',
        'evaluation.allVotesCast': 'Alle Stimmen vergeben!',
        'evaluation.ownCard': 'Deine eigene Karte - Wische Weiter!',
        'evaluation.yourTurn': 'Am Zug – Karte antippen',
        'evaluation.votesCounted': 'Die Stimmen sind ausgezählt!',
        'evaluation.voteFor': 'Wähle für den Spieler, der am lächerlichsten aussieht!',
    },
    en: {
        'common.back': 'BACK',
        'common.mainMenu': 'MAIN MENU',
        'common.yes': 'YES',
        'common.no': 'NO',
        'common.player': 'Player {number}',
        'common.nextRound': 'Next round',

        'main.local': '▶   LOCAL GAME',
        'main.online': '▶   ONLINE',
        'main.options': '⚙   OPTIONS',

        'options.title': 'OPTIONS',
        'options.volume': 'Volume',
        'options.sound': 'Sound effects',
        'options.music': 'Music',
        'options.vibration': 'Vibration',
        'options.language': 'LANGUAGE',

        'language.title': 'Language',

        'confirm.title': 'Are you sure?',
        'confirm.message': 'Your settings will not be saved',

        'settings.title': 'Settings',
        'settings.roundDuration': 'Round duration',
        'settings.unlimited': 'Unlimited',
        'settings.seconds': '{seconds} sec.',
        'settings.playerCount': 'Number of players',
        'settings.createRoom': 'CREATE ROOM',
        'settings.joinRoom': 'JOIN ROOM',
        'settings.next': 'NEXT',
        'settings.gameMode': 'GAME MODE',

        'rounds.title': 'Game modes',
        'rounds.random': 'Random order',
        'rounds.count': 'Number of rounds',
        'rounds.round': ' Round',
        'rounds.save': 'SAVE',

        'setup.name': 'Name:',
        'setup.namePlaceholder': 'Enter name',
        'setup.color': 'Choose a color:',
        'setup.nextPlayer': 'NEXT PLAYER ▶',
        'setup.startGame': 'START GAME ',
        'setup.prevPlayer': '◀ PREVIOUS PLAYER',

        'game.turn': "{name}'s turn!",
        'game.question': 'Question',
        'game.showQuestion': 'Show question',
        'game.commentPlaceholder': 'Write a comment',
        'game.nextPlayer': 'Next player',
        'game.finish': 'Finish',
        'game.quit': 'END GAME',

        'answer.done': 'DONE!',
        'answer.doneMessage': "Now it's time to take those answers out of context!",

        'transition.round': 'Round {number}',
        'transition.evaluation': "Well then, let's take a look at what you've created!",
        'transition.showResult': 'SHOW RESULTS',

        'result.currentPoints': 'CURRENT SCORE',
        'result.playAgain': 'PLAY AGAIN',
        'result.nextRound': 'NEXT ROUND',

        'evaluation.dateTime': '{date}, {time}',
        'evaluation.checkedIn': 'Checked in at:',
        'evaluation.like': '👍 Like',
        'evaluation.comment': '💬 Comment',
        'evaluation.share': '↗ Share',
        'evaluation.views': '{views} views',
        'evaluation.recommends': 'recommends',
        'evaluation.navWorld': 'World',
        'evaluation.navMoney': 'Money',
        'evaluation.navFood': 'Food',
        'evaluation.askPlayer': 'Ask {name} something!',
        'evaluation.askedAgo': 'Asked {hours} hours ago',
        'evaluation.funds': '${amount}',
        'evaluation.raised': 'Raised so far',
        'evaluation.supporters': 'Supporters',
        'evaluation.helpNow': 'HELP\nNOW',
        'evaluation.search': 'What are you looking for?',
        'evaluation.addToCart': 'ADD TO CART',
        'evaluation.noVotes': 'No votes',
        'evaluation.score': 'SCORE',
        'evaluation.allVotesCast': 'All votes cast!',
        'evaluation.ownCard': 'Your own card - swipe on!',
        'evaluation.yourTurn': 'Your turn – tap a card',
        'evaluation.votesCounted': 'The votes have been counted!',
        'evaluation.voteFor': 'Vote for the player who looks the most ridiculous!',
    },
};

const DATE_LOCALES = {
    de: 'de-DE',
    en: 'en-US',
};

export const getDateLocale = (language) => DATE_LOCALES[language];

export const translate = (language, key, params = {}) =>
    TRANSLATIONS[language][key].replace(/\{(\w+)\}/g, (_, name) => params[name]);

export const LanguageContext = createContext(null);

export const useLanguage = () => useContext(LanguageContext);
