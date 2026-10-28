import { parseVocab } from './parse';

// B2 — Orta üstü: tartışma, haber, iş ve akademik metinlerde sık geçen kelimeler.
export const B2_WORDS = [
  ...parseVocab('core', `
# ── Fiiller ──
acquire | /əˈkwaɪə(r)/ | v | B2 | Edinmek, kazanmak | She acquired good Spanish while working in Madrid. | Madrid'de çalışırken iyi derecede İspanyolca edindi. | gain; obtain | acquire a skill
adapt | /əˈdæpt/ | v | B2 | Uyum sağlamak; uyarlamak | It took me months to adapt to life in London. | Londra'daki hayata uyum sağlamam aylarımı aldı. | adjust | adapt to
adjust | /əˈdʒʌst/ | v | B2 | Ayarlamak; alışmak | You can adjust the height of the chair. | Sandalyenin yüksekliğini ayarlayabilirsin. | adapt | adjust to
appeal | /əˈpiːl/ | v | B2 | Cazip gelmek; çağrıda bulunmak | The idea of living abroad really appeals to me. | Yurt dışında yaşama fikri bana gerçekten cazip geliyor. | attract | appeal to
appreciate | /əˈpriːʃieɪt/ | v | B2 | Takdir etmek, minnettar olmak | I really appreciate your help. | Yardımın için gerçekten minnettarım. | value | appreciate it
approve | /əˈpruːv/ | v | B2 | Onaylamak | The manager approved my holiday request. | Müdür izin talebimi onayladı. | accept | approve of
blame | /bleɪm/ | v | B2 | Suçlamak | Don't blame me for your mistakes. | Kendi hataların için beni suçlama. | accuse | blame someone for
boost | /buːst/ | v | B2 | Artırmak, güçlendirmek | Exercise can boost your mood. | Egzersiz ruh halini güçlendirebilir. | increase | boost confidence
calculate | /ˈkælkjuleɪt/ | v | B2 | Hesaplamak | Calculate the total cost of the trip. | Seyahatin toplam maliyetini hesapla. | work out |
capture | /ˈkæptʃə(r)/ | v | B2 | Yakalamak; (anı) ölümsüzleştirmek | The photo captures the beauty of the city. | Fotoğraf şehrin güzelliğini yakalıyor. | catch |
claim | /kleɪm/ | v | B2 | İddia etmek; talep etmek | He claims that he saw a ghost. | Bir hayalet gördüğünü iddia ediyor. | state; argue | claim compensation
commit | /kəˈmɪt/ | v | B2 | (Suç) işlemek; kendini adamak | He was accused of committing a crime. | Suç işlemekle suçlandı. | | commit a crime; commit to
communicate | /kəˈmjuːnɪkeɪt/ | v | B2 | İletişim kurmak | We communicate mostly by email. | Çoğunlukla e-postayla iletişim kuruyoruz. | | communicate with
concentrate | /ˈkɒnsntreɪt/ | v | B2 | Odaklanmak, konsantre olmak | I can't concentrate with this noise. | Bu gürültüyle odaklanamıyorum. | focus | concentrate on
confirm | /kənˈfɜːm/ | v | B2 | Onaylamak, teyit etmek | Please confirm your booking by email. | Lütfen rezervasyonunuzu e-postayla teyit edin. | verify | confirm a booking
consult | /kənˈsʌlt/ | v | B2 | Danışmak | You should consult a lawyer. | Bir avukata danışmalısın. | ask | consult a doctor
cope | /kəʊp/ | v | B2 | Başa çıkmak | She is coping well with the new job. | Yeni işiyle iyi başa çıkıyor. | manage; deal with | cope with
criticize | /ˈkrɪtɪsaɪz/ | v | B2 | Eleştirmek | The film was criticized for being too long. | Film fazla uzun olduğu için eleştirildi. | |
defend | /dɪˈfend/ | v | B2 | Savunmak | He defended his friend in the argument. | Tartışmada arkadaşını savundu. | protect | defend yourself
deny | /dɪˈnaɪ/ | v | B2 | İnkâr etmek, reddetmek | She denied taking the money. | Parayı aldığını inkâr etti. | reject |
detect | /dɪˈtekt/ | v | B2 | Tespit etmek, sezmek | The test can detect the virus early. | Test virüsü erken tespit edebiliyor. | discover; notice |
distinguish | /dɪˈstɪŋɡwɪʃ/ | v | B2 | Ayırt etmek | Can you distinguish between the two sounds? | İki sesi birbirinden ayırt edebiliyor musun? | differentiate |
disturb | /dɪˈstɜːb/ | v | B2 | Rahatsız etmek | Sorry to disturb you, but you have a visitor. | Rahatsız ettiğim için üzgünüm ama bir ziyaretçiniz var. | bother | do not disturb
donate | /dəʊˈneɪt/ | v | B2 | Bağışlamak | They donated their old clothes to charity. | Eski kıyafetlerini hayır kurumuna bağışladılar. | give | donate blood
employ | /ɪmˈplɔɪ/ | v | B2 | İşe almak, istihdam etmek | The company employs five hundred people. | Şirket beş yüz kişiyi istihdam ediyor. | hire |
ensure | /ɪnˈʃʊə(r)/ | v | B2 | Sağlamak, garanti altına almak | Please ensure that all windows are closed. | Lütfen tüm pencerelerin kapalı olduğundan emin olun. | make sure |
entertain | /ˌentəˈteɪn/ | v | B2 | Eğlendirmek; misafir ağırlamak | The clown entertained the children for an hour. | Palyaço çocukları bir saat eğlendirdi. | amuse |
examine | /ɪɡˈzæmɪn/ | v | B2 | İncelemek, muayene etmek | The doctor examined my throat. | Doktor boğazımı muayene etti. | inspect |
expose | /ɪkˈspəʊz/ | v | B2 | Maruz bırakmak; ifşa etmek | Don't expose your skin to the sun for too long. | Cildini güneşe çok uzun süre maruz bırakma. | reveal | be exposed to
extend | /ɪkˈstend/ | v | B2 | Uzatmak, genişletmek | We decided to extend our holiday by a week. | Tatilimizi bir hafta uzatmaya karar verdik. | lengthen | extend a deadline
guarantee | /ˌɡærənˈtiː/ | v | B2 | Garanti etmek | We guarantee delivery within 24 hours. | 24 saat içinde teslimatı garanti ediyoruz. | promise |
hesitate | /ˈhezɪteɪt/ | v | B2 | Tereddüt etmek | Don't hesitate to call me if you need help. | Yardıma ihtiyacın olursa aramaktan çekinme. | pause |
highlight | /ˈhaɪlaɪt/ | v | B2 | Vurgulamak | The report highlights the need for change. | Rapor değişim ihtiyacını vurguluyor. | emphasize |
identify | /aɪˈdentɪfaɪ/ | v | B2 | Tanımlamak, tespit etmek | Can you identify the man in this photo? | Bu fotoğraftaki adamı teşhis edebilir misin? | recognize |
influence | /ˈɪnfluəns/ | v | B2 | Etkilemek | My parents influenced my choice of career. | Ailem meslek seçimimi etkiledi. | affect |
insist | /ɪnˈsɪst/ | v | B2 | Israr etmek | He insisted on paying for dinner. | Akşam yemeğini ödemekte ısrar etti. | | insist on
inspire | /ɪnˈspaɪə(r)/ | v | B2 | İlham vermek | Her story inspired me to start running. | Hikâyesi bana koşmaya başlamam için ilham verdi. | motivate |
intend | /ɪnˈtend/ | v | B2 | Niyet etmek | I intend to finish the book this week. | Kitabı bu hafta bitirmeye niyetliyim. | plan |
interrupt | /ˌɪntəˈrʌpt/ | v | B2 | Sözünü kesmek, araya girmek | Please don't interrupt me while I'm speaking. | Lütfen konuşurken sözümü kesme. | |
investigate | /ɪnˈvestɪɡeɪt/ | v | B2 | Soruşturmak, araştırmak | The police are investigating the accident. | Polis kazayı soruşturuyor. | examine |
involve | /ɪnˈvɒlv/ | v | B2 | İçermek, gerektirmek; dâhil etmek | The job involves a lot of travelling. | İş çok seyahat gerektiriyor. | include | be involved in
occur | /əˈkɜː(r)/ | v | B2 | Meydana gelmek; aklına gelmek | The accident occurred at about midnight. | Kaza gece yarısına doğru meydana geldi. | happen |
oppose | /əˈpəʊz/ | v | B2 | Karşı çıkmak | Many people oppose the new law. | Birçok kişi yeni yasaya karşı çıkıyor. | object to |
overcome | /ˌəʊvəˈkʌm/ | v | B2 | Üstesinden gelmek | She worked hard to overcome her fear of flying. | Uçma korkusunu yenmek için çok çalıştı. | defeat | overcome a problem
participate | /pɑːˈtɪsɪpeɪt/ | v | B2 | Katılmak | All students must participate in the project. | Tüm öğrenciler projeye katılmalı. | take part | participate in
praise | /preɪz/ | v | B2 | Övmek | The teacher praised her excellent work. | Öğretmen mükemmel çalışmasını övdü. | compliment |
preserve | /prɪˈzɜːv/ | v | B2 | Korumak, muhafaza etmek | We must preserve these old buildings. | Bu eski binaları korumalıyız. | protect |
react | /riˈækt/ | v | B2 | Tepki vermek | How did your parents react to the news? | Ailen habere nasıl tepki verdi? | respond | react to
reflect | /rɪˈflekt/ | v | B2 | Yansıtmak; düşünmek | The lake reflects the mountains. | Göl dağları yansıtıyor. | mirror | reflect on
regret | /rɪˈɡret/ | v | B2 | Pişman olmak | I regret not studying harder at school. | Okulda daha çok çalışmadığım için pişmanım. | | regret doing
reject | /rɪˈdʒekt/ | v | B2 | Reddetmek | The company rejected my application. | Şirket başvurumu reddetti. | refuse; turn down |
release | /rɪˈliːs/ | v | B2 | Serbest bırakmak; piyasaya çıkarmak | The band will release a new album next month. | Grup gelecek ay yeni bir albüm çıkaracak. | launch; free |
represent | /ˌreprɪˈzent/ | v | B2 | Temsil etmek | She represented Turkey at the Olympics. | Olimpiyatlarda Türkiye'yi temsil etti. | |
require | /rɪˈkwaɪə(r)/ | v | B2 | Gerektirmek | This job requires a lot of patience. | Bu iş çok sabır gerektiriyor. | need |
resist | /rɪˈzɪst/ | v | B2 | Karşı koymak, direnmek | I couldn't resist eating another piece of cake. | Bir dilim pasta daha yemeye direnemedim. | |
resolve | /rɪˈzɒlv/ | v | B2 | Çözmek, halletmek | We need to resolve this problem quickly. | Bu sorunu hızla çözmemiz gerekiyor. | solve; settle |
respond | /rɪˈspɒnd/ | v | B2 | Yanıt vermek | She hasn't responded to my email yet. | E-postama henüz yanıt vermedi. | reply; answer | respond to
restore | /rɪˈstɔː(r)/ | v | B2 | Restore etmek, eski haline getirmek | They restored the old palace. | Eski sarayı restore ettiler. | repair |
retire | /rɪˈtaɪə(r)/ | v | B2 | Emekli olmak | My father retired at sixty. | Babam altmış yaşında emekli oldu. | |
satisfy | /ˈsætɪsfaɪ/ | v | B2 | Tatmin etmek, memnun etmek | Nothing seems to satisfy him. | Hiçbir şey onu memnun etmiyor gibi. | please |
seek | /siːk/ | v | B2 | Aramak, peşinde olmak | Many young people seek jobs abroad. | Birçok genç yurt dışında iş arıyor. | look for | seek advice
settle | /ˈsetl/ | v | B2 | Yerleşmek; çözüme kavuşturmak | They settled in a small town near the coast. | Sahile yakın küçük bir kasabaya yerleştiler. | | settle down; settle an argument
struggle | /ˈstrʌɡl/ | v | B2 | Mücadele etmek, zorlanmak | Many families struggle to pay their bills. | Birçok aile faturalarını ödemekte zorlanıyor. | fight | struggle with
submit | /səbˈmɪt/ | v | B2 | Teslim etmek, sunmak | You must submit your essay by Friday. | Makaleni cumaya kadar teslim etmelisin. | hand in |
surround | /səˈraʊnd/ | v | B2 | Çevrelemek, kuşatmak | The house is surrounded by trees. | Ev ağaçlarla çevrili. | |
suspect | /səˈspekt/ | v | B2 | Şüphelenmek | I suspect that he is lying. | Yalan söylediğinden şüpheleniyorum. | |
threaten | /ˈθretn/ | v | B2 | Tehdit etmek | Climate change threatens many species. | İklim değişikliği birçok türü tehdit ediyor. | endanger |
tolerate | /ˈtɒləreɪt/ | v | B2 | Hoşgörmek, katlanmak | I can't tolerate rude behaviour. | Kaba davranışlara tahammül edemem. | put up with |
transfer | /trænsˈfɜː(r)/ | v | B2 | Aktarmak, transfer etmek | I'll transfer the money to your account. | Parayı hesabına aktaracağım. | move | transfer money
urge | /ɜːdʒ/ | v | B2 | Israrla teşvik etmek | Doctors urge people to eat less sugar. | Doktorlar insanları daha az şeker yemeye çağırıyor. | encourage |
vary | /ˈveəri/ | v | B2 | Değişmek, farklılık göstermek | Prices vary from shop to shop. | Fiyatlar dükkândan dükkâna değişiyor. | differ |
withdraw | /wɪðˈdrɔː/ | v | B2 | (Para) çekmek; geri çekilmek | I need to withdraw some cash. | Biraz nakit çekmem gerek. | take out | withdraw money
# ── İsimler ──
access | /ˈækses/ | n | B2 | Erişim | All students have access to the library. | Tüm öğrencilerin kütüphaneye erişimi var. | entry | have access to
agency | /ˈeɪdʒənsi/ | n | B2 | Ajans, kurum | She works for a travel agency. | Bir seyahat acentesinde çalışıyor. | | travel agency
aim | /eɪm/ | n | B2 | Amaç, hedef | Our aim is to finish by June. | Amacımız hazirana kadar bitirmek. | goal; target |
appearance | /əˈpɪərəns/ | n | B2 | Görünüş; ortaya çıkış | She changed her appearance completely. | Görünüşünü tamamen değiştirdi. | look |
application | /ˌæplɪˈkeɪʃn/ | n | B2 | Başvuru; uygulama | I sent my application last week. | Başvurumu geçen hafta gönderdim. | | job application
atmosphere | /ˈætməsfɪə(r)/ | n | B2 | Atmosfer, ortam | The café has a warm and friendly atmosphere. | Kafenin sıcak ve samimi bir atmosferi var. | mood |
barrier | /ˈbæriə(r)/ | n | B2 | Engel, bariyer | Language can be a barrier to communication. | Dil, iletişimin önünde bir engel olabilir. | obstacle | language barrier
belief | /bɪˈliːf/ | n | B2 | İnanç | Everyone has the right to their own beliefs. | Herkesin kendi inançlarına hakkı var. | faith |
celebrity | /səˈlebrəti/ | n | B2 | Ünlü kişi | Many celebrities attended the event. | Etkinliğe birçok ünlü katıldı. | star |
circumstance | /ˈsɜːkəmstəns/ | n | B2 | Koşul, durum | Under no circumstances should you open this door. | Hiçbir koşulda bu kapıyı açmamalısın. | condition | under the circumstances
commitment | /kəˈmɪtmənt/ | n | B2 | Bağlılık; taahhüt | Learning a language needs time and commitment. | Dil öğrenmek zaman ve bağlılık ister. | dedication |
confidence | /ˈkɒnfɪdəns/ | n | B2 | Özgüven; güven | She speaks with great confidence. | Büyük bir özgüvenle konuşuyor. | | self-confidence
conflict | /ˈkɒnflɪkt/ | n | B2 | Çatışma, anlaşmazlık | There is a conflict between the two departments. | İki departman arasında bir anlaşmazlık var. | disagreement |
contrast | /ˈkɒntrɑːst/ | n | B2 | Zıtlık, karşıtlık | There is a big contrast between the old and new parts of the city. | Şehrin eski ve yeni kısımları arasında büyük bir zıtlık var. | difference | in contrast
court | /kɔːt/ | n | B2 | Mahkeme; kort | The case will go to court next month. | Dava gelecek ay mahkemeye gidecek. | | tennis court
criticism | /ˈkrɪtɪsɪzəm/ | n | B2 | Eleştiri | He doesn't accept criticism well. | Eleştiriyi iyi karşılamaz. | |
decade | /ˈdekeɪd/ | n | B2 | On yıl | Prices have doubled in the last decade. | Fiyatlar son on yılda iki katına çıktı. | |
demand | /dɪˈmɑːnd/ | n | B2 | Talep | There is a high demand for nurses. | Hemşirelere yüksek talep var. | need | in demand
democracy | /dɪˈmɒkrəsi/ | n | B2 | Demokrasi | Free elections are important in a democracy. | Demokraside özgür seçimler önemlidir. | |
disaster | /dɪˈzɑːstə(r)/ | n | B2 | Felaket | The earthquake was a terrible disaster. | Deprem korkunç bir felaketti. | catastrophe | natural disaster
discipline | /ˈdɪsəplɪn/ | n | B2 | Disiplin | Success in sport needs discipline. | Sporda başarı disiplin gerektirir. | self-control |
element | /ˈelɪmənt/ | n | B2 | Öğe, unsur | Trust is an important element of friendship. | Güven, arkadaşlığın önemli bir unsurudur. | part; component |
emotion | /ɪˈməʊʃn/ | n | B2 | Duygu | He doesn't show his emotions. | Duygularını göstermez. | feeling |
era | /ˈɪərə/ | n | B2 | Çağ, dönem | We live in the digital era. | Dijital çağda yaşıyoruz. | age; period |
essay | /ˈeseɪ/ | n | B2 | Kompozisyon, deneme | I have to write an essay about climate change. | İklim değişikliği hakkında bir kompozisyon yazmam gerek. | composition |
existence | /ɪɡˈzɪstəns/ | n | B2 | Varoluş, varlık | Do you believe in the existence of ghosts? | Hayaletlerin varlığına inanıyor musun? | |
expectation | /ˌekspekˈteɪʃn/ | n | B2 | Beklenti | The hotel was beyond our expectations. | Otel beklentilerimizin ötesindeydi. | hope | meet expectations
facility | /fəˈsɪləti/ | n | B2 | Tesis, imkân | The hotel has excellent sports facilities. | Otelin mükemmel spor tesisleri var. | amenity |
generation | /ˌdʒenəˈreɪʃn/ | n | B2 | Nesil, kuşak | Young generations use technology differently. | Genç nesiller teknolojiyi farklı kullanıyor. | |
guidance | /ˈɡaɪdns/ | n | B2 | Rehberlik, yol gösterme | Students need guidance when choosing a career. | Öğrenciler meslek seçerken rehberliğe ihtiyaç duyar. | advice |
identity | /aɪˈdentəti/ | n | B2 | Kimlik | Please show some proof of identity. | Lütfen kimlik kanıtı gösterin. | | identity card
impression | /ɪmˈpreʃn/ | n | B2 | İzlenim | She made a good impression at the interview. | Mülakatta iyi bir izlenim bıraktı. | | first impression
incident | /ˈɪnsɪdənt/ | n | B2 | Olay, vaka | The police are investigating the incident. | Polis olayı soruşturuyor. | event |
independence | /ˌɪndɪˈpendəns/ | n | B2 | Bağımsızlık | Teenagers want more independence. | Gençler daha fazla bağımsızlık istiyor. | freedom |
institution | /ˌɪnstɪˈtjuːʃn/ | n | B2 | Kurum | The university is a respected institution. | Üniversite saygın bir kurumdur. | organization |
insurance | /ɪnˈʃʊərəns/ | n | B2 | Sigorta | Do you have health insurance? | Sağlık sigortan var mı? | cover | health insurance
intention | /ɪnˈtenʃn/ | n | B2 | Niyet | I have no intention of leaving. | Ayrılmaya hiç niyetim yok. | plan |
justice | /ˈdʒʌstɪs/ | n | B2 | Adalet | The victims want justice. | Mağdurlar adalet istiyor. | fairness |
literature | /ˈlɪtrətʃə(r)/ | n | B2 | Edebiyat | She studied English literature. | İngiliz edebiyatı okudu. | |
majority | /məˈdʒɒrəti/ | n | B2 | Çoğunluk | The majority of students passed the exam. | Öğrencilerin çoğunluğu sınavı geçti. | most | the vast majority
mission | /ˈmɪʃn/ | n | B2 | Görev, misyon | Their mission is to help homeless people. | Görevleri evsizlere yardım etmek. | task |
motivation | /ˌməʊtɪˈveɪʃn/ | n | B2 | Motivasyon | I need some motivation to study. | Ders çalışmak için biraz motivasyona ihtiyacım var. | drive |
myth | /mɪθ/ | n | B2 | Efsane; yanlış inanış | It's a myth that goldfish have three-second memories. | Japon balıklarının üç saniyelik hafızası olduğu bir efsane. | legend |
occasion | /əˈkeɪʒn/ | n | B2 | Vesile, özel gün | We only use these plates on special occasions. | Bu tabakları yalnızca özel günlerde kullanırız. | event |
opponent | /əˈpəʊnənt/ | n | B2 | Rakip | She beat her opponent in two sets. | Rakibini iki sette yendi. | rival |
origin | /ˈɒrɪdʒɪn/ | n | B2 | Köken, kaynak | What is the origin of this word? | Bu kelimenin kökeni ne? | source |
passion | /ˈpæʃn/ | n | B2 | Tutku | Music is his greatest passion. | Müzik onun en büyük tutkusu. | love |
personality | /ˌpɜːsəˈnæləti/ | n | B2 | Kişilik | She has a strong personality. | Güçlü bir kişiliği var. | character |
phase | /feɪz/ | n | B2 | Evre, aşama | The project is now in its final phase. | Proje şu anda son aşamasında. | stage |
poverty | /ˈpɒvəti/ | n | B2 | Yoksulluk | Millions of people live in poverty. | Milyonlarca insan yoksulluk içinde yaşıyor. | |
presence | /ˈprezns/ | n | B2 | Varlık, mevcudiyet | Your presence at the meeting is important. | Toplantıda bulunman önemli. | |
procedure | /prəˈsiːdʒə(r)/ | n | B2 | Prosedür, işlem | Follow the safety procedures carefully. | Güvenlik prosedürlerini dikkatle uygula. | process |
profession | /prəˈfeʃn/ | n | B2 | Meslek | Teaching is a demanding profession. | Öğretmenlik zahmetli bir meslektir. | occupation |
proof | /pruːf/ | n | B2 | Kanıt | Do you have any proof? | Herhangi bir kanıtın var mı? | evidence |
prospect | /ˈprɒspekt/ | n | B2 | Olasılık, beklenti | The prospect of a long winter depressed me. | Uzun bir kış olasılığı beni karamsar yaptı. | possibility | job prospects
protest | /ˈprəʊtest/ | n | B2 | Protesto | Thousands joined the protest in the square. | Binlerce kişi meydandaki protestoya katıldı. | demonstration |
psychology | /saɪˈkɒlədʒi/ | n | B2 | Psikoloji | She is studying psychology at university. | Üniversitede psikoloji okuyor. | |
reference | /ˈrefrəns/ | n | B2 | Referans, atıf | My old boss wrote me a reference. | Eski patronum bana bir referans mektubu yazdı. | | with reference to
reputation | /ˌrepjuˈteɪʃn/ | n | B2 | İtibar, ün | The restaurant has an excellent reputation. | Restoranın mükemmel bir ünü var. | name |
requirement | /rɪˈkwaɪəmənt/ | n | B2 | Gereklilik, şart | A degree is a requirement for this job. | Bu iş için üniversite diploması şart. | condition |
resource | /rɪˈsɔːs/ | n | B2 | Kaynak | We must use our natural resources wisely. | Doğal kaynaklarımızı akıllıca kullanmalıyız. | supply |
response | /rɪˈspɒns/ | n | B2 | Yanıt, tepki | I'm still waiting for a response. | Hâlâ bir yanıt bekliyorum. | reply; answer |
responsibility | /rɪˌspɒnsəˈbɪləti/ | n | B2 | Sorumluluk | Taking care of a pet is a big responsibility. | Bir evcil hayvana bakmak büyük bir sorumluluktur. | duty | take responsibility
revolution | /ˌrevəˈluːʃn/ | n | B2 | Devrim | The internet started a revolution in communication. | İnternet iletişimde bir devrim başlattı. | |
routine | /ruːˈtiːn/ | n | B2 | Rutin | Exercise is part of my daily routine. | Egzersiz günlük rutinimin bir parçası. | habit | daily routine
scale | /skeɪl/ | n | B2 | Ölçek; boyut | The scale of the problem is huge. | Sorunun boyutu çok büyük. | size | on a large scale
shortage | /ˈʃɔːtɪdʒ/ | n | B2 | Kıtlık, eksiklik | There is a shortage of doctors in rural areas. | Kırsal bölgelerde doktor eksikliği var. | lack |
strength | /streŋθ/ | n | B2 | Güç, kuvvet; güçlü yön | Patience is one of her strengths. | Sabır, onun güçlü yönlerinden biri. | power |
survey | /ˈsɜːveɪ/ | n | B2 | Anket | According to a survey, most people work too much. | Bir ankete göre çoğu insan fazla çalışıyor. | poll |
sympathy | /ˈsɪmpəθi/ | n | B2 | Duygudaşlık, acıma | I have a lot of sympathy for him. | Ona karşı büyük bir duygudaşlık hissediyorum. | compassion |
tension | /ˈtenʃn/ | n | B2 | Gerginlik | You could feel the tension in the room. | Odadaki gerginlik hissediliyordu. | stress |
threat | /θret/ | n | B2 | Tehdit | Pollution is a serious threat to wildlife. | Kirlilik yaban hayatı için ciddi bir tehdit. | danger |
tragedy | /ˈtrædʒədi/ | n | B2 | Trajedi, facia | The accident was a terrible tragedy. | Kaza korkunç bir faciaydı. | disaster |
victim | /ˈvɪktɪm/ | n | B2 | Kurban, mağdur | The victims of the flood need help. | Sel mağdurlarının yardıma ihtiyacı var. | |
violence | /ˈvaɪələns/ | n | B2 | Şiddet | There is too much violence on TV. | Televizyonda çok fazla şiddet var. | |
vision | /ˈvɪʒn/ | n | B2 | Vizyon; görme | The company has a clear vision for the future. | Şirketin gelecek için net bir vizyonu var. | | vision for the future
volunteer | /ˌvɒlənˈtɪə(r)/ | n | B2 | Gönüllü | Volunteers cleaned the beach on Sunday. | Gönüllüler pazar günü plajı temizledi. | |
witness | /ˈwɪtnəs/ | n | B2 | Tanık | The witness saw the car hit the tree. | Tanık arabanın ağaca çarptığını gördü. | |
# ── Sıfatlar ──
abstract | /ˈæbstrækt/ | adj | B2 | Soyut | Love is an abstract idea. | Aşk soyut bir kavramdır. | theoretical | abstract art
accessible | /əkˈsesəbl/ | adj | B2 | Erişilebilir, ulaşılabilir | The museum is accessible to wheelchair users. | Müze tekerlekli sandalye kullananlar için erişilebilir. | available |
adequate | /ˈædɪkwət/ | adj | B2 | Yeterli | The pay is adequate but not great. | Maaş yeterli ama harika değil. | sufficient |
aggressive | /əˈɡresɪv/ | adj | B2 | Saldırgan | The dog became aggressive when we came near. | Yaklaşınca köpek saldırganlaştı. | hostile |
alternative | /ɔːlˈtɜːnətɪv/ | adj | B2 | Alternatif, başka | We need to find an alternative route. | Alternatif bir yol bulmamız gerek. | other | alternative energy
annual | /ˈænjuəl/ | adj | B2 | Yıllık | The annual festival takes place in June. | Yıllık festival haziranda yapılıyor. | yearly | annual report
apparent | /əˈpærənt/ | adj | B2 | Açık, belli | It became apparent that he was lying. | Yalan söylediği belli oldu. | obvious |
appropriate | /əˈprəʊpriət/ | adj | B2 | Uygun | Jeans are not appropriate for a wedding. | Kot pantolon düğün için uygun değil. | suitable |
aware | /əˈweə(r)/ | adj | B2 | Farkında | Are you aware of the risks? | Risklerin farkında mısın? | conscious | be aware of
capable | /ˈkeɪpəbl/ | adj | B2 | Yetenekli, muktedir | She is capable of running the company alone. | Şirketi tek başına yönetebilecek yetenekte. | able | capable of
casual | /ˈkæʒuəl/ | adj | B2 | Gündelik, rahat | We wear casual clothes on Fridays. | Cuma günleri gündelik kıyafetler giyiyoruz. | informal |
competitive | /kəmˈpetətɪv/ | adj | B2 | Rekabetçi | The job market is very competitive. | İş piyasası çok rekabetçi. | | competitive price
complicated | /ˈkɒmplɪkeɪtɪd/ | adj | B2 | Karmaşık | The instructions are too complicated. | Talimatlar çok karmaşık. | complex |
concerned | /kənˈsɜːnd/ | adj | B2 | Endişeli; ilgili | I'm concerned about my father's health. | Babamın sağlığı için endişeliyim. | worried | concerned about
conscious | /ˈkɒnʃəs/ | adj | B2 | Bilinçli, farkında | She is very conscious of her diet. | Beslenmesi konusunda çok bilinçli. | aware |
considerable | /kənˈsɪdərəbl/ | adj | B2 | Hatırı sayılır, önemli ölçüde | The project cost a considerable amount of money. | Proje hatırı sayılır miktarda paraya mal oldu. | significant |
conventional | /kənˈvenʃənl/ | adj | B2 | Geleneksel, alışılagelmiş | He prefers conventional methods of teaching. | Geleneksel öğretim yöntemlerini tercih ediyor. | traditional |
critical | /ˈkrɪtɪkl/ | adj | B2 | Eleştirel; kritik | This is a critical moment for the company. | Bu, şirket için kritik bir an. | crucial | critical thinking
decent | /ˈdiːsnt/ | adj | B2 | Düzgün, makul | He earns a decent salary. | Makul bir maaş alıyor. | reasonable |
deliberate | /dɪˈlɪbərət/ | adj | B2 | Kasıtlı | It wasn't an accident; it was deliberate. | Kaza değildi; kasıtlıydı. | intentional |
dependent | /dɪˈpendənt/ | adj | B2 | Bağımlı | The country is dependent on tourism. | Ülke turizme bağımlı. | reliant | dependent on
desperate | /ˈdespərət/ | adj | B2 | Çaresiz; çok istekli | They were desperate for water. | Suya çaresizce ihtiyaç duyuyorlardı. | hopeless |
distant | /ˈdɪstənt/ | adj | B2 | Uzak | We could hear distant thunder. | Uzaktan gök gürültüsü duyabiliyorduk. | far |
domestic | /dəˈmestɪk/ | adj | B2 | Yurt içi; ev içi | We took a domestic flight to Izmir. | İzmir'e iç hat uçuşuyla gittik. | | domestic flight
dramatic | /drəˈmætɪk/ | adj | B2 | Çarpıcı, dramatik | There has been a dramatic increase in prices. | Fiyatlarda çarpıcı bir artış oldu. | striking |
eager | /ˈiːɡə(r)/ | adj | B2 | İstekli, hevesli | The students were eager to learn. | Öğrenciler öğrenmeye hevesliydi. | keen |
economic | /ˌiːkəˈnɒmɪk/ | adj | B2 | Ekonomik (ekonomiyle ilgili) | The country is facing economic problems. | Ülke ekonomik sorunlarla karşı karşıya. | financial | economic growth
effective | /ɪˈfektɪv/ | adj | B2 | Etkili | This medicine is very effective. | Bu ilaç çok etkili. | successful |
elderly | /ˈeldəli/ | adj | B2 | Yaşlı | She looks after her elderly parents. | Yaşlı anne babasına bakıyor. | old |
emotional | /ɪˈməʊʃənl/ | adj | B2 | Duygusal | It was a very emotional goodbye. | Çok duygusal bir vedaydı. | | emotional support
essential | /ɪˈsenʃl/ | adj | B2 | Gerekli, temel | Water is essential for life. | Su yaşam için gereklidir. | vital |
extraordinary | /ɪkˈstrɔːdnri/ | adj | B2 | Olağanüstü | She has an extraordinary voice. | Olağanüstü bir sesi var. | remarkable |
fascinating | /ˈfæsɪneɪtɪŋ/ | adj | B2 | Büyüleyici | The documentary was fascinating. | Belgesel büyüleyiciydi. | captivating |
frequent | /ˈfriːkwənt/ | adj | B2 | Sık | There are frequent trains to the airport. | Havalimanına sık tren seferi var. | regular |
genuine | /ˈdʒenjuɪn/ | adj | B2 | Gerçek, samimi | Is this a genuine leather bag? | Bu gerçek deri bir çanta mı? | real |
incredible | /ɪnˈkredəbl/ | adj | B2 | İnanılmaz | The view from the top was incredible. | Tepeden manzara inanılmazdı. | amazing |
initial | /ɪˈnɪʃl/ | adj | B2 | İlk, başlangıçtaki | My initial reaction was surprise. | İlk tepkim şaşkınlıktı. | first |
intense | /ɪnˈtens/ | adj | B2 | Yoğun, şiddetli | The heat was intense in July. | Temmuzda sıcak çok yoğundu. | strong |
internal | /ɪnˈtɜːnl/ | adj | B2 | İç, dahili | This is an internal company document. | Bu şirket içi bir belge. | inner |
logical | /ˈlɒdʒɪkl/ | adj | B2 | Mantıklı | There must be a logical explanation. | Mantıklı bir açıklaması olmalı. | reasonable |
loyal | /ˈlɔɪəl/ | adj | B2 | Sadık | Dogs are very loyal animals. | Köpekler çok sadık hayvanlardır. | faithful |
mental | /ˈmentl/ | adj | B2 | Zihinsel, ruhsal | Sleep is important for mental health. | Uyku ruh sağlığı için önemlidir. | psychological | mental health
minor | /ˈmaɪnə(r)/ | adj | B2 | Küçük, önemsiz | It was only a minor problem. | Sadece küçük bir sorundu. | small |
moral | /ˈmɒrəl/ | adj | B2 | Ahlaki | It's a moral question, not a legal one. | Bu yasal değil, ahlaki bir soru. | ethical |
mutual | /ˈmjuːtʃuəl/ | adj | B2 | Karşılıklı, ortak | They met through a mutual friend. | Ortak bir arkadaş aracılığıyla tanıştılar. | shared | mutual respect
negative | /ˈneɡətɪv/ | adj | B2 | Olumsuz | Don't be so negative! | Bu kadar olumsuz olma! | | negative effect
numerous | /ˈnjuːmərəs/ | adj | B2 | Çok sayıda | I have told him numerous times. | Ona defalarca söyledim. | many |
outstanding | /aʊtˈstændɪŋ/ | adj | B2 | Olağanüstü, seçkin | She is an outstanding student. | Seçkin bir öğrenci. | excellent |
overall | /ˌəʊvərˈɔːl/ | adj | B2 | Genel, toplam | The overall cost of the project was high. | Projenin toplam maliyeti yüksekti. | total |
permanent | /ˈpɜːmənənt/ | adj | B2 | Kalıcı, sürekli | She is looking for a permanent job. | Kalıcı bir iş arıyor. | lasting |
precious | /ˈpreʃəs/ | adj | B2 | Değerli, kıymetli | Time with family is precious. | Aileyle geçen zaman çok kıymetli. | valuable |
previous | /ˈpriːviəs/ | adj | B2 | Önceki | In my previous job, I worked from home. | Önceki işimde evden çalışıyordum. | former |
primary | /ˈpraɪməri/ | adj | B2 | Birincil, temel | Our primary goal is safety. | Birincil hedefimiz güvenlik. | main | primary school
proper | /ˈprɒpə(r)/ | adj | B2 | Doğru düzgün, uygun | You need proper shoes for hiking. | Doğa yürüyüşü için uygun ayakkabıya ihtiyacın var. | suitable |
rapid | /ˈræpɪd/ | adj | B2 | Hızlı | The city has seen rapid growth. | Şehir hızlı bir büyüme yaşadı. | fast; quick |
reasonable | /ˈriːznəbl/ | adj | B2 | Makul, mantıklı | The prices here are very reasonable. | Buradaki fiyatlar çok makul. | fair |
remarkable | /rɪˈmɑːkəbl/ | adj | B2 | Dikkate değer | She made remarkable progress this year. | Bu yıl dikkate değer bir ilerleme kaydetti. | extraordinary |
remote | /rɪˈməʊt/ | adj | B2 | Uzak, ücra | They live in a remote village. | Ücra bir köyde yaşıyorlar. | isolated | remote work
rough | /rʌf/ | adj | B2 | Pürüzlü; kaba; yaklaşık | I have a rough idea of the cost. | Maliyet hakkında kabaca bir fikrim var. | approximate |
rural | /ˈrʊərəl/ | adj | B2 | Kırsal | Life in rural areas is slower. | Kırsal bölgelerde hayat daha yavaş. | country |
secure | /sɪˈkjʊə(r)/ | adj | B2 | Güvenli, emniyetli | Make sure your password is secure. | Şifrenin güvenli olduğundan emin ol. | safe |
severe | /sɪˈvɪə(r)/ | adj | B2 | Şiddetli, ağır | There was severe flooding in the north. | Kuzeyde şiddetli sel vardı. | serious |
solid | /ˈsɒlɪd/ | adj | B2 | Katı; sağlam | The table is made of solid wood. | Masa masif ahşaptan yapılmış. | firm |
steady | /ˈstedi/ | adj | B2 | Düzenli, istikrarlı | He has a steady job. | İstikrarlı bir işi var. | stable |
temporary | /ˈtemprəri/ | adj | B2 | Geçici | This is only a temporary solution. | Bu sadece geçici bir çözüm. | short-term |
unique | /juˈniːk/ | adj | B2 | Eşsiz, benzersiz | Every person is unique. | Her insan eşsizdir. | one of a kind |
urban | /ˈɜːbən/ | adj | B2 | Kentsel | Urban areas are often polluted. | Kentsel alanlar genellikle kirlidir. | city |
vague | /veɪɡ/ | adj | B2 | Belirsiz, muğlak | He gave a vague answer. | Belirsiz bir cevap verdi. | unclear |
visible | /ˈvɪzəbl/ | adj | B2 | Görünür | The island is visible from the beach. | Ada plajdan görülebiliyor. | |
vital | /ˈvaɪtl/ | adj | B2 | Hayati, çok önemli | Exercise is vital for good health. | Egzersiz sağlık için hayati önem taşır. | essential |
# ── Zarflar ──
approximately | /əˈprɒksɪmətli/ | adv | B2 | Yaklaşık olarak | The flight takes approximately three hours. | Uçuş yaklaşık üç saat sürüyor. | about; roughly |
basically | /ˈbeɪsɪkli/ | adv | B2 | Temelde, kısacası | Basically, we need more time. | Kısacası, daha fazla zamana ihtiyacımız var. | essentially |
consequently | /ˈkɒnsɪkwəntli/ | adv | B2 | Sonuç olarak | He missed the bus and consequently was late. | Otobüsü kaçırdı ve sonuç olarak geç kaldı. | therefore |
deliberately | /dɪˈlɪbərətli/ | adv | B2 | Kasıtlı olarak | He deliberately ignored my message. | Mesajımı kasıtlı olarak görmezden geldi. | on purpose |
entirely | /ɪnˈtaɪəli/ | adv | B2 | Tamamen | I entirely agree with you. | Sana tamamen katılıyorum. | completely |
frequently | /ˈfriːkwəntli/ | adv | B2 | Sık sık | She frequently travels for work. | İş için sık sık seyahat ediyor. | often |
furthermore | /ˌfɜːðəˈmɔː(r)/ | adv | B2 | Ayrıca, bundan başka | The hotel is cheap. Furthermore, it's close to the beach. | Otel ucuz. Ayrıca plaja yakın. | moreover |
increasingly | /ɪnˈkriːsɪŋli/ | adv | B2 | Giderek artan şekilde | It's becoming increasingly difficult to find a flat. | Daire bulmak giderek zorlaşıyor. | more and more |
meanwhile | /ˈmiːnwaɪl/ | adv | B2 | Bu arada | I'll cook dinner. Meanwhile, you can set the table. | Ben yemeği pişireyim. Bu arada sen sofrayı kurabilirsin. | in the meantime |
obviously | /ˈɒbviəsli/ | adv | B2 | Belli ki, tabii ki | Obviously, I can't come if I'm ill. | Hastaysam tabii ki gelemem. | clearly |
occasionally | /əˈkeɪʒnəli/ | adv | B2 | Ara sıra | We occasionally go to the theatre. | Ara sıra tiyatroya gideriz. | sometimes |
relatively | /ˈrelətɪvli/ | adv | B2 | Nispeten | The exam was relatively easy. | Sınav nispeten kolaydı. | fairly |
roughly | /ˈrʌfli/ | adv | B2 | Kabaca, yaklaşık | There were roughly fifty people at the party. | Partide kabaca elli kişi vardı. | approximately |
significantly | /sɪɡˈnɪfɪkəntli/ | adv | B2 | Önemli ölçüde | Prices have risen significantly. | Fiyatlar önemli ölçüde arttı. | considerably |
thus | /ðʌs/ | adv | B2 | Böylece, bu nedenle | He was ill and thus unable to work. | Hastaydı ve bu nedenle çalışamıyordu. | therefore |
`),
  ...parseVocab('business', `
budget cut | /ˈbʌdʒɪt kʌt/ | n | B2 | Bütçe kesintisi | The school faces serious budget cuts. | Okul ciddi bütçe kesintileriyle karşı karşıya. | | make budget cuts
invest | /ɪnˈvest/ | v | B2 | Yatırım yapmak | He invested his savings in property. | Birikimlerini gayrimenkule yatırdı. | | invest in
economy | /ɪˈkɒnəmi/ | n | B2 | Ekonomi | Tourism is important for the local economy. | Turizm yerel ekonomi için önemli. | | global economy
finance | /ˈfaɪnæns/ | n | B2 | Finans, maliye | She works in finance. | Finans sektöründe çalışıyor. | money |
goods | /ɡʊdz/ | n | B2 | Mal, eşya | The shop sells goods from all over the world. | Dükkân dünyanın her yerinden mal satıyor. | products |
debt | /det/ | n | B2 | Borç | They are trying to pay off their debts. | Borçlarını ödemeye çalışıyorlar. | | in debt
inflation | /ɪnˈfleɪʃn/ | n | B2 | Enflasyon | Inflation makes everything more expensive. | Enflasyon her şeyi daha pahalı hale getiriyor. | |
unemployment | /ˌʌnɪmˈplɔɪmənt/ | n | B2 | İşsizlik | Unemployment is high among young people. | Gençler arasında işsizlik yüksek. | |
manufacture | /ˌmænjuˈfæktʃə(r)/ | v | B2 | Üretmek, imal etmek | The company manufactures furniture. | Şirket mobilya üretiyor. | produce |
campaign | /kæmˈpeɪn/ | n | B2 | Kampanya | They started an advertising campaign. | Bir reklam kampanyası başlattılar. | | election campaign
handle | /ˈhændl/ | v | B2 | Halletmek, ele almak | She handles complaints very professionally. | Şikâyetleri çok profesyonelce ele alıyor. | deal with; manage |
`),
  ...parseVocab('academic', `
analysis | /əˈnæləsɪs/ | n | B2 | Analiz, çözümleme | We need a detailed analysis of the data. | Verilerin ayrıntılı bir analizine ihtiyacımız var. | examination |
aspect | /ˈæspekt/ | n | B2 | Yön, açı | Money is only one aspect of the problem. | Para, sorunun yalnızca bir yönü. | side; feature |
mechanism | /ˈmekənɪzəm/ | n | B2 | Mekanizma | The clock has a simple mechanism. | Saatin basit bir mekanizması var. | system |
substance | /ˈsʌbstəns/ | n | B2 | Madde | Water is a common substance. | Su yaygın bir maddedir. | material |
`),
  ...parseVocab('emotions', `
anxiety | /æŋˈzaɪəti/ | n | B2 | Kaygı, endişe | Many students suffer from exam anxiety. | Birçok öğrenci sınav kaygısı yaşıyor. | worry |
guilt | /ɡɪlt/ | n | B2 | Suçluluk duygusu | He felt a lot of guilt after the argument. | Tartışmadan sonra büyük bir suçluluk duydu. | shame |
sincere | /sɪnˈsɪə(r)/ | adj | B2 | İçten, samimi | Please accept my sincere apologies. | Lütfen içten özürlerimi kabul edin. | genuine; honest |
`),
  ...parseVocab('nature', `
landscape | /ˈlændskeɪp/ | n | B2 | Manzara, peyzaj | The landscape in Cappadocia is unique. | Kapadokya'nın manzarası eşsizdir. | scenery |
`),
  ...parseVocab('travel', `
carousel | /ˌkærəˈsel/ | n | B2 | Bagaj bandı; atlıkarınca | Our bags came out on carousel 4. | Bavullarımız 4 numaralı bantta çıktı. | baggage belt | baggage carousel
checkpoint | /ˈtʃekpɔɪnt/ | n | B2 | Kontrol noktası | We had to stop at a security checkpoint. | Bir güvenlik kontrol noktasında durmak zorunda kaldık. | | security checkpoint
`),
  ...parseVocab('daily', `
compliment | /ˈkɒmplɪmənt/ | n | B2 | İltifat | Thank you for the compliment! | İltifatın için teşekkürler! | praise | pay a compliment
`),
];
