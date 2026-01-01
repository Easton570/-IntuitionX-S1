import { VideoScenario, VideoType } from "./types";

export const SCENARIOS: VideoScenario[] = [
  {
    id: 's1',
    title: 'Inception - Detailed Movie Review',
    type: VideoType.MOVIE_REVIEW,
    description: 'A deep dive into Christopher Nolan\'s Inception, explaining the dream layers, the totem theory, and the ambiguous ending.',
    duration: 600, // 10 minutes
    thumbnailUrl: 'https://picsum.photos/800/450?grayscale&blur=2' // Abstract representation
  },
  {
    id: 's2',
    title: 'Kyoto Japan - 3 Day Itinerary Vlog',
    type: VideoType.TRAVEL_VLOG,
    description: 'Travel vlog exploring Kyoto, visiting Fushimi Inari, Arashiyama Bamboo Grove, and tasting local street food in Nishiki Market.',
    duration: 480, // 8 minutes
    thumbnailUrl: 'https://picsum.photos/800/450?blur=1' 
  },
  {
    id: 's3',
    title: 'Understanding Quantum Computing',
    type: VideoType.KNOWLEDGE_SHARE,
    description: 'An educational breakdown of qubits, superposition, entanglement, and how quantum computers differ from classical ones.',
    duration: 300, // 5 minutes
    thumbnailUrl: 'https://picsum.photos/800/450?grayscale' 
  }
];