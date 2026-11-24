'use strict';

// The page remains readable if the optional animation bundle cannot load.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function loadMotion() {
  if (motionPreference.matches) return;
  import('./animations.js').then(({ initMotion }) => initMotion()).catch(() => {
    // Native navigation, dialogs and downloads continue to work without motion.
  });
}
loadMotion();
motionPreference.addEventListener('change', loadMotion);

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  mobileNav.classList.remove('open');
  mobileNav.inert = true;
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
  mobileNav.classList.toggle('open', !expanded);
  mobileNav.inert = expanded;
  if (!expanded) document.dispatchEvent(new CustomEvent('aetheria:menu-open'));
});
mobileNav.querySelectorAll('a, button').forEach(item => item.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

const galleryDialog = document.querySelector('#gallery-dialog');
const specsDialog = document.querySelector('#specs-dialog');
const galleryFrame = document.querySelector('.gallery-frame');
const galleryButtons = [...document.querySelectorAll('.gallery-controls button')];
function setGalleryView(view) {
  galleryFrame.dataset.galleryView = view;
  // Fetch the largest photo only when a visitor explores a close-up.
  galleryFrame.querySelector('img').sizes = view === 'full'
    ? '(max-width: 700px) calc(100vw - 32px), 760px'
    : '1120px';
  galleryButtons.forEach(button => {
    const selected = button.dataset.galleryView === view;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.dispatchEvent(new CustomEvent('aetheria:gallery-view'));
}
function openDialog(dialog) {
  if (dialog.open) return;
  closeMenu();
  dialog.showModal();
  document.body.classList.add('modal-open');
  document.dispatchEvent(new CustomEvent('aetheria:dialog-open', { detail: { dialog } }));
}
function closeDialog(dialog) {
  const event = new CustomEvent('aetheria:dialog-close', { detail: { dialog }, cancelable: true });
  if (document.dispatchEvent(event)) dialog.close();
}
document.querySelectorAll('[data-open-gallery]').forEach(button => button.addEventListener('click', () => {
  setGalleryView(button.dataset.view || 'full');
  openDialog(galleryDialog);
}));
document.querySelectorAll('[data-open-specs]').forEach(button => button.addEventListener('click', () => openDialog(specsDialog)));
galleryButtons.forEach(button => button.addEventListener('click', () => setGalleryView(button.dataset.galleryView)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
    document.dispatchEvent(new CustomEvent('aetheria:dialog-dismissed', { detail: { dialog } }));
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});

const experiences = {
  play: { title: 'Escucha el próximo movimiento.', text: 'Entra en la partida con una conexión diseñada para reducir la espera entre lo que sucede y lo que escuchas.', width: 1 },
  create: { title: 'Dale espacio a tu próxima idea.', text: 'Explora una propuesta pensada para músicos y productores, con audio PCM estéreo y conversión digital a analógica dedicada.', width: 0.75 },
  listen: { title: 'Vuelve a encontrar tus canciones.', text: 'Dedica un momento a tu música. Drivers de 50 mm y un diseño acústico que busca dar a cada detalle su lugar.', width: 0.5 }
};
const tabs = [...document.querySelectorAll('[data-mode]')];
const experiencePanel = document.querySelector('#experience-panel');
const waveLines = document.querySelector('.wave-lines');
// Abstract waveform: an illustration, not a product measurement.
for (let i = 0; i < 49; i += 1) waveLines.append(document.createElement('i'));
function drawWave(mode) {
  const shape = experiences[mode].width;
  [...waveLines.children].forEach((line, index) => {
    const envelope = Math.pow(1 - Math.abs(index - 24) / 24, 0.85);
    const oscillation = Math.abs(Math.sin(index * (0.42 + shape * 0.08)) * Math.cos(index * 0.16));
    line.style.setProperty('--height', `${12 + envelope * (65 + oscillation * 150)}px`);
    line.style.setProperty('--opacity', `${0.22 + envelope * 0.75}`);
  });
}
function activateTab(tab) {
  const content = experiences[tab.dataset.mode];
  tabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  experiencePanel.setAttribute('aria-labelledby', tab.id);
  experiencePanel.querySelector('h3').textContent = content.title;
  experiencePanel.querySelector('p').textContent = content.text;
  drawWave(tab.dataset.mode);
  document.dispatchEvent(new CustomEvent('aetheria:mode-change'));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    activateTab(tabs[next]);
  });
});
drawWave('play');

const productSheet = `AETHERIA — AE-01 PHANTOM
PLAY. CREATE. PERFORM.

AUDÍFONOS INALÁMBRICOS SIN BLUETOOTH
Color de referencia: negro / violeta

Conexión: Aetheria Link, ESP-NOW 2.4 GHz
Audio: PCM estéreo, 48 kHz / 16 bits
Latencia estimada: 2.6–2.8 ms (ruta de señal objetivo: 2.75 ms)
Drivers: Peerless 50 mm, 32 ohmios
Conversión: DAC PCM5102A
Control: 2 × Seeed XIAO ESP32-S3
Autonomía estimada: 10–14 horas
Batería propuesta: LiPo 800–1000 mAh
Diseño acústico: baffle inclinado de 12–15 grados
Carcasa propuesta: impresión 3D PETG / ABS
Founder's Edition: precio objetivo de $2,990 MXN

IMPORTANTE
Concepto en desarrollo. Todas las especificaciones y datos son
estimaciones internas del proyecto, no certificaciones externas.
El precio es una propuesta; no confirma disponibilidad ni lanzamiento.

Fuente: presentación AETHERIA AE-01 PHANTOM suministrada para este proyecto.
`;
let toastTimer;
document.querySelectorAll('[data-download-specs]').forEach(button => button.addEventListener('click', () => {
  const blob = new Blob(['\uFEFF', productSheet], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'AETHERIA-AE-01-PHANTOM-ficha-tecnica.txt';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  const toast = document.querySelector('.toast');
  toast.textContent = 'Ficha técnica descargada en formato de texto.';
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}));
document.querySelector('#year').textContent = new Date().getFullYear();
