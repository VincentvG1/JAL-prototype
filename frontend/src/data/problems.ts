// 5 civic problems mapped to real locations in Tilburg.

import type { Problem } from '../types/journey';

export const PROBLEMS: Problem[] = [
  {
    id: 'afval',
    title: 'Afval en zwerfvuil',
    subtitle: 'De prullenbakken stromen over',
    icon: '🗑️',
    color: '#e8762b',
    position: [51.5553, 5.091],
    teaser:
      'In het stadscentrum liggen overal afval en volle prullenbakken. Wie is er verantwoordelijk?',
    snippets: [
      {
        icon: '📊',
        title: '35 kg afval per persoon per jaar',
        body: 'Een gemiddelde Nederlander produceert 35 kilo zwerfafval per jaar. In drukke winkelstraten zie je dat het meeste.',
      },
      {
        icon: '🌍',
        title: 'Effect op de natuur',
        body: 'Plastic uit de stad eindigt vaak in de natuur of het water. Dieren en vissen raken hier gewond door.',
      },
      {
        icon: '💡',
        title: 'Wie lost het op?',
        body: 'Gemeente, winkels en burgers wijzen naar elkaar. Maar wie heeft echt de macht om het te veranderen?',
      },
      {
        icon: '🤖',
        title: 'Slimme prullenbakken',
        body: 'In sommige steden zijn er prullenbakken die zelf melden wanneer ze vol zijn. Zou dat hier ook werken?',
      },
    ],
  },
  {
    id: 'verkeer',
    title: 'Verkeersveiligheid',
    subtitle: 'Gevaarlijk bij de schoolpoort',
    icon: '🚗',
    color: '#e74c3c',
    position: [51.562, 5.097],
    teaser:
      "Op werkdagen staat het vast rondom scholen. Auto's rijden te snel en fietsers zijn niet veilig.",
    snippets: [
      {
        icon: '🚸',
        title: 'Elke dag gevaarlijke situaties',
        body: '1 op de 3 kinderen maakt bijna-ongelukken mee op weg naar school — dat zijn 10 kinderen per dag in Tilburg.',
      },
      {
        icon: '🚲',
        title: "Fietsers versus auto's",
        body: "Tilburg heeft veel fietspaden, maar bij schoolpoorten is te weinig ruimte. Auto's bezetten het fietspad bij het halen en brengen.",
      },
      {
        icon: '📍',
        title: 'Zwarte punten in de stad',
        body: 'De gemeente heeft een kaart met plekken waar de meeste ongelukken gebeuren. Veel liggen bij scholen.',
      },
      {
        icon: '🛑',
        title: 'Wie beslist over de straat?',
        body: 'Herinrichting kost veel geld en tijd. Ouders, leerlingen en de gemeente moeten samenwerken voor een veiligere buurt.',
      },
    ],
  },
  {
    id: 'park',
    title: 'Bewegen en gezondheid',
    subtitle: 'Het park is er, maar wie gebruikt het?',
    icon: '🌳',
    color: '#27ae60',
    position: [51.5611, 5.083],
    teaser:
      'Het Wilhelminapark is een grote groene long van Tilburg. Maar veel jongeren komen er nauwelijks. Hoe activeer je een park?',
    snippets: [
      {
        icon: '📉',
        title: '1 op de 4 jongeren beweegt te weinig',
        body: '25% van jongeren tussen 12 en 18 jaar voldoet niet aan de beweegnorm. Dat heeft gevolgen voor je gezondheid.',
      },
      {
        icon: '🏃',
        title: 'Het park heeft meer nodig',
        body: 'Een grasveld is niet genoeg. Jongeren willen uitdaging, ontmoeting en sociale activiteiten. Dat vraagt om slimme inrichting.',
      },
      {
        icon: '📱',
        title: 'Schermen vs. buiten zijn',
        body: 'Jongeren brengen gemiddeld 7 uur per dag door achter een scherm. Buiten zijn concurreert met TikTok en YouTube.',
      },
      {
        icon: '🤝',
        title: 'Buurt betrekken',
        body: 'In andere steden organiseren buurtbewoners zelf activiteiten in parken. Zou dat in Tilburg ook kunnen?',
      },
    ],
  },
  {
    id: 'mobiliteit',
    title: 'Openbaar vervoer',
    subtitle: 'De bus snapt niemand meer',
    icon: '🚌',
    color: '#3498db',
    position: [51.5634, 5.0837],
    teaser:
      'Tilburg heeft treinen en bussen, maar voor jongeren is het systeem verwarrend en duur. Hoe maak je OV toegankelijker?',
    snippets: [
      {
        icon: '😤',
        title: 'Te ingewikkeld en te duur',
        body: 'Bijna 60% van de jongeren vindt het OV te ingewikkeld. Veel hebben geen OV-chipkaart of weten niet hoe ze die opladen.',
      },
      {
        icon: '🌐',
        title: 'Digitale kloof',
        body: 'Niet iedereen heeft een smartphone of internet om reis-apps te gebruiken. Dat maakt het OV nog moeilijker toegankelijk.',
      },
      {
        icon: '🗺️',
        title: 'Hoe navigeer je de stad?',
        body: 'Jongeren in Tilburg gaan voornamelijk met de fiets. Maar niet iedereen heeft er een, en niet elke bestemming is fietsbaar.',
      },
      {
        icon: '💡',
        title: 'Andere steden als voorbeeld',
        body: 'In Amsterdam en Utrecht zijn gratis OV-zones voor jongeren. Waarom bestaat dat niet in Tilburg?',
      },
    ],
  },
  {
    id: 'luchtkwaliteit',
    title: 'Luchtkwaliteit',
    subtitle: 'Wat adem jij in?',
    icon: '💨',
    color: '#9b59b6',
    position: [51.558, 5.077],
    teaser:
      'Rondom de Spoorzone is de luchtkwaliteit soms slechter dan elders in de stad. Wie merkt dit het meest?',
    snippets: [
      {
        icon: '🏭',
        title: 'Industrie in de stad',
        body: 'De Spoorzone is een oud industriegebied dat nu deels omgebouwd wordt, maar er zijn nog bedrijven die uitstoot produceren.',
      },
      {
        icon: '🌬️',
        title: 'Luchtvervuiling is onzichtbaar',
        body: 'Fijnstof is niet te zien of te ruiken, maar kan leiden tot astma, longproblemen en hart- en vaatziekten.',
      },
      {
        icon: '📊',
        title: 'Wie woont het dichtst bij?',
        body: 'Mensen met lagere inkomens wonen vaker in de buurt van industriegebieden. Luchtvervuiling is ook een sociaal probleem.',
      },
      {
        icon: '🌱',
        title: 'Groen als filter',
        body: 'Bomen en planten filteren deels de lucht. Meer groen in de stad kan de luchtkwaliteit verbeteren — maar groen aanleggen kost geld.',
      },
    ],
  },
];
