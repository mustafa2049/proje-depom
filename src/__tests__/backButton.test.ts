import { describe, expect, it } from 'vitest';
import { pushBackHandler, runBackHandlers } from '../lib/backButton';

describe('geri tuşu işleyicileri', () => {
  it('en son kaydedilen işleyici önce çalışır; ele almayan sıradakine bırakır', () => {
    const calls: string[] = [];
    const removePage = pushBackHandler(() => {
      calls.push('sayfa');
      return true;
    });
    const removeSheet = pushBackHandler(() => {
      calls.push('pencere');
      return true;
    });
    expect(runBackHandlers()).toBe(true);
    expect(calls).toEqual(['pencere']);
    removeSheet();
    const removePass = pushBackHandler(() => {
      calls.push('geçer');
      return false;
    });
    expect(runBackHandlers()).toBe(true);
    expect(calls).toEqual(['pencere', 'geçer', 'sayfa']);
    removePass();
    removePage();
    expect(runBackHandlers()).toBe(false);
  });
});
