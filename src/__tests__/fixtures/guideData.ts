import type { GuideData, ChapterWithSections, Step, ContentItem } from '../../types/guide';

// ─── ContentItem helpers ──────────────────────────────────────────────────────

export const plainText = (text: string): ContentItem => ({ text });

export const boldText = (text: string): ContentItem => ({
  text,
  formatting: { bold: true },
});

export const linkItem = (text: string, url: string): ContentItem => ({
  text,
  url,
  isLink: true,
});

export const formattingLinkItem = (text: string, url: string): ContentItem => ({
  text,
  formatting: { isLink: true, url },
});

export const coloredText = (text: string, r: number, g: number, b: number): ContentItem => ({
  text,
  formatting: { color: { r, g, b } },
});

// ─── Step factory ─────────────────────────────────────────────────────────────

export function makeStep(text: string, overrides?: Partial<Step>): Step {
  return {
    content: [plainText(text)],
    ...overrides,
  };
}

// ─── Mock guide data: 2 chapters × 2 sections × 2 steps = 8 steps total ──────
// Step IDs: 1-1, 1-2, 1-3, 1-4 (chapter 1) | 2-1, 2-2, 2-3, 2-4 (chapter 2)

export const mockGuideData: GuideData = {
  updatedOn: '2025-01-01',
  chapters: [
    {
      title: 'Chapter One',
      sections: [
        {
          title: 'Section 1.1',
          steps: [
            makeStep('Do the first thing'),
            makeStep('Do the second thing', {
              metadata: { gp_stack: '500k', total_time: '10 min', items_needed: 'Rope' },
            }),
          ],
        },
        {
          title: 'Section 1.2',
          steps: [
            makeStep('Third thing'),
            makeStep('Fourth thing'),
          ],
        },
      ],
    },
    {
      title: 'Chapter Two',
      sections: [
        {
          title: 'Section 2.1',
          steps: [
            makeStep('Fifth thing'),
            makeStep('Sixth thing'),
          ],
        },
        {
          title: 'Section 2.2',
          steps: [
            makeStep('Seventh thing'),
            makeStep('Eighth thing'),
          ],
        },
      ],
    },
  ],
};

// ─── buildChapters: mirrors the useMemo in page components ──────────────────

export function buildChapters(data: GuideData = mockGuideData): {
  chapters: ChapterWithSections[];
  allStepIds: string[];
} {
  const ids: string[] = [];
  const chapters: ChapterWithSections[] = data.chapters.map((chapter, ci) => {
    let count = 0;
    const sections = chapter.sections.map((section) => {
      const steps = section.steps.map((step) => {
        count++;
        const stepId = `${ci + 1}-${count}`;
        ids.push(stepId);
        return { step, stepId };
      });
      return { section, steps };
    });
    return { chapter, chapterIndex: ci, sections };
  });
  return { chapters, allStepIds: ids };
}
