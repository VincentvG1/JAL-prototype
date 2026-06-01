// Types for the student journey: CityMap → ProblemExploration → Mindmap

export interface ProblemSnippet {
  icon: string;
  title: string;
  body: string;
}

export interface Problem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  /** [lat, lng] — WGS84 coordinates for the Leaflet marker */
  position: [number, number];
  /** One-sentence teaser shown in the map side-panel */
  teaser: string;
  snippets: ProblemSnippet[];
}
