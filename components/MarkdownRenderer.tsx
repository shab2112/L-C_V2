
import React from 'react';

// A simple regex to find **bold** text
const boldRegex = /\*\*(.*?)\*\*/g;

const renderLine = (line: string) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  line.replace(boldRegex, (match, p1, offset) => {
    if (offset > lastIndex) {
      parts.push(line.substring(lastIndex, offset));
    }
    parts.push(<strong key={offset}>{p1}</strong>);
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < line.length) {
    parts.push(line.substring(lastIndex));
  }

  return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-4">{currentList}</ul>);
      currentList = [];
    }
  };

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`table-wrapper-${elements.length}`} className="report-table-container overflow-x-auto my-8 border border-brand-accent rounded-lg">
          <table key={`table-${elements.length}`} className="w-full text-left border-collapse bg-white">
            <thead>
              <tr style={{ backgroundColor: '#F9F9F9' }}>
                {tableHeaders.map((header, i) => (
                  <th key={i} className="p-4 text-xs font-bold uppercase tracking-wider border-b border-brand-accent" style={{ color: '#000000', opacity: 1 }}>{renderLine(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #EEE' }}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-4 text-sm text-gray-800 font-medium">{renderLine(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    inTable = false;
    tableHeaders = [];
    tableRows = [];
  };

  lines.forEach((line, i) => {
    const trimmedLine = line.trim();

    // REMOVE EXTRA DASHES (---)
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      return; 
    }

    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      flushList();
      const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim());

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else if (cells.every(cell => /^:?-{2,}:?$/.test(cell))) {
        return;
      } else {
        tableRows.push(cells);
      }
    } else {
      if (inTable) {
        flushTable();
      }

      if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={i} className="text-xl font-bold text-black mt-8 mb-4 border-b-2 border-brand-gold pb-2">{renderLine(line.substring(3))}</h2>);
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={i} className="text-3xl font-black text-black mt-10 mb-6 uppercase tracking-tight">{renderLine(line.substring(2))}</h1>);
      } else if (trimmedLine.startsWith('- ')) {
        currentList.push(<li key={i} className="mb-2 leading-relaxed">{renderLine(trimmedLine.substring(2))}</li>);
      } else if (trimmedLine === '') {
        flushList();
        elements.push(<div key={`spacer-${i}`} className="h-4"></div>);
      } else {
        flushList();
        elements.push(<p key={i} className="my-3 leading-relaxed text-black">{renderLine(line)}</p>);
      }
    }
  });

  flushTable();
  flushList();

  return <div className="max-w-none text-black printable-markdown-root">{elements}</div>;
};

export default MarkdownRenderer;