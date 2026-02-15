
export interface TravelData {
  source: string;
  destination: string;
}

export interface AssistantResponse {
  trafficInfo: string;
  weatherInfo: string;
  venueDetails: string;
  groundingLinks: Array<{ title: string; uri: string }>;
}

export enum AppStage {
  WELCOME = 'WELCOME',
  INPUT = 'INPUT',
  RESULTS = 'RESULTS'
}
