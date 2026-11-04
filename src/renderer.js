import mermaid from 'mermaid';

let queue = Promise.resolve();
let serial = 0;

/** Extract the first Mermaid fence, or accept raw Mermaid source. */
export function extractMermaid(input) {
  if (typeof input !== 'string') throw new TypeError('Mermaid 코드는 문자열이어야 합니다.');
  const fence = input.match(/^[ \t]*```mermaid[^\S\r\n]*\r?\n([\s\S]*?)^[ \t]*```/im);
  const source = (fence ? fence[1] : input).trim();
  if (!source) throw new Error('Mermaid 코드를 입력해 주세요.');
  if (source.length > 50000) throw new Error('코드는 50,000자 이내로 입력해 주세요.');
  return source;
}

function configure(theme) {
  mermaid.initialize({
    startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, htmlLabels: false,
    maxTextSize: 50000, theme: theme === 'studio' ? 'base' : theme,
    fontFamily: '"Segoe UI", "Malgun Gothic", sans-serif',
    ...(theme === 'studio' ? { themeVariables: {
      primaryColor: '#f0edff', primaryTextColor: '#514771', primaryBorderColor: '#b5a4df',
      lineColor: '#9b96aa', secondaryColor: '#e8f5ef', tertiaryColor: '#fff5e4',
      fontSize: '14px', background: '#ffffff', mainBkg: '#f0edff', nodeBorder: '#b5a4df',
      clusterBkg: '#f7f5fc', edgeLabelBackground: '#ffffff',
      actorBkg: '#f0edff', actorBorder: '#b5a4df', actorTextColor: '#514771',
      signalColor: '#8b80a5', signalTextColor: '#514771',
    }} : {}),
    flowchart: { htmlLabels: false, curve: 'basis', padding: 16, nodeSpacing: 36, rankSpacing: 36 },
    journey: { textPlacement: 'tspan' },
  });
}

/** Browser renderer. Calls are serialized because Mermaid has global configuration. */
export function createDiagramRenderer() {
  let request = 0;
  let lastResult = null;
  return {
    get lastResult() { return lastResult; },
    async render(element, input, { theme = 'studio' } = {}) {
      const ticket = ++request;
      const task = queue.then(async () => {
        if (ticket !== request) return { stale: true };
        const source = extractMermaid(input);
        if (!['studio', 'dark', 'forest', 'neutral'].includes(theme)) throw new Error('지원하지 않는 테마입니다.');
        configure(theme);
        await mermaid.parse(source);
        const { svg, bindFunctions } = await mermaid.render(`mermaid-svg-${++serial}`, source);
        if (ticket !== request) return { stale: true };
        element.innerHTML = svg;
        bindFunctions?.(element);
        lastResult = { svg, source, theme };
        return lastResult;
      });
      queue = task.catch(() => {});
      return task;
    },
    cancel() { request++; },
  };
}

export function downloadFile(content, filename, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Export a standalone SVG, preserving computed text styles and real dimensions. */
export function standaloneSvg(element, background = '#ffffff') {
  const original = element.querySelector('svg');
  if (!original) throw new Error('먼저 다이어그램을 렌더링해 주세요.');
  const svg = original.cloneNode(true);
  const box = original.viewBox.baseVal;
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', box.width || original.getBoundingClientRect().width);
  svg.setAttribute('height', box.height || original.getBoundingClientRect().height);
  svg.style.maxWidth = 'none';
  svg.style.backgroundColor = background;
  return new XMLSerializer().serializeToString(svg);
}

export async function svgToPng(svg, scale = 2) {
  await document.fonts.ready;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const ratio = Math.min(scale, 8192 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(img.naturalWidth * ratio);
    canvas.height = Math.ceil(img.naturalHeight * ratio);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 변환에 실패했습니다.')), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}
