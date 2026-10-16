import { describe, expect, it } from 'vitest';

import { UpstreamError } from '../lib/errors';
import { buildSentenceAnalysisPrompt, buildTutorSystemPrompt } from './aiPrompts';
import { sentenceAnalysisSchema, tutorOutputSchema } from './aiSchemas';
import {
  createLlmProvider,
  GeminiProvider,
  MockProvider,
  OpenAiProvider,
  parseModelJson,
  type LlmMessage,
} from './llmService';

describe('MockProvider', () => {
  const provider = new MockProvider();

  it('tutor görevinde şemaya uygun JSON döner ve düzeltme gerekeni işaretler', async () => {
    const messages: LlmMessage[] = [
      { role: 'system', content: buildTutorSystemPrompt({ userLevel: 'A2', scenario: 'Free Talk' }) },
      { role: 'user', content: 'i like music' },
    ];

    const output = parseModelJson(await provider.completeJson(messages), tutorOutputSchema);

    expect(output.isPerfect).toBe(false);
    expect(output.correctedUserMessage).toBe('I like music.');
    expect(output.extractedVocabulary.length).toBeGreaterThan(0);
  });

  it('tutor görevinde doğru cümleyi olduğu gibi kabul eder', async () => {
    const messages: LlmMessage[] = [
      { role: 'system', content: buildTutorSystemPrompt({ userLevel: 'A2', scenario: 'Free Talk' }) },
      { role: 'user', content: 'I like music.' },
    ];

    const output = parseModelJson(await provider.completeJson(messages), tutorOutputSchema);

    expect(output.isPerfect).toBe(true);
    expect(output.correctedUserMessage).toBeNull();
  });

  it('analiz görevinde analiz şemasına uygun JSON döner', async () => {
    const messages: LlmMessage[] = [
      { role: 'system', content: buildSentenceAnalysisPrompt({ sourceTR: 'Ben müzik seviyorum' }) },
      { role: 'user', content: 'I like music.' },
    ];

    const analysis = parseModelJson(await provider.completeJson(messages), sentenceAnalysisSchema);

    expect(analysis.isCorrect).toBe(true);
    expect(analysis.score).toBeGreaterThanOrEqual(0);
    expect(analysis.naturalnessScore).toBeGreaterThanOrEqual(1);
  });
});

describe('prompt builders', () => {
  it('tutor promptu analiz alanını (naturalnessScore) içermez ve placeholder bırakmaz', () => {
    const prompt = buildTutorSystemPrompt({ userLevel: 'B1', scenario: 'Job Interview' });

    expect(prompt).not.toContain('naturalnessScore');
    expect(prompt).not.toContain('{{');
    expect(prompt).toContain('Kullanıcının mevcut seviyesi: B1');
    expect(prompt).toContain('Seçilen senaryo: Job Interview');
    expect(prompt).toContain('"extractedVocabulary"');
  });

  it('analiz promptu çeviri ve bağlam notlarını ekler', () => {
    const prompt = buildSentenceAnalysisPrompt({ sourceTR: 'Yarın gelirim', context: 'iş e-postası' });

    expect(prompt).toContain('Yarın gelirim');
    expect(prompt).toContain('iş e-postası');
    expect(prompt).toContain('naturalnessScore');
  });
});

describe('parseModelJson', () => {
  it('geçerli olmayan JSON için UpstreamError fırlatır', () => {
    expect(() => parseModelJson('{not json', tutorOutputSchema)).toThrow(UpstreamError);
  });

  it('şemaya uymayan JSON için UpstreamError fırlatır', () => {
    expect(() => parseModelJson('{"reply": 5}', tutorOutputSchema)).toThrow(UpstreamError);
  });
});

describe('GeminiProvider', () => {
  it('system mesajını systemInstruction olarak, asistan rolünü model olarak gönderir', async () => {
    let capturedBody: unknown;
    const fakeFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }) as typeof fetch;

    const provider = new GeminiProvider('test-key', 'gemini-test', fakeFetch);
    const result = await provider.completeJson([
      { role: 'system', content: 'SYS' },
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
      { role: 'user', content: 'again' },
    ]);

    expect(result).toBe('{"ok":true}');
    expect(capturedBody).toMatchObject({
      systemInstruction: { parts: [{ text: 'SYS' }] },
      contents: [
        { role: 'user', parts: [{ text: 'hi' }] },
        { role: 'model', parts: [{ text: 'hello' }] },
        { role: 'user', parts: [{ text: 'again' }] },
      ],
    });
  });

  it('HTTP hatasında UpstreamError fırlatır', async () => {
    const fakeFetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
    const provider = new GeminiProvider('test-key', 'gemini-test', fakeFetch);

    await expect(provider.completeJson([{ role: 'user', content: 'x' }])).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe('createLlmProvider', () => {
  const base = { OPENAI_MODEL: 'gpt-4o-mini', GEMINI_MODEL: 'gemini-2.0-flash' };

  it('auto modunda anahtar yoksa mock sağlayıcıyı seçer', () => {
    expect(createLlmProvider({ ...base, AI_PROVIDER: 'auto' })).toBeInstanceOf(MockProvider);
  });

  it('auto modunda OpenAI anahtarı varsa OpenAI sağlayıcıyı seçer', () => {
    const provider = createLlmProvider({ ...base, AI_PROVIDER: 'auto', OPENAI_API_KEY: 'sk-test' });
    expect(provider).toBeInstanceOf(OpenAiProvider);
    expect(provider.name).toBe('openai');
  });

  it('auto modunda yalnızca Gemini anahtarı varsa Gemini sağlayıcıyı seçer', () => {
    const provider = createLlmProvider({ ...base, AI_PROVIDER: 'auto', GEMINI_API_KEY: 'g-test' });
    expect(provider).toBeInstanceOf(GeminiProvider);
  });
});
