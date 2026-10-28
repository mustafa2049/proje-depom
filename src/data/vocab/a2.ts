import { parseVocab } from './parse';

// A2 — Temel: ilişkiler, alışveriş, meslekler, okul, ev eşyaları, mutfak, vücut, hayvanlar ve sık sıfatlar.
export const A2_WORDS = [
  ...parseVocab('daily', `
# ── İnsanlar ve ilişkiler ──
cousin | /ˈkʌzn/ | n | A2 | Kuzen | My cousin is coming to visit us next week. | Kuzenim gelecek hafta bizi ziyarete geliyor. | |
guest | /ɡest/ | n | A2 | Misafir, konuk | We have three guests for dinner tonight. | Bu akşam yemeğe üç misafirimiz var. | visitor | hotel guest
adult | /ˈædʌlt/ | n | A2 | Yetişkin | The ticket is ten euros for adults. | Bilet yetişkinler için on euro. | grown-up |
teenager | /ˈtiːneɪdʒə(r)/ | n | A2 | Ergen, genç (13–19 yaş) | Most teenagers love social media. | Çoğu genç sosyal medyayı çok sever. | |
couple | /ˈkʌpl/ | n | A2 | Çift; birkaç | The young couple bought a flat. | Genç çift bir daire satın aldı. | pair | a couple of
boyfriend | /ˈbɔɪfrend/ | n | A2 | Erkek arkadaş, sevgili | Her boyfriend is a musician. | Erkek arkadaşı bir müzisyen. | partner |
girlfriend | /ˈɡɜːlfrend/ | n | A2 | Kız arkadaş, sevgili | He is going to Paris with his girlfriend. | Kız arkadaşıyla Paris'e gidiyor. | partner |
married | /ˈmærid/ | adj | A2 | Evli | They have been married for ten years. | On yıldır evliler. | | get married; married couple
wedding | /ˈwedɪŋ/ | n | A2 | Düğün | We are going to my cousin's wedding on Saturday. | Cumartesi kuzenimin düğününe gidiyoruz. | marriage | wedding ring; wedding dress
member | /ˈmembə(r)/ | n | A2 | Üye | She is a member of the tennis club. | Tenis kulübünün üyesi. | | family member; club member
team | /tiːm/ | n | A2 | Takım, ekip | Which football team do you support? | Hangi futbol takımını tutuyorsun? | group | team member
glad | /ɡlæd/ | adj | A2 | Memnun, sevinçli | I'm glad you could come. | Gelebildiğine sevindim. | pleased; happy |
joke | /dʒəʊk/ | n | A2 | Şaka, fıkra | He always tells funny jokes. | Hep komik fıkralar anlatır. | | tell a joke
laugh | /lɑːf/ | v | A2 | Gülmek (sesli) | We laughed at his funny story. | Onun komik hikâyesine güldük. | | laugh at; make someone laugh
smile | /smaɪl/ | v | A2 | Gülümsemek | She smiled when she saw the present. | Hediyeyi görünce gülümsedi. | grin | smile at
cry | /kraɪ/ | v | A2 | Ağlamak | The baby cries when she is hungry. | Bebek acıktığında ağlar. | weep |
mean | /miːn/ | v | A2 | Anlamına gelmek; kastetmek | What does this word mean? | Bu kelime ne anlama geliyor? | | I mean
of course | /əv ˈkɔːs/ | phr | A2 | Elbette, tabii ki | Of course you can use my phone. | Tabii ki telefonumu kullanabilirsin. | sure; certainly |
maybe | /ˈmeɪbi/ | adv | A2 | Belki | Maybe we can meet tomorrow. | Belki yarın buluşabiliriz. | perhaps |
later | /ˈleɪtə(r)/ | adv | A2 | Daha sonra | I'll call you later. | Seni sonra ararım. | afterwards | see you later
soon | /suːn/ | adv | A2 | Yakında, birazdan | The bus will be here soon. | Otobüs birazdan burada olur. | | as soon as possible
ago | /əˈɡəʊ/ | adv | A2 | Önce (zaman) | I moved to Istanbul two years ago. | İki yıl önce İstanbul'a taşındım. | | a long time ago
still | /stɪl/ | adv | A2 | Hâlâ | Are you still working? | Hâlâ çalışıyor musun? | |
yet | /jet/ | adv | A2 | Henüz, daha | I haven't finished my homework yet. | Ödevimi henüz bitirmedim. | | not yet
just | /dʒʌst/ | adv | A2 | Az önce; sadece | I've just arrived home. | Eve az önce vardım. | only | just now
enough | /ɪˈnʌf/ | adv | A2 | Yeterli, yeterince | Do we have enough chairs for everyone? | Herkese yetecek kadar sandalyemiz var mı? | sufficient | big enough
quite | /kwaɪt/ | adv | A2 | Oldukça | The film was quite good. | Film oldukça iyiydi. | fairly | quite a lot
ever | /ˈevə(r)/ | adv | A2 | Hiç (soru cümlelerinde) | Have you ever been to London? | Hiç Londra'ya gittin mi? | | ever since
`),
  ...parseVocab('core', `
# ── Fiiller ──
become | /bɪˈkʌm/ | v | A2 | Olmak, haline gelmek | She wants to become a doctor. | Doktor olmak istiyor. | get; turn into |
break | /breɪk/ | v | A2 | Kırmak, bozmak | Be careful not to break the glasses. | Bardakları kırmamaya dikkat et. | smash | break a promise; break a record
fall | /fɔːl/ | v | A2 | Düşmek | Be careful, you might fall. | Dikkat et, düşebilirsin. | drop | fall asleep; fall in love
forget | /fəˈɡet/ | v | A2 | Unutmak | Don't forget to lock the door. | Kapıyı kilitlemeyi unutma. | | forget about
hold | /həʊld/ | v | A2 | Tutmak | Can you hold my bag for a minute? | Bir dakika çantamı tutabilir misin? | carry | hold hands
let | /let/ | v | A2 | İzin vermek, bırakmak | Let me help you with that. | Bunda sana yardım edeyim. | allow | let someone know
move | /muːv/ | v | A2 | Taşınmak; hareket etmek | We are moving to a new flat next month. | Gelecek ay yeni bir daireye taşınıyoruz. | | move house
pass | /pɑːs/ | v | A2 | Geçmek; uzatmak | I hope I pass my driving test. | Umarım ehliyet sınavını geçerim. | | pass an exam; pass the salt
ring | /rɪŋ/ | v | A2 | Çalmak (zil); telefonla aramak | Your phone is ringing. | Telefonun çalıyor. | call | ring the bell
smell | /smel/ | v | A2 | Kokmak; koklamak | This soup smells delicious. | Bu çorba çok güzel kokuyor. | | smell good
sound | /saʊnd/ | v | A2 | Gibi görünmek/gelmek (duyuluş) | That sounds like a great plan. | Bu harika bir plan gibi geliyor. | seem | sound good
turn | /tɜːn/ | v | A2 | Dönmek, çevirmek | Turn right at the next corner. | Bir sonraki köşeden sağa dön. | | turn around
check | /tʃek/ | v | A2 | Kontrol etmek | Check your answers before you finish. | Bitirmeden önce cevaplarını kontrol et. | examine | check your email
fix | /fɪks/ | v | A2 | Tamir etmek, düzeltmek | My dad can fix your bike. | Babam bisikletini tamir edebilir. | repair |
enter | /ˈentə(r)/ | v | A2 | Girmek | Please knock before you enter the room. | Lütfen odaya girmeden önce kapıyı çal. | go into | enter a password
hate | /heɪt/ | v | A2 | Nefret etmek | I hate waiting in long queues. | Uzun kuyruklarda beklemekten nefret ederim. | dislike |
hit | /hɪt/ | v | A2 | Vurmak, çarpmak | The ball hit the window. | Top cama çarptı. | strike |
kick | /kɪk/ | v | A2 | Tekmelemek | He kicked the ball into the goal. | Topu kaleye attı. | | kick a ball
mix | /mɪks/ | v | A2 | Karıştırmak | Mix the flour and the eggs together. | Unu ve yumurtaları birlikte karıştır. | combine |
paint | /peɪnt/ | v | A2 | Boyamak; resim yapmak | We painted the kitchen white. | Mutfağı beyaza boyadık. | | paint a picture
practise | /ˈpræktɪs/ | v | A2 | Pratik yapmak, alıştırma yapmak | I practise English every day. | Her gün İngilizce pratik yapıyorum. | | practise speaking
sign | /saɪn/ | v | A2 | İmzalamak | Please sign the form at the bottom. | Lütfen formu en altından imzalayın. | | sign a contract
# ── Alışveriş ve para ──
shopping | /ˈʃɒpɪŋ/ | n | A2 | Alışveriş | I do the shopping on Saturday mornings. | Alışverişi cumartesi sabahları yaparım. | | go shopping; shopping centre
customer | /ˈkʌstəmə(r)/ | n | A2 | Müşteri | The shop has a lot of customers today. | Dükkânın bugün çok müşterisi var. | client |
size | /saɪz/ | n | A2 | Beden; boyut | Do you have this shirt in a bigger size? | Bu gömleğin daha büyük bedeni var mı? | | what size
sale | /seɪl/ | n | A2 | İndirim; satış | I bought these shoes in the sale. | Bu ayakkabıları indirimde aldım. | | on sale; for sale
coin | /kɔɪn/ | n | A2 | Madeni para | I need some coins for the parking machine. | Otopark makinesi için birkaç bozuk paraya ihtiyacım var. | |
credit card | /ˈkredɪt kɑːd/ | n | A2 | Kredi kartı | Can I pay by credit card? | Kredi kartıyla ödeyebilir miyim? | | pay by credit card
# ── Okul ve iş ──
subject | /ˈsʌbdʒɪkt/ | n | A2 | Ders (konu); konu | My favourite subject at school is history. | Okulda en sevdiğim ders tarih. | topic |
maths | /mæθs/ | n | A2 | Matematik | I'm not very good at maths. | Matematikte pek iyi değilim. | mathematics |
science | /ˈsaɪəns/ | n | A2 | Bilim; fen | She wants to study science at university. | Üniversitede fen bilimleri okumak istiyor. | |
geography | /dʒiˈɒɡrəfi/ | n | A2 | Coğrafya | In geography we are learning about rivers. | Coğrafyada nehirleri öğreniyoruz. | |
art | /ɑːt/ | n | A2 | Sanat; resim dersi | We saw some modern art at the museum. | Müzede modern sanat eserleri gördük. | | work of art
project | /ˈprɒdʒekt/ | n | A2 | Proje | We are working on a science project. | Bir fen projesi üzerinde çalışıyoruz. | | school project
uniform | /ˈjuːnɪfɔːm/ | n | A2 | Üniforma | Students wear a uniform at this school. | Bu okulda öğrenciler üniforma giyer. | | school uniform
test | /test/ | n | A2 | Test, sınav | We have a vocabulary test on Friday. | Cuma günü kelime sınavımız var. | exam | driving test
course | /kɔːs/ | n | A2 | Kurs | I'm taking an English course this summer. | Bu yaz bir İngilizce kursuna gidiyorum. | class | language course
boss | /bɒs/ | n | A2 | Patron, şef | My boss is on holiday this week. | Patronum bu hafta tatilde. | manager |
company | /ˈkʌmpəni/ | n | A2 | Şirket | He works for a big software company. | Büyük bir yazılım şirketinde çalışıyor. | firm |
factory | /ˈfæktri/ | n | A2 | Fabrika | My uncle works in a car factory. | Amcam bir araba fabrikasında çalışıyor. | plant |
meeting | /ˈmiːtɪŋ/ | n | A2 | Toplantı | We have a team meeting at ten. | Saat onda ekip toplantımız var. | | have a meeting
engineer | /ˌendʒɪˈnɪə(r)/ | n | A2 | Mühendis | My sister is an engineer. | Ablam mühendis. | |
police officer | /pəˈliːs ɒfɪsə(r)/ | n | A2 | Polis memuru | Ask the police officer for directions. | Polis memuruna yol sor. | |
farmer | /ˈfɑːmə(r)/ | n | A2 | Çiftçi | The farmer grows vegetables and fruit. | Çiftçi sebze ve meyve yetiştiriyor. | |
driver | /ˈdraɪvə(r)/ | n | A2 | Sürücü, şoför | The bus driver was very friendly. | Otobüs şoförü çok güler yüzlüydü. | |
artist | /ˈɑːtɪst/ | n | A2 | Sanatçı, ressam | The artist painted a picture of the sea. | Sanatçı denizin resmini yaptı. | painter |
writer | /ˈraɪtə(r)/ | n | A2 | Yazar | She is a famous writer of children's books. | Çocuk kitaplarının ünlü bir yazarı. | author |
musician | /mjuˈzɪʃn/ | n | A2 | Müzisyen | The street musician played the violin. | Sokak müzisyeni keman çaldı. | |
chef | /ʃef/ | n | A2 | Aşçı, şef | The chef made a special dinner for us. | Şef bizim için özel bir akşam yemeği hazırladı. | cook |
# ── Sıfatlar ──
amazing | /əˈmeɪzɪŋ/ | adj | A2 | Harika, şaşırtıcı | The view from the top is amazing. | Tepeden manzara harika. | incredible |
awful | /ˈɔːfl/ | adj | A2 | Berbat, korkunç | The weather was awful yesterday. | Dün hava berbattı. | terrible |
brilliant | /ˈbrɪliənt/ | adj | A2 | Harika; parlak, zeki | That's a brilliant idea! | Bu harika bir fikir! | excellent |
clear | /klɪə(r)/ | adj | A2 | Açık, net | The instructions are very clear. | Talimatlar çok net. | obvious | clear sky
dark | /dɑːk/ | adj | A2 | Karanlık; koyu | It gets dark early in winter. | Kışın hava erken kararır. | | dark blue
excellent | /ˈeksələnt/ | adj | A2 | Mükemmel | Your English is excellent. | İngilizcen mükemmel. | great |
fantastic | /fænˈtæstɪk/ | adj | A2 | Harika, muhteşem | We had a fantastic holiday. | Harika bir tatil geçirdik. | wonderful |
heavy | /ˈhevi/ | adj | A2 | Ağır; yoğun | This box is too heavy for me. | Bu kutu benim için çok ağır. | | heavy rain; heavy traffic
light | /laɪt/ | adj | A2 | Hafif; açık (renk) | This bag is very light. | Bu çanta çok hafif. | | light blue
loud | /laʊd/ | adj | A2 | Yüksek sesli | The music is too loud. | Müzik çok yüksek. | noisy |
normal | /ˈnɔːml/ | adj | A2 | Normal | It's normal to feel nervous before an exam. | Sınavdan önce gergin hissetmek normaldir. | usual |
perfect | /ˈpɜːfɪkt/ | adj | A2 | Mükemmel, kusursuz | The weather is perfect for a picnic. | Hava piknik için mükemmel. | ideal |
poor | /pɔː(r)/ | adj | A2 | Fakir; zavallı | They were very poor when they were young. | Gençken çok fakirdiler. | | poor people
rich | /rɪtʃ/ | adj | A2 | Zengin | He became rich after selling his company. | Şirketini sattıktan sonra zengin oldu. | wealthy |
safe | /seɪf/ | adj | A2 | Güvenli | Is it safe to swim here? | Burada yüzmek güvenli mi? | | safe and sound
simple | /ˈsɪmpl/ | adj | A2 | Basit, sade | The recipe is very simple. | Tarif çok basit. | easy |
soft | /sɒft/ | adj | A2 | Yumuşak | This pillow is really soft. | Bu yastık gerçekten yumuşak. | |
special | /ˈspeʃl/ | adj | A2 | Özel | Today is a special day for our family. | Bugün ailemiz için özel bir gün. | | special offer
strong | /strɒŋ/ | adj | A2 | Güçlü; sert (içecek) | He is very strong; he can lift the sofa. | Çok güçlü; kanepeyi kaldırabilir. | powerful | strong coffee
weak | /wiːk/ | adj | A2 | Zayıf, güçsüz | I felt weak after the flu. | Gripten sonra halsiz hissettim. | |
thin | /θɪn/ | adj | A2 | İnce; zayıf | The walls in this flat are very thin. | Bu dairenin duvarları çok ince. | slim |
wet | /wet/ | adj | A2 | Islak | My shoes got wet in the rain. | Ayakkabılarım yağmurda ıslandı. | |
dry | /draɪ/ | adj | A2 | Kuru | Is the washing dry yet? | Çamaşırlar kurudu mu? | |
wonderful | /ˈwʌndəfl/ | adj | A2 | Harika, şahane | Thank you for a wonderful evening. | Harika bir akşam için teşekkürler. | lovely |
possible | /ˈpɒsəbl/ | adj | A2 | Mümkün, olası | Is it possible to change my ticket? | Biletimi değiştirmek mümkün mü? | | as soon as possible
true | /truː/ | adj | A2 | Doğru, gerçek | Is it true that you are moving to Canada? | Kanada'ya taşınacağın doğru mu? | correct | come true
real | /rɪəl/ | adj | A2 | Gerçek | Is that a real diamond? | O gerçek bir elmas mı? | genuine | real life
whole | /həʊl/ | adj | A2 | Bütün, tüm | I ate the whole pizza. | Pizzanın tamamını yedim. | entire | the whole day
ugly | /ˈʌɡli/ | adj | A2 | Çirkin | I think this building is really ugly. | Bence bu bina gerçekten çirkin. | |
pretty | /ˈprɪti/ | adj | A2 | Güzel, hoş | What a pretty little village! | Ne kadar şirin küçük bir köy! | beautiful |
lovely | /ˈlʌvli/ | adj | A2 | Hoş, sevimli | What a lovely day! | Ne güzel bir gün! | nice |
quick | /kwɪk/ | adj | A2 | Çabuk, hızlı | Can I ask you a quick question? | Sana kısa bir soru sorabilir miyim? | fast |
noisy | /ˈnɔɪzi/ | adj | A2 | Gürültülü | Our street is very noisy at night. | Sokağımız geceleri çok gürültülü. | loud |
traditional | /trəˈdɪʃənl/ | adj | A2 | Geleneksel | We had a traditional Turkish breakfast. | Geleneksel bir Türk kahvaltısı yaptık. | | traditional food
international | /ˌɪntəˈnæʃnəl/ | adj | A2 | Uluslararası | It's an international school. | Uluslararası bir okul. | global |
public | /ˈpʌblɪk/ | adj | A2 | Kamuya ait, halka açık | The park is open to the public. | Park halka açık. | | public transport
# ── Yer ve yön ──
outside | /ˌaʊtˈsaɪd/ | adv | A2 | Dışarıda | The children are playing outside. | Çocuklar dışarıda oynuyor. | |
inside | /ˌɪnˈsaɪd/ | adv | A2 | İçeride | It's raining, let's go inside. | Yağmur yağıyor, içeri girelim. | indoors |
everywhere | /ˈevriweə(r)/ | adv | A2 | Her yerde | I looked everywhere for my keys. | Anahtarlarımı her yerde aradım. | |
away | /əˈweɪ/ | adv | A2 | Uzakta, uzağa | The beach is two kilometres away. | Plaj iki kilometre uzakta. | | go away; far away
`),
  ...parseVocab('food', `
biscuit | /ˈbɪskɪt/ | n | A2 | Bisküvi | Would you like a biscuit with your tea? | Çayının yanında bisküvi ister misin? | cookie |
butter | /ˈbʌtə(r)/ | n | A2 | Tereyağı | I put butter on my toast. | Kızarmış ekmeğime tereyağı sürerim. | |
cream | /kriːm/ | n | A2 | Krema, kaymak | Do you want cream with your strawberries? | Çileklerinin yanında krema ister misin? | |
jam | /dʒæm/ | n | A2 | Reçel | My grandmother makes cherry jam. | Büyükannem vişne reçeli yapar. | |
honey | /ˈhʌni/ | n | A2 | Bal | I have honey and cheese for breakfast. | Kahvaltıda bal ve peynir yerim. | |
oil | /ɔɪl/ | n | A2 | Yağ | Fry the onions in a little oil. | Soğanları biraz yağda kızart. | | olive oil
pepper | /ˈpepə(r)/ | n | A2 | Biber; karabiber | Add some salt and pepper to the soup. | Çorbaya biraz tuz ve karabiber ekle. | | black pepper
salt | /sɔːlt/ | n | A2 | Tuz | Can you pass the salt, please? | Tuzu uzatır mısın, lütfen? | |
lemon | /ˈlemən/ | n | A2 | Limon | I like tea with lemon. | Limonlu çayı severim. | |
grape | /ɡreɪp/ | n | A2 | Üzüm | We bought a kilo of grapes at the market. | Pazardan bir kilo üzüm aldık. | |
strawberry | /ˈstrɔːbəri/ | n | A2 | Çilek | Strawberries are my favourite fruit. | Çilek en sevdiğim meyve. | |
carrot | /ˈkærət/ | n | A2 | Havuç | Rabbits love carrots. | Tavşanlar havucu çok sever. | |
onion | /ˈʌnjən/ | n | A2 | Soğan | Cutting onions makes me cry. | Soğan doğramak beni ağlatıyor. | |
bean | /biːn/ | n | A2 | Fasulye | We had beans and rice for lunch. | Öğle yemeğinde kuru fasulye pilav yedik. | | green beans
pasta | /ˈpæstə/ | n | A2 | Makarna | I'll cook pasta for dinner. | Akşam yemeği için makarna pişireceğim. | |
ice cream | /ˌaɪs ˈkriːm/ | n | A2 | Dondurma | Let's get an ice cream on the beach. | Plajda dondurma alalım. | |
sweet | /swiːt/ | adj | A2 | Tatlı | This cake is too sweet for me. | Bu kek benim için fazla tatlı. | | sweet tooth
plate | /pleɪt/ | n | A2 | Tabak | Put the plates on the table, please. | Tabakları masaya koy, lütfen. | dish |
knife | /naɪf/ | n | A2 | Bıçak | Be careful, that knife is very sharp. | Dikkat et, o bıçak çok keskin. | |
fork | /fɔːk/ | n | A2 | Çatal | We eat pasta with a fork. | Makarnayı çatalla yeriz. | |
spoon | /spuːn/ | n | A2 | Kaşık | You need a spoon for the soup. | Çorba için kaşığa ihtiyacın var. | | teaspoon
bowl | /bəʊl/ | n | A2 | Kâse | I eat a bowl of soup every evening. | Her akşam bir kâse çorba içerim. | |
`),
  ...parseVocab('home', `
bath | /bɑːθ/ | n | A2 | Küvet; banyo yapma | I like to have a hot bath after work. | İşten sonra sıcak bir banyo yapmayı severim. | | have a bath
armchair | /ˈɑːmtʃeə(r)/ | n | A2 | Koltuk | My grandfather sleeps in his armchair after lunch. | Dedem öğle yemeğinden sonra koltuğunda uyur. | |
fridge | /frɪdʒ/ | n | A2 | Buzdolabı | Put the milk in the fridge. | Sütü buzdolabına koy. | refrigerator |
cooker | /ˈkʊkə(r)/ | n | A2 | Ocak, fırınlı ocak | The soup is on the cooker. | Çorba ocakta. | stove |
oven | /ˈʌvn/ | n | A2 | Fırın | Bake the cake in the oven for forty minutes. | Keki fırında kırk dakika pişir. | |
microwave | /ˈmaɪkrəweɪv/ | n | A2 | Mikrodalga fırın | Heat the soup in the microwave. | Çorbayı mikrodalgada ısıt. | |
towel | /ˈtaʊəl/ | n | A2 | Havlu | Don't forget your towel for the beach. | Plaj için havlunu unutma. | |
soap | /səʊp/ | n | A2 | Sabun | Wash your hands with soap and water. | Ellerini sabun ve suyla yıka. | |
pillow | /ˈpɪləʊ/ | n | A2 | Yastık | I can't sleep without my own pillow. | Kendi yastığım olmadan uyuyamam. | cushion |
curtain | /ˈkɜːtn/ | n | A2 | Perde | Close the curtains; the sun is too bright. | Perdeleri kapat; güneş çok parlak. | |
lamp | /læmp/ | n | A2 | Lamba | Turn on the lamp; it's dark in here. | Lambayı aç; burası karanlık. | light |
lift | /lɪft/ | n | A2 | Asansör | The lift isn't working, so we took the stairs. | Asansör çalışmıyordu, merdivenleri kullandık. | elevator |
upstairs | /ˌʌpˈsteəz/ | adv | A2 | Üst katta, yukarıda | The bathroom is upstairs. | Banyo üst katta. | |
downstairs | /ˌdaʊnˈsteəz/ | adv | A2 | Alt katta, aşağıda | Breakfast is ready downstairs. | Kahvaltı aşağıda hazır. | |
`),
  ...parseVocab('travel', `
museum | /mjuˈziːəm/ | n | A2 | Müze | We visited the archaeology museum. | Arkeoloji müzesini ziyaret ettik. | | art museum
cinema | /ˈsɪnəmə/ | n | A2 | Sinema | Let's go to the cinema tonight. | Bu akşam sinemaya gidelim. | movie theater |
theatre | /ˈθɪətə(r)/ | n | A2 | Tiyatro | We saw a great play at the theatre. | Tiyatroda harika bir oyun izledik. | |
library | /ˈlaɪbrəri/ | n | A2 | Kütüphane | I study at the library after school. | Okuldan sonra kütüphanede ders çalışırım. | |
mosque | /mɒsk/ | n | A2 | Cami | The Blue Mosque is in the centre of Istanbul. | Sultanahmet Camii İstanbul'un merkezinde. | |
bridge | /brɪdʒ/ | n | A2 | Köprü | We walked across the bridge at sunset. | Gün batımında köprüden yürüyerek geçtik. | |
building | /ˈbɪldɪŋ/ | n | A2 | Bina | They live in a tall building near the sea. | Denize yakın yüksek bir binada yaşıyorlar. | |
corner | /ˈkɔːnə(r)/ | n | A2 | Köşe | The bakery is on the corner of the street. | Fırın sokağın köşesinde. | | around the corner
centre | /ˈsentə(r)/ | n | A2 | Merkez | Our hotel is in the city centre. | Otelimiz şehir merkezinde. | middle | city centre; shopping centre
village | /ˈvɪlɪdʒ/ | n | A2 | Köy | My grandparents live in a small village. | Büyükannemle büyükbabam küçük bir köyde yaşıyor. | |
traffic | /ˈtræfɪk/ | n | A2 | Trafik | There is a lot of traffic in the morning. | Sabahları trafik çok yoğun. | | heavy traffic; traffic light
bus stop | /ˈbʌs stɒp/ | n | A2 | Otobüs durağı | I'll wait for you at the bus stop. | Seni otobüs durağında bekleyeceğim. | |
boat | /bəʊt/ | n | A2 | Tekne, kayık | We took a boat to the island. | Adaya tekneyle gittik. | | by boat
ship | /ʃɪp/ | n | A2 | Gemi | The ship carries cars and passengers. | Gemi araç ve yolcu taşıyor. | | cruise ship
gate | /ɡeɪt/ | n | A2 | (Bahçe) kapısı; biniş kapısı | Our flight leaves from gate 12. | Uçuşumuz 12 numaralı kapıdan kalkıyor. | | boarding gate
pilot | /ˈpaɪlət/ | n | A2 | Pilot | The pilot said we would land in ten minutes. | Pilot on dakika içinde ineceğimizi söyledi. | |
`),
  ...parseVocab('health', `
neck | /nek/ | n | A2 | Boyun | I have a pain in my neck. | Boynumda bir ağrı var. | |
shoulder | /ˈʃəʊldə(r)/ | n | A2 | Omuz | She carried the bag on her shoulder. | Çantayı omzunda taşıdı. | |
knee | /niː/ | n | A2 | Diz | I hurt my knee playing football. | Futbol oynarken dizimi incittim. | |
finger | /ˈfɪŋɡə(r)/ | n | A2 | Parmak (el) | I cut my finger with a knife. | Parmağımı bıçakla kestim. | |
toe | /təʊ/ | n | A2 | Ayak parmağı | I hit my toe on the table. | Ayak parmağımı masaya çarptım. | |
heart | /hɑːt/ | n | A2 | Kalp | Exercise is good for your heart. | Egzersiz kalbin için iyidir. | | heart rate
skin | /skɪn/ | n | A2 | Cilt, deri | Use sun cream to protect your skin. | Cildini korumak için güneş kremi kullan. | |
dentist | /ˈdentɪst/ | n | A2 | Diş hekimi | I'm going to the dentist tomorrow. | Yarın dişçiye gidiyorum. | |
ill | /ɪl/ | adj | A2 | Hasta | I can't come to school; I'm ill. | Okula gelemem; hastayım. | sick |
hurt | /hɜːt/ | v | A2 | Acımak; incitmek | My back hurts when I sit for too long. | Çok uzun oturunca sırtım ağrıyor. | ache |
ambulance | /ˈæmbjələns/ | n | A2 | Ambulans | Call an ambulance, quickly! | Hemen bir ambulans çağırın! | | call an ambulance
`),
  ...parseVocab('nature', `
wind | /wɪnd/ | n | A2 | Rüzgâr | The wind is very strong today. | Bugün rüzgâr çok sert. | breeze |
ice | /aɪs/ | n | A2 | Buz | Be careful, there is ice on the road. | Dikkat et, yolda buz var. | |
island | /ˈaɪlənd/ | n | A2 | Ada | We spent our holiday on a Greek island. | Tatilimizi bir Yunan adasında geçirdik. | |
lake | /leɪk/ | n | A2 | Göl | We went swimming in the lake. | Gölde yüzmeye gittik. | |
field | /fiːld/ | n | A2 | Tarla; saha | There are cows in the field. | Tarlada inekler var. | | football field
plant | /plɑːnt/ | n | A2 | Bitki | Don't forget to water the plants. | Bitkileri sulamayı unutma. | |
grass | /ɡrɑːs/ | n | A2 | Çimen, ot | Please keep off the grass. | Lütfen çimlere basmayın. | |
leaf | /liːf/ | n | A2 | Yaprak (çoğulu: leaves) | A yellow leaf fell from the tree. | Ağaçtan sarı bir yaprak düştü. | |
rock | /rɒk/ | n | A2 | Kaya | We sat on a rock by the sea. | Deniz kenarında bir kayanın üstüne oturduk. | stone |
sand | /sænd/ | n | A2 | Kum | The children are playing in the sand. | Çocuklar kumda oynuyor. | |
moon | /muːn/ | n | A2 | Ay (gök cismi) | The moon is very bright tonight. | Bu gece ay çok parlak. | | full moon
star | /stɑː(r)/ | n | A2 | Yıldız | You can see many stars in the village. | Köyde birçok yıldız görebilirsin. | |
pet | /pet/ | n | A2 | Evcil hayvan | Do you have any pets? | Hiç evcil hayvanın var mı? | |
sheep | /ʃiːp/ | n | A2 | Koyun | The farmer has fifty sheep. | Çiftçinin elli koyunu var. | |
pig | /pɪɡ/ | n | A2 | Domuz | There are pigs and cows on the farm. | Çiftlikte domuzlar ve inekler var. | |
duck | /dʌk/ | n | A2 | Ördek | The children are feeding the ducks in the park. | Çocuklar parktaki ördekleri besliyor. | |
rabbit | /ˈræbɪt/ | n | A2 | Tavşan | My daughter has a white rabbit. | Kızımın beyaz bir tavşanı var. | |
mouse | /maʊs/ | n | A2 | Fare (çoğulu: mice) | The cat is chasing a mouse. | Kedi bir fareyi kovalıyor. | |
lion | /ˈlaɪən/ | n | A2 | Aslan | The lion is the king of the jungle. | Aslan ormanın kralıdır. | |
elephant | /ˈelɪfənt/ | n | A2 | Fil | Elephants have very good memories. | Fillerin hafızası çok iyidir. | |
monkey | /ˈmʌŋki/ | n | A2 | Maymun | The monkey is eating a banana. | Maymun muz yiyor. | |
bear | /beə(r)/ | n | A2 | Ayı | We saw a bear in the forest. | Ormanda bir ayı gördük. | |
snake | /sneɪk/ | n | A2 | Yılan | Are you afraid of snakes? | Yılanlardan korkar mısın? | |
`),
  ...parseVocab('emotions', `
worried | /ˈwʌrid/ | adj | A2 | Endişeli | I'm worried about my exam. | Sınavım için endişeliyim. | anxious | worried about
surprised | /səˈpraɪzd/ | adj | A2 | Şaşırmış | I was surprised to see him at the party. | Onu partide görünce şaşırdım. | amazed |
friendly | /ˈfrendli/ | adj | A2 | Arkadaş canlısı, güler yüzlü | The people here are very friendly. | Buradaki insanlar çok güler yüzlü. | kind |
funny | /ˈfʌni/ | adj | A2 | Komik | He told us a funny story. | Bize komik bir hikâye anlattı. | amusing |
clever | /ˈklevə(r)/ | adj | A2 | Akıllı, zeki | She is a very clever student. | Çok zeki bir öğrenci. | smart; intelligent |
stupid | /ˈstjuːpɪd/ | adj | A2 | Aptal, saçma | It was a stupid mistake. | Aptalca bir hataydı. | silly |
pleased | /pliːzd/ | adj | A2 | Memnun | We are very pleased with our new flat. | Yeni dairemizden çok memnunuz. | happy; glad |
unhappy | /ʌnˈhæpi/ | adj | A2 | Mutsuz | He was unhappy in his old job. | Eski işinde mutsuzdu. | sad |
feeling | /ˈfiːlɪŋ/ | n | A2 | Duygu, his | I have a feeling that something is wrong. | İçimde bir şeylerin yanlış olduğu hissi var. | emotion |
fun | /fʌn/ | n | A2 | Eğlence | Have fun at the party! | Partide iyi eğlenceler! | | have fun
`),
  ...parseVocab('tech', `
text | /tekst/ | n | A2 | Kısa mesaj; metin | I'll send you a text when I arrive. | Varınca sana mesaj atarım. | message | text message
laptop | /ˈlæptɒp/ | n | A2 | Dizüstü bilgisayar | I take my laptop to work every day. | Her gün dizüstü bilgisayarımı işe götürürüm. | |
tablet | /ˈtæblət/ | n | A2 | Tablet (bilgisayar); hap | My son reads books on his tablet. | Oğlum kitapları tabletinden okuyor. | |
mobile | /ˈməʊbaɪl/ | n | A2 | Cep telefonu | What's your mobile number? | Cep telefonu numaran ne? | phone | mobile phone
printer | /ˈprɪntə(r)/ | n | A2 | Yazıcı | The printer has no paper. | Yazıcıda kâğıt yok. | |
file | /faɪl/ | n | A2 | Dosya | Save the file before you close it. | Kapatmadan önce dosyayı kaydet. | document | open a file
program | /ˈprəʊɡræm/ | n | A2 | Program (bilgisayar) | This program helps you learn languages. | Bu program dil öğrenmene yardım ediyor. | software |
print | /prɪnt/ | v | A2 | Yazdırmak, basmak | Can you print this document for me? | Bu belgeyi benim için yazdırabilir misin? | | print out
chat | /tʃæt/ | v | A2 | Sohbet etmek, yazışmak | We chatted online for hours. | Saatlerce internette yazıştık. | talk |
`),
];
