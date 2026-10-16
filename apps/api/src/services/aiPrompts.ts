/**
 * Sistem promptları. Tutor promptu ile analiz promptu birbirinden bağımsızdır:
 * tutor promptunda `naturalnessScore` alanı bulunmaz (mock sağlayıcı görev türünü buna göre ayırt eder).
 */

const TUTOR_INSTRUCTION =
  'Sen uzman bir İngilizce öğretmenisin ve konuşma partnerisin. Kullanıcının mevcut seviyesi: {{userLevel}}. ' +
  'Seçilen senaryo: {{scenario}}. Kullanıcının mesajına senaryoya uygun olarak yanıt ver. ' +
  'Aynı zamanda kullanıcının son mesajını dilbilgisi, kelime seçimi ve doğallık açısından analiz et. ' +
  'Çıktıyı SADECE aşağıdaki JSON formatında ver:';

const TUTOR_SCHEMA = {
  reply: 'Diyaloğu sürdüren İngilizce yanıt (kullanıcı seviyesine uygun).',
  replyTranslationTR: 'Yanıtın Türkçe çevirisi.',
  isPerfect: true,
  correctedUserMessage: 'Kullanıcı cümlesinin gramer olarak düzeltilmiş hali (hata yoksa null).',
  nativeAlternative: 'Ana dili İngilizce olan birinin bunu nasıl söyleyeceği (yoksa null).',
  explanationTR: 'Yapılan hatanın veya geliştirme önerisinin kısa, net Türkçe açıklaması.',
  extractedVocabulary: [{ term: 'önemli kelime/kalıp', translationTR: 'Türkçe anlamı', example: 'örnek cümle' }],
};

const TUTOR_RULES = [
  'Yanıtını yalnızca geçerli bir JSON nesnesi olarak ver; JSON dışında metin yazma.',
  'Hata yoksa correctedUserMessage alanını null yap ve isPerfect alanını true olarak işaretle.',
  'extractedVocabulary en fazla 5 öğe içermeli; yalnızca bu konuşmada geçen faydalı kelime ve kalıpları seç.',
];

const ANALYSIS_INSTRUCTION =
  'Sen İngilizce gramer ve doğallık değerlendiricisisin. Kullanıcının İngilizce cümlesini ' +
  'değerlendir. {{translationNote}}{{contextNote}}' +
  'Açıklamaları Türkçe yaz. Çıktıyı SADECE aşağıdaki JSON formatında ver:';

const ANALYSIS_SCHEMA = {
  score: 'Genel başarı puanı, 0-100 arası tam sayı.',
  isCorrect: 'Cümle gramer ve anlam açısından doğru ise true.',
  correctedSentence: 'Gramer düzeltilmiş cümle.',
  nativeAlternative: 'Ana dili İngilizce olan birinin aynı anlamı nasıl ifade edeceği.',
  grammarNotesTR: ['Kısa Türkçe gramer notu'],
  naturalnessScore: 'Doğallık puanı, 1-10 arası tam sayı.',
};

function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => values[key] ?? '');
}

export function buildTutorSystemPrompt(input: { userLevel: string; scenario: string }): string {
  const instruction = renderTemplate(TUTOR_INSTRUCTION, {
    userLevel: input.userLevel,
    scenario: input.scenario,
  });
  return [
    instruction,
    JSON.stringify(TUTOR_SCHEMA, null, 2),
    TUTOR_RULES.map((rule) => `- ${rule}`).join('\n'),
  ].join('\n\n');
}

export function buildSentenceAnalysisPrompt(input: { sourceTR?: string | undefined; context?: string | undefined }): string {
  const translationNote = input.sourceTR
    ? `Cümle, şu Türkçe metnin çevirisidir: "${input.sourceTR}". Anlam doğruluğunu da kontrol et. `
    : '';
  const contextNote = input.context ? `Bağlam: ${input.context}. ` : '';
  const instruction = renderTemplate(ANALYSIS_INSTRUCTION, { translationNote, contextNote });
  return [instruction, JSON.stringify(ANALYSIS_SCHEMA, null, 2)].join('\n\n');
}
