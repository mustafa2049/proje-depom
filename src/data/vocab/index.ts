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
