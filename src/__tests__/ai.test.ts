import { afterEach, describe, expect, it, vi } from 'vitest';
import { chatJson } from '../lib/ai';

const ok = (content: unknown) => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 });
const limited = () => new Response('{}', { status: 429, headers: { 'retry-after': '1' } });

describe('chatJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('dakikalık sınır dolunca yedek modele geçer', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'test');
    const models: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        const model = JSON.parse(String(init.body)).model as string;
        models.push(model);
        return model === 'openai/gpt-oss-120b' ? limited() : ok({ ok: true });
      }),
    );
    await expect(chatJson('s', 'u')).resolves.toEqual({ ok: true });
    expect(models).toEqual(['openai/gpt-oss-120b', 'openai/gpt-oss-20b']);
  });

  it('bozuk JSON çıktısında bir kez yeniden dener', async () => {
    vi.stubEnv('VITE_GROQ_API_KEY', 'test');
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls++;
        return calls === 1 ? new Response(JSON.stringify({ choices: [{ message: { content: '{bozuk' } }] }), { status: 200 }) : ok({ n: 2 });
      }),
    );
    await expect(chatJson('s', 'u')).resolves.toEqual({ n: 2 });
    expect(calls).toBe(2);
  });
});
