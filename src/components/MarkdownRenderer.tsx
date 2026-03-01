import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// [🔥] TAMBAHAN KAMUS MATEMATIKA
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
// ===================================
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon } from './Icons';

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden bg-[#1e1e1e] border border-token-border-medium">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-xs text-gray-300 border-b border-gray-700">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'transparent',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]} // [🔥] REMARK MATH MASUK SINI
      rehypePlugins={[rehypeKatex]}           // [🔥] REHYPE KATEX MASUK SINI
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          
          if (match || (codeString.includes('\n') && !className)) {
            return (
              <CodeBlock language={match ? match[1] : ''}>
                {codeString}
              </CodeBlock>
            );
          }
          return (
            <code className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-7">{children}</p>;
        },
        ul({ children }) {
          return <ul className="mb-3 list-disc pl-6 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="mb-3 list-decimal pl-6 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-7">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-3 mt-5">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-2 mt-4">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mb-2 mt-3">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 italic text-gray-600 dark:text-gray-300">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
              {children}
            </td>
          );
        },
        a({ children, href }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              {children}
            </a>
          );
        },
        hr() {
          return <hr className="my-4 border-gray-300 dark:border-gray-600" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}