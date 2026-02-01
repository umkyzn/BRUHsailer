// Data structure types for guide_data.json
export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: {
    r: number;
    g: number;
    b: number;
  };
}

export interface ContentElement {
  text: string;
  formatting?: TextFormatting;
}

export interface StepMetadata {
  gp_stack?: string;
  items_needed?: string;
  total_time?: string;
  skills_quests_met?: string;
  [key: string]: string | undefined;
}

export interface Step {
  content: ContentElement[];
  nestedContent: Step[];
  metadata: StepMetadata;
}

export interface Section {
  title: string;
  steps: Step[];
}

export interface Chapter {
  title: string;
  sections: Section[];
}

export interface GuideData {
  updatedOn: string;
  title: string;
  chapters: Chapter[];
}

// LocalStorage schema types
export interface ProgressState {
  [key: string]: boolean; // stepId -> completed
}

export interface HighlightState {
  [key: string]: boolean; // stepId -> highlighted
}

export interface FilterState {
  gpStack: string;
  itemsNeeded: string;
  totalTime: string;
  skillsQuestsMet: string;
}

// Event types for eventBus
export type EventCallback = (...args: any[]) => void;

export interface EventBus {
  on(event: string, callback: EventCallback): void;
  off(event: string, callback: EventCallback): void;
  emit(event: string, ...args: any[]): void;
}
