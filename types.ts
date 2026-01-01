export enum VideoType {
  MOVIE_REVIEW = 'MOVIE_REVIEW',
  TRAVEL_VLOG = 'TRAVEL_VLOG',
  KNOWLEDGE_SHARE = 'KNOWLEDGE_SHARE'
}

export interface VideoScenario {
  id: string;
  title: string;
  type: VideoType;
  description: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl?: string; // For actual video playback
  file?: File; // The actual file object for analysis
  isCustom?: boolean;
}

export interface Segment {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  title: string;
  description: string;
  keyEntities: string[]; // Characters or Locations
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalysisResult {
  segments: Segment[];
  summary: string;
}