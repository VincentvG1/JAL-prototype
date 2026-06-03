interface Tool {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  active: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'video',
    icon: '🎬',
    name: 'Videogenerator',
    tagline: 'Maak een korte film van je idee',
    active: true,
  },
  {
    id: 'image',
    icon: '🖼️',
    name: 'Afbeeldingsgenerator',
    tagline: 'Laat AI een plaatje tekenen',
    active: false,
  },
  {
    id: 'game',
    icon: '🎮',
    name: 'Game bouwen',
    tagline: 'Maak een mini-spel van je oplossing',
    active: false,
  },
  {
    id: 'website',
    icon: '🌐',
    name: 'Website bouwer',
    tagline: 'Maak een simpele webpagina',
    active: false,
  },
];

interface ToolSelectorProps {
  onSelect: (toolId: string) => void;
}

export function ToolSelector({ onSelect }: ToolSelectorProps) {
  return (
    <div className="tool-selector-screen">
      <div className="tool-selector-header">
        <h2 className="tool-selector-title">Hoe wil je je oplossing laten zien?</h2>
        <p className="tool-selector-subtitle">
          Kies een tool om je presentatie te maken
        </p>
      </div>

      <div className="tool-selector-grid">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            className={`tool-tile${tool.active ? ' tool-tile--active' : ''}`}
            onClick={() => tool.active && onSelect(tool.id)}
            aria-label={tool.name}
          >
            <span className="tool-tile-icon" aria-hidden="true">{tool.icon}</span>
            <span className="tool-tile-name">{tool.name}</span>
            <span className="tool-tile-tagline">{tool.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
