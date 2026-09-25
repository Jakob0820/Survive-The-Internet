import googleMapsLogo from '../../assets/googlemaps.png';
import redditLogo from '../../assets/reddit.png';
import youtubeLogo from '../../assets/youtube.png';
import linkedinLogo from '../../assets/linkedin.png';
import tagesschauLogo from '../../assets/tagesschau.png';
import gutefrageLogo from '../../assets/gutefrage.png';
import gofundmeLogo from '../../assets/gofundme.png';
import twitterLogo from '../../assets/twitter.png';
import ebayLogo from '../../assets/ebay.png';

export const ROUND_TYPE = {
    GOOGLE_MAPS: 'google_maps',
    REDDIT: 'reddit',
    YOUTUBE: 'youtube',
    LINKEDIN: 'linkedin',
    TAGESSCHAU: 'tagesschau',
    GUTEFRAGE: 'gutefrage',
    GOFUNDME: 'gofundme',
    TWITTER: 'twitter',
    EBAY: 'ebay',

}

export const QUESTIONS = [
    {
        id: 'review',
        categoryName: 'Google Maps',
        //...Empfielt Location
        type: ROUND_TYPE.GOOGLE_MAPS,
        questions: [
            'Schreibe eine Rezension für das letzte Buch was du gelesen hast.',
            'Wie beschreibst du den Geruch von vollgestopften Restmülltonnen im Hochsommer?',
            'Beschreibe den Inhalt eines Studenten-Kühlschranks am Ende des Monats.',
            'Schreibe eine ehrliche Rezension über ein billiges Hotelzimmer.',
            'Beschreibe den Zustand einer öffentlichen Toilette an einem Hauptbahnhof um 4 Uhr morgens.',
            'Wie war der letzte Kinofilm, den du gesehen hast?',
            'Schreibe eine Rezension für einen Mietwagen?',
            'Wie war deine letzte Bahnfahrt?',
            'Wie würdest du dein Traumdate beschreiben?',
            'Schreibe eine ehrliche Rezension für das Menü in der Uni-Mensa.',
            'Was ist das Erste, was du rufst, wenn du im Lotto den Hauptgewinn knackst?',
            'Beschreibe das letzte Youtube Video, das du gesehen hast.',
            'Schreibe eine kurze Rezension über die letzte TV-Serie, die du geschaut hast.',
        ],
        answer: ['wäre eine peinliche Rezension für diesen Standort:'],
        color: [
            '#79acff',
            '#FFFFFF',
            '#000000',
        ],
        logo: googleMapsLogo,
    },
    {
        id: 'comment',
        categoryName: 'Reddit',
        //...Antwort auf Kommentar
        type: ROUND_TYPE.REDDIT,
        questions: [
            'Was, glaubst du, ist die häufigste Lüge, die Leute erzählen?',
            'Was sagst du zu einer Mücke, die nachts um 3 Uhr an deinem Ohr summt?',
            'Was rufst du einem Hund zu, der stur nicht hören will?',
            'Was denkst du über die Theorie, dass Aliens die Pyramiden gebaut haben?',
            'Was rufst du einer Person zu, die ihren Einkaufswagen mitten im Gang stehen lässt?',
            'Was sagst du zu deinem Smartphone, wenn der Touchscreen im entscheidenden Moment einfriert?',
            'Was schreist du dem Schiedsrichter zu, wenn er eine offensichtliche Fehlentscheidung trifft?',
            'Was sagst du zu einer Taube, die gerade auf deine frisch gewaschene Windschutzscheibe kackt?',
            'Was ist deine ehrliche Meinung zu Horoskopen und Astrologie?',
            'Was hälts du von Ananas auf der Pizza?',
            'Was denkst du, was die Regierung wirklich in der geheimnisvollen Area 51 versteckt?',
            'Was antwortest du, wenn dich deine Oma fragt, ob du schon eine/n Freund/in hast?',
            'Was ist die wichtigste Lektion, die du aus einer schlechten Beziehung gelernt hast?',
            'Was rufst du dem Autofahrer zu, der vor dir ohne zu blinken abbiegt?',
            'Was ist ein universeller Spruch, der jeden Streit beenden kann?',
            'Was denkst du über Leute die in einer Wohngemeinschaft leben?',
        ],
        answer: ['wäre eine peinliche Antwort auf diesen Kommentar:'],
        color: [
            '#ff9772',
            '#FFFFFF',
            '#000000',
        ],
        logo: redditLogo,
    },
    {
        id: 'video',
        categoryName: 'Youtube',
        //..Videotitel und Kommentar auf dieses Video
        type: ROUND_TYPE.YOUTUBE,
        questions: [
            'Was war das erste, was du heute gesagt hast?',
            'Was denkst du über Leute, die im Kino laut mit der Popcorntüte rascheln?',
            'Was hältst du von der Mondlandung?',
            'Was würdest du gerne in den Grand Canyon rufen?',
            'Wie beschreibst du das Gefühl nanch dem Sex?',
            'Was rufst du dem Richter zu nachdem er dich zu 5 Jahren Haft verurteilt hat?',
            'Was würdest du gerne deinem absoluten Hassprofessor sagen?',
            'Du triffst dein Idol, was ist das erste, was du ihm/ihr sagst?',
            'Was sagst du, wenn ein Typ dich im Club antanzt?', 
            'Was würdest du sagen, wenn du Hitler eine Frage stellen könntest?',
            'Wie war dein letzter Besuch im Bürgerbüro?',
            'Was ist deine ehrliche Meinung zu Sprachnachrichten, die länger als drei Minuten dauern?',
            'Was rufst du aus dem Fenster, wenn nachts um 2 Uhr draußen eine Alarmanlage losgeht?',
            'Wie ist deine Haltung zu Gespenstern?',
            'Wie fühlst du dich normalerweise an deinem Geburtstag?',

        ],
        answer: ['wäre ein peinlicher Kommentar auf ein Video mit diesem Titel:'],
        color: [
            '#ffb8b8',
            '#FFFFFF',
            '#000000',
        ],
        logo: youtubeLogo,
    },
    /*{
        id: 'photo',
        categoryName: 'Instagram',
        //...Bild und Kommentar auf das Bild
        questions: [
            {
                id: 'q1',
                text: 'In welches Land würdest du eher reisen?',
                //image: require()
                options: [
                    'Frankreich',
                    'Russland',
                ]
            },
            {
                id: 'q2',
                text: 'Wofür würdest du mehr Geld ausgeben?',
                options: [
                    'Hochzeit',
                    'Eine Anzahlung fürs Haus',
                ]
            }
        ]
    },*/
    {
        id: 'recommendation',
        categoryName: 'LinkedIN',
        //..Empfielt Person
        type: ROUND_TYPE.LINKEDIN,
        questions: [
            'Was macht Batman so toll?',
            'Beschreibe deine/n letzten Mathlehrer/in.',
            'Was hältst du von Bonnie Blue?',
            'Beschreibe kurz die letzte Person, mit der du in einer Menge zusammengedrängt warst.',
            'Wie beschreibst du das Aussehen von jemandem, der gerade einen extrem schlimmen Unfall überlebt hat?',
            'Was macht Darth Vader so extrem bedrohlich?',
            'Wie würdest du den Intellekt und das Verhalten von Patrick aus Spongebob beschreiben?',
            'Wie würdest du eine Barbiepuppe beschreiben?',
            'Wie würdest du die Kardashians beschreiben?',
            'Was macht den weißen Hai so bedrohlich?',
            'Wieso haben alle Angst für Pennywise?',
            'Beschreibe Megan Fox aus Transformers.',
            'Wie würdest du das Verhalten von Mr. Bean beschreiben?',
            'Nenne Eigenschaften, die ein Arzt haben sollte.',
            'Was macht einen guten Koch aus?',
            'Was denkst du über Shakespeare?',
            'Was ist Mary Poppins beste Eigenschaft?',
        ],
        answer: ['wäre eine peinliche Empfehlung für diese Person:'],
        color: [
            '#8bd3ff',
            //'#0d2d41',
            '#FFFFFF',
            '#000000',
        ],
        logo: linkedinLogo,
    },
    {
        id: 'news',
        categoryName: 'Tagesschau',
        //Schlagzeile
        type: ROUND_TYPE.TAGESSCHAU,
        questions: [
            'Was ist deine Meinung über Franzosen?',
            'Was ist deine Meinung über Türken?',
            'Was denkst du über den Weltfrieden?',
            'Was ist dein erster Gedanke, wenn du morgens den Wecker hörst?',
            'Was denkst du über Tornadojäger?',
            'Was sagst du zu der Behauptung, dass Geld allein glücklich macht?',
            'Was ist dein erster Gedanke, wenn du siehst, wie jemand versucht, eine verschlossene Tür aufzudrücken statt zu ziehen?',
            'Was sagst du zu einem Navi, das dich stur in eine Einbahnstraße schicken will?',
            'Was sagst du zu einem Passagier im Flugzeug, wenn die Turbulenzen so stark werden, dass die Sauerstoffmasken herunterfallen?',
            'Was sagst du zu jemandem, der fest davon überzeugt ist, dass Tauben in Wahrheit Spionage-Dronen der Regierung sind?',
            'Wie reagierst du nach deinem ersten Fortnite Sieg?',
            'Was ist dein erster Gedanke, wenn du zum Fallschirmspringen aus dem Flugzeug springst?',
            'Was ist deine ehrliche Meinung zu Leuten, die behaupten, die Erde sei eine Scheibe?',
            'Was, glaubst du, ist der wahre Grund, warum die Eisemaschine bei McDonald’s gefühlt ständig defekt ist?',
            'Was flüsterst du dir selbst zu, wenn du im Fahrstuhl stecken bleibst – zusammen mit deinem Ex-Partner?',
            'Was denkst du über Leute, die sich in öffentlichen Verkehrsmitteln die Fingernägel schneiden?',
            'Welchen Klischeesatz benutzt du am häufigsten?',
            'Was sagst du wenn du beim Schach gewinnst?',
        ],
        answer: ['wäre ein schrecklicher Kommentar auf diese Schlagzeile:'],
        color: [
            '#adccff',
            '#FFFFFF',
            '#000000',
        ],
        logo: tagesschauLogo,
    },
    {
        id: 'forum',
        categoryName: 'Gutefrage.net',
        //Frage Post und antwort auf diese Frage
        type: ROUND_TYPE.GUTEFRAGE,
        questions: [
            'Was ist deine Haltung zum Klimawandel?',
            'Welchen Ratschlag würdest du deinem jüngeren Ich geben?',
            'Wie beschreibst du dein perfektes Wochenende?',
            'Was ist dein absolutes Geheimrezept für gute Laune?',
            'Welchen kurzen Tipp würdest du jemandem geben, der nicht schlafen kann?',
            'Was denkst du über Leute, die sich auf fremde Parties schleichen?',
            'Was ist dein absolut skrupellosester Beziehungs-Dealbreaker?',
            'Was würdest du tun, wenn du für 24 Stunden absolut jede moralische Regel straffrei brechen könntest?',
            'Was denkst du über Leute, die ihr gesamtes Privatleben auf Social Media zur Schau stellen?',
            'Welchen Tipp würdest du einem neuen Studenten geben?',
            'Was ist deine Lieblingsbeschäftigung an einem verregneten Sonntag?',
            'Welchen Tipp würdest du einem Schüler geben der gemobbt wird?',
            'Was ist das erste, was du nach einer geschriebenen Klausur tust?',
            'Was ist dein Tipp gegen Liebeskummer?',
            'Was ist eine unpopuläre Meinung von dir, zu der du voll und ganz stehst?',
            'Welchen Tipp würdest du jemandem geben, der Angst vor dem Älterwerden hat?',
            'Welchen Rat würdest du jemandem geben, der auf Jobsuche ist?',
            'Was ist deine Wunderwaffe, wenn du im Beruf oder Studium kurz vor einem Burnout stehst?',
            'Wenn du ab morgen nie wieder arbeiten müsstest, womit würdest du deinen Alltag füllen?',
            'Welchen Ratschlag würdest du jemandem geben, der nach Jahren immer noch nicht über seine erste große Liebe hinweg ist?',
            'Was würdest du zu einem schlechten Servicemitarbeiter sagen?',
            'Was denkst du über Leute, die nicht recyclen?'
        ],
        answer: ['wäre eine peinliche Antwort auf diese Frage:'],
        color: [
            '#6cceff',
            '#FFFFFF',
            '#000000',
        ],
        logo:gutefrageLogo,
    },
    {
        id: 'funding',
        categoryName: 'GoFundMe',
        //Spendenaktion
        type: ROUND_TYPE.GOFUNDME,
        questions: [
            'Was würdest du gerne deinen Hatern sagen?',
            'Was sagst du, wenn sich jemand in einer Schlange vordrängelt?',
            'Was antwortest du, wenn dich eine nervige Person auf der Straße um Geld anbettelt?',
            'Was sagst du zu deinem Spiegelbild, wenn du um 5 Uhr morgens völlig zerstört aus dem Club kommst?',
            'Was sagst du zu Eltern, deren Kind im Supermarkt seit 20 Minuten lautstark rumschreit?',
            'Was sagst du zu einer Person, die sich beide Beine gebrochen hat und nicht mehr laufen kann?',
            'Was denkst du insgeheim über Leute, die nachts an einer völlig leeren Straße bei Rot an der Fußgängerampel warten?',
            'Was sagst du zu jemandem, der dir auf einer Party ein pissewarmes Bier anbietet?',
            'Was sagst du zu deiner Tochter, die viel zu freizügig in den Club geht?',
            'Was sagst du zu deiner Tochter, wenn du erfährst, dass sie schwanger ist?',
            'Wie beantwortest du einen Bootycall?',
            'Was denkst du über Menschen, die auf Rolltreppen links stehen bleiben, statt zu gehen?',
            'Was sagst du zu deinem Freund/Freundin, die zum dritten mal hinternander komplett abstürzt beim feiern?',
            'Was denkst du über Leute, die im Fitnessstudio laut stöhnend die Gewichte auf den Boden knallen lassen?',
            'Was sagst du zu jemandem, der dir ungefragt Diät-Tipps gibt?',
            'Was rufst du einer Person zu, die beim Einparken drei Parkplätze auf einmal blockiert?',
            'Wie stehst du zu Ostern?',
            'Wie würdest du deine athletischen Fähigkeiten beschreiben?',
        ],
        answer: ['wäre ein lustiger Kommentar auf eine Crowdfunding-Kampagne mit diesem namens:'],
        color: [
            '#00ab55',
            '#FFFFFF',
            '#000000',
        ],
        logo:gofundmeLogo,
    },
    {
        id: 'hashtag',
        categoryName: 'Twitter',
        //Hashtag auf eine Aussage
        type: ROUND_TYPE.TWITTER,
        questions: [
            'Wie reagierst du normalerweise, wenn du eine Spinne siehst?',
            'Wie reagierst du, wenn du barfuß auf einen Legostein trittst?',
            'Was hältst du von Quinoa?',
            'Wie reagierst du, wenn du nachts im Dunkeln mit dem kleinen Zeh an die Bettkante stößt?',
            'Was ist dein tiefstes, dunkelstes Geheimnis, das du niemals deiner Mutter erzählen dürftest?',
            'Was hältst du von der WWE?',
            'Was hältst du von Leuten, die Ananas auf ihrer Pizza essen?',
            'Was hältst du von Sendungen wie „Ich bin ein Star - Holt mich hier raus!“ oder „Temptation Island“?',
            'Was hältst du von Leuten, die in den ersten 5 Minuten eines Gesprächs erwähnen, dass sie CrossFit machen?',
            'Was würdest du tun, wenn du aufwachen würdest und für 24 Stunden unsichtbar wärst?',
            'Was würdest du deinem Chef/deiner Chefin im allerletzten Satz deiner Kündigung an den Kopf werfen?',
            'Was ist das Erste, was du denkst, wenn du morgens nach einer Party aufwachst und jemand Fremdes neben dir liegt?',
            'Was ist dein lieblings Filmzitat?',
            'Was möchtest du oft laut herausrufen, wenn du die Nachrichten siehst?',
        ],
        answer: ['wäre ein peinlicher Kommentar zu diesem Hashtag:'],
        color: [
            '#ade0ff',
            '#FFFFFF',
            '#000000',
        ],
        logo:twitterLogo,

    },
    {
        id: 'product',
        categoryName: 'Ebay',
        //Kommentar auf ein Produkt
        type: ROUND_TYPE.EBAY,
        questions: [
            'Schreibe eine Rezension über deine Badematte',
            'Was denkst du über moderne Kunstwerke in Museen?',
            'Schreibe eine kurze Rezension über Apple-Geräte.',
            'Was hälts du von alkoholfreiem Bier?',
            'Schreibe eine Bewertung für das Essen in einer Schulkantine.',
            'Schreibe eine Rezension über eine Saugroboter.',
            'Was ist deine ehrliche Meinung über Energy-Drinks?',
            'Was ist deine Meinung über veganen Käseersatz?',
            'Was ist deine Meinung zu vegetarischem Fleischersatz?',
            'Wie hast du gestern Nacht geschlafen?',
            'Schreibe eine ehrliche Rezension für das Gratis-WLAN in einem Fernzug.',
            'Schreibe eine kurze Rezension über deinen letzten Haarschnitt.',
            'Schreibe eine Rezension über deinen Fernseher.',
            'Was denkst du über Brokkoli?',
        
        ],
        answer: ['wäre eine peinliche Rezension für dieses Produkt:'],
        color: [
            '#c8f364',
            '#FFFFFF',
            '#000000',
        ],
        logo:ebayLogo,
    }
    
]