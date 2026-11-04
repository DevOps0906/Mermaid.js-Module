import { createIcons, Workflow, GitCommitHorizontal, ArrowRightLeft, Database, CircleDot, Brain, Network, ChartNoAxesGantt, Route, GitBranch, ChartPie, ChartColumnIncreasing, ScatterChart, ChevronsUpDown, Search, Blocks, ArrowUpRight, Github, PanelsTopLeft, Menu, BookOpen, Upload, Shapes, Zap, PackageOpen, Download, ChevronDown, MousePointer2, Code2, RotateCcw, Copy, ScanEye, Minus, Plus, Maximize, Expand, Info, Play, Lightbulb, Terminal, X } from 'lucide';
import { diagrams } from './catalog.js';
import { createDiagramRenderer, downloadFile, standaloneSvg, svgToPng, extractMermaid } from './renderer.js';

const icons = { Workflow, GitCommitHorizontal, ArrowRightLeft, Database, CircleDot, Brain, Network, ChartNoAxesGantt, Route, GitBranch, ChartPie, ChartColumnIncreasing, ScatterChart, ChevronsUpDown, Search, Blocks, ArrowUpRight, Github, PanelsTopLeft, Menu, BookOpen, Upload, Shapes, Zap, PackageOpen, Download, ChevronDown, MousePointer2, Code2, RotateCcw, Copy, ScanEye, Minus, Plus, Maximize, Expand, Info, Play, Lightbulb, Terminal, X };
const $ = (selector) => document.querySelector(selector);
const refreshIcons = () => createIcons({ icons, attrs: { 'aria-hidden': 'true' } });
const editor = $('#code');
const renderer = createDiagramRenderer();
const storageKey = 'mermaid-studio-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { /* Corrupt or disabled storage uses defaults. */ }
if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
let current;
let presetIndex = 0;
let zoom = 100;
let timer;
let renderVersion = 0;
let toastTimer;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3000);
}

function save() {
  saved[current.id] = { code: editor.value, preset: presetIndex };
  saved.theme = $('#theme').value;
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); }
  catch { $('.local-badge').textContent = '저장 공간 부족 · 파일로 내보내세요'; }
}

function updateLines() {
  const count = editor.value.split('\n').length;
  $('#line-count').textContent = `${count} lines`;
  $('#line-numbers').textContent = Array.from({ length: count }, (_, index) => index + 1).join('\n');
  $('#line-numbers').scrollTop = editor.scrollTop;
}

function renderNavigation(query = '') {
  const matches = diagrams.filter(item => `${item.title} ${item.english}`.toLowerCase().includes(query.toLowerCase()));
  $('#diagram-nav').innerHTML = ['구조와 흐름', '기획과 설계', '데이터와 분석'].map(group => {
    const entries = matches.filter(item => item.group === group);
    return entries.length ? `<div class="nav-group">${group}</div>${entries.map(item => `<a class="nav-link ${current?.id === item.id ? 'active' : ''}" href="#${item.id}" ${current?.id === item.id ? 'aria-current="page"' : ''}><i data-lucide="${item.icon}"></i>${item.title}</a>`).join('')}` : '';
  }).join('') || '<p class="empty-search">검색 결과가 없습니다.</p>';
  $('#library-count').textContent = matches.length;
  refreshIcons();
}

function renderPresets() {
  $('#presets').innerHTML = current.presets.map((preset, index) => `<button class="preset-button ${index === presetIndex ? 'active' : ''}" data-preset="${index}" aria-pressed="${index === presetIndex}">${preset.name}</button>`).join('');
}

function invalidateRender() {
  clearTimeout(timer);
  renderer.cancel();
  renderVersion++;
  $('#valid-badge').textContent = '변경됨';
  $('#valid-badge').classList.remove('invalid');
  $('#render-status').textContent = '변경된 코드를 렌더링해 주세요';
  $('#export-button').disabled = true;
  $('#export-menu').hidden = true;
  $('#error').hidden = true;
}

async function render() {
  clearTimeout(timer);
  const version = ++renderVersion;
  const start = performance.now();
  $('#valid-badge').textContent = '검증 중';
  $('#render-status').textContent = '다이어그램을 그리고 있어요…';
  $('#export-button').disabled = true;
  try {
    const result = await renderer.render($('#diagram'), editor.value, { theme: $('#theme').value });
    if (version !== renderVersion || result.stale) return;
    $('#error').hidden = true;
    $('#valid-badge').textContent = '✓ 유효한 코드';
    $('#valid-badge').classList.remove('invalid');
    $('#render-status').textContent = `✓ 렌더링 완료 · ${Math.round(performance.now() - start)}ms`;
    $('#canvas').dataset.theme = result.theme;
    $('#export-button').disabled = false;
  } catch (error) {
    if (version !== renderVersion) return;
    $('#error').hidden = false;
    $('#error').textContent = `코드 확인이 필요해요. 마지막 정상 미리보기를 유지합니다.\n${error.message || error}`;
    $('#valid-badge').textContent = '구문 오류';
    $('#valid-badge').classList.add('invalid');
    $('#render-status').textContent = '오류 발생 · 아래 메시지를 확인해 주세요';
  }
}

function changeCode() {
  updateLines(); save(); invalidateRender();
  if ($('#auto-render').checked) timer = setTimeout(render, 450);
}

function selectDiagram() {
  const id = location.hash.slice(1);
  const selected = diagrams.find(item => item.id === id) || diagrams[0];
  if (current?.id === selected.id) return;
  if (current) save();
  invalidateRender();
  current = selected;
  const stored = saved[current.id];
  presetIndex = Number.isInteger(stored?.preset) && current.presets[stored.preset] ? stored.preset : 0;
  editor.value = typeof stored?.code === 'string' ? stored.code : current.presets[presetIndex].code;
  $('#diagram-title').textContent = current.title;
  $('#diagram-description').textContent = current.description;
  $('#title-icon').innerHTML = `<i data-lucide="${current.icon}"></i>`;
  $('#use-cases').innerHTML = current.uses.map(use => { const [title, description] = use.split('|'); return `<div><strong>${title}</strong><p>${description}</p></div>`; }).join('');
  $('#syntax-guide').innerHTML = '';
  current.syntax.forEach(([code, description]) => {
    const row = document.createElement('div'); row.className = 'syntax-row';
    const snippet = document.createElement('code'); snippet.textContent = code;
    const label = document.createElement('span'); label.textContent = description;
    row.append(snippet, label); $('#syntax-guide').append(row);
  });
  $('#syntax-doc').href = `https://mermaid.js.org/syntax/${current.doc}.html`;
  $('#diagram').replaceChildren();
  $('#sidebar').classList.remove('open');
  $('#menu-toggle').setAttribute('aria-expanded', 'false');
  setZoom(100); renderPresets(); renderNavigation($('#search').value); updateLines(); render();
}

function setZoom(value) {
  zoom = Math.max(30, Math.min(250, value));
  $('#diagram').style.transform = `scale(${zoom / 100})`;
  $('#zoom-label').textContent = `${zoom}%`;
}

$('#search').addEventListener('input', event => renderNavigation(event.target.value));
window.addEventListener('hashchange', selectDiagram);
$('#diagram-nav').addEventListener('click', event => { if (event.target.closest('a')) { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); } });
$('#presets').addEventListener('click', event => {
  const button = event.target.closest('[data-preset]');
  if (!button) return;
  presetIndex = Number(button.dataset.preset);
  editor.value = current.presets[presetIndex].code;
  renderPresets(); changeCode(); render();
});
editor.addEventListener('input', changeCode);
editor.addEventListener('scroll', () => { $('#line-numbers').scrollTop = editor.scrollTop; });
editor.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = editor.selectionStart;
    editor.setRangeText('    ', start, editor.selectionEnd, 'end');
    changeCode();
  }
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); render(); }
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
  if (event.key === 'Escape') { $('#export-menu').hidden = true; $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); }
});
$('#reset').addEventListener('click', () => { editor.value = current.presets[presetIndex].code; changeCode(); render(); toast('현재 예제의 코드로 초기화했습니다.'); });
$('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(editor.value); toast('코드를 클립보드에 복사했습니다.'); }
  catch { editor.select(); toast('코드를 선택했습니다. Ctrl+C로 복사해 주세요.'); }
});
$('#render').addEventListener('click', render);
$('#auto-render').addEventListener('change', () => { clearTimeout(timer); if ($('#auto-render').checked) render(); });
if (['studio', 'dark', 'forest', 'neutral'].includes(saved.theme)) $('#theme').value = saved.theme;
$('#theme').addEventListener('change', () => { save(); invalidateRender(); render(); });
$('#zoom-in').addEventListener('click', () => setZoom(zoom + 10));
$('#zoom-out').addEventListener('click', () => setZoom(zoom - 10));
$('#fit').addEventListener('click', () => setZoom(100));
$('#fullscreen').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('#canvas').requestFullscreen(); }
  catch { toast('이 브라우저에서는 전체 화면을 사용할 수 없습니다.'); }
});
$('#export-button').addEventListener('click', () => { $('#export-menu').hidden = !$('#export-menu').hidden; });
document.addEventListener('click', event => { if (!event.target.closest('#export-button, #export-menu')) $('#export-menu').hidden = true; });
$('#export-menu').addEventListener('click', async event => {
  const format = event.target.closest('[data-export]')?.dataset.export;
  if (!format || $('#export-button').disabled) return;
  $('#export-menu').hidden = true;
  const filename = current.id;
  try {
    if (format === 'mmd') downloadFile(extractMermaid(editor.value), `${filename}.mmd`);
    else if (format === 'pdf') { setZoom(100); window.print(); }
    else {
      const svg = standaloneSvg($('#diagram'), $('#theme').value === 'dark' ? '#222431' : '#ffffff');
      if (format === 'svg') downloadFile(svg, `${filename}.svg`, 'image/svg+xml;charset=utf-8');
      else downloadFile(await svgToPng(svg), `${filename}.png`);
    }
    if (format !== 'pdf') toast(`${format.toUpperCase()} 파일을 내보냈습니다.`);
  } catch (error) { toast(`내보내기 실패: ${error.message}`); }
});
$('#import-button').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 200000) throw new Error('200KB 이하의 텍스트 파일을 선택해 주세요.');
    const text = await file.text();
    extractMermaid(text);
    editor.value = text; changeCode(); render(); toast('파일을 가져왔습니다.');
  } catch (error) { toast(error.message); }
  event.target.value = '';
});
$('#module-help').addEventListener('click', () => $('#guide').showModal());
$('#close-guide').addEventListener('click', () => $('#guide').close());
$('#menu-toggle').setAttribute('aria-expanded', 'false');
$('#menu-toggle').addEventListener('click', () => { const open = $('#sidebar').classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); });
document.addEventListener('click', event => { if (!event.target.closest('#sidebar, #menu-toggle')) { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); } });
selectDiagram();
refreshIcons();
