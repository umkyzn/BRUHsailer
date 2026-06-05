import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StepMeta from '../../components/guide/StepMeta';

describe('StepMeta', () => {
  it('renders nothing when metadata prop is undefined', () => {
    const { container } = render(<StepMeta />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when metadata contains only skipped keys', () => {
    const { container } = render(
      <StepMeta metadata={{ total_time: '5 min', skills_quests_met: '70 Attack' }} />
    );
    expect(container.querySelector('.step-meta')).toBeNull();
  });

  it('renders nothing when all non-skipped values are empty strings', () => {
    const { container } = render(<StepMeta metadata={{ gp_stack: '' }} />);
    expect(container.querySelector('.step-meta')).toBeNull();
  });

  it('renders GP Stack with the correct display name', () => {
    render(<StepMeta metadata={{ gp_stack: '500k' }} />);
    expect(screen.getByText('GP Stack:')).toBeInTheDocument();
    expect(screen.getByText('500k')).toBeInTheDocument();
  });

  it('renders Items Needed with the correct display name', () => {
    render(<StepMeta metadata={{ items_needed: 'Rope, Tinderbox' }} />);
    expect(screen.getByText('Items Needed:')).toBeInTheDocument();
    expect(screen.getByText('Rope, Tinderbox')).toBeInTheDocument();
  });

  it('does not render total_time even when present alongside other fields', () => {
    render(<StepMeta metadata={{ total_time: '30 min', gp_stack: '1m' }} />);
    expect(screen.queryByText('30 min')).not.toBeInTheDocument();
    expect(screen.getByText('GP Stack:')).toBeInTheDocument();
  });

  it('renders unknown keys with title-case transformation (underscores → spaces)', () => {
    render(<StepMeta metadata={{ my_custom_key: 'some value' }} />);
    expect(screen.getByText('My Custom Key:')).toBeInTheDocument();
    expect(screen.getByText('some value')).toBeInTheDocument();
  });
});
