import OpenAI from 'openai';
import type { z } from 'zod';

import { UpstreamError } from '../lib/errors';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Sağlayıcı soyutlaması: her sağlayıcı, JSON modunda ham metin döner.
 * Şema doğrulaması çağıran servislerde yapılır.
 */
export interface LlmProvider {
  readonly name: 'openai' | 'gemini' | 'mock';
  completeJson(messages: LlmMessage[]): Promise<string>;
}

const REQUEST_TIMEOUT_MS = 30_000;

export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai' as const;
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 2 });
  }

  async completeJson(messages: LlmMessage[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new UpstreamError('OpenAI boş yanıt döndü');
    }
    return content;
  }
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini' as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async completeJson(messages: LlmMessage[]): Promise<string> {
    const systemText = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n');

    const contents = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
    const response = await this.fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new UpstreamError(`Gemini isteği başarısız oldu (HTTP ${response.status})`);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
    if (!text) {
      throw new UpstreamError('Gemini boş yanıt döndü');
    }
    return text;
  }
}

/**
 * Deterministik sahte sağlayıcı: API anahtarı olmadan geliştirme ve testler için.
 * Şemaya uygun JSON üretir; düzeltme gerektiren girdiyi (küçük harf / noktalama eksik) işaretler.
 */
export class MockProvider implements LlmProvider {
  readonly name = 'mock' as const;

  async completeJson(messages: LlmMessage[]): Promise<string> {
    const systemText = messages.find((message) => message.role === 'system')?.content ?? '';
    const lastUserText = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';

    const payload = systemText.includes('naturalnessScore')
      ? mockSentenceAnalysis(lastUserText)
      : mockTutorReply(lastUserText);

    return JSON.stringify(payload);
  }
}

function needsPolish(text: string): boolean {
  return !/^[A-Z]/.test(text) || !/[.!?]$/.test(text);
}

function polish(text: string): string {
  const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function mockTutorReply(text: string) {
  const fixable = needsPolish(text);
  const corrected = fixable ? polish(text) : null;

  return {
    reply: 'Thanks for sharing that! Could you tell me more about it?',
    replyTranslationTR: 'Bunu paylaştığın için teşekkürler! Bu konuda biraz daha anlatır mısın?',
    isPerfect: !fixable,
    correctedUserMessage: corrected,
    nativeAlternative: corrected,
    explanationTR: fixable
      ? 'Cümle büyük harfle başlamalı ve bir noktalama işaretiyle bitmeli.'
      : 'Cümlen gramer açısından doğru, harika!',
    extractedVocabulary: [{ term: 'share', translationTR: 'paylaşmak', example: 'Thanks for sharing that!' }],
  };
}

function mockSentenceAnalysis(text: string) {
  const fixable = needsPolish(text);
  const corrected = polish(text);

  return {
    score: fixable ? 70 : 95,
    isCorrect: !fixable,
    correctedSentence: corrected,
    nativeAlternative: corrected,
    grammarNotesTR: fixable ? ['Cümle büyük harfle başlamalı ve noktalama ile bitmeli.'] : [],
    naturalnessScore: fixable ? 6 : 9,
  };
}

export interface LlmEnv {
  AI_PROVIDER: 'auto' | 'openai' | 'gemini' | 'mock';
  OPENAI_API_KEY?: string | undefined;
  OPENAI_MODEL: string;
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL: string;
}

/**
 * Ortam değişkenlerine göre sağlayıcı seçer. `auto`: OpenAI → Gemini → mock.
 */
export function createLlmProvider(env: LlmEnv): LlmProvider {
  const choice =
    env.AI_PROVIDER === 'auto'
      ? env.OPENAI_API_KEY
        ? 'openai'
        : env.GEMINI_API_KEY
          ? 'gemini'
          : 'mock'
      : env.AI_PROVIDER;

  switch (choice) {
    case 'openai':
      return new OpenAiProvider(env.OPENAI_API_KEY ?? '', env.OPENAI_MODEL);
    case 'gemini':
      return new GeminiProvider(env.GEMINI_API_KEY ?? '', env.GEMINI_MODEL);
    case 'mock':
      return new MockProvider();
  }
}

/**
 * Model çıktısını JSON olarak ayrıştırıp şemayla doğrular.
 */
export function parseModelJson<T>(raw: string, schema: z.ZodType<T>): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new UpstreamError('Yapay zeka yanıtı geçerli JSON değil');
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new UpstreamError('Yapay zeka yanıtı beklenen şemaya uymuyor');
  }
  return result.data;
}
