import { parseVocab } from './parse';

// Çekirdek kelimeler (A1–B1): günlük hayatta en sık karşılaşılan fiil, isim, sıfat ve zarflar.
export const CORE = parseVocab('core', `
# ── Fiiller ──
accept | /əkˈsept/ | v | B1 | Kabul etmek | She decided to accept the job offer. | İş teklifini kabul etmeye karar verdi. | agree to; take | accept an offer; accept responsibility
agree | /əˈɡriː/ | v | A2 | Katılmak, aynı fikirde olmak | I agree with you completely. | Sana tamamen katılıyorum. | concur | agree with someone; agree on something
allow | /əˈlaʊ/ | v | B1 | İzin vermek | My parents allow me to stay out late on Fridays. | Ailem cuma günleri geç saate kadar dışarıda kalmama izin veriyor. | permit; let | allow someone to do
answer | /ˈɑːnsə(r)/ | v | A1 | Cevaplamak | Please answer the question. | Lütfen soruyu cevapla. | reply; respond | answer the phone; answer a question
appear | /əˈpɪə(r)/ | v | B1 | Görünmek, ortaya çıkmak | A strange light appeared in the sky. | Gökyüzünde garip bir ışık belirdi. | emerge; show up | appear to be
arrive | /əˈraɪv/ | v | A2 | Varmak, ulaşmak | We arrived at the hotel at midnight. | Otele gece yarısı vardık. | reach; get to | arrive at; arrive in
avoid | /əˈvɔɪd/ | v | B1 | Kaçınmak, sakınmak | Try to avoid sugary drinks. | Şekerli içeceklerden kaçınmaya çalış. | stay away from | avoid doing something
believe | /bɪˈliːv/ | v | A2 | İnanmak | I can't believe it's already October. | Şimdiden ekim olduğuna inanamıyorum. | trust; think | believe in
belong | /bɪˈlɒŋ/ | v | B1 | Ait olmak | This bag belongs to my sister. | Bu çanta kız kardeşime ait. | | belong to
bring | /brɪŋ/ | v | A1 | Getirmek | Can you bring some water? | Biraz su getirebilir misin? | fetch | bring something back
build | /bɪld/ | v | A2 | İnşa etmek, kurmak | They want to build a new bridge. | Yeni bir köprü inşa etmek istiyorlar. | construct | build a house; build trust
carry | /ˈkæri/ | v | A2 | Taşımak | I can carry your bag for you. | Çantanı senin için taşıyabilirim. | hold; bring | carry out
catch | /kætʃ/ | v | A2 | Yakalamak; (otobüs vb.) yetişmek | We need to catch the last bus. | Son otobüse yetişmemiz gerek. | grab | catch a cold; catch a bus
cause | /kɔːz/ | v | B1 | Neden olmak | The storm caused a lot of damage. | Fırtına büyük hasara neden oldu. | lead to; result in | cause a problem
change | /tʃeɪndʒ/ | v | A1 | Değiştirmek, değişmek | I want to change my password. | Şifremi değiştirmek istiyorum. | alter; modify | change your mind
choose | /tʃuːz/ | v | A2 | Seçmek | You can choose any seat you like. | İstediğin herhangi bir koltuğu seçebilirsin. | pick; select | choose between
collect | /kəˈlekt/ | v | A2 | Toplamak, biriktirmek | My son likes to collect stamps. | Oğlum pul biriktirmeyi seviyor. | gather | collect data; collect money
compare | /kəmˈpeə(r)/ | v | B1 | Karşılaştırmak | Always compare prices before you buy. | Satın almadan önce her zaman fiyatları karşılaştır. | contrast | compare with
contain | /kənˈteɪn/ | v | B1 | İçermek | This drink contains a lot of sugar. | Bu içecek çok şeker içeriyor. | include; hold |
continue | /kənˈtɪnjuː/ | v | A2 | Devam etmek | Please continue reading. | Lütfen okumaya devam et. | carry on; go on |
create | /kriˈeɪt/ | v | A2 | Yaratmak, oluşturmak | She wants to create her own website. | Kendi web sitesini oluşturmak istiyor. | make; design | create a plan; create jobs
deliver | /dɪˈlɪvə(r)/ | v | B1 | Teslim etmek | They deliver pizza until midnight. | Gece yarısına kadar pizza teslim ediyorlar. | bring; supply | deliver a package; deliver a speech
depend | /dɪˈpend/ | v | B1 | Bağlı olmak | It depends on the weather. | Havaya bağlı. | rely | depend on
describe | /dɪˈskraɪb/ | v | A2 | Tarif etmek, betimlemek | Can you describe the man you saw? | Gördüğün adamı tarif edebilir misin? | explain; portray |
destroy | /dɪˈstrɔɪ/ | v | B1 | Yok etmek, mahvetmek | The fire destroyed the old building. | Yangın eski binayı yok etti. | ruin; wreck |
develop | /dɪˈveləp/ | v | B1 | Geliştirmek, gelişmek | The company plans to develop a new app. | Şirket yeni bir uygulama geliştirmeyi planlıyor. | grow; build | develop skills
disappear | /ˌdɪsəˈpɪə(r)/ | v | B1 | Kaybolmak, gözden kaybolmak | The cat disappeared under the bed. | Kedi yatağın altında gözden kayboldu. | vanish |
discover | /dɪˈskʌvə(r)/ | v | B1 | Keşfetmek | Scientists discovered a new species. | Bilim insanları yeni bir tür keşfetti. | find; uncover |
discuss | /dɪˈskʌs/ | v | B1 | Tartışmak, görüşmek | We need to discuss the plan. | Planı görüşmemiz gerekiyor. | talk about | discuss a problem
encourage | /ɪnˈkʌrɪdʒ/ | v | B1 | Cesaretlendirmek, teşvik etmek | My teacher encouraged me to write. | Öğretmenim beni yazmaya teşvik etti. | support; motivate | encourage someone to do
enjoy | /ɪnˈdʒɔɪ/ | v | A1 | Keyif almak, tadını çıkarmak | Enjoy your meal! | Afiyet olsun! | like; love | enjoy yourself
escape | /ɪˈskeɪp/ | v | B1 | Kaçmak, kurtulmak | The bird escaped from its cage. | Kuş kafesinden kaçtı. | flee; get away |
expect | /ɪkˈspekt/ | v | A2 | Beklemek, ummak | I expect him to call tonight. | Bu akşam aramasını bekliyorum. | anticipate | expect something to happen
fail | /feɪl/ | v | B1 | Başarısız olmak; (sınavdan) kalmak | Don't worry if you fail at first. | İlk başta başarısız olursan endişelenme. | | fail an exam; fail to do
fill | /fɪl/ | v | A2 | Doldurmak | Please fill the glass with water. | Lütfen bardağı suyla doldur. | | fill in a form
follow | /ˈfɒləʊ/ | v | A2 | Takip etmek, izlemek | Follow me, I know the way. | Beni takip et, yolu biliyorum. | | follow the rules; follow instructions
forgive | /fəˈɡɪv/ | v | B1 | Affetmek | Please forgive me for being late. | Lütfen geç kaldığım için beni affet. | pardon; excuse |
gain | /ɡeɪn/ | v | B1 | Kazanmak, elde etmek | You will gain experience in this job. | Bu işte deneyim kazanacaksın. | get; obtain | gain weight; gain experience
grow | /ɡrəʊ/ | v | A2 | Büyümek, yetiştirmek | We grow tomatoes in our garden. | Bahçemizde domates yetiştiriyoruz. | increase; raise | grow up
guess | /ɡes/ | v | A2 | Tahmin etmek | Can you guess my age? | Yaşımı tahmin edebilir misin? | estimate |
happen | /ˈhæpən/ | v | A1 | Olmak, meydana gelmek | What happened yesterday? | Dün ne oldu? | occur; take place |
hide | /haɪd/ | v | A2 | Saklamak, saklanmak | The children like to hide behind the sofa. | Çocuklar kanepenin arkasına saklanmayı seviyor. | conceal |
hope | /həʊp/ | v | A2 | Umut etmek | I hope you feel better soon. | Umarım yakında daha iyi hissedersin. | wish | hope for
hurry | /ˈhʌri/ | v | A2 | Acele etmek | Hurry, the film is starting! | Acele et, film başlıyor! | rush | hurry up
imagine | /ɪˈmædʒɪn/ | v | A2 | Hayal etmek, düşünmek | Imagine living on a small island. | Küçük bir adada yaşadığını hayal et. | picture |
include | /ɪnˈkluːd/ | v | A2 | İçermek, dahil etmek | The price includes breakfast. | Fiyata kahvaltı dahil. | contain |
increase | /ɪnˈkriːs/ | v | B1 | Artmak, artırmak | Prices increase every year. | Fiyatlar her yıl artıyor. | rise; grow | increase sharply
introduce | /ˌɪntrəˈdjuːs/ | v | A2 | Tanıştırmak; tanıtmak | Let me introduce my friend Ali. | Arkadaşım Ali'yi tanıştırayım. | present | introduce yourself
invite | /ɪnˈvaɪt/ | v | A2 | Davet etmek | We want to invite you to dinner. | Seni yemeğe davet etmek istiyoruz. | ask | invite someone to
join | /dʒɔɪn/ | v | A2 | Katılmak | Would you like to join us? | Bize katılmak ister misin? | take part | join a club
keep | /kiːp/ | v | A2 | Tutmak, saklamak; devam etmek | Keep the receipt just in case. | Ne olur ne olmaz fişi sakla. | hold; retain | keep a secret; keep going
knock | /nɒk/ | v | B1 | (Kapıyı) çalmak, vurmak | Please knock before you come in. | Lütfen girmeden önce kapıyı çal. | tap | knock on the door
lead | /liːd/ | v | B1 | Önderlik etmek; götürmek | This road leads to the beach. | Bu yol plaja çıkıyor. | guide | lead to; lead a team
learn | /lɜːn/ | v | A1 | Öğrenmek | I want to learn Spanish. | İspanyolca öğrenmek istiyorum. | study | learn by heart
lose | /luːz/ | v | A2 | Kaybetmek | Don't lose your keys again! | Anahtarlarını yine kaybetme! | misplace | lose weight; lose a game
manage | /ˈmænɪdʒ/ | v | B1 | Yönetmek; başarmak, becermek | She manages a small team. | Küçük bir ekibi yönetiyor. | run; cope | manage to do
mention | /ˈmenʃn/ | v | B1 | Bahsetmek | He didn't mention the price. | Fiyattan bahsetmedi. | refer to | not to mention
miss | /mɪs/ | v | A2 | Özlemek; kaçırmak | I miss my family a lot. | Ailemi çok özlüyorum. | | miss the bus; miss someone
notice | /ˈnəʊtɪs/ | v | B1 | Fark etmek | Did you notice anything strange? | Garip bir şey fark ettin mi? | spot; see |
offer | /ˈɒfə(r)/ | v | A2 | Teklif etmek, sunmak | They offered me a cup of tea. | Bana bir fincan çay ikram ettiler. | provide | offer help
order | /ˈɔːdə(r)/ | v | A2 | Sipariş vermek; emretmek | Let's order a pizza. | Pizza sipariş edelim. | | order food online
own | /əʊn/ | v | B1 | Sahip olmak | They own a small farm. | Küçük bir çiftliğe sahipler. | possess; have |
pay | /peɪ/ | v | A1 | Ödemek | Can I pay by card? | Kartla ödeyebilir miyim? | | pay attention; pay a bill
perform | /pəˈfɔːm/ | v | B1 | Sahnelemek, icra etmek; yerine getirmek | The band will perform tonight. | Grup bu akşam sahne alacak. | play; carry out | perform well
plan | /plæn/ | v | A2 | Planlamak | We plan to travel in July. | Temmuzda seyahat etmeyi planlıyoruz. | arrange | plan ahead
prefer | /prɪˈfɜː(r)/ | v | A2 | Tercih etmek | I prefer tea to coffee. | Çayı kahveye tercih ederim. | favour | prefer A to B
prepare | /prɪˈpeə(r)/ | v | A2 | Hazırlamak, hazırlanmak | I need to prepare for the exam. | Sınava hazırlanmam gerekiyor. | get ready | prepare for
pretend | /prɪˈtend/ | v | B1 | -mış gibi yapmak | He pretended to be asleep. | Uyuyormuş gibi yaptı. | fake |
prevent | /prɪˈvent/ | v | B1 | Önlemek, engellemek | Washing your hands helps prevent illness. | Ellerini yıkamak hastalığı önlemeye yardımcı olur. | stop; avoid | prevent someone from
promise | /ˈprɒmɪs/ | v | A2 | Söz vermek | I promise I'll be on time. | Zamanında geleceğime söz veriyorum. | swear | keep a promise
protect | /prəˈtekt/ | v | B1 | Korumak | Sunscreen protects your skin. | Güneş kremi cildini korur. | guard; defend | protect from
prove | /pruːv/ | v | B1 | Kanıtlamak | Can you prove it? | Bunu kanıtlayabilir misin? | show; demonstrate |
provide | /prəˈvaɪd/ | v | B1 | Sağlamak, temin etmek | The hotel provides free towels. | Otel ücretsiz havlu sağlıyor. | supply; give | provide information
pull | /pʊl/ | v | A2 | Çekmek | Pull the door to open it. | Açmak için kapıyı çek. | drag; tug |
push | /pʊʃ/ | v | A2 | İtmek | Push the button to start. | Başlatmak için düğmeye bas. | press; shove |
reach | /riːtʃ/ | v | B1 | Ulaşmak, erişmek | We reached the top of the mountain. | Dağın zirvesine ulaştık. | arrive at; get to | reach a goal
realize | /ˈriːəlaɪz/ | v | B1 | Farkına varmak | I didn't realize it was so late. | Bu kadar geç olduğunun farkında değildim. | notice; understand |
receive | /rɪˈsiːv/ | v | A2 | Almak, teslim almak | Did you receive my email? | E-postamı aldın mı? | get | receive a message
recognize | /ˈrekəɡnaɪz/ | v | B1 | Tanımak | I didn't recognize you with short hair! | Kısa saçla seni tanıyamadım! | identify |
recommend | /ˌrekəˈmend/ | v | B1 | Tavsiye etmek | Can you recommend a good restaurant? | İyi bir restoran tavsiye edebilir misin? | suggest | highly recommend
reduce | /rɪˈdjuːs/ | v | B1 | Azaltmak | We should reduce plastic waste. | Plastik atığı azaltmalıyız. | cut; decrease | reduce costs
refuse | /rɪˈfjuːz/ | v | B1 | Reddetmek | She refused to answer. | Cevap vermeyi reddetti. | decline; reject |
relax | /rɪˈlæks/ | v | A2 | Rahatlamak, dinlenmek | I like to relax with a good book. | İyi bir kitapla rahatlamayı severim. | rest; unwind |
remove | /rɪˈmuːv/ | v | B1 | Çıkarmak, kaldırmak | Please remove your shoes. | Lütfen ayakkabılarınızı çıkarın. | take off; delete |
repair | /rɪˈpeə(r)/ | v | B1 | Tamir etmek | Can you repair my bike? | Bisikletimi tamir edebilir misin? | fix; mend |
repeat | /rɪˈpiːt/ | v | A2 | Tekrar etmek | Could you repeat that, please? | Bunu tekrar eder misiniz lütfen? | say again |
replace | /rɪˈpleɪs/ | v | B1 | Yerine koymak, değiştirmek | We need to replace the old battery. | Eski pili değiştirmemiz gerekiyor. | substitute; swap |
reply | /rɪˈplaɪ/ | v | A2 | Yanıt vermek | Please reply to my message. | Lütfen mesajıma yanıt ver. | answer; respond | reply to
respect | /rɪˈspekt/ | v | B1 | Saygı duymak | We must respect other cultures. | Diğer kültürlere saygı duymalıyız. | honour; value |
return | /rɪˈtɜːn/ | v | A2 | Geri dönmek; iade etmek | I will return the book tomorrow. | Kitabı yarın iade edeceğim. | come back; give back |
save | /seɪv/ | v | A2 | Kurtarmak; biriktirmek; kaydetmek | Don't forget to save your work. | Çalışmanı kaydetmeyi unutma. | rescue; keep | save money; save time
search | /sɜːtʃ/ | v | A2 | Aramak | I searched everywhere for my phone. | Telefonumu her yerde aradım. | look for | search for
seem | /siːm/ | v | A2 | Gibi görünmek | You seem tired today. | Bugün yorgun görünüyorsun. | appear; look |
share | /ʃeə(r)/ | v | A2 | Paylaşmak | Let's share the cake. | Pastayı paylaşalım. | divide | share with
shout | /ʃaʊt/ | v | A2 | Bağırmak | Please don't shout at me. | Lütfen bana bağırma. | yell; scream | shout at
solve | /sɒlv/ | v | B1 | Çözmek | We need to solve this problem quickly. | Bu sorunu hızla çözmemiz gerekiyor. | fix; resolve | solve a problem
spend | /spend/ | v | A2 | Harcamak; (zaman) geçirmek | I spend too much money on clothes. | Kıyafetlere çok fazla para harcıyorum. | | spend time
steal | /stiːl/ | v | B1 | Çalmak | Someone tried to steal my bike. | Biri bisikletimi çalmaya çalıştı. | rob; take |
succeed | /səkˈsiːd/ | v | B1 | Başarmak, başarılı olmak | If you work hard, you will succeed. | Çok çalışırsan başarılı olursun. | achieve; win | succeed in
suffer | /ˈsʌfə(r)/ | v | B1 | Acı çekmek, -den muzdarip olmak | Many people suffer from back pain. | Birçok insan sırt ağrısından muzdarip. | endure | suffer from
support | /səˈpɔːt/ | v | B1 | Desteklemek | My family always supports me. | Ailem beni her zaman destekler. | help; back |
suppose | /səˈpəʊz/ | v | B1 | Sanmak, varsaymak | I suppose you're right. | Sanırım haklısın. | assume; guess | be supposed to
surprise | /səˈpraɪz/ | v | A2 | Şaşırtmak | Let's surprise Mom with breakfast. | Annemizi kahvaltıyla şaşırtalım. | amaze |
survive | /səˈvaɪv/ | v | B1 | Hayatta kalmak | Plants cannot survive without water. | Bitkiler susuz hayatta kalamaz. | live through |
teach | /tiːtʃ/ | v | A1 | Öğretmek | Can you teach me to swim? | Bana yüzmeyi öğretir misin? | educate; train |
thank | /θæŋk/ | v | A1 | Teşekkür etmek | I want to thank you for your help. | Yardımın için sana teşekkür etmek istiyorum. | |
throw | /θrəʊ/ | v | A2 | Atmak, fırlatmak | Don't throw rubbish on the street. | Sokağa çöp atma. | toss | throw away
touch | /tʌtʃ/ | v | A2 | Dokunmak | Please don't touch the paintings. | Lütfen tablolara dokunmayın. | | keep in touch
translate | /trænsˈleɪt/ | v | A2 | Çevirmek (dil) | Can you translate this sentence? | Bu cümleyi çevirebilir misin? | | translate into
trust | /trʌst/ | v | B1 | Güvenmek | I trust you completely. | Sana tamamen güveniyorum. | rely on; believe |
understand | /ˌʌndəˈstænd/ | v | A1 | Anlamak | I don't understand this word. | Bu kelimeyi anlamıyorum. | get; comprehend |
wait | /weɪt/ | v | A1 | Beklemek | Please wait here. | Lütfen burada bekleyin. | | wait for
warn | /wɔːn/ | v | B1 | Uyarmak | I warned you about the ice. | Seni buz konusunda uyarmıştım. | alert; caution | warn someone about
waste | /weɪst/ | v | B1 | Boşa harcamak, israf etmek | Don't waste your time on that game. | Vaktini o oyuna harcama. | squander | waste money
wear | /weə(r)/ | v | A1 | Giymek, takmak | I usually wear jeans at weekends. | Hafta sonları genelde kot pantolon giyerim. | | wear glasses
win | /wɪn/ | v | A2 | Kazanmak | Our team wants to win the cup. | Takımımız kupayı kazanmak istiyor. | | win a prize
wish | /wɪʃ/ | v | A2 | Dilemek | I wish you a happy birthday! | Sana mutlu yıllar dilerim! | hope; want |
wonder | /ˈwʌndə(r)/ | v | B1 | Merak etmek | I wonder where she is now. | Şimdi nerede olduğunu merak ediyorum. | ask yourself |
worry | /ˈwʌri/ | v | A2 | Endişelenmek | Don't worry, everything will be fine. | Endişelenme, her şey yoluna girecek. | be anxious | worry about

# ── İsimler ──
ability | /əˈbɪləti/ | n | B1 | Yetenek, beceri | She has the ability to learn fast. | Hızlı öğrenme yeteneğine sahip. | skill; talent |
accident | /ˈæksɪdənt/ | n | A2 | Kaza | He had a car accident last year. | Geçen yıl araba kazası geçirdi. | crash | by accident
achievement | /əˈtʃiːvmənt/ | n | B1 | Başarı | Finishing the marathon was a great achievement. | Maratonu bitirmek büyük bir başarıydı. | success; accomplishment |
activity | /ækˈtɪvəti/ | n | A2 | Etkinlik, faaliyet | Swimming is my favourite activity. | Yüzme en sevdiğim etkinlik. | | outdoor activity
advantage | /ədˈvɑːntɪdʒ/ | n | B1 | Avantaj | Speaking English is a big advantage. | İngilizce konuşmak büyük bir avantaj. | benefit | take advantage of
adventure | /ədˈventʃə(r)/ | n | A2 | Macera | Our trip to Peru was a real adventure. | Peru gezimiz gerçek bir maceraydı. | |
amount | /əˈmaʊnt/ | n | B1 | Miktar | A large amount of money was stolen. | Büyük miktarda para çalındı. | quantity |
appointment | /əˈpɔɪntmənt/ | n | B1 | Randevu | I have a doctor's appointment at three. | Saat üçte doktor randevum var. | | make an appointment
argument | /ˈɑːɡjumənt/ | n | B1 | Tartışma; argüman | They had an argument about money. | Para yüzünden tartıştılar. | quarrel; fight | have an argument
attempt | /əˈtempt/ | n | B1 | Girişim, deneme | He passed the test on his first attempt. | Sınavı ilk denemesinde geçti. | try; effort |
attitude | /ˈætɪtjuːd/ | n | B1 | Tutum, tavır | She has a positive attitude to life. | Hayata karşı olumlu bir tavrı var. | outlook |
behaviour | /bɪˈheɪvjə(r)/ | n | B1 | Davranış | His behaviour at the party was strange. | Partideki davranışı tuhaftı. | conduct |
benefit | /ˈbenɪfɪt/ | n | B1 | Fayda, yarar | Exercise has many benefits. | Egzersizin birçok faydası var. | advantage |
career | /kəˈrɪə(r)/ | n | B1 | Kariyer | She wants a career in medicine. | Tıp alanında kariyer yapmak istiyor. | profession |
century | /ˈsentʃəri/ | n | A2 | Yüzyıl | This church was built in the 12th century. | Bu kilise 12. yüzyılda inşa edildi. | |
challenge | /ˈtʃælɪndʒ/ | n | B1 | Zorluk, meydan okuma | Learning a language is a big challenge. | Bir dil öğrenmek büyük bir zorluk. | difficulty | face a challenge
chance | /tʃɑːns/ | n | A2 | Şans, fırsat, ihtimal | Give me one more chance. | Bana bir şans daha ver. | opportunity | by chance
choice | /tʃɔɪs/ | n | A2 | Seçim, tercih | You made the right choice. | Doğru seçimi yaptın. | option | make a choice
community | /kəˈmjuːnəti/ | n | B1 | Topluluk | Our community has a new library. | Topluluğumuzun yeni bir kütüphanesi var. | society |
competition | /ˌkɒmpəˈtɪʃn/ | n | B1 | Yarışma; rekabet | She won a singing competition. | Bir şarkı yarışması kazandı. | contest |
condition | /kənˈdɪʃn/ | n | B1 | Durum, koşul | The car is in good condition. | Arabanın durumu iyi. | state | on condition that
conversation | /ˌkɒnvəˈseɪʃn/ | n | A2 | Sohbet, konuşma | We had a long conversation. | Uzun bir sohbet ettik. | talk; chat | have a conversation
culture | /ˈkʌltʃə(r)/ | n | A2 | Kültür | I love learning about Japanese culture. | Japon kültürünü öğrenmeyi seviyorum. | |
damage | /ˈdæmɪdʒ/ | n | B1 | Hasar, zarar | The flood caused serious damage. | Sel ciddi hasara yol açtı. | harm |
danger | /ˈdeɪndʒə(r)/ | n | A2 | Tehlike | There is no danger here. | Burada tehlike yok. | risk | in danger
detail | /ˈdiːteɪl/ | n | A2 | Ayrıntı, detay | Please send me more details. | Lütfen bana daha fazla ayrıntı gönder. | | in detail
difference | /ˈdɪfrəns/ | n | A2 | Fark | What's the difference between them? | Aralarındaki fark ne? | | make a difference
direction | /dəˈrekʃn/ | n | A2 | Yön | We're going in the wrong direction. | Yanlış yöne gidiyoruz. | way | ask for directions
distance | /ˈdɪstəns/ | n | A2 | Mesafe, uzaklık | The distance between the cities is 50 km. | Şehirler arasındaki mesafe 50 km. | | in the distance
education | /ˌedʒuˈkeɪʃn/ | n | A2 | Eğitim | Education is important for everyone. | Eğitim herkes için önemlidir. | schooling |
effort | /ˈefət/ | n | B1 | Çaba | Thanks for all your effort. | Tüm çaban için teşekkürler. | work; attempt | make an effort
energy | /ˈenədʒi/ | n | A2 | Enerji | Children have so much energy. | Çocukların çok fazla enerjisi var. | power |
event | /ɪˈvent/ | n | A2 | Etkinlik, olay | The event starts at seven. | Etkinlik saat yedide başlıyor. | occasion |
evidence | /ˈevɪdəns/ | n | B1 | Kanıt | There is no evidence that he did it. | Bunu onun yaptığına dair kanıt yok. | proof |
experience | /ɪkˈspɪəriəns/ | n | A2 | Deneyim, tecrübe | Do you have any work experience? | Hiç iş deneyimin var mı? | | gain experience
failure | /ˈfeɪljə(r)/ | n | B1 | Başarısızlık | Failure is part of learning. | Başarısızlık öğrenmenin bir parçasıdır. | defeat |
freedom | /ˈfriːdəm/ | n | B1 | Özgürlük | Everyone wants freedom. | Herkes özgürlük ister. | liberty |
future | /ˈfjuːtʃə(r)/ | n | A2 | Gelecek | Nobody knows the future. | Kimse geleceği bilemez. | | in the future
goal | /ɡəʊl/ | n | A2 | Hedef; gol | My goal is to run a marathon. | Hedefim bir maraton koşmak. | aim; target | reach a goal
government | /ˈɡʌvənmənt/ | n | B1 | Hükümet | The government announced new rules. | Hükümet yeni kurallar açıkladı. | |
habit | /ˈhæbɪt/ | n | B1 | Alışkanlık | Reading every day is a good habit. | Her gün okumak iyi bir alışkanlıktır. | routine | break a habit
history | /ˈhɪstri/ | n | A2 | Tarih | I love reading about history. | Tarih hakkında okumayı seviyorum. | |
information | /ˌɪnfəˈmeɪʃn/ | n | A2 | Bilgi | Can I have some information about the tour? | Tur hakkında biraz bilgi alabilir miyim? | details | a piece of information
interest | /ˈɪntrəst/ | n | A2 | İlgi; faiz | She has a strong interest in art. | Sanata güçlü bir ilgisi var. | | interest rate
invitation | /ˌɪnvɪˈteɪʃn/ | n | A2 | Davet, davetiye | Thanks for the invitation! | Davet için teşekkürler! | |
knowledge | /ˈnɒlɪdʒ/ | n | B1 | Bilgi, birikim | He has a good knowledge of history. | İyi bir tarih bilgisine sahip. | understanding |
language | /ˈlæŋɡwɪdʒ/ | n | A1 | Dil | How many languages do you speak? | Kaç dil konuşuyorsun? | | body language
level | /ˈlevl/ | n | A2 | Seviye | What is your English level? | İngilizce seviyen ne? | | high level
memory | /ˈmeməri/ | n | B1 | Hafıza; anı | I have a terrible memory for names. | İsimler konusunda hafızam berbattır. | recollection | childhood memory
message | /ˈmesɪdʒ/ | n | A1 | Mesaj | I sent you a message. | Sana bir mesaj gönderdim. | text | leave a message
method | /ˈmeθəd/ | n | B1 | Yöntem | This is a simple method for learning words. | Bu kelime öğrenmek için basit bir yöntem. | way; technique |
moment | /ˈməʊmənt/ | n | A2 | An | Wait a moment, please. | Bir dakika bekleyin lütfen. | instant | at the moment
neighbour | /ˈneɪbə(r)/ | n | A2 | Komşu | Our neighbour has three dogs. | Komşumuzun üç köpeği var. | |
noise | /nɔɪz/ | n | A2 | Gürültü | What's that noise? | O gürültü ne? | sound | make noise
opinion | /əˈpɪnjən/ | n | A2 | Fikir, görüş | In my opinion, the film was too long. | Bence film çok uzundu. | view | in my opinion
patience | /ˈpeɪʃns/ | n | B1 | Sabır | Thank you for your patience. | Sabrınız için teşekkürler. | | lose patience
permission | /pəˈmɪʃn/ | n | B1 | İzin | You need permission to enter. | Girmek için izne ihtiyacın var. | consent | ask for permission
power | /ˈpaʊə(r)/ | n | B1 | Güç; elektrik | There was a power cut last night. | Dün gece elektrik kesintisi oldu. | strength | power cut
price | /praɪs/ | n | A1 | Fiyat | What's the price of this jacket? | Bu ceketin fiyatı ne? | cost |
progress | /ˈprəʊɡres/ | n | B1 | İlerleme | You are making great progress! | Harika ilerleme kaydediyorsun! | improvement | make progress
purpose | /ˈpɜːpəs/ | n | B1 | Amaç | What is the purpose of your visit? | Ziyaretinizin amacı nedir? | aim; goal | on purpose
quality | /ˈkwɒləti/ | n | B1 | Kalite | These shoes are good quality. | Bu ayakkabılar kaliteli. | standard |
reason | /ˈriːzn/ | n | A2 | Neden, sebep | Is there a reason for the delay? | Gecikmenin bir nedeni var mı? | cause |
relationship | /rɪˈleɪʃnʃɪp/ | n | B1 | İlişki | They have a good relationship. | Aralarında iyi bir ilişki var. | connection |
result | /rɪˈzʌlt/ | n | A2 | Sonuç | The test result was positive. | Test sonucu pozitifti. | outcome | as a result
risk | /rɪsk/ | n | B1 | Risk | Smoking increases the risk of cancer. | Sigara içmek kanser riskini artırır. | danger | take a risk
rule | /ruːl/ | n | A2 | Kural | You must follow the rules. | Kurallara uymalısın. | law | break the rules
safety | /ˈseɪfti/ | n | B1 | Güvenlik | Safety comes first. | Önce güvenlik. | security |
schedule | /ˈʃedjuːl/ | n | B1 | Program, takvim | My schedule is very busy this week. | Bu hafta programım çok yoğun. | timetable | on schedule
secret | /ˈsiːkrət/ | n | A2 | Sır | Can you keep a secret? | Sır tutabilir misin? | | keep a secret
skill | /skɪl/ | n | A2 | Beceri | Communication is an important skill. | İletişim önemli bir beceridir. | ability |
society | /səˈsaɪəti/ | n | B1 | Toplum | Technology changes society. | Teknoloji toplumu değiştirir. | community |
solution | /səˈluːʃn/ | n | B1 | Çözüm | We need a quick solution. | Hızlı bir çözüme ihtiyacımız var. | answer | find a solution
success | /səkˈses/ | n | B1 | Başarı | The party was a great success. | Parti büyük bir başarıydı. | achievement |
task | /tɑːsk/ | n | B1 | Görev, iş | This task will take two hours. | Bu görev iki saat sürecek. | job; duty |
truth | /truːθ/ | n | B1 | Gerçek, doğruluk | Please tell me the truth. | Lütfen bana gerçeği söyle. | fact | tell the truth
value | /ˈvæljuː/ | n | B1 | Değer | The value of the house has doubled. | Evin değeri iki katına çıktı. | worth |

# ── Sıfatlar ──
ancient | /ˈeɪnʃənt/ | adj | B1 | Antik, çok eski | We visited an ancient temple. | Antik bir tapınağı ziyaret ettik. | old | ancient history
basic | /ˈbeɪsɪk/ | adj | B1 | Temel | I only know basic Spanish. | Sadece temel düzeyde İspanyolca biliyorum. | simple; fundamental |
brave | /breɪv/ | adj | B1 | Cesur | The brave firefighter saved the child. | Cesur itfaiyeci çocuğu kurtardı. | courageous |
careful | /ˈkeəfl/ | adj | A2 | Dikkatli | Be careful, the floor is wet. | Dikkatli ol, yer ıslak. | cautious |
certain | /ˈsɜːtn/ | adj | B1 | Emin; belirli | Are you certain about that? | Bundan emin misin? | sure |
cheap | /tʃiːp/ | adj | A1 | Ucuz | This hotel is cheap but clean. | Bu otel ucuz ama temiz. | inexpensive |
common | /ˈkɒmən/ | adj | A2 | Yaygın; ortak | It's a common mistake. | Bu yaygın bir hata. | usual | have something in common
correct | /kəˈrekt/ | adj | A2 | Doğru | Your answer is correct. | Cevabın doğru. | right |
crowded | /ˈkraʊdɪd/ | adj | A2 | Kalabalık | The bus was very crowded. | Otobüs çok kalabalıktı. | busy; packed |
curious | /ˈkjʊəriəs/ | adj | B1 | Meraklı | Cats are very curious animals. | Kediler çok meraklı hayvanlardır. | inquisitive |
dangerous | /ˈdeɪndʒərəs/ | adj | A2 | Tehlikeli | It's dangerous to swim here. | Burada yüzmek tehlikeli. | risky |
deep | /diːp/ | adj | A2 | Derin | The lake is very deep. | Göl çok derin. | |
difficult | /ˈdɪfɪkəlt/ | adj | A1 | Zor | This exercise is difficult. | Bu alıştırma zor. | hard; tough |
empty | /ˈempti/ | adj | A2 | Boş | The fridge is empty. | Buzdolabı boş. | vacant |
equal | /ˈiːkwəl/ | adj | B1 | Eşit | All people are equal. | Bütün insanlar eşittir. | same | equal rights
expensive | /ɪkˈspensɪv/ | adj | A1 | Pahalı | This watch is too expensive. | Bu saat çok pahalı. | costly; pricey |
fair | /feə(r)/ | adj | B1 | Adil | That's not fair! | Bu adil değil! | just |
famous | /ˈfeɪməs/ | adj | A1 | Ünlü | She is a famous singer. | O ünlü bir şarkıcı. | well-known |
foreign | /ˈfɒrən/ | adj | A2 | Yabancı | Do you speak any foreign languages? | Hiç yabancı dil konuşuyor musun? | | foreign language
generous | /ˈdʒenərəs/ | adj | B1 | Cömert | My uncle is very generous. | Amcam çok cömerttir. | kind |
honest | /ˈɒnɪst/ | adj | B1 | Dürüst | Please be honest with me. | Lütfen bana karşı dürüst ol. | truthful |
huge | /hjuːdʒ/ | adj | A2 | Kocaman, devasa | They live in a huge house. | Kocaman bir evde yaşıyorlar. | enormous |
impossible | /ɪmˈpɒsəbl/ | adj | A2 | İmkânsız | Nothing is impossible. | Hiçbir şey imkânsız değildir. | |
independent | /ˌɪndɪˈpendənt/ | adj | B1 | Bağımsız | She is a very independent person. | Çok bağımsız bir insan. | self-sufficient |
lazy | /ˈleɪzi/ | adj | A2 | Tembel | I feel lazy on Sunday mornings. | Pazar sabahları kendimi tembel hissediyorum. | idle |
local | /ˈləʊkl/ | adj | A2 | Yerel | We buy vegetables from the local market. | Sebzeleri yerel pazardan alıyoruz. | | local people
lucky | /ˈlʌki/ | adj | A2 | Şanslı | You're lucky to have such good friends. | Böyle iyi arkadaşların olduğu için şanslısın. | fortunate |
modern | /ˈmɒdn/ | adj | A2 | Modern | The city has a modern airport. | Şehrin modern bir havalimanı var. | contemporary |
narrow | /ˈnærəʊ/ | adj | B1 | Dar | The streets in the old town are narrow. | Eski şehirdeki sokaklar dar. | thin |
necessary | /ˈnesəsəri/ | adj | B1 | Gerekli | Is it necessary to book in advance? | Önceden rezervasyon yapmak gerekli mi? | essential |
obvious | /ˈɒbviəs/ | adj | B1 | Apaçık, belli | The answer is obvious. | Cevap çok belli. | clear |
ordinary | /ˈɔːdnri/ | adj | B1 | Sıradan | It was just an ordinary day. | Sıradan bir gündü. | normal; usual |
polite | /pəˈlaɪt/ | adj | A2 | Kibar | It's polite to say thank you. | Teşekkür etmek kibarlıktır. | courteous |
popular | /ˈpɒpjələ(r)/ | adj | A2 | Popüler, sevilen | This song is very popular. | Bu şarkı çok popüler. | |
private | /ˈpraɪvət/ | adj | B1 | Özel | This is a private beach. | Burası özel bir plaj. | personal |
proud | /praʊd/ | adj | B1 | Gururlu | I'm proud of you. | Seninle gurur duyuyorum. | | proud of
quiet | /ˈkwaɪət/ | adj | A1 | Sessiz, sakin | The library is very quiet. | Kütüphane çok sessiz. | calm; silent |
rare | /reə(r)/ | adj | B1 | Nadir | This is a rare bird. | Bu nadir bir kuş. | unusual |
recent | /ˈriːsnt/ | adj | B1 | Yakın zamanki, son | Have you seen his recent photos? | Son fotoğraflarını gördün mü? | latest |
responsible | /rɪˈspɒnsəbl/ | adj | B1 | Sorumlu | Who is responsible for this mess? | Bu dağınıklıktan kim sorumlu? | | responsible for
rude | /ruːd/ | adj | A2 | Kaba | It's rude to interrupt people. | İnsanların sözünü kesmek kabalıktır. | impolite |
serious | /ˈsɪəriəs/ | adj | A2 | Ciddi | Is it serious, doctor? | Ciddi mi, doktor? | |
similar | /ˈsɪmələ(r)/ | adj | A2 | Benzer | Our jackets are very similar. | Ceketlerimiz çok benzer. | alike | similar to
strange | /streɪndʒ/ | adj | A2 | Garip, tuhaf | I heard a strange noise. | Garip bir ses duydum. | odd; weird |
strict | /strɪkt/ | adj | B1 | Katı, sıkı | Our teacher is very strict. | Öğretmenimiz çok katıdır. | firm |
sudden | /ˈsʌdn/ | adj | B1 | Ani | There was a sudden change in the weather. | Havada ani bir değişiklik oldu. | unexpected | all of a sudden
terrible | /ˈterəbl/ | adj | A2 | Berbat, korkunç | The food was terrible. | Yemek berbattı. | awful |
typical | /ˈtɪpɪkl/ | adj | B1 | Tipik | This is a typical Turkish breakfast. | Bu tipik bir Türk kahvaltısı. | usual |
useful | /ˈjuːsfl/ | adj | A2 | Yararlı, kullanışlı | This app is really useful. | Bu uygulama gerçekten yararlı. | helpful |
wide | /waɪd/ | adj | A2 | Geniş | The river is very wide here. | Nehir burada çok geniş. | broad |
wise | /waɪz/ | adj | B1 | Bilge, akıllıca | That was a wise decision. | Bu akıllıca bir karardı. | sensible |

# ── Zarflar ve bağlaçlar ──
actually | /ˈæktʃuəli/ | adv | A2 | Aslında | Actually, I don't like coffee. | Aslında kahve sevmiyorum. | in fact |
almost | /ˈɔːlməʊst/ | adv | A2 | Neredeyse | I almost missed the train. | Neredeyse treni kaçırıyordum. | nearly |
already | /ɔːlˈredi/ | adv | A2 | Zaten, çoktan | I have already eaten. | Ben zaten yemek yedim. | |
anyway | /ˈeniweɪ/ | adv | B1 | Neyse, yine de | It was raining, but we went anyway. | Yağmur yağıyordu ama yine de gittik. | anyhow |
certainly | /ˈsɜːtnli/ | adv | B1 | Kesinlikle | I will certainly come to your party. | Partine kesinlikle geleceğim. | definitely |
definitely | /ˈdefɪnətli/ | adv | B1 | Kesinlikle | This is definitely the best pizza in town. | Bu kesinlikle şehrin en iyi pizzası. | certainly |
especially | /ɪˈspeʃəli/ | adv | B1 | Özellikle | I love fruit, especially apples. | Meyveyi severim, özellikle elmayı. | particularly |
eventually | /ɪˈventʃuəli/ | adv | B1 | Sonunda, eninde sonunda | Eventually, we found the hotel. | Sonunda oteli bulduk. | finally |
exactly | /ɪɡˈzæktli/ | adv | A2 | Tam olarak | That's exactly what I wanted. | Tam olarak istediğim buydu. | precisely |
finally | /ˈfaɪnəli/ | adv | A2 | Sonunda; son olarak | We finally arrived home. | Sonunda eve vardık. | at last |
fortunately | /ˈfɔːtʃənətli/ | adv | B1 | Neyse ki, şans eseri | Fortunately, nobody was hurt. | Neyse ki kimse yaralanmadı. | luckily |
hardly | /ˈhɑːdli/ | adv | B1 | Neredeyse hiç | I can hardly hear you. | Seni neredeyse hiç duyamıyorum. | barely |
immediately | /ɪˈmiːdiətli/ | adv | B1 | Hemen, derhal | Please call me immediately. | Lütfen beni hemen ara. | at once |
instead | /ɪnˈsted/ | adv | A2 | Onun yerine | Let's walk instead of taking a taxi. | Taksiye binmek yerine yürüyelim. | rather | instead of
nearly | /ˈnɪəli/ | adv | B1 | Neredeyse | It's nearly midnight. | Neredeyse gece yarısı. | almost |
otherwise | /ˈʌðəwaɪz/ | adv | B1 | Aksi takdirde | Hurry, otherwise we'll be late. | Acele et, yoksa geç kalacağız. | or else |
perhaps | /pəˈhæps/ | adv | A2 | Belki | Perhaps it will rain tomorrow. | Belki yarın yağmur yağar. | maybe |
probably | /ˈprɒbəbli/ | adv | A2 | Muhtemelen | She's probably at home. | Muhtemelen evdedir. | likely |
rarely | /ˈreəli/ | adv | B1 | Nadiren | I rarely watch TV. | Nadiren televizyon izlerim. | seldom |
recently | /ˈriːsntli/ | adv | B1 | Son zamanlarda | I've been very busy recently. | Son zamanlarda çok meşguldüm. | lately |
suddenly | /ˈsʌdənli/ | adv | A2 | Aniden | Suddenly, the lights went out. | Aniden ışıklar söndü. | all of a sudden |
unfortunately | /ʌnˈfɔːtʃənətli/ | adv | B1 | Maalesef | Unfortunately, the shop was closed. | Maalesef dükkân kapalıydı. | sadly |
however | /haʊˈevə(r)/ | adv | B1 | Ancak, bununla birlikte | The test was hard. However, I passed. | Sınav zordu. Ancak geçtim. | but; nevertheless |
therefore | /ˈðeəfɔː(r)/ | adv | B1 | Bu nedenle | It was late; therefore, we took a taxi. | Geç olmuştu; bu nedenle taksiye bindik. | so; thus |
unless | /ənˈles/ | conj | B1 | -medikçe, -mezse | We'll go out unless it rains. | Yağmur yağmazsa dışarı çıkacağız. | except if |
whether | /ˈweðə(r)/ | conj | B1 | -ip -mediği, olup olmadığı | I don't know whether he's coming. | Gelip gelmediğini bilmiyorum. | if |
despite | /dɪˈspaɪt/ | prep | B1 | -e rağmen | We went out despite the rain. | Yağmura rağmen dışarı çıktık. | in spite of |
during | /ˈdjʊərɪŋ/ | prep | A2 | Sırasında, boyunca | Please be quiet during the film. | Lütfen film sırasında sessiz olun. | throughout |
among | /əˈmʌŋ/ | prep | B1 | Arasında (ikiden fazla) | She was among the best students. | En iyi öğrenciler arasındaydı. | amid |
`);
