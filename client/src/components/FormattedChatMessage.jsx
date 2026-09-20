import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Clean and resilient Markdown formatter for KisanMitra AI responses
 * Formats headers, bold tags, bullet points, numbers, links, and highlight badges without external heavy dependencies.
 */
export default function FormattedChatMessage({ content }) {
  if (!content) return null;

  // Split content into logical lines
  const lines = content.split('\n');

  const renderFormattedLine = (line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    // 1. Level 3 Headings: "### 📊 ..." or "### ..."
    if (trimmed.startsWith('###')) {
      const headingText = trimmed.replace(/^###\s*/, '');
      return (
        <div 
          key={lineIdx} 
          className="font-black text-slate-900 text-sm sm:text-base tracking-tight pb-1.5 pt-1 border-b border-emerald-100 flex items-center gap-1.5 text-emerald-900"
        >
          {parseInlineFormatting(headingText)}
        </div>
      );
    }

    // 2. Callout / Advice Box: "💡 **...**" or "ℹ️ **...**"
    if (trimmed.startsWith('💡') || trimmed.startsWith('ℹ️') || trimmed.startsWith('⚠️')) {
      const icon = trimmed.startsWith('💡') ? '💡' : (trimmed.startsWith('⚠️') ? '⚠️' : 'ℹ️');
      const text = trimmed.slice(icon.length).trim();
      const isWarn = icon === '⚠️';

      return (
        <div 
          key={lineIdx} 
          className={`my-2 p-2.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
            isWarn 
              ? 'bg-amber-50 border-amber-200 text-amber-900' 
              : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
          }`}
        >
          <span className="text-sm shrink-0 mt-0.5">{icon}</span>
          <div className="flex-1 font-medium">
            {parseInlineFormatting(text)}
          </div>
        </div>
      );
    }

    // 3. Bullet points: "• ..." or "* ..." or "- ..."
    if (/^[•*-]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[•*-]\s+/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-2 text-xs sm:text-[13px] leading-relaxed py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0"></span>
          <div className="flex-1 text-slate-800">
            {parseInlineFormatting(bulletContent)}
          </div>
        </div>
      );
    }

    // 4. Numbered list: "1. ..."
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 text-xs sm:text-[13px] leading-relaxed py-0.5">
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1 text-slate-800">
            {parseInlineFormatting(numMatch[2])}
          </div>
        </div>
      );
    }

    // 5. Standard paragraph
    return (
      <p key={lineIdx} className="text-xs sm:text-[13px] text-slate-700 leading-relaxed py-0.5">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  };

  /**
   * Parses inline Markdown: **bold**, `code`, [link](url), and ₹ currency tags
   */
  const parseInlineFormatting = (text) => {
    // Tokenize markdown bold **text**, links [text](url), and normal text
    const parts = [];
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\)|\₹[\d,]+(?:\s*\/\s*(?:Quintal|क्विंटल|टन|Q))?)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];

      // Bold: **text**
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        const inner = matchText.slice(2, -2);
        parts.push(
          <strong key={match.index} className="font-extrabold text-slate-900">
            {inner}
          </strong>
        );
      }
      // Link: [label](url)
      else if (matchText.startsWith('[') && matchText.includes('](')) {
        const linkMatch = matchText.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={match.index}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-emerald-700 hover:text-emerald-800 font-bold underline hover:no-underline ml-0.5"
            >
              <span>{linkMatch[1]}</span>
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          );
        } else {
          parts.push(matchText);
        }
      }
      // Currency highlight: e.g. ₹4500 / Quintal
      else if (matchText.startsWith('₹')) {
        parts.push(
          <span 
            key={match.index} 
            className="inline-block bg-emerald-100/90 text-emerald-900 font-black px-1.5 py-0.2 rounded-md mx-0.5 text-xs shadow-2xs border border-emerald-300/40"
          >
            {matchText}
          </span>
        );
      } else {
        parts.push(matchText);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="space-y-1 w-full overflow-hidden">
      {lines.map((line, idx) => renderFormattedLine(line, idx))}
    </div>
  );
}
