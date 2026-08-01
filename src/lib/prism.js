import './prism-setup.js';
import Prism from 'prismjs';

// Order matters: `cpp` extends `c`, `typescript` extends the bundled `javascript`.
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-sql';

/**
 * Flattens Prism's nested token tree into one entry per character.
 *
 * The typing stage needs both the syntax class *and* a per-character typing
 * state on the same span, so it cannot use Prism's own HTML output.
 */
export function tokenizeToChars(code, languageId = 'javascript') {
  const grammar = Prism.languages[languageId] ?? Prism.languages.javascript;
  const chars = [];

  const walk = (nodes, inherited) => {
    for (const node of nodes) {
      if (typeof node === 'string') {
        for (const ch of node) chars.push({ ch, className: inherited });
      } else {
        const className = ['token', node.type, ...(node.alias ? [].concat(node.alias) : [])]
          .filter(Boolean)
          .join(' ');
        const merged = inherited ? `${inherited} ${className}` : className;
        walk(Array.isArray(node.content) ? node.content : [node.content], merged);
      }
    }
  };

  try {
    walk(Prism.tokenize(code, grammar), '');
  } catch {
    for (const ch of code) chars.push({ ch, className: '' });
  }

  // Guard against a grammar dropping or duplicating characters.
  if (chars.length !== code.length) {
    return [...code].map((ch) => ({ ch, className: '' }));
  }
  return chars;
}

export default Prism;
