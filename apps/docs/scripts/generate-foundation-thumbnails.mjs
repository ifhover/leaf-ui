import { writeFile } from 'node:fs/promises';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Info,
  LoaderCircle,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const rect = (x, y, w, h, fill = '#fff', stroke = '#dce5de', r = 6) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const text = (x, y, value, color = '#203329', size = 10) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif">${value}</text>`;
const icon = (component, x, y, color = '#20834a', size = 14) =>
  `<g transform="translate(${x} ${y})">${renderToStaticMarkup(createElement(component, { size, color, strokeWidth: 1.8 }))}</g>`;
const circle = (x, y, radius, color) =>
  `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`;
const images = {
  avatar:
    circle(58, 62, 26, '#eaf4ed') +
    icon(UserRound, 45, 48, '#20834a', 27) +
    rect(103, 38, 50, 50, '#eaf4ed', '#bddcc7', 8) +
    text(116, 69, 'LF', '#20834a', 18) +
    circle(188, 62, 20, '#f1edf9') +
    text(179, 67, 'UI', '#7654c6', 14),
  card:
    rect(25, 15, 190, 98) +
    text(39, 37, 'Leaf Garden', '#203329', 11) +
    '<path d="M25 47h190" stroke="#dce5de"/>' +
    text(39, 70, 'Projects, people and plans', '#6c7c71', 9) +
    rect(39, 88, 52, 16, '#eaf4ed', 'none', 4) +
    text(49, 100, 'Details', '#20834a', 8),
  divider:
    text(38, 30, 'Project details', '#6c7c71', 10) +
    '<path d="M25 58h52m84 0h54M25 95h190" stroke="#dce5de"/>' +
    text(92, 62, 'Settings', '#203329', 10),
  empty:
    icon(UserRound, 104, 20, '#bddcc7', 32) +
    text(85, 75, 'No projects yet', '#6c7c71', 9) +
    rect(83, 86, 76, 24, '#20834a', 'none', 5) +
    text(93, 102, 'Create project', '#fff', 9),
  skeleton:
    circle(43, 39, 17, '#dce5de') +
    rect(73, 26, 93, 12, '#e1e9e3', 'none', 5) +
    [60, 78, 96].map((y, i) => rect(73, y, 143 - i * 21, 9, '#e7ece8', 'none', 4)).join(''),
  collapse:
    rect(25, 15, 190, 98) +
    icon(ChevronDown, 37, 25, '#20834a') +
    text(60, 36, 'About this project', '#203329', 10) +
    text(60, 59, 'Keep your plans together.', '#6c7c71', 9) +
    '<path d="M25 75h190" stroke="#dce5de"/>' +
    icon(ChevronRight, 37, 87, '#6c7c71') +
    text(60, 98, 'Settings', '#203329', 10),
  popover:
    rect(45, 14, 150, 71) +
    text(60, 36, 'Project details', '#203329', 10) +
    text(60, 58, 'Edit and save your changes.', '#6c7c71', 8) +
    rect(90, 94, 60, 23, '#eaf4ed', '#bddcc7', 5) +
    text(104, 110, 'Open', '#20834a', 9),
  slider:
    '<path d="M28 58h184" stroke="#dce5de" stroke-width="4" stroke-linecap="round"/><path d="M28 58h106" stroke="#20834a" stroke-width="4" stroke-linecap="round"/>' +
    circle(134, 58, 7, '#20834a') +
    circle(134, 58, 4, '#fff') +
    text(25, 86, '0', '#6c7c71', 9) +
    text(112, 86, '50', '#6c7c71', 9) +
    text(200, 86, '100', '#6c7c71', 9),
  rate:
    [0, 1, 2, 3, 4]
      .map((i) => icon(Star, 32 + i * 37, 44, i < 4 ? '#b78221' : '#dce5de', 28))
      .join('') + text(89, 96, '4 / 5 rating', '#6c7c71', 10),
  steps:
    '<path d="M40 43h164" stroke="#dce5de"/>' +
    '<path d="M40 43h81" stroke="#20834a"/>' +
    circle(36, 43, 14, '#eaf4ed') +
    icon(Check, 29, 36) +
    circle(120, 43, 14, '#20834a') +
    text(116, 47, '2', '#fff', 11) +
    circle(204, 43, 14, '#f4f7f4') +
    text(200, 47, '3', '#6c7c71', 11) +
    text(16, 78, 'Create') +
    text(101, 78, 'Review', '#20834a') +
    text(190, 78, 'Done', '#6c7c71') +
    text(82, 100, 'Your next step', '#6c7c71', 9),
  breadcrumb:
    text(22, 53, 'Home', '#6c7c71') +
    icon(ChevronRight, 61, 43, '#6c7c71') +
    text(82, 53, 'Projects', '#6c7c71') +
    icon(ChevronRight, 129, 43, '#6c7c71') +
    text(150, 53, 'Leaf Garden') +
    rect(22, 72, 196, 26, '#f4f7f4', 'none') +
    text(33, 89, 'Home / Projects / Leaf Garden', '#6c7c71', 9),
  pagination:
    icon(ChevronLeft, 20, 48, '#6c7c71') +
    [1, 2, 3, 4, 5]
      .map(
        (n, i) =>
          rect(
            43 + i * 31,
            40,
            26,
            28,
            n === 2 ? '#eaf4ed' : '#fff',
            n === 2 ? '#20834a' : '#dce5de',
          ) + text(53 + i * 31, 58, n, n === 2 ? '#20834a' : '#203329'),
      )
      .join('') +
    icon(ChevronRight, 204, 48, '#6c7c71') +
    text(73, 92, '11–20 / 50 items', '#6c7c71', 9),
  tag:
    rect(21, 34, 59, 25, '#eaf4ed', '#bddcc7') +
    text(30, 51, 'Published', '#20834a', 9) +
    rect(90, 34, 54, 25, '#edf5ff', '#bbd7fc') +
    text(101, 51, 'Design', '#1677ff') +
    rect(154, 34, 64, 25, '#fff6e9', '#e8d1af') +
    text(164, 51, 'Pending', '#a9670e') +
    rect(56, 74, 61, 25, '#20834a', 'none') +
    text(68, 91, 'Ready', '#fff') +
    rect(129, 74, 61, 25, '#f4effb', '#d9cdee') +
    text(141, 91, 'Leaf', '#7654c6') +
    icon(X, 169, 80, '#7654c6', 12),
  badge:
    rect(27, 39, 46, 42, '#f4f7f4') +
    icon(Bell, 42, 52, '#6c7c71', 18) +
    circle(72, 39, 10, '#c83c3c') +
    text(69, 43, '8', '#fff', 10) +
    rect(103, 39, 96, 42) +
    text(125, 65, 'Inbox') +
    rect(182, 29, 35, 20, '#c83c3c', 'none', 10) +
    text(187, 43, '99+', '#fff') +
    circle(77, 100, 4, '#20834a') +
    text(88, 104, 'Running', '#6c7c71'),
  drawer:
    rect(21, 12, 198, 105, '#00000040', 'none', 9) +
    rect(98, 12, 121, 105) +
    text(110, 33, 'Settings', '#203329', 11) +
    icon(X, 196, 22, '#6c7c71') +
    text(110, 54, 'Project name', '#6c7c71', 9) +
    rect(110, 61, 97, 23) +
    text(118, 77, 'Leaf Garden', '#203329', 9) +
    rect(164, 92, 43, 17, '#20834a', 'none', 4) +
    text(175, 104, 'Save', '#fff', 8),
  loading:
    rect(24, 19, 192, 91, '#f4f7f4') +
    rect(39, 35, 120, 7, '#dce5de', 'none', 3) +
    rect(39, 53, 160, 6, '#e7ece8', 'none', 3) +
    rect(39, 70, 140, 6, '#e7ece8', 'none', 3) +
    icon(LoaderCircle, 103, 41, '#20834a', 30) +
    text(95, 92, 'Loading…', '#20834a', 10),
  progress:
    rect(22, 24, 158, 8, '#f4f7f4', 'none', 4) +
    rect(22, 24, 107, 8, '#20834a', 'none', 4) +
    text(192, 32, '68%', '#6c7c71', 9) +
    '<circle cx="120" cy="83" r="25" stroke="#edf1ee" stroke-width="5"/><circle cx="120" cy="83" r="25" stroke="#20834a" stroke-width="5" stroke-linecap="round" stroke-dasharray="107 157" transform="rotate(-90 120 83)"/>' +
    text(109, 87, '68%', '#203329', 10),
  tooltip:
    rect(63, 21, 114, 29, '#203329', 'none', 5) +
    text(78, 40, 'Save your changes', '#fff', 9) +
    rect(83, 62, 74, 30) +
    icon(Info, 96, 70) +
    text(118, 82, 'Save', '#20834a'),
  calendar:
    rect(22, 12, 196, 104) +
    text(79, 30, 'October 2026', '#203329', 10) +
    icon(ChevronLeft, 31, 19, '#6c7c71', 12) +
    icon(ChevronRight, 197, 19, '#6c7c71', 12) +
    Array.from({ length: 21 }, (_, i) => {
      const x = 33 + (i % 7) * 25;
      const y = 49 + Math.floor(i / 7) * 23;
      return (
        (i === 7 ? rect(x - 3, y - 11, 21, 20, '#20834a', 'none', 4) : '') +
        text(x, y + 3, i + 1, i === 7 ? '#fff' : '#6c7c71', 9)
      );
    }).join('') +
    rect(135, 76, 40, 5, '#c5dfce', 'none', 2),
  tabs:
    rect(22, 22, 196, 85) +
    text(34, 45, 'Overview', '#20834a') +
    text(104, 45, 'Settings', '#6c7c71') +
    text(166, 45, 'History', '#9cab9f') +
    '<path d="M22 55h196" stroke="#dce5de"/><path d="M32 55h52" stroke="#20834a" stroke-width="2"/>' +
    text(34, 77, 'Your project at a glance.', '#6c7c71', 9) +
    rect(34, 88, 112, 5, '#e7ece8', 'none', 2),
  'input-number':
    text(43, 32, 'Quantity', '#6c7c71', 9) +
    rect(42, 41, 156, 34) +
    text(54, 63, '3', '#203329', 13) +
    '<path d="M174 41v34M174 58h24" stroke="#dce5de"/>' +
    icon(ChevronUp, 181, 44, '#6c7c71', 11) +
    icon(ChevronDown, 181, 61, '#6c7c71', 11) +
    text(59, 98, 'Range 0–20 · Step 1', '#6c7c71', 9),
};
for (const [slug, content] of Object.entries(images))
  await writeFile(
    new URL(`../docs/public/components/${slug}.svg`, import.meta.url),
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="128" viewBox="0 0 240 128" fill="none"><title>${slug}</title>${content}</svg>\n`,
  );
