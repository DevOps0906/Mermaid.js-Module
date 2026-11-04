import { defineConfig } from 'vite';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Preserve Mermaid's published lazy ESM modules instead of combining its large
// optional layout engines with application chunks. All files stay local/offline.
function mermaidDistribution() {
  const root = dirname(fileURLToPath(import.meta.resolve('mermaid')));
  const entry = 'mermaid.esm.min.mjs';
  const chunks = 'chunks/mermaid.esm.min';
  return {
    name: 'mermaid-distribution',
    enforce: 'pre',
    apply: 'build',
    resolveId(source) {
      if (source === 'mermaid') {
        return { id: '../vendor/mermaid/' + entry, external: true };
      }
    },
    async generateBundle() {
      const files = [entry, ...await readdir(join(root, chunks)).then(names =>
        names.filter(name => name.endsWith('.mjs')).map(name => `${chunks}/${name}`))];
      for (const file of files) {
        this.emitFile({ type: 'asset', fileName: `vendor/mermaid/${file}`, source: await readFile(join(root, file)) });
      }
      this.emitFile({ type: 'asset', fileName: 'vendor/mermaid/LICENSE', source: await readFile(join(root, '../LICENSE')) });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [mermaidDistribution()],
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1', port: 5173 },
});
