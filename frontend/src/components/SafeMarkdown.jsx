import React from 'react';

/**
 * SafeMarkdown: XSS-safe Markdown parser and renderer in pure React JSX.
 * Renders bold, italics, inline code, headings, lists, badges, and filters
 * out raw separator lines ('---'), '###', and stray '**' markers.
 * Fully supports English and Telugu text without breaking UTF-8 characters.
 */

// Safely parses inline markdown (bold, italics, code) within a line of text
const parseInlineMarkdown = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Clean stray trailing/leading formatting remnants
  const normalized = text.trim();

  // Split by bold (**text**), italics (*text*), and inline code (`text`)
  const tokenRegex = /(\*\*[\s\S]+?\*\*|`[^`]+`|\*[^*\n]+?\*)/g;
  const parts = normalized.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2).replace(/\*\*/g, '').trim();
      return (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
          {inner}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200"
        >
          {inner}
        </code>
      );
    }

    // Italic: *text* (only if not bold and has closing asterisk)
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      const inner = part.slice(1, -1).replace(/\*/g, '').trim();
      return (
        <em key={index} className="italic opacity-90">
          {inner}
        </em>
      );
    }

    // Regular text: sanitize any stray unclosed ** or * symbols so they never show literally
    const cleanedText = part.replace(/\*+/g, '');
    return <React.Fragment key={index}>{cleanedText}</React.Fragment>;
  });
};

export const SafeMarkdown = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines
  const rawLines = String(content).split(/\r?\n/);

  // Filter out raw horizontal separators like '---', '***', '___'
  const lines = rawLines.filter((l) => {
    const trimmed = l.trim();
    return !/^[-*_]{3,}$/.test(trimmed);
  });

  const blocks = [];
  let currentBullets = [];
  let currentNumbered = [];

  const flushBullets = (key) => {
    if (currentBullets.length > 0) {
      blocks.push(
        <ul key={`ul-${key}`} className="my-2 space-y-1 pl-1">
          {currentBullets.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-primary font-black text-xs mt-1 shrink-0 select-none">•</span>
              <span className="flex-1">{parseInlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentBullets = [];
    }
  };

  const flushNumbered = (key) => {
    if (currentNumbered.length > 0) {
      blocks.push(
        <ol key={`ol-${key}`} className="my-2 space-y-1 pl-1">
          {currentNumbered.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-primary font-black text-xs mt-0.5 shrink-0 select-none">
                {item.num}.
              </span>
              <span className="flex-1">{parseInlineMarkdown(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      currentNumbered = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Empty line: flush any lists
    if (!trimmed) {
      flushBullets(lineIdx);
      flushNumbered(lineIdx);
      return;
    }

    // Markdown Heading (### Heading, ## Heading, # Heading)
    const headingMatch = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      flushBullets(lineIdx);
      flushNumbered(lineIdx);
      blocks.push(
        <h4
          key={`h-${lineIdx}`}
          className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white mt-2.5 mb-1 tracking-tight"
        >
          {parseInlineMarkdown(headingMatch[1])}
        </h4>
      );
      return;
    }

    // Unordered bullet item (- item, * item, • item)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      flushNumbered(lineIdx);
      currentBullets.push(bulletMatch[1]);
      return;
    }

    // Numbered list item (1. item, 2. item)
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (numMatch) {
      flushBullets(lineIdx);
      currentNumbered.push({ num: numMatch[1], text: numMatch[2] });
      return;
    }

    // Normal line / paragraph: flush lists first
    flushBullets(lineIdx);
    flushNumbered(lineIdx);

    // Check for Status / Reason / Action key lines for special styling
    const isStatusLine = /^\s*(\*\*)?status:?(\*\*)?/i.test(trimmed);
    const isReasonLine = /^\s*(\*\*)?reason:?(\*\*)?/i.test(trimmed);
    const isActionLine = /^\s*(\*\*)?action:?(\*\*)?/i.test(trimmed);

    if (isStatusLine || isReasonLine || isActionLine) {
      blocks.push(
        <div key={`field-${lineIdx}`} className="my-1.5 leading-relaxed font-sans">
          {parseInlineMarkdown(trimmed)}
        </div>
      );
    } else {
      blocks.push(
        <p key={`p-${lineIdx}`} className="my-1 leading-relaxed font-sans">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  flushBullets('end');
  flushNumbered('end');

  return (
    <div className={`space-y-0.5 text-xs sm:text-sm font-sans ${className}`}>
      {blocks}
    </div>
  );
};

export default SafeMarkdown;
