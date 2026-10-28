import { parseVocab } from './parse';

// A1 — Başlangıç: selamlaşma, aile, zaman, renkler, temel fiil ve sıfatlar, günlük nesneler.
// Seviye yolunda en önce bu kelimeler gelir (bkz. levelPathWords).
export const A1_WORDS = [
  ...parseVocab('daily', `
# ── Selamlaşma ve nezaket ──
hello | /həˈləʊ/ | phr | A1 | Merhaba | Hello, my name is Ali. | Merhaba, benim adım Ali. | hi | say hello
goodbye | /ˌɡʊdˈbaɪ/ | phr | A1 | Hoşça kal, güle güle | We said goodbye at the station. | İstasyonda vedalaştık. | bye; see you | say goodbye
please | /pliːz/ | adv | A1 | Lütfen | Can I have some water, please? | Biraz su alabilir miyim, lütfen? | | yes, please
thank you | /ˈθæŋk juː/ | phr | A1 | Teşekkür ederim | Thank you for your help. | Yardımın için teşekkür ederim. | thanks | thank you very much
sorry | /ˈsɒri/ | adj | A1 | Üzgün; özür dilerim | I'm sorry I'm late. | Geç kaldığım için özür dilerim. | | say sorry; feel sorry for
excuse me | /ɪkˈskjuːz miː/ | phr | A1 | Affedersiniz, pardon | Excuse me, where is the station? | Affedersiniz, istasyon nerede? | pardon |
good morning | /ɡʊd ˈmɔːnɪŋ/ | phr | A1 | Günaydın | Good morning! Did you sleep well? | Günaydın! İyi uyudun mu? | |
good night | /ɡʊd ˈnaɪt/ | phr | A1 | İyi geceler | Good night, see you tomorrow. | İyi geceler, yarın görüşürüz. | |
how are you | /ˌhaʊ ɑː ˈjuː/ | phr | A1 | Nasılsın? | Hi Emma, how are you today? | Merhaba Emma, bugün nasılsın? | how's it going |
nice to meet you | /ˌnaɪs tə ˈmiːt juː/ | phr | A1 | Tanıştığıma memnun oldum | Nice to meet you, I'm Can. | Tanıştığımıza memnun oldum, ben Can. | pleased to meet you |
see you later | /ˌsiː juː ˈleɪtə(r)/ | phr | A1 | Sonra görüşürüz | I have to go now, see you later! | Şimdi gitmem gerek, sonra görüşürüz! | see you soon |
welcome | /ˈwelkəm/ | phr | A1 | Hoş geldin(iz) | Welcome to our home! | Evimize hoş geldiniz! | | warm welcome; welcome to
fine | /faɪn/ | adj | A1 | İyi, iyi durumda | I'm fine, thanks. And you? | İyiyim, teşekkürler. Ya sen? | okay; well |
# ── Aile ve insanlar ──
family | /ˈfæməli/ | n | A1 | Aile | I live with my family in Izmir. | İzmir'de ailemle yaşıyorum. | relatives | big family; family member
mother | /ˈmʌðə(r)/ | n | A1 | Anne | My mother is a teacher. | Annem öğretmen. | mum | mother and father
father | /ˈfɑːðə(r)/ | n | A1 | Baba | My father works in a bank. | Babam bir bankada çalışıyor. | dad |
parent | /ˈpeərənt/ | n | A1 | Ebeveyn (anne veya baba) | My parents live in Ankara. | Annem ve babam Ankara'da yaşıyor. | | parents' house
brother | /ˈbrʌðə(r)/ | n | A1 | Erkek kardeş, ağabey | I have one brother and two sisters. | Bir erkek ve iki kız kardeşim var. | | older brother; younger brother
sister | /ˈsɪstə(r)/ | n | A1 | Kız kardeş, abla | My sister is two years older than me. | Ablam benden iki yaş büyük. | | older sister; little sister
son | /sʌn/ | n | A1 | Oğul | Their son is ten years old. | Oğulları on yaşında. | | only son
daughter | /ˈdɔːtə(r)/ | n | A1 | Kız evlat | Her daughter is a doctor. | Kızı doktor. | | eldest daughter
husband | /ˈhʌzbənd/ | n | A1 | Koca, eş | Her husband cooks dinner every evening. | Kocası her akşam yemek pişiriyor. | | husband and wife
wife | /waɪf/ | n | A1 | Karı, eş | This is my wife, Selin. | Bu eşim Selin. | |
child | /tʃaɪld/ | n | A1 | Çocuk (çoğulu: children) | The child is playing in the garden. | Çocuk bahçede oynuyor. | kid |
baby | /ˈbeɪbi/ | n | A1 | Bebek | The baby is sleeping now. | Bebek şimdi uyuyor. | | have a baby
grandmother | /ˈɡrænmʌðə(r)/ | n | A1 | Büyükanne, nine | My grandmother makes the best soup. | Büyükannem en güzel çorbayı yapar. | grandma |
grandfather | /ˈɡrænfɑːðə(r)/ | n | A1 | Büyükbaba, dede | My grandfather is eighty years old. | Dedem seksen yaşında. | grandpa |
aunt | /ɑːnt/ | n | A1 | Teyze, hala, yenge | My aunt lives in London. | Teyzem Londra'da yaşıyor. | |
uncle | /ˈʌŋkl/ | n | A1 | Amca, dayı, enişte | My uncle has a small shop. | Amcamın küçük bir dükkânı var. | |
friend | /frend/ | n | A1 | Arkadaş | She is my best friend. | O benim en iyi arkadaşım. | mate | best friend; make friends
boy | /bɔɪ/ | n | A1 | Erkek çocuk, oğlan | The boy is riding a bike. | Oğlan bisiklet sürüyor. | | little boy
girl | /ɡɜːl/ | n | A1 | Kız çocuk | The girl has long hair. | Kızın uzun saçları var. | | little girl
man | /mæn/ | n | A1 | Adam, erkek (çoğulu: men) | A tall man is waiting outside. | Uzun boylu bir adam dışarıda bekliyor. | | young man; old man
woman | /ˈwʊmən/ | n | A1 | Kadın (çoğulu: women) | The woman in the red dress is my aunt. | Kırmızı elbiseli kadın teyzem. | lady |
people | /ˈpiːpl/ | n | A1 | İnsanlar | Many people live in this city. | Bu şehirde çok insan yaşıyor. | | young people
person | /ˈpɜːsn/ | n | A1 | Kişi | He is a very kind person. | O çok nazik bir insan. | | in person
name | /neɪm/ | n | A1 | İsim, ad | What is your name? | Adın ne? | | first name
age | /eɪdʒ/ | n | A1 | Yaş | We are the same age. | Aynı yaştayız. | | at the age of
birthday | /ˈbɜːθdeɪ/ | n | A1 | Doğum günü | Happy birthday! Here is your present. | Doğum günün kutlu olsun! İşte hediyen. | | happy birthday; birthday party
party | /ˈpɑːti/ | n | A1 | Parti, eğlence | We are having a party on Saturday. | Cumartesi bir parti veriyoruz. | celebration | have a party; birthday party
present | /ˈpreznt/ | n | A1 | Hediye | I bought a present for my mother. | Annem için bir hediye aldım. | gift | birthday present
love | /lʌv/ | v | A1 | Sevmek | I love my family very much. | Ailemi çok seviyorum. | adore | fall in love
like | /laɪk/ | v | A1 | Hoşlanmak, sevmek | Do you like pizza? | Pizza sever misin? | enjoy | would like
live | /lɪv/ | v | A1 | Yaşamak, oturmak | We live in a small flat. | Küçük bir dairede yaşıyoruz. | | live in; live with
meet | /miːt/ | v | A1 | Buluşmak, tanışmak | Let's meet at the café at six. | Altıda kafede buluşalım. | | meet up; meet someone
talk | /tɔːk/ | v | A1 | Konuşmak, sohbet etmek | We talked for hours. | Saatlerce konuştuk. | chat | talk to; talk about
ask | /ɑːsk/ | v | A1 | Sormak; istemek | Can I ask you a question? | Sana bir soru sorabilir miyim? | | ask a question; ask for help
call | /kɔːl/ | v | A1 | Aramak (telefonla); seslenmek | I will call you tomorrow. | Seni yarın arayacağım. | phone; ring | call back
send | /send/ | v | A1 | Göndermek | I'll send you the photos tonight. | Fotoğrafları sana bu akşam göndereceğim. | | send a message
`),
  ...parseVocab('core', `
# ── Zaman ──
time | /taɪm/ | n | A1 | Zaman; saat | What time is it? | Saat kaç? | | on time; free time
day | /deɪ/ | n | A1 | Gün | Have a nice day! | İyi günler! | | every day; all day
week | /wiːk/ | n | A1 | Hafta | I go swimming twice a week. | Haftada iki kez yüzmeye giderim. | | next week; last week
month | /mʌnθ/ | n | A1 | Ay (takvim) | We are moving next month. | Gelecek ay taşınıyoruz. | | every month
year | /jɪə(r)/ | n | A1 | Yıl, sene | I started learning English this year. | Bu yıl İngilizce öğrenmeye başladım. | | last year; next year
today | /təˈdeɪ/ | adv | A1 | Bugün | Today is a beautiful day. | Bugün güzel bir gün. | |
tomorrow | /təˈmɒrəʊ/ | adv | A1 | Yarın | See you tomorrow! | Yarın görüşürüz! | | tomorrow morning
yesterday | /ˈjestədeɪ/ | adv | A1 | Dün | I saw her yesterday. | Onu dün gördüm. | | yesterday evening
morning | /ˈmɔːnɪŋ/ | n | A1 | Sabah | I drink coffee every morning. | Her sabah kahve içerim. | | in the morning
afternoon | /ˌɑːftəˈnuːn/ | n | A1 | Öğleden sonra | We have a meeting this afternoon. | Bu öğleden sonra bir toplantımız var. | | in the afternoon
evening | /ˈiːvnɪŋ/ | n | A1 | Akşam | What are you doing this evening? | Bu akşam ne yapıyorsun? | | in the evening
night | /naɪt/ | n | A1 | Gece | I couldn't sleep last night. | Dün gece uyuyamadım. | | at night; last night
hour | /ˈaʊə(r)/ | n | A1 | Saat (süre) | The film is two hours long. | Film iki saat sürüyor. | | half an hour
minute | /ˈmɪnɪt/ | n | A1 | Dakika | Wait a minute, please. | Bir dakika bekle, lütfen. | | in a minute
weekend | /ˌwiːkˈend/ | n | A1 | Hafta sonu | What did you do at the weekend? | Hafta sonu ne yaptın? | | at the weekend
o'clock | /əˈklɒk/ | adv | A1 | Saat (tam saatlerde) | The shop opens at nine o'clock. | Dükkân saat dokuzda açılıyor. | |
clock | /klɒk/ | n | A1 | Saat (duvar/masa saati) | The clock on the wall is slow. | Duvardaki saat geri kalıyor. | | alarm clock
now | /naʊ/ | adv | A1 | Şimdi | I'm busy now; can I call you later? | Şimdi meşgulüm; seni sonra arayabilir miyim? | | right now
always | /ˈɔːlweɪz/ | adv | A1 | Her zaman | She always drinks tea in the morning. | O sabahları hep çay içer. | |
never | /ˈnevə(r)/ | adv | A1 | Asla, hiç | I never eat fast food. | Asla fast food yemem. | |
often | /ˈɒfn/ | adv | A1 | Sık sık | We often go to the cinema. | Sık sık sinemaya gideriz. | frequently |
sometimes | /ˈsʌmtaɪmz/ | adv | A1 | Bazen | Sometimes I walk to work. | Bazen işe yürüyerek giderim. | occasionally |
usually | /ˈjuːʒuəli/ | adv | A1 | Genellikle | I usually get up at seven. | Genellikle yedide kalkarım. | normally |
early | /ˈɜːli/ | adj | A1 | Erken | I have an early meeting tomorrow. | Yarın erken bir toplantım var. | | early morning
late | /leɪt/ | adj | A1 | Geç | Sorry, I'm late again. | Üzgünüm, yine geç kaldım. | | be late for
# ── Günler ve aylar ──
Monday | /ˈmʌndeɪ/ | n | A1 | Pazartesi | I start my new job on Monday. | Yeni işime pazartesi başlıyorum. | |
Tuesday | /ˈtjuːzdeɪ/ | n | A1 | Salı | The museum is closed on Tuesday. | Müze salı günü kapalı. | |
Wednesday | /ˈwenzdeɪ/ | n | A1 | Çarşamba | We have English class on Wednesday. | Çarşamba günü İngilizce dersimiz var. | |
Thursday | /ˈθɜːzdeɪ/ | n | A1 | Perşembe | The meeting is on Thursday morning. | Toplantı perşembe sabahı. | |
Friday | /ˈfraɪdeɪ/ | n | A1 | Cuma | Let's go out on Friday night. | Cuma akşamı dışarı çıkalım. | |
Saturday | /ˈsætədeɪ/ | n | A1 | Cumartesi | I clean the house on Saturday. | Cumartesi evi temizlerim. | |
Sunday | /ˈsʌndeɪ/ | n | A1 | Pazar | We visit my grandmother every Sunday. | Her pazar büyükanneme gideriz. | |
January | /ˈdʒænjuəri/ | n | A1 | Ocak | It snows a lot in January. | Ocakta çok kar yağar. | |
February | /ˈfebruəri/ | n | A1 | Şubat | February is the shortest month. | Şubat en kısa aydır. | |
March | /mɑːtʃ/ | n | A1 | Mart | My birthday is in March. | Doğum günüm martta. | |
April | /ˈeɪprəl/ | n | A1 | Nisan | The flowers open in April. | Çiçekler nisanda açar. | |
May | /meɪ/ | n | A1 | Mayıs | The exams start in May. | Sınavlar mayısta başlıyor. | |
June | /dʒuːn/ | n | A1 | Haziran | School finishes in June. | Okul haziranda bitiyor. | |
July | /dʒuˈlaɪ/ | n | A1 | Temmuz | July is very hot here. | Burada temmuz çok sıcak. | |
August | /ˈɔːɡəst/ | n | A1 | Ağustos | We go on holiday in August. | Ağustosta tatile gideriz. | |
September | /sepˈtembə(r)/ | n | A1 | Eylül | The new school year starts in September. | Yeni okul yılı eylülde başlar. | |
October | /ɒkˈtəʊbə(r)/ | n | A1 | Ekim | The leaves turn brown in October. | Ekimde yapraklar kahverengiye döner. | |
November | /nəʊˈvembə(r)/ | n | A1 | Kasım | It often rains in November. | Kasımda sık sık yağmur yağar. | |
December | /dɪˈsembə(r)/ | n | A1 | Aralık | December is the last month of the year. | Aralık yılın son ayıdır. | |
# ── Sayılar ve sıra ──
number | /ˈnʌmbə(r)/ | n | A1 | Sayı, numara | What is your phone number? | Telefon numaran ne? | | phone number
hundred | /ˈhʌndrəd/ | n | A1 | Yüz (sayı) | There are a hundred students in the school. | Okulda yüz öğrenci var. | | hundreds of
thousand | /ˈθaʊznd/ | n | A1 | Bin | The ticket costs two thousand lira. | Bilet iki bin lira. | | thousands of
first | /fɜːst/ | adj | A1 | Birinci, ilk | This is my first trip to Paris. | Bu benim Paris'e ilk gezim. | | at first; for the first time
last | /lɑːst/ | adj | A1 | Son; geçen | I watched a great film last night. | Dün gece harika bir film izledim. | final | last week; at last
next | /nekst/ | adj | A1 | Sonraki, gelecek | See you next week! | Gelecek hafta görüşürüz! | following | next time; next to
half | /hɑːf/ | n | A1 | Yarım, yarı | I'll be there in half an hour. | Yarım saat içinde orada olurum. | | half an hour; half price
# ── Renkler ──
colour | /ˈkʌlə(r)/ | n | A1 | Renk | What colour is your car? | Araban ne renk? | | favourite colour
red | /red/ | adj | A1 | Kırmızı | She has a red car. | Kırmızı bir arabası var. | |
blue | /bluː/ | adj | A1 | Mavi | The sky is blue today. | Bugün gökyüzü mavi. | | light blue; dark blue
green | /ɡriːn/ | adj | A1 | Yeşil | The traffic light is green. | Trafik ışığı yeşil. | |
yellow | /ˈjeləʊ/ | adj | A1 | Sarı | Bananas are yellow. | Muzlar sarıdır. | |
black | /blæk/ | adj | A1 | Siyah | I like black coffee. | Sade (sütsüz) kahveyi severim. | | black and white
white | /waɪt/ | adj | A1 | Beyaz | The snow is white and soft. | Kar beyaz ve yumuşak. | |
brown | /braʊn/ | adj | A1 | Kahverengi | He has brown eyes. | Kahverengi gözleri var. | |
pink | /pɪŋk/ | adj | A1 | Pembe | She is wearing a pink dress. | Pembe bir elbise giyiyor. | |
grey | /ɡreɪ/ | adj | A1 | Gri | The sky is grey and cloudy. | Gökyüzü gri ve bulutlu. | |
purple | /ˈpɜːpl/ | adj | A1 | Mor | Purple is my favourite colour. | Mor en sevdiğim renk. | |
# ── Temel fiiller ──
be | /biː/ | v | A1 | Olmak | I want to be a doctor. | Doktor olmak istiyorum. | |
have | /hæv/ | v | A1 | Sahip olmak; (yemek, içecek) almak | We have two cats. | İki kedimiz var. | own | have breakfast; have fun
do | /duː/ | v | A1 | Yapmak | What do you do at the weekend? | Hafta sonu ne yaparsın? | | do homework; do the shopping
make | /meɪk/ | v | A1 | Yapmak, hazırlamak | I make breakfast for my kids. | Çocuklarıma kahvaltı hazırlarım. | create | make a mistake; make money
get | /ɡet/ | v | A1 | Almak, edinmek; varmak | I get a lot of emails every day. | Her gün çok e-posta alırım. | receive | get home; get a job
go | /ɡəʊ/ | v | A1 | Gitmek | I go to work by bus. | İşe otobüsle giderim. | | go home; go shopping
come | /kʌm/ | v | A1 | Gelmek | Can you come to my party? | Partime gelebilir misin? | | come in; come home
see | /siː/ | v | A1 | Görmek | I can see the sea from my window. | Penceremden denizi görebiliyorum. | |
look | /lʊk/ | v | A1 | Bakmak | Look at this photo! | Şu fotoğrafa bak! | | look at
watch | /wɒtʃ/ | v | A1 | İzlemek, seyretmek | We watch TV after dinner. | Akşam yemeğinden sonra televizyon izleriz. | | watch a film
listen | /ˈlɪsn/ | v | A1 | Dinlemek | I listen to music on the bus. | Otobüste müzik dinlerim. | | listen to
hear | /hɪə(r)/ | v | A1 | Duymak | Can you hear me? | Beni duyabiliyor musun? | | hear about
say | /seɪ/ | v | A1 | Söylemek, demek | What did you say? | Ne dedin? | | say hello; say sorry
tell | /tel/ | v | A1 | Anlatmak, söylemek | Tell me about your holiday. | Bana tatilini anlat. | | tell a story; tell the truth
speak | /spiːk/ | v | A1 | Konuşmak (bir dili) | Do you speak English? | İngilizce konuşuyor musun? | | speak to
read | /riːd/ | v | A1 | Okumak | I read a book every month. | Her ay bir kitap okurum. | | read a book
write | /raɪt/ | v | A1 | Yazmak | Please write your name here. | Lütfen adını buraya yaz. | | write a letter
spell | /spel/ | v | A1 | (Bir kelimeyi) harf harf söylemek | How do you spell your name? | Adını nasıl yazıyorsun, harf harf söyler misin? | | spell a word
know | /nəʊ/ | v | A1 | Bilmek, tanımak | I know the answer. | Cevabı biliyorum. | |
think | /θɪŋk/ | v | A1 | Düşünmek | I think it's a good idea. | Bence bu iyi bir fikir. | believe | think about
want | /wɒnt/ | v | A1 | İstemek | I want a glass of water. | Bir bardak su istiyorum. | | want to do
need | /niːd/ | v | A1 | İhtiyaç duymak, gerekmek | I need a new phone. | Yeni bir telefona ihtiyacım var. | | need to do
help | /help/ | v | A1 | Yardım etmek | Can you help me with my homework? | Ödevime yardım edebilir misin? | assist |
give | /ɡɪv/ | v | A1 | Vermek | Give me your bag; I'll carry it. | Çantanı bana ver; ben taşırım. | | give a present
take | /teɪk/ | v | A1 | Almak, götürmek | Take an umbrella; it's raining. | Bir şemsiye al; yağmur yağıyor. | | take a photo; take a bus
put | /pʊt/ | v | A1 | Koymak | Put your shoes by the door. | Ayakkabılarını kapının yanına koy. | place |
open | /ˈəʊpən/ | v | A1 | Açmak | Can you open the window? | Pencereyi açabilir misin? | | open a door
close | /kləʊz/ | v | A1 | Kapatmak | Please close the door. | Lütfen kapıyı kapat. | shut |
start | /stɑːt/ | v | A1 | Başlamak | The film starts at eight. | Film sekizde başlıyor. | begin |
finish | /ˈfɪnɪʃ/ | v | A1 | Bitirmek | I finish work at five. | İşi beşte bitiririm. | end | finish school
stop | /stɒp/ | v | A1 | Durmak, durdurmak | The bus stops here. | Otobüs burada duruyor. | | stop doing
play | /pleɪ/ | v | A1 | Oynamak; (enstrüman) çalmak | The children play in the park. | Çocuklar parkta oynuyor. | | play football; play the guitar
run | /rʌn/ | v | A1 | Koşmak | I run in the park every morning. | Her sabah parkta koşarım. | jog |
sit | /sɪt/ | v | A1 | Oturmak | Please sit down. | Lütfen oturun. | | sit down
stand | /stænd/ | v | A1 | Ayakta durmak | We had to stand on the bus. | Otobüste ayakta durmak zorunda kaldık. | | stand up
buy | /baɪ/ | v | A1 | Satın almak | I want to buy a new jacket. | Yeni bir ceket almak istiyorum. | purchase |
sell | /sel/ | v | A1 | Satmak | They sell fresh bread here. | Burada taze ekmek satıyorlar. | |
cost | /kɒst/ | v | A1 | Fiyatı olmak, tutmak | How much does this shirt cost? | Bu gömleğin fiyatı ne kadar? | |
find | /faɪnd/ | v | A1 | Bulmak | I can't find my keys. | Anahtarlarımı bulamıyorum. | |
try | /traɪ/ | v | A1 | Denemek | Try this cake; it's delicious. | Bu keki dene; çok lezzetli. | |
use | /juːz/ | v | A1 | Kullanmak | Can I use your phone? | Telefonunu kullanabilir miyim? | |
show | /ʃəʊ/ | v | A1 | Göstermek | Show me your new phone. | Bana yeni telefonunu göster. | | show someone around
stay | /steɪ/ | v | A1 | Kalmak | We stayed at a small hotel. | Küçük bir otelde kaldık. | remain | stay at home
leave | /liːv/ | v | A1 | Ayrılmak, bırakmak | The train leaves at ten. | Tren onda kalkıyor. | depart | leave home
work | /wɜːk/ | v | A1 | Çalışmak | My father works in a hospital. | Babam bir hastanede çalışıyor. | | work hard
study | /ˈstʌdi/ | v | A1 | Ders çalışmak, okumak | She studies medicine at university. | Üniversitede tıp okuyor. | learn | study for an exam
dance | /dɑːns/ | v | A1 | Dans etmek | We danced all night at the wedding. | Düğünde bütün gece dans ettik. | |
sing | /sɪŋ/ | v | A1 | Şarkı söylemek | She sings in a band. | Bir grupta şarkı söylüyor. | | sing a song
draw | /drɔː/ | v | A1 | Çizmek | My son likes to draw animals. | Oğlum hayvan çizmeyi sever. | | draw a picture
swim | /swɪm/ | v | A1 | Yüzmek | Can you swim? | Yüzebiliyor musun? | | go swimming
walk | /wɔːk/ | v | A1 | Yürümek | I walk to school every day. | Her gün okula yürüyerek giderim. | | go for a walk
sleep | /sliːp/ | v | A1 | Uyumak | Babies sleep a lot. | Bebekler çok uyur. | | sleep well
eat | /iːt/ | v | A1 | Yemek yemek | We eat dinner at seven. | Akşam yemeğini yedide yeriz. | |
drink | /drɪŋk/ | v | A1 | İçmek | You should drink more water. | Daha fazla su içmelisin. | |
cook | /kʊk/ | v | A1 | Yemek pişirmek | My husband cooks very well. | Kocam çok iyi yemek yapar. | | cook dinner
clean | /kliːn/ | v | A1 | Temizlemek | I clean my room every Saturday. | Her cumartesi odamı temizlerim. | tidy | clean the house
wash | /wɒʃ/ | v | A1 | Yıkamak | Wash your hands before dinner. | Yemekten önce ellerini yıka. | | wash the dishes
# ── Temel sıfat ve zarflar ──
good | /ɡʊd/ | adj | A1 | İyi, güzel | This is a really good film. | Bu gerçekten iyi bir film. | great | good at
bad | /bæd/ | adj | A1 | Kötü | The weather is bad today. | Bugün hava kötü. | terrible | bad news
big | /bɪɡ/ | adj | A1 | Büyük | They live in a big house. | Büyük bir evde yaşıyorlar. | large |
small | /smɔːl/ | adj | A1 | Küçük | I have a small car. | Küçük bir arabam var. | little |
new | /njuː/ | adj | A1 | Yeni | I like your new shoes. | Yeni ayakkabılarını beğendim. | |
old | /əʊld/ | adj | A1 | Eski; yaşlı | This is a very old building. | Bu çok eski bir bina. | | old friend
young | /jʌŋ/ | adj | A1 | Genç | My teacher is very young. | Öğretmenim çok genç. | |
long | /lɒŋ/ | adj | A1 | Uzun | It was a long day. | Uzun bir gündü. | | a long time
short | /ʃɔːt/ | adj | A1 | Kısa | She has short hair. | Kısa saçları var. | |
tall | /tɔːl/ | adj | A1 | Uzun boylu; yüksek | My brother is very tall. | Erkek kardeşim çok uzun boylu. | |
beautiful | /ˈbjuːtɪfl/ | adj | A1 | Güzel | What a beautiful garden! | Ne güzel bir bahçe! | lovely; pretty |
nice | /naɪs/ | adj | A1 | Hoş, güzel, nazik | Have a nice weekend! | İyi hafta sonları! | lovely; pleasant |
easy | /ˈiːzi/ | adj | A1 | Kolay | The test was easy. | Sınav kolaydı. | simple |
hard | /hɑːd/ | adj | A1 | Zor; sert | This exercise is very hard. | Bu alıştırma çok zor. | difficult | work hard
fast | /fɑːst/ | adj | A1 | Hızlı | This is a very fast train. | Bu çok hızlı bir tren. | quick |
slow | /sləʊ/ | adj | A1 | Yavaş | The internet is very slow today. | İnternet bugün çok yavaş. | |
hot | /hɒt/ | adj | A1 | Sıcak | Be careful, the soup is hot. | Dikkat et, çorba sıcak. | | hot weather
cold | /kəʊld/ | adj | A1 | Soğuk | It's very cold outside. | Dışarısı çok soğuk. | | catch a cold
warm | /wɔːm/ | adj | A1 | Ilık, sıcak | Wear a warm coat. | Sıcak tutan bir mont giy. | | warm weather
dirty | /ˈdɜːti/ | adj | A1 | Kirli | My shoes are dirty. | Ayakkabılarım kirli. | |
busy | /ˈbɪzi/ | adj | A1 | Meşgul, yoğun | I'm very busy this week. | Bu hafta çok yoğunum. | | busy street
ready | /ˈredi/ | adj | A1 | Hazır | Dinner is ready! | Akşam yemeği hazır! | | get ready
favourite | /ˈfeɪvərɪt/ | adj | A1 | En sevilen, gözde | Pizza is my favourite food. | Pizza en sevdiğim yemek. | |
important | /ɪmˈpɔːtnt/ | adj | A1 | Önemli | This is an important meeting. | Bu önemli bir toplantı. | |
interesting | /ˈɪntrəstɪŋ/ | adj | A1 | İlginç | That's an interesting book. | Bu ilginç bir kitap. | |
boring | /ˈbɔːrɪŋ/ | adj | A1 | Sıkıcı | The film was really boring. | Film gerçekten sıkıcıydı. | dull |
great | /ɡreɪt/ | adj | A1 | Harika; büyük | We had a great time. | Harika vakit geçirdik. | wonderful |
free | /friː/ | adj | A1 | Ücretsiz; boş | The museum is free on Sundays. | Müze pazar günleri ücretsiz. | | free time
right | /raɪt/ | adj | A1 | Doğru; sağ | That's the right answer. | Doğru cevap bu. | correct | turn right
wrong | /rɒŋ/ | adj | A1 | Yanlış | Sorry, wrong number. | Pardon, yanlış numara. | incorrect |
same | /seɪm/ | adj | A1 | Aynı | We have the same phone. | Aynı telefona sahibiz. | |
different | /ˈdɪfrənt/ | adj | A1 | Farklı | My sister and I are very different. | Kız kardeşim ve ben çok farklıyız. | | different from
very | /ˈveri/ | adv | A1 | Çok | Thank you very much. | Çok teşekkür ederim. | really |
really | /ˈriːəli/ | adv | A1 | Gerçekten | I really like your idea. | Fikrini gerçekten beğendim. | |
again | /əˈɡen/ | adv | A1 | Tekrar, yine | Can you say that again? | Bunu tekrar söyleyebilir misin? | |
also | /ˈɔːlsəʊ/ | adv | A1 | Ayrıca, de/da | She speaks English and also French. | İngilizce ve ayrıca Fransızca konuşuyor. | too |
here | /hɪə(r)/ | adv | A1 | Burada, buraya | Come here, please. | Buraya gel, lütfen. | |
there | /ðeə(r)/ | adv | A1 | Orada, oraya | Put the box over there. | Kutuyu şuraya koy. | | over there
together | /təˈɡeðə(r)/ | adv | A1 | Birlikte | Let's have dinner together. | Akşam yemeğini birlikte yiyelim. | |
# ── Genel isimler ──
money | /ˈmʌni/ | n | A1 | Para | I don't have much money this month. | Bu ay fazla param yok. | cash | save money; spend money
idea | /aɪˈdɪə/ | n | A1 | Fikir | That's a great idea! | Bu harika bir fikir! | | good idea
problem | /ˈprɒbləm/ | n | A1 | Sorun, problem | We have a problem with the car. | Arabayla ilgili bir sorunumuz var. | issue | no problem
place | /pleɪs/ | n | A1 | Yer | This is a nice place for a picnic. | Burası piknik için güzel bir yer. | |
world | /wɜːld/ | n | A1 | Dünya | I want to travel around the world. | Dünyayı dolaşmak istiyorum. | | all over the world
life | /laɪf/ | n | A1 | Hayat, yaşam | City life is very busy. | Şehir hayatı çok yoğun. | | real life
story | /ˈstɔːri/ | n | A1 | Hikâye | My father tells us a story every night. | Babam bize her gece bir hikâye anlatır. | tale | tell a story
song | /sɒŋ/ | n | A1 | Şarkı | This is my favourite song. | Bu benim en sevdiğim şarkı. | |
letter | /ˈletə(r)/ | n | A1 | Mektup; harf | I wrote a letter to my grandmother. | Büyükanneme bir mektup yazdım. | |
address | /əˈdres/ | n | A1 | Adres | What's your email address? | E-posta adresin ne? | |
thing | /θɪŋ/ | n | A1 | Şey | I have a lot of things to do today. | Bugün yapacak çok şeyim var. | |
way | /weɪ/ | n | A1 | Yol; yöntem | Is this the way to the station? | İstasyonun yolu bu mu? | |
music | /ˈmjuːzɪk/ | n | A1 | Müzik | What kind of music do you like? | Ne tür müzik seversin? | | listen to music
film | /fɪlm/ | n | A1 | Film | Let's watch a film tonight. | Bu akşam bir film izleyelim. | movie |
sport | /spɔːt/ | n | A1 | Spor | Football is the most popular sport in Turkey. | Futbol Türkiye'nin en popüler sporu. | | do sport
football | /ˈfʊtbɔːl/ | n | A1 | Futbol | The boys play football after school. | Çocuklar okuldan sonra futbol oynar. | soccer |
game | /ɡeɪm/ | n | A1 | Oyun; maç | Let's play a game. | Bir oyun oynayalım. | match |
# ── Okul ve iş ──
school | /skuːl/ | n | A1 | Okul | My children walk to school. | Çocuklarım okula yürüyerek gider. | | go to school
student | /ˈstjuːdnt/ | n | A1 | Öğrenci | She is a student at Istanbul University. | İstanbul Üniversitesi'nde öğrenci. | pupil |
teacher | /ˈtiːtʃə(r)/ | n | A1 | Öğretmen | Our English teacher is from Canada. | İngilizce öğretmenimiz Kanadalı. | |
class | /klɑːs/ | n | A1 | Sınıf; ders | There are twenty students in my class. | Sınıfımda yirmi öğrenci var. | lesson |
lesson | /ˈlesn/ | n | A1 | Ders | I have a piano lesson on Monday. | Pazartesi piyano dersim var. | class |
homework | /ˈhəʊmwɜːk/ | n | A1 | Ev ödevi | Did you finish your homework? | Ödevini bitirdin mi? | | do homework
pen | /pen/ | n | A1 | Tükenmez kalem | Can I borrow your pen? | Kalemini ödünç alabilir miyim? | |
pencil | /ˈpensl/ | n | A1 | Kurşun kalem | Write your answers in pencil. | Cevaplarını kurşun kalemle yaz. | |
paper | /ˈpeɪpə(r)/ | n | A1 | Kâğıt | I need a piece of paper. | Bir parça kâğıda ihtiyacım var. | |
word | /wɜːd/ | n | A1 | Kelime, sözcük | I learn ten new words every day. | Her gün on yeni kelime öğreniyorum. | | in other words
sentence | /ˈsentəns/ | n | A1 | Cümle | Write five sentences about your family. | Ailen hakkında beş cümle yaz. | |
example | /ɪɡˈzɑːmpl/ | n | A1 | Örnek | Can you give me an example? | Bana bir örnek verebilir misin? | | for example
dictionary | /ˈdɪkʃənri/ | n | A1 | Sözlük | Look up the word in a dictionary. | Kelimeye sözlükte bak. | |
question | /ˈkwestʃən/ | n | A1 | Soru | Do you have any questions? | Hiç sorunuz var mı? | | ask a question
exam | /ɪɡˈzæm/ | n | A1 | Sınav | I have a maths exam tomorrow. | Yarın matematik sınavım var. | test | pass an exam
university | /ˌjuːnɪˈvɜːsəti/ | n | A1 | Üniversite | My brother is at university. | Ağabeyim üniversitede okuyor. | | go to university
job | /dʒɒb/ | n | A1 | İş, meslek | She has a new job at a bank. | Bir bankada yeni bir işi var. | work | get a job
office | /ˈɒfɪs/ | n | A1 | Ofis, büro | I work in an office in the city. | Şehirde bir ofiste çalışıyorum. | |
# ── Giysiler ──
clothes | /kləʊðz/ | n | A1 | Giysiler, kıyafetler | I need some new clothes. | Birkaç yeni kıyafete ihtiyacım var. | |
shirt | /ʃɜːt/ | n | A1 | Gömlek | He is wearing a white shirt. | Beyaz bir gömlek giyiyor. | |
T-shirt | /ˈtiː ʃɜːt/ | n | A1 | Tişört | It's hot; just wear a T-shirt. | Hava sıcak; sadece tişört giy. | |
trousers | /ˈtraʊzəz/ | n | A1 | Pantolon | These trousers are too long. | Bu pantolon çok uzun. | pants |
jeans | /dʒiːnz/ | n | A1 | Kot pantolon | I usually wear jeans. | Genellikle kot giyerim. | |
dress | /dres/ | n | A1 | Elbise | She bought a new dress for the party. | Parti için yeni bir elbise aldı. | |
skirt | /skɜːt/ | n | A1 | Etek | She is wearing a long black skirt. | Uzun siyah bir etek giyiyor. | |
shoe | /ʃuː/ | n | A1 | Ayakkabı | I need new shoes for running. | Koşu için yeni ayakkabılara ihtiyacım var. | |
coat | /kəʊt/ | n | A1 | Palto, mont | Take your coat; it's cold. | Montunu al; hava soğuk. | |
jacket | /ˈdʒækɪt/ | n | A1 | Ceket | This leather jacket is very expensive. | Bu deri ceket çok pahalı. | |
hat | /hæt/ | n | A1 | Şapka | Wear a hat in the sun. | Güneşte şapka tak. | cap |
bag | /bæɡ/ | n | A1 | Çanta | My bag is very heavy. | Çantam çok ağır. | | shopping bag
`),
  ...parseVocab('food', `
food | /fuːd/ | n | A1 | Yiyecek, yemek | Turkish food is famous all over the world. | Türk yemekleri tüm dünyada ünlüdür. | | fast food
water | /ˈwɔːtə(r)/ | n | A1 | Su | Can I have a glass of water? | Bir bardak su alabilir miyim? | |
bread | /bred/ | n | A1 | Ekmek | I buy fresh bread every morning. | Her sabah taze ekmek alırım. | | a loaf of bread
milk | /mɪlk/ | n | A1 | Süt | Do you take milk in your tea? | Çayına süt koyar mısın? | |
coffee | /ˈkɒfi/ | n | A1 | Kahve | Let's have a coffee. | Bir kahve içelim. | |
tea | /tiː/ | n | A1 | Çay | Would you like a cup of tea? | Bir fincan çay ister misin? | |
egg | /eɡ/ | n | A1 | Yumurta | I have two eggs for breakfast. | Kahvaltıda iki yumurta yerim. | | boiled egg
cheese | /tʃiːz/ | n | A1 | Peynir | I'd like a cheese sandwich. | Peynirli sandviç istiyorum. | |
rice | /raɪs/ | n | A1 | Pirinç, pilav | We often eat rice with chicken. | Sık sık tavukla pilav yeriz. | |
meat | /miːt/ | n | A1 | Et | I don't eat meat. | Et yemem. | |
chicken | /ˈtʃɪkɪn/ | n | A1 | Tavuk | The chicken soup is delicious. | Tavuk çorbası çok lezzetli. | |
fish | /fɪʃ/ | n | A1 | Balık | We eat fish on Fridays. | Cuma günleri balık yeriz. | |
fruit | /fruːt/ | n | A1 | Meyve | Eat more fruit and vegetables. | Daha çok meyve ve sebze ye. | |
apple | /ˈæpl/ | n | A1 | Elma | An apple a day keeps the doctor away. | Günde bir elma doktoru uzak tutar. | |
banana | /bəˈnɑːnə/ | n | A1 | Muz | Monkeys love bananas. | Maymunlar muzu çok sever. | |
orange | /ˈɒrɪndʒ/ | n | A1 | Portakal; turuncu | I drink orange juice every morning. | Her sabah portakal suyu içerim. | | orange juice
vegetable | /ˈvedʒtəbl/ | n | A1 | Sebze | We grow vegetables in our garden. | Bahçemizde sebze yetiştiriyoruz. | |
potato | /pəˈteɪtəʊ/ | n | A1 | Patates | Do you want potatoes with your fish? | Balığının yanında patates ister misin? | |
tomato | /təˈmɑːtəʊ/ | n | A1 | Domates | Cut the tomatoes into small pieces. | Domatesleri küçük parçalara kes. | |
salad | /ˈsæləd/ | n | A1 | Salata | I'll have a green salad, please. | Yeşil salata alayım, lütfen. | |
soup | /suːp/ | n | A1 | Çorba | Lentil soup is very popular in Turkey. | Mercimek çorbası Türkiye'de çok sevilir. | |
sandwich | /ˈsænwɪtʃ/ | n | A1 | Sandviç | I made a sandwich for lunch. | Öğle yemeği için sandviç yaptım. | |
cake | /keɪk/ | n | A1 | Kek, pasta | She made a chocolate cake for my birthday. | Doğum günüm için çikolatalı pasta yaptı. | |
chocolate | /ˈtʃɒklət/ | n | A1 | Çikolata | I love dark chocolate. | Bitter çikolatayı çok severim. | |
sugar | /ˈʃʊɡə(r)/ | n | A1 | Şeker | No sugar for me, thanks. | Bana şeker yok, teşekkürler. | |
juice | /dʒuːs/ | n | A1 | Meyve suyu | A glass of apple juice, please. | Bir bardak elma suyu, lütfen. | |
breakfast | /ˈbrekfəst/ | n | A1 | Kahvaltı | What do you have for breakfast? | Kahvaltıda ne yersin? | | have breakfast
lunch | /lʌntʃ/ | n | A1 | Öğle yemeği | Let's have lunch together. | Öğle yemeğini birlikte yiyelim. | |
dinner | /ˈdɪnə(r)/ | n | A1 | Akşam yemeği | Dinner is at eight o'clock. | Akşam yemeği saat sekizde. | |
restaurant | /ˈrestrɒnt/ | n | A1 | Restoran | We had dinner at an Italian restaurant. | Bir İtalyan restoranında akşam yemeği yedik. | |
cup | /kʌp/ | n | A1 | Fincan, kupa | I drink three cups of coffee a day. | Günde üç fincan kahve içerim. | mug |
glass | /ɡlɑːs/ | n | A1 | Bardak; cam | Can I have a glass of milk? | Bir bardak süt alabilir miyim? | |
bottle | /ˈbɒtl/ | n | A1 | Şişe | I bought a bottle of water. | Bir şişe su aldım. | |
`),
  ...parseVocab('home', `
house | /haʊs/ | n | A1 | Ev | They have a house by the sea. | Deniz kenarında bir evleri var. | home |
home | /həʊm/ | n | A1 | Ev, yuva | I'm going home now. | Şimdi eve gidiyorum. | | at home; go home
room | /ruːm/ | n | A1 | Oda | My room is on the second floor. | Odam ikinci katta. | |
kitchen | /ˈkɪtʃɪn/ | n | A1 | Mutfak | We eat breakfast in the kitchen. | Kahvaltıyı mutfakta yaparız. | |
bedroom | /ˈbedruːm/ | n | A1 | Yatak odası | The flat has two bedrooms. | Dairenin iki yatak odası var. | |
bathroom | /ˈbɑːθruːm/ | n | A1 | Banyo | The bathroom is next to the kitchen. | Banyo mutfağın yanında. | |
living room | /ˈlɪvɪŋ ruːm/ | n | A1 | Oturma odası | We watch TV in the living room. | Oturma odasında televizyon izleriz. | lounge |
garden | /ˈɡɑːdn/ | n | A1 | Bahçe | My grandfather works in the garden every day. | Dedem her gün bahçede çalışır. | |
door | /dɔː(r)/ | n | A1 | Kapı | Someone is at the door. | Kapıda biri var. | | open the door
window | /ˈwɪndəʊ/ | n | A1 | Pencere | Open the window; it's hot in here. | Pencereyi aç; burası sıcak. | |
table | /ˈteɪbl/ | n | A1 | Masa | The keys are on the kitchen table. | Anahtarlar mutfak masasında. | |
chair | /tʃeə(r)/ | n | A1 | Sandalye | Please take a chair. | Lütfen bir sandalye alın. | |
bed | /bed/ | n | A1 | Yatak | I go to bed at eleven. | Saat on birde yatarım. | | go to bed
wall | /wɔːl/ | n | A1 | Duvar | There is a big picture on the wall. | Duvarda büyük bir resim var. | |
floor | /flɔː(r)/ | n | A1 | Zemin; kat | The cat is sleeping on the floor. | Kedi yerde uyuyor. | | ground floor
shower | /ˈʃaʊə(r)/ | n | A1 | Duş | I have a shower every morning. | Her sabah duş alırım. | | have a shower
toilet | /ˈtɔɪlət/ | n | A1 | Tuvalet | Where is the toilet, please? | Tuvalet nerede, lütfen? | |
flat | /flæt/ | n | A1 | Daire (apartman dairesi) | She lives in a flat in the city centre. | Şehir merkezinde bir dairede yaşıyor. | apartment |
picture | /ˈpɪktʃə(r)/ | n | A1 | Resim | Draw a picture of your house. | Evinin resmini çiz. | image |
`),
  ...parseVocab('travel', `
city | /ˈsɪti/ | n | A1 | Şehir | Istanbul is a very big city. | İstanbul çok büyük bir şehir. | | city centre
town | /taʊn/ | n | A1 | Kasaba, şehir | I grew up in a small town. | Küçük bir kasabada büyüdüm. | |
street | /striːt/ | n | A1 | Sokak, cadde | There are many shops on this street. | Bu sokakta birçok dükkân var. | road |
road | /rəʊd/ | n | A1 | Yol | Be careful when you cross the road. | Yolu geçerken dikkatli ol. | |
shop | /ʃɒp/ | n | A1 | Dükkân, mağaza | The shop closes at nine. | Dükkân dokuzda kapanıyor. | store |
supermarket | /ˈsuːpəmɑːkɪt/ | n | A1 | Süpermarket | I buy fruit at the supermarket. | Meyveyi süpermarketten alırım. | |
market | /ˈmɑːkɪt/ | n | A1 | Pazar, çarşı | We buy vegetables at the market on Sundays. | Pazar günleri pazardan sebze alırız. | |
bank | /bæŋk/ | n | A1 | Banka | The bank opens at nine. | Banka dokuzda açılıyor. | |
park | /pɑːk/ | n | A1 | Park | Let's go for a walk in the park. | Parkta yürüyüşe çıkalım. | |
station | /ˈsteɪʃn/ | n | A1 | İstasyon | The station is near my house. | İstasyon evime yakın. | | train station; bus station
airport | /ˈeəpɔːt/ | n | A1 | Havalimanı | We arrived at the airport early. | Havalimanına erken vardık. | |
hotel | /həʊˈtel/ | n | A1 | Otel | Our hotel is near the beach. | Otelimiz plaja yakın. | |
car | /kɑː(r)/ | n | A1 | Araba | I go to work by car. | İşe arabayla giderim. | | by car
bus | /bʌs/ | n | A1 | Otobüs | The bus is late again. | Otobüs yine gecikti. | | bus stop
train | /treɪn/ | n | A1 | Tren | The train to Ankara leaves at nine. | Ankara treni dokuzda kalkıyor. | | by train
bike | /baɪk/ | n | A1 | Bisiklet | I ride my bike to school. | Okula bisikletle giderim. | bicycle | ride a bike
taxi | /ˈtæksi/ | n | A1 | Taksi | Let's take a taxi to the hotel. | Otele taksiyle gidelim. | cab |
plane | /pleɪn/ | n | A1 | Uçak | The plane lands at six. | Uçak altıda iniyor. | aeroplane | by plane
ticket | /ˈtɪkɪt/ | n | A1 | Bilet | I bought two tickets for the concert. | Konser için iki bilet aldım. | | train ticket
holiday | /ˈhɒlədeɪ/ | n | A1 | Tatil | We are going on holiday next week. | Gelecek hafta tatile gidiyoruz. | vacation | go on holiday
beach | /biːtʃ/ | n | A1 | Plaj, kumsal | We spent the day on the beach. | Günü plajda geçirdik. | |
country | /ˈkʌntri/ | n | A1 | Ülke; kırsal | Which country are you from? | Hangi ülkedensin? | nation |
near | /nɪə(r)/ | prep | A1 | Yakın, yakınında | Is there a bank near here? | Buralarda bir banka var mı? | close to |
far | /fɑː(r)/ | adv | A1 | Uzak | My school isn't far from here. | Okulum buradan uzak değil. | | far from
ride | /raɪd/ | v | A1 | (Bisiklet, at) sürmek, binmek | Can you ride a bike? | Bisiklet sürebilir misin? | | ride a horse
drive | /draɪv/ | v | A1 | (Araba) sürmek | My mother drives to work. | Annem işe arabayla gider. | | drive a car
fly | /flaɪ/ | v | A1 | Uçmak; uçakla gitmek | We fly to London tomorrow. | Yarın Londra'ya uçuyoruz. | |
travel | /ˈtrævl/ | v | A1 | Seyahat etmek | I love to travel by train. | Trenle seyahat etmeyi severim. | | travel abroad
visit | /ˈvɪzɪt/ | v | A1 | Ziyaret etmek | We visit our grandparents every summer. | Her yaz büyükanne ve büyükbabamızı ziyaret ederiz. | | visit a museum
`),
  ...parseVocab('health', `
body | /ˈbɒdi/ | n | A1 | Vücut, beden | Exercise is good for your body. | Egzersiz vücudun için iyidir. | |
head | /hed/ | n | A1 | Baş, kafa | My head hurts. | Başım ağrıyor. | |
face | /feɪs/ | n | A1 | Yüz | Wash your face with cold water. | Yüzünü soğuk suyla yıka. | |
eye | /aɪ/ | n | A1 | Göz | She has big blue eyes. | Büyük mavi gözleri var. | |
ear | /ɪə(r)/ | n | A1 | Kulak | Rabbits have long ears. | Tavşanların uzun kulakları var. | |
nose | /nəʊz/ | n | A1 | Burun | My nose is cold. | Burnum üşüdü. | |
mouth | /maʊθ/ | n | A1 | Ağız | Don't talk with your mouth full. | Ağzın doluyken konuşma. | |
tooth | /tuːθ/ | n | A1 | Diş (çoğulu: teeth) | I have a bad tooth. | Çürük bir dişim var. | |
hair | /heə(r)/ | n | A1 | Saç | She has long black hair. | Uzun siyah saçları var. | |
hand | /hænd/ | n | A1 | El | Raise your hand if you know the answer. | Cevabı biliyorsan elini kaldır. | |
arm | /ɑːm/ | n | A1 | Kol | He broke his arm playing football. | Futbol oynarken kolunu kırdı. | |
leg | /leɡ/ | n | A1 | Bacak | My legs are tired after the walk. | Yürüyüşten sonra bacaklarım yoruldu. | |
foot | /fʊt/ | n | A1 | Ayak (çoğulu: feet) | I hurt my foot. | Ayağımı incittim. | | on foot
back | /bæk/ | n | A1 | Sırt, bel | I have a pain in my back. | Sırtımda bir ağrı var. | |
doctor | /ˈdɒktə(r)/ | n | A1 | Doktor | You should see a doctor. | Bir doktora görünmelisin. | | go to the doctor
hospital | /ˈhɒspɪtl/ | n | A1 | Hastane | She is in hospital with a broken leg. | Bacağı kırık olduğu için hastanede. | |
well | /wel/ | adv | A1 | İyi | I don't feel well today. | Bugün kendimi iyi hissetmiyorum. | | well done
`),
  ...parseVocab('nature', `
animal | /ˈænɪml/ | n | A1 | Hayvan | Which is your favourite animal? | En sevdiğin hayvan hangisi? | | wild animal
dog | /dɒɡ/ | n | A1 | Köpek | We take the dog for a walk every evening. | Her akşam köpeği yürüyüşe çıkarırız. | |
cat | /kæt/ | n | A1 | Kedi | The cat is sleeping on the sofa. | Kedi kanepede uyuyor. | |
bird | /bɜːd/ | n | A1 | Kuş | Birds sing in the morning. | Kuşlar sabahları öter. | |
horse | /hɔːs/ | n | A1 | At | She rides a horse every weekend. | Her hafta sonu ata biniyor. | |
cow | /kaʊ/ | n | A1 | İnek | Cows give us milk. | İnekler bize süt verir. | |
tree | /triː/ | n | A1 | Ağaç | There is a big tree in our garden. | Bahçemizde büyük bir ağaç var. | |
flower | /ˈflaʊə(r)/ | n | A1 | Çiçek | He gave her some flowers. | Ona birkaç çiçek verdi. | |
sun | /sʌn/ | n | A1 | Güneş | The sun is very strong today. | Bugün güneş çok güçlü. | |
rain | /reɪn/ | n | A1 | Yağmur | Take an umbrella; there will be rain this afternoon. | Şemsiye al; öğleden sonra yağmur yağacak. | | heavy rain
snow | /snəʊ/ | n | A1 | Kar | The children are playing in the snow. | Çocuklar karda oynuyor. | |
sky | /skaɪ/ | n | A1 | Gökyüzü | There are no clouds in the sky. | Gökyüzünde hiç bulut yok. | |
sea | /siː/ | n | A1 | Deniz | The sea is very warm in August. | Ağustosta deniz çok sıcak. | |
river | /ˈrɪvə(r)/ | n | A1 | Nehir | The river runs through the city. | Nehir şehrin içinden geçiyor. | |
mountain | /ˈmaʊntən/ | n | A1 | Dağ | We climbed the mountain last summer. | Geçen yaz dağa tırmandık. | | climb a mountain
summer | /ˈsʌmə(r)/ | n | A1 | Yaz | We go to the beach every summer. | Her yaz plaja gideriz. | |
winter | /ˈwɪntə(r)/ | n | A1 | Kış | Winter is cold and snowy here. | Burada kış soğuk ve karlı. | |
spring | /sprɪŋ/ | n | A1 | İlkbahar | The trees turn green in spring. | İlkbaharda ağaçlar yeşillenir. | |
autumn | /ˈɔːtəm/ | n | A1 | Sonbahar | Leaves fall from the trees in autumn. | Sonbaharda yapraklar ağaçlardan düşer. | fall |
`),
  ...parseVocab('emotions', `
happy | /ˈhæpi/ | adj | A1 | Mutlu | I'm so happy to see you! | Seni gördüğüme çok mutluyum! | glad | happy birthday
sad | /sæd/ | adj | A1 | Üzgün | She was sad when her friend left. | Arkadaşı gidince üzüldü. | unhappy |
tired | /ˈtaɪəd/ | adj | A1 | Yorgun | I'm tired after work. | İşten sonra yorgunum. | exhausted |
feel | /fiːl/ | v | A1 | Hissetmek | I feel tired today. | Bugün yorgun hissediyorum. | | feel good
`),
  ...parseVocab('tech', `
phone | /fəʊn/ | n | A1 | Telefon | My phone is out of battery. | Telefonumun şarjı bitti. | mobile | phone number
computer | /kəmˈpjuːtə(r)/ | n | A1 | Bilgisayar | I use a computer at work. | İşte bilgisayar kullanırım. | |
internet | /ˈɪntənet/ | n | A1 | İnternet | I read the news on the internet. | Haberleri internetten okurum. | | on the internet
email | /ˈiːmeɪl/ | n | A1 | E-posta | I'll send you an email tonight. | Bu akşam sana bir e-posta göndereceğim. | | send an email
photo | /ˈfəʊtəʊ/ | n | A1 | Fotoğraf | Can you take a photo of us? | Bizim bir fotoğrafımızı çekebilir misin? | picture | take a photo
video | /ˈvɪdiəʊ/ | n | A1 | Video | I watched a funny video. | Komik bir video izledim. | |
camera | /ˈkæmərə/ | n | A1 | Fotoğraf makinesi, kamera | I forgot my camera at home. | Fotoğraf makinemi evde unuttum. | |
website | /ˈwebsaɪt/ | n | A1 | İnternet sitesi | You can buy tickets on the website. | Biletleri internet sitesinden alabilirsin. | site |
television | /ˈtelɪvɪʒn/ | n | A1 | Televizyon | There is nothing good on television tonight. | Bu akşam televizyonda güzel bir şey yok. | TV | watch television
`),
];
