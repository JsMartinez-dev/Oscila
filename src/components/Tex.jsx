// Matemáticas con KaTeX local (sin CDN): ecuaciones en bloque y texto con $…$ en línea y **negrita**.

import katex from 'katex';
import { Fragment, useMemo } from 'react';

const opciones = { throwOnError: false, strict: 'ignore', trust: false };

export function TexBloque({ latex, tag }) {
  const html = useMemo(() => {
    const fuente = tag != null ? `${latex}\\tag{${tag}}` : latex;
    return katex.renderToString(fuente, { ...opciones, displayMode: true });
  }, [latex, tag]);
  return <div className="tex-bloque" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function TexLinea({ latex }) {
  const html = useMemo(() => katex.renderToString(latex, { ...opciones, displayMode: false }), [latex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Texto con $math$ en línea y **negrita**. */
export function TextoMat({ texto }) {
  const partes = useMemo(() => String(texto ?? '').split(/(\$[^$]+\$)/g), [texto]);
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 1) return <TexLinea key={i} latex={p.slice(1, -1)} />;
        const trozos = p.split(/(\*\*[^*]+\*\*)/g);
        return (
          <Fragment key={i}>
            {trozos.map((t, j) => (t.startsWith('**') && t.endsWith('**') ? <strong key={j}>{t.slice(2, -2)}</strong> : <Fragment key={j}>{t}</Fragment>))}
          </Fragment>
        );
      })}
    </>
  );
}
