import { A1_WORDS } from './a1';
import { A2_WORDS } from './a2';
import { B1_WORDS } from './b1';
import { B2_WORDS } from './b2';
import { C1_WORDS } from './c1';
import { C2_WORDS } from './c2';
import { ACADEMIC } from './academic';
import { BUSINESS } from './business';
import { CORE } from './core';
import { DAILY } from './daily';
import { EMOTIONS } from './emotions';
import { FOOD } from './food';
import { HEALTH } from './health';
import { HOME } from './home';
import { NATURE } from './nature';
import { PHRASAL } from './phrasal';
import { SITCOM } from './sitcom';
import { TECH } from './tech';
import { TRAVEL } from './travel';

/** Satır formatında yazılmış genişletilmiş sözlük (bkz. parse.ts). */
export const EXTRA_WORDS = [
  ...CORE,
  ...ACADEMIC,
  ...BUSINESS,
  ...DAILY,
  ...SITCOM,
  ...TRAVEL,
  ...FOOD,
  ...HEALTH,
  ...TECH,
  ...EMOTIONS,
  ...HOME,
  ...NATURE,
  ...PHRASAL,
];

/**
 * Seviye dosyaları (A1 → C2): seviye yolu için eklenen kelimeler. Sözlüğün başına eklenir;
 * böylece aynı seviyedeki temel kelimeler, konu destelerindeki eski kayıtlardan önce tanıtılır.
 */
export const LEVEL_WORDS = [
  ...A1_WORDS,
  ...A2_WORDS,
  ...B1_WORDS,
  ...B2_WORDS,
  ...C1_WORDS,
  ...C2_WORDS,
];
