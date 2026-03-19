export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface Formatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: RgbColor;
  url?: string;
  isLink?: boolean;
}

export interface ContentItem {
  text: string;
  url?: string;
  isLink?: boolean;
  formatting?: Formatting;
}

export interface NestedContent {
  level: number;
  content: ContentItem[];
}

export interface StepMetadata {
  total_time?: string;
  gp_stack?: string;
  items_needed?: string;
  skills_quests_met?: string;
  [key: string]: string | undefined;
}

export interface Step {
  content: ContentItem[];
  metadata?: StepMetadata;
  nestedContent?: NestedContent[];
}

export interface GuideSection {
  title: string;
  steps: Step[];
}

export interface Footnote {
  content: ContentItem[];
}

export interface Chapter {
  title: string;
  titleFormatted?: ContentItem[];
  sections: GuideSection[];
  footnotes?: Footnote[];
}

export interface GuideData {
  updatedOn: string;
  chapters: Chapter[];
}

export type HighlightColor = 'green' | 'yellow' | 'blue' | 'pink';
export type FilterType = 'all' | 'completed' | 'incomplete';

export interface HighlightEntry {
  parentId: string;
  htmlContent: string;
  color: HighlightColor;
}

// Pre-processed step with its computed ID
export interface StepWithId {
  step: Step;
  stepId: string;
}

export interface SectionWithSteps {
  section: GuideSection;
  steps: StepWithId[];
}

export interface ChapterWithSections {
  chapter: Chapter;
  chapterIndex: number;
  sections: SectionWithSteps[];
}
