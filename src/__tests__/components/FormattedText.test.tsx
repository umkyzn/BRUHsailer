import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormattedText from '../../components/guide/FormattedText';
import { plainText, boldText, linkItem, formattingLinkItem, coloredText } from '../fixtures/guideData';
import type { ContentItem } from '../../types/guide';

describe('FormattedText', () => {
  it('renders plain text inside a span', () => {
    render(<FormattedText content={[plainText('Hello world')]} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders multiple items in sequence', () => {
    render(<FormattedText content={[plainText('First'), plainText(' Second')]} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    // Leading space is preserved in the DOM even though getByText normalizes it for queries
    expect(screen.getByText(/Second/)).toBeInTheDocument();
  });

  it('renders bold text with fontWeight bold style', () => {
    render(<FormattedText content={[boldText('Bold text')]} />);
    const el = screen.getByText('Bold text');
    expect(el.style.fontWeight).toBe('bold');
  });

  it('renders italic text with fontStyle italic style', () => {
    const item: ContentItem = { text: 'Slanted', formatting: { italic: true } };
    render(<FormattedText content={[item]} />);
    expect(screen.getByText('Slanted').style.fontStyle).toBe('italic');
  });

  it('renders strikethrough text with line-through text decoration', () => {
    const item: ContentItem = { text: 'Old info', formatting: { strikethrough: true } };
    render(<FormattedText content={[item]} />);
    expect(screen.getByText('Old info').style.textDecoration).toContain('line-through');
  });

  it('renders explicit link (item.isLink) with correct href and class', () => {
    render(<FormattedText content={[linkItem('Click me', 'https://example.com')]} />);
    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveClass('drive-link');
  });

  it('renders formatting.isLink / formatting.url as an anchor', () => {
    render(<FormattedText content={[formattingLinkItem('Wiki', 'https://osrs.wiki/')]} />);
    const link = screen.getByRole('link', { name: 'Wiki' });
    expect(link).toHaveAttribute('href', 'https://osrs.wiki/');
  });

  it('auto-detects bare URLs in plain text and wraps them as anchor tags', () => {
    const item = plainText('Visit https://runescape.com for info');
    render(<FormattedText content={[item]} />);
    const link = screen.getByRole('link', { name: 'https://runescape.com' });
    expect(link).toHaveAttribute('href', 'https://runescape.com');
    expect(screen.getByText(/^Visit/)).toBeInTheDocument();
    expect(screen.getByText(/for info/)).toBeInTheDocument();
  });

  it('renders colored text with the correct rgb() color style', () => {
    render(<FormattedText content={[coloredText('Red text', 1, 0, 0)]} />);
    expect(screen.getByText('Red text').style.color).toBe('rgb(255, 0, 0)');
  });

  it('renders zero-value color channels correctly', () => {
    render(<FormattedText content={[coloredText('Blue', 0, 0, 1)]} />);
    expect(screen.getByText('Blue').style.color).toBe('rgb(0, 0, 255)');
  });
});
