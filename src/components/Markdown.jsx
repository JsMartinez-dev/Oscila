// Markdown con matemáticas KaTeX ($…$ y $$…$$), tablas GFM y figuras locales.

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';

const opcionesKatex = { throwOnError: false, strict: 'ignore' };

export default function Markdown({ children, figuras = {} }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[[rehypeKatex, opcionesKatex]]}
      components={{
        img: ({ src, alt }) => <img src={figuras[src] ?? src} alt={alt ?? ''} className="md-figura" loading="lazy" />,
        table: ({ children: c }) => (
          <div className="md-tabla-wrap">
            <table>{c}</table>
          </div>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
