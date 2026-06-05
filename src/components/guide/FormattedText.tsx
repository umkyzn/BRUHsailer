import { memo } from 'react';
import type { ContentItem, Formatting } from '../../types/guide';

function buildStyle(formatting?: Formatting): React.CSSProperties {
  if (!formatting) return {};
  const style: React.CSSProperties = {};

  style.fontWeight = formatting.bold ? 'bold' : 'normal';
  style.fontStyle = formatting.italic ? 'italic' : 'normal';

  const decorations: string[] = [];
  if (formatting.underline) decorations.push('underline');
  if (formatting.strikethrough) decorations.push('line-through');
  style.textDecoration = decorations.length ? decorations.join(' ') : 'none';

  if (formatting.fontSize) style.fontSize = `${formatting.fontSize + 2}px`;
  if (formatting.fontFamily) style.fontFamily = formatting.fontFamily;

  if (formatting.color) {
    const { r, g, b } = formatting.color;
    style.color = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
  }

  return style;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderItem(item: ContentItem, index: number): React.ReactNode {
  const style = buildStyle(item.formatting);

  // Explicit link on item
  if (item.isLink && item.url) {
    return (
      <a key={index} href={item.url} target="_blank" rel="noreferrer" className="drive-link" style={style}>
        {item.text}
      </a>
    );
  }

  // Explicit link on formatting
  if (item.formatting?.isLink && item.formatting.url) {
    return (
      <a key={index} href={item.formatting.url} target="_blank" rel="noreferrer" className="drive-link" style={style}>
        {item.text}
      </a>
    );
  }

  // Auto-detect URLs in text
  if (URL_REGEX.test(item.text)) {
    URL_REGEX.lastIndex = 0;
    const parts: React.ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    let i = 0;

    while ((match = URL_REGEX.exec(item.text)) !== null) {
      if (match.index > last) {
        parts.push(<span key={i++} style={style}>{item.text.slice(last, match.index)}</span>);
      }
      parts.push(
        <a key={i++} href={match[0]} target="_blank" rel="noreferrer" style={style}>
          {match[0]}
        </a>
      );
      last = match.index + match[0].length;
    }
    if (last < item.text.length) {
      parts.push(<span key={i++} style={style}>{item.text.slice(last)}</span>);
    }
    return <span key={index}>{parts}</span>;
  }

  return <span key={index} style={style}>{item.text}</span>;
}

interface FormattedTextProps {
  content: ContentItem[];
}

const FormattedText = memo(function FormattedText({ content }: FormattedTextProps) {
  return <div>{content.map(renderItem)}</div>;
});

export default FormattedText;
