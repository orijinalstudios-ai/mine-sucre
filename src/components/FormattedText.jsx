import React from 'react';

/**
 * FormattedText: Renders notes with paragraph separation, inline bold/italics, quotes, and emojis.
 */
export default function FormattedText({ text, className = '', clampLines = null }) {
  if (!text) return null;

  // Split into distinct paragraphs by double line breaks (\n\n or \r\n\r\n)
  const paragraphs = text.split(/\r?\n\s*\r?\n/);

  const formatInline = (str) => {
    // Process markdown-like inline formatting:
    // **bold**
    // *italic*
    // ==highlight==
    // single \n to <br/>
    const lines = str.split(/\r?\n/);

    return lines.map((line, lineIdx) => {
      // Check if blockquote line
      const isQuote = line.trim().startsWith('>');
      const content = isQuote ? line.trim().replace(/^>\s*/, '') : line;

      // Tokenize formatting tags
      const tokens = [];
      let remainder = content;
      let keyCounter = 0;

      // Regular expressions for inline styles
      const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|==[^=]+==)/;

      while (remainder) {
        const match = remainder.match(regex);
        if (!match) {
          tokens.push(<React.Fragment key={keyCounter++}>{remainder}</React.Fragment>);
          break;
        }

        const matchIndex = match.index;
        if (matchIndex > 0) {
          tokens.push(
            <React.Fragment key={keyCounter++}>
              {remainder.substring(0, matchIndex)}
            </React.Fragment>
          );
        }

        const matchedStr = match[0];
        if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
          tokens.push(
            <strong key={keyCounter++} className="font-bold">
              {matchedStr.slice(2, -2)}
            </strong>
          );
        } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
          tokens.push(
            <em key={keyCounter++} className="italic">
              {matchedStr.slice(1, -1)}
            </em>
          );
        } else if (matchedStr.startsWith('==') && matchedStr.endsWith('==')) {
          tokens.push(
            <mark key={keyCounter++} className="bg-[#ffd79b]/40 text-inherit px-1 rounded">
              {matchedStr.slice(2, -2)}
            </mark>
          );
        }

        remainder = remainder.substring(matchIndex + matchedStr.length);
      }

      if (isQuote) {
        return (
          <blockquote
            key={lineIdx}
            className="border-l-2 border-secondary/60 pl-3 italic my-1 opacity-90"
          >
            {tokens}
          </blockquote>
        );
      }

      return (
        <React.Fragment key={lineIdx}>
          {tokens}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  if (clampLines) {
    const clampClass =
      clampLines === 1
        ? 'line-clamp-1'
        : clampLines === 2
        ? 'line-clamp-2'
        : clampLines === 3
        ? 'line-clamp-3'
        : clampLines === 4
        ? 'line-clamp-4'
        : clampLines === 5
        ? 'line-clamp-5'
        : 'line-clamp-3';

    return (
      <div className={`${clampClass} ${className}`}>
        {paragraphs.map((p, idx) => (
          <p key={idx} className="mb-2 last:mb-0">
            {formatInline(p)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {paragraphs.map((p, idx) => (
        <p key={idx} className="leading-relaxed">
          {formatInline(p)}
        </p>
      ))}
    </div>
  );
}
