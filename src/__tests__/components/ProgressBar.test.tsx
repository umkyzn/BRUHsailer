import { describe, it, expect, beforeEach } from 'vitest';
import ProgressBar from '../../components/guide/ProgressBar';
import { renderWithGuide } from '../utils/renderHelpers';

describe('ProgressBar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows 0% width when no steps are completed', () => {
    const { container } = renderWithGuide(<ProgressBar totalSteps={4} />);
    const bar = container.querySelector('.progress') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });

  it('shows 50% width when half the steps are completed', () => {
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true, '1-2': true }));
    const { container } = renderWithGuide(<ProgressBar totalSteps={4} />);
    const bar = container.querySelector('.progress') as HTMLElement;
    expect(bar.style.width).toBe('50%');
  });

  it('shows 100% width when all steps are completed', () => {
    localStorage.setItem(
      'guideProgress:test',
      JSON.stringify({ '1-1': true, '1-2': true, '1-3': true, '1-4': true })
    );
    const { container } = renderWithGuide(<ProgressBar totalSteps={4} />);
    const bar = container.querySelector('.progress') as HTMLElement;
    expect(bar.style.width).toBe('100%');
  });

  it('shows 0% and does not divide by zero when totalSteps is 0', () => {
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true }));
    const { container } = renderWithGuide(<ProgressBar totalSteps={0} />);
    const bar = container.querySelector('.progress') as HTMLElement;
    expect(bar.style.width).toBe('0%');
  });

  it('rounds to nearest integer (33% for 1 of 3 completed)', () => {
    localStorage.setItem('guideProgress:test', JSON.stringify({ '1-1': true }));
    const { container } = renderWithGuide(<ProgressBar totalSteps={3} />);
    const bar = container.querySelector('.progress') as HTMLElement;
    expect(bar.style.width).toBe('33%');
  });
});
