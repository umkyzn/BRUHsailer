import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { findInitialOpenLocation } from '../../components/guide/GuideView';
import { buildChapters } from '../fixtures/guideData';

const { chapters } = buildChapters();

describe('findInitialOpenLocation', () => {
  it('returns chapter 0, section 0 when lastStepId is null', () => {
    expect(findInitialOpenLocation(chapters, null)).toEqual({ chapterIndex: 0, sectionIndex: 0 });
  });

  it('returns chapter 0, section 0 for step 1-1 (first step)', () => {
    expect(findInitialOpenLocation(chapters, '1-1')).toEqual({ chapterIndex: 0, sectionIndex: 0 });
  });

  it('returns chapter 0, section 1 for step 1-3 (second section of chapter 1)', () => {
    expect(findInitialOpenLocation(chapters, '1-3')).toEqual({ chapterIndex: 0, sectionIndex: 1 });
  });

  it('returns chapter 1, section 0 for step 2-1 (first section of chapter 2)', () => {
    expect(findInitialOpenLocation(chapters, '2-1')).toEqual({ chapterIndex: 1, sectionIndex: 0 });
  });

  it('returns chapter 1, section 1 for step 2-3 (second section of chapter 2)', () => {
    expect(findInitialOpenLocation(chapters, '2-3')).toEqual({ chapterIndex: 1, sectionIndex: 1 });
  });

  it('falls back to {0, 0} when the step ID does not exist in any chapter', () => {
    expect(findInitialOpenLocation(chapters, '99-99')).toEqual({ chapterIndex: 0, sectionIndex: 0 });
  });

  it('handles a single-step-id with step 1-4 (last step of chapter 1 section 2)', () => {
    expect(findInitialOpenLocation(chapters, '1-4')).toEqual({ chapterIndex: 0, sectionIndex: 1 });
  });
});
