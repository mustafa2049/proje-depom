import type { Cefr, Example, PartOfSpeech, Word } from '../lib/types';

type Extra = Partial<Omit<Word, 'id' | 'word' | 'ipa' | 'pos' | 'cefr' | 'meaning' | 'examples' | 'deckId'>>;

function w(
  deckId: string,
  word: string,
  ipa: string,
  pos: PartOfSpeech,
  cefr: Cefr,
  meaning: string,
  examples: Example[],
  extra: Extra = {},
): Word {
  return { id: slugify(word), word, ipa, pos, cefr, meaning, examples, deckId, ...extra };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ex = (en: string, tr: string): Example => ({ en, tr });

export const SEED_WORDS: Word[] = [
  // ───────────────────────── Akademik & Sınav ─────────────────────────
  w('academic', 'inevitable', '/ɪnˈevɪtəbl/', 'adjective', 'B2', 'Kaçınılmaz, önlenemez', [
    ex('Change is an inevitable part of career growth.', 'Değişim, kariyer gelişiminin kaçınılmaz bir parçasıdır.'),
    ex('It was an inevitable consequence of our decision.', 'Kararımızın önlenemez bir sonucuydu.'),
  ], {
    synonyms: ['unavoidable', 'inescapable'],
    collocations: ['inevitable result', 'inevitable consequence', 'almost inevitable'],
    mnemonic: 'In (olumsuzluk eki) + evitable (kaçınılabilir) → kaçınılamaz, kesinlikle başa gelecek olan.',
    morphology: [
      { part: 'in-', meaning: 'olumsuzluk / değil' },
      { part: 'e- (ex-)', meaning: 'dışarı' },
      { part: 'vitare', meaning: 'sakınmak' },
    ],
    etymology: 'Latince "inevitabilis": "kaçınılamayan". "Evitare" (sakınmak, kaçmak) fiiline olumsuzluk bildiren "in-" eki eklenmiştir.',
    syllables: ['ɪn', 'ˈev', 'ɪ', 'tə', 'bl'],
    stressIndex: 1,
  }),
  w('academic', 'reluctant', '/rɪˈlʌktənt/', 'adjective', 'B2', 'İsteksiz, gönülsüz', [
    ex('She was reluctant to admit her mistake.', 'Hatasını kabul etmekte isteksizdi.'),
    ex('He gave a reluctant smile.', 'Gönülsüzce gülümsedi.'),
  ], {
    synonyms: ['unwilling', 'hesitant'],
    collocations: ['reluctant to do something', 'reluctant agreement', 'deeply reluctant'],
    morphology: [
      { part: 're-', meaning: 'karşı, geri' },
      { part: 'luctari', meaning: 'güreşmek, mücadele etmek' },
    ],
    etymology: 'Latince "reluctari": "karşı koymak, direnmek". İsteksiz kişi içten içe direnen kişidir.',
    syllables: ['rɪ', 'ˈlʌk', 'tənt'],
    stressIndex: 1,
  }),
  w('academic', 'serendipity', '/ˌserənˈdɪpəti/', 'noun', 'C1', 'Mutlu tesadüf, şans eseri gelen keşif', [
    ex('Finding this rare book was pure serendipity.', 'Bu nadir kitabı bulmak tam bir mutlu tesadüftü.'),
    ex('A stroke of serendipity led to the discovery.', 'Şans eseri yaşanan bir tesadüf buluşa yol açtı.'),
  ], {
    synonyms: ['chance', 'fluke', 'lucky accident'],
    collocations: ['pure serendipity', 'a moment of serendipity'],
    etymology: 'Horace Walpole’un 1754’te uydurduğu kelime; şans eseri keşifler yapan "Serendip’in Üç Prensi" masalından gelir.',
    syllables: ['ˌser', 'ən', 'ˈdɪp', 'ə', 'ti'],
    stressIndex: 2,
  }),
  w('academic', 'thrive', '/θraɪv/', 'verb', 'B2', 'Gelişmek, serpilmek, başarılı olmak', [
    ex('Small businesses thrive in this neighbourhood.', 'Küçük işletmeler bu mahallede gelişiyor.'),
    ex('Some people thrive under pressure.', 'Bazı insanlar baskı altında daha başarılı olur.'),
  ], {
    synonyms: ['flourish', 'prosper'],
    collocations: ['thrive on challenges', 'thrive under pressure'],
    mnemonic: '"Thrive" ≈ "drive": içindeki motor (drive) çalıştıkça serpilir, gelişirsin.',
  }),
  w('academic', 'feasible', '/ˈfiːzəbl/', 'adjective', 'C1', 'Uygulanabilir, yapılabilir', [
    ex('Is it feasible to finish the project by Friday?', 'Projeyi cumaya kadar bitirmek mümkün mü?'),
    ex('The plan is technically feasible but expensive.', 'Plan teknik olarak uygulanabilir ama pahalı.'),
  ], {
    synonyms: ['achievable', 'viable', 'workable'],
    collocations: ['economically feasible', 'a feasible option', 'feasibility study'],
    etymology: 'Fransızca "faisable" (yapılabilir), "faire" (yapmak) fiilinden.',
  }),
  w('academic', 'obstacle', '/ˈɒbstəkl/', 'noun', 'B2', 'Engel, mani', [
    ex('Lack of funding is the main obstacle.', 'Finansman eksikliği asıl engel.'),
  ], {
    synonyms: ['barrier', 'hurdle'],
    collocations: ['overcome an obstacle', 'a major obstacle'],
  }),
  w('academic', 'ambiguous', '/æmˈbɪɡjuəs/', 'adjective', 'C1', 'Belirsiz, iki anlamlı', [
    ex('The instructions were ambiguous.', 'Talimatlar belirsizdi.'),
    ex('His answer was deliberately ambiguous.', 'Cevabı kasıtlı olarak muğlaktı.'),
  ], {
    synonyms: ['unclear', 'vague'],
    collocations: ['ambiguous wording', 'deliberately ambiguous'],
    morphology: [
      { part: 'ambi-', meaning: 'iki, her iki yönde' },
      { part: 'agere', meaning: 'sürmek, yönlendirmek' },
    ],
    etymology: 'Latince "ambiguus": "iki yöne çekilen", yani iki şekilde yorumlanabilen.',
  }),
  w('academic', 'abandon', '/əˈbændən/', 'verb', 'B2', 'Terk etmek, vazgeçmek', [
    ex('They had to abandon the car in the snow.', 'Arabayı karda terk etmek zorunda kaldılar.'),
    ex('Never abandon your dreams.', 'Hayallerinden asla vazgeçme.'),
  ], {
    synonyms: ['desert', 'give up', 'leave behind'],
    collocations: ['abandon a plan', 'abandon hope', 'abandoned building'],
    mnemonic: 'Kulağa "e-ben-dın" gibi gelir: "E, ben dün buraları terk ettim!" Issız, tozlu evi valiziyle ardında bırakıp giden birini canlandır.',
    morphology: [
      { part: 'à', meaning: '-e, -a (yönelme)' },
      { part: 'bandon', meaning: 'yetki, denetim' },
    ],
    etymology: 'Orta Çağ Fransızcası "à bandon": birini veya bir mülkü başkasının denetimine, yani kendi haline / kaderine terk etmek.',
    image: 'images/mnemonic-abandon.jpg',
    syllables: ['ə', 'ˈbæn', 'dən'],
    stressIndex: 1,
  }),
  w('academic', 'consequence', '/ˈkɒnsɪkwəns/', 'noun', 'B2', 'Sonuç, netice', [
    ex('Every action has consequences.', 'Her eylemin sonuçları vardır.'),
  ], {
    synonyms: ['result', 'outcome'],
    collocations: ['face the consequences', 'as a consequence', 'serious consequences'],
  }),
  w('academic', 'comprehensive', '/ˌkɒmprɪˈhensɪv/', 'adjective', 'B2', 'Kapsamlı, ayrıntılı', [
    ex('We need a comprehensive review of the system.', 'Sistemin kapsamlı bir incelemesine ihtiyacımız var.'),
  ], {
    synonyms: ['thorough', 'complete'],
    collocations: ['comprehensive review', 'comprehensive guide'],
  }),
  w('academic', 'subsequent', '/ˈsʌbsɪkwənt/', 'adjective', 'C1', 'Sonraki, ardından gelen', [
    ex('Subsequent tests confirmed the results.', 'Sonraki testler sonuçları doğruladı.'),
  ], {
    synonyms: ['following', 'later'],
    collocations: ['subsequent years', 'subsequently'],
  }),
  w('academic', 'hypothesis', '/haɪˈpɒθəsɪs/', 'noun', 'C1', 'Hipotez, varsayım', [
    ex('The data supports our hypothesis.', 'Veriler hipotezimizi destekliyor.'),
  ], {
    synonyms: ['theory', 'assumption'],
    collocations: ['test a hypothesis', 'support a hypothesis'],
  }),
  w('academic', 'diminish', '/dɪˈmɪnɪʃ/', 'verb', 'C1', 'Azalmak, azaltmak', [
    ex('The pain will diminish over time.', 'Ağrı zamanla azalacak.'),
  ], {
    synonyms: ['decrease', 'reduce', 'lessen'],
    collocations: ['diminishing returns', 'greatly diminish'],
  }),
  w('academic', 'plausible', '/ˈplɔːzəbl/', 'adjective', 'C1', 'Akla yatkın, makul', [
    ex('That is a plausible explanation.', 'Bu akla yatkın bir açıklama.'),
  ], {
    synonyms: ['believable', 'reasonable'],
    collocations: ['a plausible explanation', 'perfectly plausible'],
  }),
  w('academic', 'undermine', '/ˌʌndəˈmaɪn/', 'verb', 'C1', 'Baltalamak, zayıflatmak', [
    ex('Constant criticism can undermine confidence.', 'Sürekli eleştiri özgüveni zayıflatabilir.'),
  ], {
    synonyms: ['weaken', 'sabotage'],
    collocations: ['undermine confidence', 'undermine authority'],
    mnemonic: 'Under (altından) + mine (tünel kazmak): bir yapının altını oyarak onu çökertmek.',
  }),
  w('academic', 'meticulous', '/məˈtɪkjələs/', 'adjective', 'C1', 'Titiz, son derece dikkatli', [
    ex('She keeps meticulous records.', 'Son derece titiz kayıtlar tutuyor.'),
  ], {
    synonyms: ['careful', 'precise', 'thorough'],
    collocations: ['meticulous attention to detail', 'meticulous planning'],
  }),
  w('academic', 'scrutiny', '/ˈskruːtəni/', 'noun', 'C1', 'Dikkatli inceleme, mercek altına alma', [
    ex('The proposal came under close scrutiny.', 'Teklif sıkı bir incelemeye tabi tutuldu.'),
  ], {
    synonyms: ['examination', 'inspection'],
    collocations: ['under scrutiny', 'close scrutiny', 'public scrutiny'],
  }),
  w('academic', 'resilient', '/rɪˈzɪliənt/', 'adjective', 'C1', 'Dayanıklı, çabuk toparlanan', [
    ex('Children are often remarkably resilient.', 'Çocuklar çoğu zaman şaşırtıcı derecede dayanıklıdır.'),
  ], {
    synonyms: ['tough', 'adaptable'],
    collocations: ['remarkably resilient', 'resilient economy'],
  }),
  w('academic', 'hesitant', '/ˈhezɪtənt/', 'adjective', 'B2', 'Tereddütlü, kararsız', [
    ex('He was hesitant about signing the contract.', 'Sözleşmeyi imzalama konusunda tereddütlüydü.'),
  ], {
    synonyms: ['uncertain', 'unsure'],
    collocations: ['hesitant to ask', 'a hesitant smile'],
  }),
  w('academic', 'affect', '/əˈfekt/', 'verb', 'B2', 'Etkilemek, tesir etmek', [
    ex('Lack of sleep directly affects your memory.', 'Uykusuzluk hafızanı doğrudan etkiler.'),
  ], {
    synonyms: ['influence', 'impact'],
    collocations: ['seriously affect', 'directly affect'],
  }),
  w('academic', 'effect', '/ɪˈfekt/', 'noun', 'B2', 'Etki, sonuç', [
    ex('The therapy had an immediate positive effect.', 'Tedavinin anında olumlu bir etkisi oldu.'),
  ], {
    synonyms: ['result', 'impact'],
    collocations: ['have an effect on', 'side effect', 'take effect'],
  }),
  w('academic', 'unprecedented', '/ʌnˈpresɪdentɪd/', 'adjective', 'C1', 'Eşi görülmemiş, emsalsiz', [
    ex('The company saw unprecedented growth.', 'Şirket eşi görülmemiş bir büyüme yaşadı.'),
  ], {
    synonyms: ['unparalleled', 'record-breaking'],
    collocations: ['unprecedented growth', 'on an unprecedented scale'],
  }),

  // ───────────────────────── İş İngilizcesi ─────────────────────────
  w('business', 'deadline', '/ˈdedlaɪn/', 'noun', 'B1', 'Son teslim tarihi', [
    ex('We must meet the deadline.', 'Son teslim tarihine yetişmeliyiz.'),
  ], {
    collocations: ['meet a deadline', 'miss a deadline', 'a tight deadline'],
  }),
  w('business', 'negotiate', '/nɪˈɡəʊʃieɪt/', 'verb', 'B2', 'Müzakere etmek, pazarlık etmek', [
    ex('We negotiated a better price with the supplier.', 'Tedarikçiyle daha iyi bir fiyat için pazarlık yaptık.'),
  ], {
    synonyms: ['bargain', 'discuss terms'],
    collocations: ['negotiate a deal', 'negotiate terms'],
  }),
  w('business', 'agenda', '/əˈdʒendə/', 'noun', 'B2', 'Gündem', [
    ex('What is on the agenda for today’s meeting?', 'Bugünkü toplantının gündeminde ne var?'),
  ], {
    collocations: ['on the agenda', 'set the agenda', 'hidden agenda'],
  }),
  w('business', 'stakeholder', '/ˈsteɪkhəʊldə(r)/', 'noun', 'C1', 'Paydaş', [
    ex('We need to inform all stakeholders.', 'Tüm paydaşları bilgilendirmemiz gerekiyor.'),
  ], {
    collocations: ['key stakeholders', 'stakeholder meeting'],
  }),
  w('business', 'revenue', '/ˈrevənjuː/', 'noun', 'B2', 'Gelir, hasılat', [
    ex('Revenue increased by 20% this year.', 'Gelir bu yıl %20 arttı.'),
  ], {
    synonyms: ['income', 'turnover'],
    collocations: ['generate revenue', 'annual revenue'],
  }),
  w('business', 'budget', '/ˈbʌdʒɪt/', 'noun', 'B1', 'Bütçe', [
    ex('We are already over budget.', 'Bütçeyi şimdiden aştık.'),
  ], {
    collocations: ['over budget', 'tight budget', 'budget cuts'],
  }),
  w('business', 'postpone', '/pəˈspəʊn/', 'verb', 'B2', 'Ertelemek', [
    ex('The meeting has been postponed until Monday.', 'Toplantı pazartesiye ertelendi.'),
  ], {
    synonyms: ['delay', 'put off'],
    collocations: ['postpone a meeting', 'postpone indefinitely'],
  }),
  w('business', 'implement', '/ˈɪmplɪment/', 'verb', 'B2', 'Uygulamak, hayata geçirmek', [
    ex('The company will implement the new policy next month.', 'Şirket yeni politikayı gelecek ay uygulamaya koyacak.'),
  ], {
    synonyms: ['carry out', 'execute'],
    collocations: ['implement a plan', 'implement changes'],
  }),
  w('business', 'feedback', '/ˈfiːdbæk/', 'noun', 'B1', 'Geri bildirim', [
    ex('Thanks for your helpful feedback.', 'Faydalı geri bildirimin için teşekkürler.'),
  ], {
    collocations: ['give feedback', 'positive feedback', 'constructive feedback'],
  }),
  w('business', 'colleague', '/ˈkɒliːɡ/', 'noun', 'B1', 'İş arkadaşı, meslektaş', [
    ex('I’m having lunch with a colleague.', 'Bir iş arkadaşımla öğle yemeği yiyorum.'),
  ], {
    synonyms: ['co-worker'],
  }),
  w('business', 'delegate', '/ˈdelɪɡeɪt/', 'verb', 'C1', 'Görev devretmek, yetki vermek', [
    ex('A good manager knows how to delegate.', 'İyi bir yönetici görev devretmeyi bilir.'),
  ], {
    collocations: ['delegate tasks', 'delegate responsibility'],
  }),
  w('business', 'leverage', '/ˈliːvərɪdʒ/', 'verb', 'C1', 'Avantaja çevirmek, etkin biçimde kullanmak', [
    ex('We can leverage our network to find new clients.', 'Yeni müşteri bulmak için ağımızı etkin biçimde kullanabiliriz.'),
  ], {
    synonyms: ['exploit', 'make use of'],
  }),
  w('business', 'invoice', '/ˈɪnvɔɪs/', 'noun', 'B2', 'Fatura', [
    ex('Please send the invoice by email.', 'Lütfen faturayı e-postayla gönderin.'),
  ], {
    collocations: ['issue an invoice', 'pay an invoice'],
  }),
  w('business', 'proposal', '/prəˈpəʊzl/', 'noun', 'B2', 'Teklif, öneri', [
    ex('The board rejected the proposal.', 'Yönetim kurulu teklifi reddetti.'),
  ], {
    collocations: ['submit a proposal', 'reject a proposal'],
  }),
  w('business', 'follow up', '/ˌfɒləʊ ˈʌp/', 'phrasal', 'B2', 'Takip etmek, ardından ilgilenmek', [
    ex('I will follow up with an email tomorrow.', 'Yarın bir e-postayla konuyu takip edeceğim.'),
  ], {
    collocations: ['follow up on something', 'follow-up meeting'],
  }),
  w('business', 'oversight', '/ˈəʊvəsaɪt/', 'noun', 'C1', 'Gözden kaçırma, dikkatsizlik; denetim', [
    ex('The error was due to an oversight.', 'Hata, bir gözden kaçırmadan kaynaklandı.'),
  ], {
    collocations: ['an inadvertent oversight', 'regulatory oversight'],
  }),
  w('business', 'decision', '/dɪˈsɪʒn/', 'noun', 'B1', 'Karar', [
    ex('We have to make a tough decision.', 'Zor bir karar vermek zorundayız.'),
  ], {
    collocations: ['make a decision', 'reach a decision', 'a tough decision'],
  }),

  // ───────────────────────── Sitcom & Dizi ─────────────────────────
  w('sitcom', 'awkward', '/ˈɔːkwəd/', 'adjective', 'B2', 'Garip, tuhaf, rahatsız edici', [
    ex('There was an awkward silence after his joke.', 'Şakasından sonra garip bir sessizlik oldu.'),
  ], {
    synonyms: ['uncomfortable', 'embarrassing'],
    collocations: ['awkward silence', 'awkward moment'],
  }),
  w('sitcom', 'run into', '/rʌn ˈɪntuː/', 'phrasal', 'B1', 'Tesadüfen karşılaşmak, rastlamak', [
    ex('I ran into an old friend at the café.', 'Kafede eski bir arkadaşıma rastladım.'),
  ], {
    synonyms: ['bump into', 'come across'],
  }),
  w('sitcom', 'hang out', '/hæŋ ˈaʊt/', 'phrasal', 'B1', 'Takılmak, birlikte vakit geçirmek', [
    ex('We used to hang out at the coffee shop.', 'Eskiden kafede takılırdık.'),
  ]),
  w('sitcom', 'get over', '/ɡet ˈəʊvə(r)/', 'phrasal', 'B2', 'Atlatmak, üstesinden gelmek', [
    ex('It took him months to get over the breakup.', 'Ayrılığı atlatması aylar sürdü.'),
  ], {
    synonyms: ['recover from'],
  }),
  w('sitcom', 'figure out', '/ˌfɪɡər ˈaʊt/', 'phrasal', 'B1', 'Çözmek, anlamak', [
    ex('I can’t figure out what she meant.', 'Ne demek istediğini çözemiyorum.'),
  ], {
    synonyms: ['work out', 'understand'],
  }),
  w('sitcom', 'freak out', '/friːk ˈaʊt/', 'phrasal', 'B2', 'Panikleyip kendini kaybetmek', [
    ex('Don’t freak out, it’s just a spider.', 'Panik yapma, sadece bir örümcek.'),
  ], {
    synonyms: ['panic', 'lose it'],
  }),
  w('sitcom', 'sarcastic', '/sɑːˈkæstɪk/', 'adjective', 'B2', 'İğneleyici, alaycı', [
    ex('Was that a sarcastic comment?', 'Bu alaycı bir yorum muydu?'),
  ], {
    synonyms: ['ironic', 'mocking'],
  }),
  w('sitcom', 'roommate', '/ˈruːmmeɪt/', 'noun', 'A2', 'Ev arkadaşı, oda arkadaşı', [
    ex('My roommate always eats my food.', 'Ev arkadaşım hep yemeğimi yiyor.'),
  ], {
    synonyms: ['flatmate'],
  }),
  w('sitcom', 'gossip', '/ˈɡɒsɪp/', 'noun', 'B1', 'Dedikodu', [
    ex('Have you heard the latest gossip?', 'Son dedikoduyu duydun mu?'),
  ], {
    collocations: ['spread gossip', 'juicy gossip'],
  }),
  w('sitcom', 'embarrassed', '/ɪmˈbærəst/', 'adjective', 'B1', 'Utanmış, mahcup', [
    ex('I was so embarrassed when I forgot her name.', 'Adını unuttuğumda çok utandım.'),
  ], {
    synonyms: ['ashamed', 'self-conscious'],
  }),
  w('sitcom', 'crush', '/krʌʃ/', 'noun', 'B2', 'Platonik aşk, hoşlanılan kişi', [
    ex('She has a crush on her neighbour.', 'Komşusundan hoşlanıyor.'),
  ], {
    collocations: ['have a crush on someone'],
  }),
  w('sitcom', 'hilarious', '/hɪˈleəriəs/', 'adjective', 'B2', 'Çok komik, gülmekten kırıp geçiren', [
    ex('The last episode was hilarious.', 'Son bölüm çok komikti.'),
  ], {
    synonyms: ['very funny'],
  }),
  w('sitcom', 'make up', '/meɪk ˈʌp/', 'phrasal', 'B2', 'Barışmak; uydurmak', [
    ex('They argued but made up the next day.', 'Tartıştılar ama ertesi gün barıştılar.'),
    ex('Stop making up excuses!', 'Bahane uydurmayı bırak!'),
  ]),
  w('sitcom', 'clumsy', '/ˈklʌmzi/', 'adjective', 'B2', 'Sakar, beceriksiz', [
    ex('I’m so clumsy, I dropped my coffee again.', 'Çok sakarım, kahvemi yine düşürdüm.'),
  ]),
  w('sitcom', 'coincidence', '/kəʊˈɪnsɪdəns/', 'noun', 'B2', 'Tesadüf', [
    ex('What a coincidence! I was just thinking about you.', 'Ne tesadüf! Ben de tam seni düşünüyordum.'),
  ], {
    collocations: ['pure coincidence', 'by coincidence'],
  }),
  w('sitcom', 'moody', '/ˈmuːdi/', 'adjective', 'B2', 'Huysuz, keyfi çabuk değişen', [
    ex('He’s been really moody since Monday.', 'Pazartesiden beri gerçekten huysuz.'),
  ]),

  // ───────────────────────── Günlük Konuşma & Deyimler ─────────────────────────
  w('daily', 'piece of cake', '/ˌpiːs əv ˈkeɪk/', 'idiom', 'B1', 'Çocuk oyuncağı, çok kolay', [
    ex('The exam was a piece of cake.', 'Sınav çocuk oyuncağıydı.'),
  ]),
  w('daily', 'break the ice', '/ˌbreɪk ði ˈaɪs/', 'idiom', 'B2', 'Buzları eritmek', [
    ex('He told a joke to break the ice.', 'Buzları eritmek için bir şaka yaptı.'),
  ]),
  w('daily', 'under the weather', '/ˌʌndə ðə ˈweðə(r)/', 'idiom', 'B2', 'Keyifsiz, hafif hasta', [
    ex('I’m feeling a bit under the weather today.', 'Bugün kendimi biraz halsiz hissediyorum.'),
  ]),
  w('daily', 'hit the sack', '/ˌhɪt ðə ˈsæk/', 'idiom', 'B2', 'Yatmak, uyumaya gitmek', [
    ex('I’m exhausted, I’m going to hit the sack.', 'Çok yorgunum, yatmaya gidiyorum.'),
  ]),
  w('daily', 'once in a blue moon', '/ˌwʌns ɪn ə ˌbluː ˈmuːn/', 'idiom', 'B2', 'Kırk yılda bir', [
    ex('I only eat fast food once in a blue moon.', 'Fast food’u kırk yılda bir yerim.'),
  ]),
  w('daily', 'cost an arm and a leg', '/ˌkɒst ən ˌɑːm ənd ə ˈleɡ/', 'idiom', 'B2', 'Dudak uçuklatacak kadar pahalı olmak', [
    ex('That car cost an arm and a leg.', 'O araba dudak uçuklatan bir fiyata mal oldu.'),
  ]),
  w('daily', 'call it a day', '/ˌkɔːl ɪt ə ˈdeɪ/', 'idiom', 'B2', 'Paydos etmek, bugünlük bu kadar demek', [
    ex('It’s late, let’s call it a day.', 'Geç oldu, bugünlük bu kadar diyelim.'),
  ]),
  w('daily', 'keep in touch', '/ˌkiːp ɪn ˈtʌtʃ/', 'phrase', 'B1', 'İrtibatta kalmak, haberleşmek', [
    ex('Let’s keep in touch after graduation.', 'Mezuniyetten sonra haberleşelim.'),
  ]),
  w('daily', 'get the hang of', '/ˌɡet ðə ˈhæŋ əv/', 'idiom', 'B2', 'Alışmak, işin püf noktasını kavramak', [
    ex('You’ll get the hang of it soon.', 'Yakında alışırsın.'),
  ]),
  w('daily', 'on the same page', '/ɒn ðə ˌseɪm ˈpeɪdʒ/', 'idiom', 'B2', 'Aynı fikirde olmak, mutabık olmak', [
    ex('Let’s make sure we’re on the same page.', 'Aynı şeyi düşündüğümüzden emin olalım.'),
  ]),
  w('daily', 'a blessing in disguise', '/ə ˈblesɪŋ ɪn dɪsˈɡaɪz/', 'idiom', 'C1', 'Kötü görünüp hayırlı çıkan şey', [
    ex('Losing that job was a blessing in disguise.', 'O işi kaybetmek aslında hayırlı oldu.'),
  ]),
  w('daily', 'hang in there', '/ˌhæŋ ɪn ˈðeə(r)/', 'idiom', 'B2', 'Dayan, pes etme', [
    ex('Hang in there, the exams are almost over.', 'Dayan, sınavlar neredeyse bitti.'),
  ]),
  w('daily', 'my bad', '/ˌmaɪ ˈbæd/', 'phrase', 'B1', 'Benim hatam (argo)', [
    ex('My bad, I forgot to call you.', 'Benim hatam, seni aramayı unuttum.'),
  ]),
  w('daily', 'no worries', '/nəʊ ˈwʌriz/', 'phrase', 'A2', 'Sorun değil, dert etme', [
    ex('“Sorry I’m late.” “No worries!”', '“Geciktiğim için üzgünüm.” “Sorun değil!”'),
  ]),
  w('daily', 'go the extra mile', '/ˌɡəʊ ði ˌekstrə ˈmaɪl/', 'idiom', 'B2', 'Fazladan çaba göstermek', [
    ex('She always goes the extra mile for her customers.', 'Müşterileri için her zaman fazladan çaba gösterir.'),
  ]),
  w('daily', 'by the way', '/ˌbaɪ ðə ˈweɪ/', 'phrase', 'A2', 'Bu arada', [
    ex('By the way, have you seen my keys?', 'Bu arada, anahtarlarımı gördün mü?'),
  ]),

  // ───────────────────────── Çekirdek Kelimeler ─────────────────────────
  w('core', 'achieve', '/əˈtʃiːv/', 'verb', 'B1', 'Başarmak, elde etmek', [
    ex('She finally achieved her goal.', 'Sonunda hedefine ulaştı.'),
  ], {
    collocations: ['achieve a goal', 'achieve success'],
  }),
  w('core', 'improve', '/ɪmˈpruːv/', 'verb', 'A2', 'Geliştirmek, iyileştirmek', [
    ex('I want to improve my English.', 'İngilizcemi geliştirmek istiyorum.'),
  ]),
  w('core', 'borrow', '/ˈbɒrəʊ/', 'verb', 'A2', 'Ödünç almak', [
    ex('Can I borrow your pen?', 'Kalemini ödünç alabilir miyim?'),
  ]),
  w('core', 'lend', '/lend/', 'verb', 'A2', 'Ödünç vermek', [
    ex('Could you lend me some money?', 'Bana biraz borç para verebilir misin?'),
  ]),
  w('core', 'journey', '/ˈdʒɜːni/', 'noun', 'A2', 'Yolculuk', [
    ex('The journey took six hours.', 'Yolculuk altı saat sürdü.'),
  ]),
  w('core', 'advice', '/ədˈvaɪs/', 'noun', 'A2', 'Tavsiye, öğüt', [
    ex('Can you give me some advice?', 'Bana biraz tavsiye verebilir misin?'),
  ], {
    collocations: ['give advice', 'take someone’s advice', 'a piece of advice'],
  }),
  w('core', 'mistake', '/mɪˈsteɪk/', 'noun', 'A2', 'Hata, yanlış', [
    ex('Everyone makes mistakes.', 'Herkes hata yapar.'),
  ], {
    collocations: ['make a mistake', 'a big mistake', 'by mistake'],
  }),
  w('core', 'available', '/əˈveɪləbl/', 'adjective', 'A2', 'Mevcut, müsait', [
    ex('Are you available tomorrow morning?', 'Yarın sabah müsait misin?'),
  ]),
  w('core', 'remember', '/rɪˈmembə(r)/', 'verb', 'A1', 'Hatırlamak', [
    ex('I can’t remember his name.', 'Adını hatırlayamıyorum.'),
  ]),
  w('core', 'explain', '/ɪkˈspleɪn/', 'verb', 'A2', 'Açıklamak', [
    ex('Can you explain this rule again?', 'Bu kuralı tekrar açıklayabilir misin?'),
  ]),
  w('core', 'comfortable', '/ˈkʌmftəbl/', 'adjective', 'A2', 'Rahat', [
    ex('This sofa is really comfortable.', 'Bu kanepe gerçekten rahat.'),
  ]),
  w('core', 'opportunity', '/ˌɒpəˈtjuːnəti/', 'noun', 'B1', 'Fırsat', [
    ex('This is a great opportunity for you.', 'Bu senin için harika bir fırsat.'),
  ], {
    collocations: ['take the opportunity', 'a golden opportunity'],
  }),
  w('core', 'suggest', '/səˈdʒest/', 'verb', 'B1', 'Önermek', [
    ex('I suggest we leave early.', 'Erken çıkmamızı öneriyorum.'),
  ]),
  w('core', 'environment', '/ɪnˈvaɪrənmənt/', 'noun', 'B1', 'Çevre, ortam', [
    ex('We must protect the environment.', 'Çevreyi korumalıyız.'),
  ]),
  w('core', 'although', '/ɔːlˈðəʊ/', 'conjunction', 'B1', '-e rağmen, gerçi', [
    ex('Although it was raining, we went out.', 'Yağmur yağmasına rağmen dışarı çıktık.'),
  ]),
  w('core', 'likely', '/ˈlaɪkli/', 'adjective', 'B1', 'Muhtemel', [
    ex('It is likely to rain tomorrow.', 'Yarın yağmur yağması muhtemel.'),
  ]),
  w('core', 'decide', '/dɪˈsaɪd/', 'verb', 'A2', 'Karar vermek', [
    ex('We decided to stay at home.', 'Evde kalmaya karar verdik.'),
  ]),
  w('core', 'complain', '/kəmˈpleɪn/', 'verb', 'B1', 'Şikâyet etmek', [
    ex('He always complains about the weather.', 'Hep havadan şikâyet ediyor.'),
  ]),
  w('core', 'afford', '/əˈfɔːd/', 'verb', 'B1', '(Parasını) karşılayabilmek, gücü yetmek', [
    ex('I can’t afford a new car.', 'Yeni bir arabaya gücüm yetmez.'),
  ]),
  w('core', 'weather', '/ˈweðə(r)/', 'noun', 'A1', 'Hava (durumu)', [
    ex('The weather is lovely today.', 'Bugün hava çok güzel.'),
  ]),
];

export const SEED_WORD_MAP: Record<string, Word> = Object.fromEntries(SEED_WORDS.map((x) => [x.id, x]));

export const POS_LABELS: Record<PartOfSpeech, { tr: string; en: string }> = {
  noun: { tr: 'İsim', en: 'Noun' },
  verb: { tr: 'Fiil', en: 'Verb' },
  adjective: { tr: 'Sıfat', en: 'Adjective' },
  adverb: { tr: 'Zarf', en: 'Adverb' },
  phrasal: { tr: 'Deyimsel Fiil', en: 'Phrasal Verb' },
  idiom: { tr: 'Deyim', en: 'Idiom' },
  phrase: { tr: 'Kalıp', en: 'Phrase' },
  conjunction: { tr: 'Bağlaç', en: 'Conjunction' },
};
