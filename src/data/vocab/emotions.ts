import { parseVocab } from './parse';

// Duygular ve kişilik özellikleri.
export const EMOTIONS = parseVocab('emotions', `
afraid | /əˈfreɪd/ | adj | A2 | Korkmuş | Don't be afraid to ask questions. | Soru sormaktan korkma. | scared; frightened | afraid of
amazed | /əˈmeɪzd/ | adj | B1 | Hayran kalmış, şaşkın | I was amazed by the view. | Manzaraya hayran kaldım. | astonished |
angry | /ˈæŋɡri/ | adj | A1 | Kızgın | Why are you angry with me? | Neden bana kızgınsın? | mad; furious | angry with someone
annoyed | /əˈnɔɪd/ | adj | B1 | Sinirlenmiş, rahatsız | I was annoyed because he was late. | Geç kaldığı için sinirlendim. | irritated |
anxious | /ˈæŋkʃəs/ | adj | B1 | Endişeli, kaygılı | She feels anxious before exams. | Sınavlardan önce kaygılı hissediyor. | worried; nervous |
arrogant | /ˈærəɡənt/ | adj | B2 | Kibirli | He's clever but a bit arrogant. | Zeki ama biraz kibirli. | proud; conceited |
ashamed | /əˈʃeɪmd/ | adj | B1 | Utanmış, mahcup | I'm ashamed of what I said. | Söylediklerimden utanıyorum. | embarrassed | ashamed of
bored | /bɔːd/ | adj | A2 | Sıkılmış | I'm bored. Let's go out. | Sıkıldım. Hadi dışarı çıkalım. | |
calm | /kɑːm/ | adj | A2 | Sakin | Stay calm and listen to me. | Sakin ol ve beni dinle. | relaxed; peaceful |
cheerful | /ˈtʃɪəfl/ | adj | B1 | Neşeli | She's always cheerful in the morning. | Sabahları her zaman neşelidir. | happy; jolly |
confident | /ˈkɒnfɪdənt/ | adj | B1 | Kendinden emin | I feel confident about the interview. | Mülakat konusunda kendimden eminim. | self-assured |
confused | /kənˈfjuːzd/ | adj | A2 | Kafası karışık | I'm confused. Can you explain again? | Kafam karıştı. Tekrar açıklayabilir misin? | puzzled |
delighted | /dɪˈlaɪtɪd/ | adj | B1 | Çok memnun | We're delighted to meet you. | Sizinle tanıştığımıza çok memnun olduk. | pleased; thrilled |
disappointed | /ˌdɪsəˈpɔɪntɪd/ | adj | B1 | Hayal kırıklığına uğramış | I was disappointed with the film. | Film beni hayal kırıklığına uğrattı. | let down |
envious | /ˈenviəs/ | adj | B2 | Kıskanç, gıpta eden | I'm a little envious of your holiday. | Tatiline biraz imreniyorum. | jealous |
excited | /ɪkˈsaɪtɪd/ | adj | A2 | Heyecanlı | The kids are excited about the trip. | Çocuklar gezi için heyecanlı. | thrilled |
exhausted | /ɪɡˈzɔːstɪd/ | adj | B1 | Bitkin, çok yorgun | I'm exhausted after the long day. | Uzun günün ardından bitkinim. | worn out |
frightened | /ˈfraɪtnd/ | adj | B1 | Korkmuş, ürkmüş | The child was frightened of the dark. | Çocuk karanlıktan korkuyordu. | scared |
frustrated | /frʌˈstreɪtɪd/ | adj | B1 | Hüsrana uğramış, bıkmış | I get frustrated when my phone is slow. | Telefonum yavaş olunca sinirim bozuluyor. | annoyed |
grateful | /ˈɡreɪtfl/ | adj | B1 | Minnettar | I'm grateful for your help. | Yardımın için minnettarım. | thankful |
guilty | /ˈɡɪlti/ | adj | B1 | Suçlu | I feel guilty for not calling her. | Onu aramadığım için kendimi suçlu hissediyorum. | | feel guilty
homesick | /ˈhəʊmsɪk/ | adj | B1 | Sıla hasreti çeken | She felt homesick during her first year abroad. | Yurt dışındaki ilk yılında sıla hasreti çekti. | |
hopeful | /ˈhəʊpfl/ | adj | B1 | Umutlu | We are hopeful about the future. | Gelecek konusunda umutluyuz. | optimistic |
jealous | /ˈdʒeləs/ | adj | B1 | Kıskanç | He's jealous of his brother's success. | Kardeşinin başarısını kıskanıyor. | envious |
kind | /kaɪnd/ | adj | A1 | Nazik, iyi kalpli | It's very kind of you to help. | Yardım etmen çok naziksin. | nice; caring |
lonely | /ˈləʊnli/ | adj | A2 | Yalnız (duygusal) | He feels lonely in the big city. | Büyük şehirde kendini yalnız hissediyor. | alone |
mood | /muːd/ | n | B1 | Ruh hali | You're in a good mood today! | Bugün keyfin yerinde! | temper | in a good mood
nervous | /ˈnɜːvəs/ | adj | A2 | Gergin, heyecanlı | I always get nervous before a presentation. | Sunumdan önce hep gerilirim. | anxious; tense |
optimistic | /ˌɒptɪˈmɪstɪk/ | adj | B2 | İyimser | She's optimistic about the results. | Sonuçlar konusunda iyimser. | positive; hopeful |
impatient | /ɪmˈpeɪʃnt/ | adj | B1 | Sabırsız | Don't be so impatient, the bus will come soon. | Bu kadar sabırsız olma, otobüs birazdan gelir. | restless |
pessimistic | /ˌpesɪˈmɪstɪk/ | adj | B2 | Kötümser | Don't be so pessimistic! | Bu kadar kötümser olma! | negative |
relieved | /rɪˈliːvd/ | adj | B1 | Rahatlamış | I was relieved to hear the news. | Haberi duyunca rahatladım. | |
reliable | /rɪˈlaɪəbl/ | adj | B1 | Güvenilir | She's a very reliable friend. | Çok güvenilir bir arkadaştır. | dependable; trustworthy |
scared | /skeəd/ | adj | A2 | Korkmuş | I'm scared of spiders. | Örümceklerden korkarım. | afraid | scared of
selfish | /ˈselfɪʃ/ | adj | B1 | Bencil | It was selfish of him to eat all the cake. | Bütün pastayı yemesi bencillikti. | self-centred |
sensitive | /ˈsensətɪv/ | adj | B1 | Hassas, duyarlı | He's very sensitive to criticism. | Eleştiriye karşı çok hassastır. | | sensitive to
shy | /ʃaɪ/ | adj | A2 | Utangaç | My son is shy with new people. | Oğlum yeni insanlara karşı utangaçtır. | timid |
stubborn | /ˈstʌbən/ | adj | B2 | İnatçı | My grandfather is very stubborn. | Dedem çok inatçıdır. | headstrong |
thoughtful | /ˈθɔːtfl/ | adj | B2 | Düşünceli, ince düşünen | Thanks for the flowers, that's very thoughtful. | Çiçekler için teşekkürler, çok düşüncelisin. | considerate |
upset | /ˌʌpˈset/ | adj | B1 | Üzgün, morali bozuk | She was upset about the bad news. | Kötü haberden dolayı üzgündü. | sad; hurt |
cheer up | /ˌtʃɪər ˈʌp/ | pv | B1 | Neşelenmek; neşelendirmek | Cheer up! It's not the end of the world. | Neşelen! Dünyanın sonu değil. | |
mature | /məˈtʃʊə(r)/ | adj | B2 | Olgun | She's very mature for her age. | Yaşına göre çok olgun. | grown-up |
ambitious | /æmˈbɪʃəs/ | adj | B2 | Hırslı | He's an ambitious young lawyer. | Hırslı genç bir avukat. | driven |
easy-going | /ˌiːzi ˈɡəʊɪŋ/ | adj | B1 | Rahat, uysal | My boss is very easy-going. | Patronum çok rahat biridir. | relaxed |
furious | /ˈfjʊəriəs/ | adj | B2 | Öfkeden deliye dönmüş | She was furious when she saw the mess. | Dağınıklığı görünce öfkeden deliye döndü. | very angry |
`);
