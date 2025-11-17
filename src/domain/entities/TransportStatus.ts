import { TransportMode } from '../enums';

/**
 * État du réseau de transport
 */
export interface TransportNetworkStatus {
  location: {
    city: string;
    country: string;
  };
  timestamp: Date;
  modes: TransportModeStatus[];
  globalStatus: 'normal' | 'disrupted' | 'critical';
  roadConditions: RoadConditions;
}

/**
 * État d'un mode de transport spécifique
 */
export interface TransportModeStatus {
  mode: TransportMode;
  status: 'operational' | 'delayed' | 'disrupted' | 'closed';
  severity: 'none' | 'low' | 'medium' | 'high';

  disruptions: Disruption[];
  affectedLines?: Line[];

  averageDelay?: number;  // minutes
  availability: number;   // % (0-100)
}

/**
 * Perturbation de transport
 */
export interface Disruption {
  id: string;
  type: 'strike' | 'accident' | 'maintenance' | 'weather' | 'technical' | 'other';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;

  startTime: Date;
  endTime?: Date;

  affectedLines?: string[];
  affectedStations?: string[];
  affectedAreas?: string[];
}

/**
 * Ligne de transport affectée
 */
export interface Line {
  id: string;
  name: string;
  mode: TransportMode;
  status: 'operational' | 'delayed' | 'disrupted' | 'closed';
  disruptions: string[];
}

/**
 * Conditions routières
 */
export interface RoadConditions {
  overall: 'good' | 'fair' | 'poor' | 'dangerous';

  iceWarning: boolean;
  snowWarning: boolean;
  rainWarning: boolean;
  fogWarning: boolean;

  accidents: Accident[];
  trafficLevel: 'fluid' | 'moderate' | 'dense' | 'congested';

  advisories: RoadAdvisory[];
}

/**
 * Accident de la route
 */
export interface Accident {
  id: string;
  location: string;
  severity: 'minor' | 'major' | 'severe';
  description: string;
  reportedAt: Date;
  cleared: boolean;
}

/**
 * Avis routier
 */
export interface RoadAdvisory {
  type: 'construction' | 'closure' | 'weather' | 'event' | 'other';
  location: string;
  description: string;
  startTime: Date;
  endTime?: Date;
}
