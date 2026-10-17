import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react-native';

import { ComprehensionQuiz } from '../../components/reader/ComprehensionQuiz';
import { InteractiveText } from '../../components/reader/InteractiveText';
import { PassageListItem } from '../../components/reader/PassageListItem';
import { WordLookupSheet } from '../../components/reader/WordLookupSheet';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { isSpeaking, speak, stop } from '../../services/ttsService';
import { useReaderStore, type LevelFilter } from '../../store/useReaderStore';
import { CATEGORY_LABELS } from '../../components/reader/PassageListItem';

const FILTERS: LevelFilter[] = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** İnteraktif okuma: seviye filtreli kütüphane, tıklanabilir metin, sesli okuma ve okuduğunu anlama. */
export default function ReaderScreen() {
  const levelFilter = useReaderStore((state) => state.levelFilter);
  const passages = useReaderStore((state) => state.passages);
  const listStatus = useReaderStore((state) => state.listStatus);
  const listError = useReaderStore((state) => state.listError);
  const current = useReaderStore((state) => state.current);
  const currentStatus = useReaderStore((state) => state.currentStatus);
  const currentError = useReaderStore((state) => state.currentError);
  const lookup = useReaderStore((state) => state.lookup);
  const setLevelFilter = useReaderStore((state) => state.setLevelFilter);
  const loadPassages = useReaderStore((state) => state.loadPassages);
  const openPassage = useReaderStore((state) => state.openPassage);
  const closePassage = useReaderStore((state) => state.closePassage);
  const lookupWord = useReaderStore((state) => state.lookupWord);
  const closeLookup = useReaderStore((state) => state.closeLookup);
  const saveLookup = useReaderStore((state) => state.saveLookup);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    void loadPassages();
  }, [loadPassages]);

  // Sesli okuma bittiğinde düğme durumunu senkronize tut.
  useEffect(() => {
    if (!speaking) {
      return;
    }
    const timer = setInterval(() => {
      if (!isSpeaking()) {
        setSpeaking(false);
      }
    }, 400);
    return () => clearInterval(timer);
  }, [speaking]);

  // Ekrandan çıkınca veya başka parça açılınca okuma durmalı.
  useEffect(() => () => stop(), []);

  function leavePassage() {
    stop();
    setSpeaking(false);
    setActiveKey(null);
    closePassage();
  }

  function toggleSpeech() {
    if (!current) return;
    if (speaking) {
      stop();
      setSpeaking(false);
      return;
    }
    speak(current.content.replace(/\n+/g, ' '));
    setSpeaking(true);
  }

  function closeSheet() {
    closeLookup();
    setActiveKey(null);
  }

  if (current) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <ScrollView contentContainerClassName="gap-6 px-5 pb-10 pt-4">
          <Pressable accessibilityRole="button" accessibilityLabel="Kütüphaneye dön" onPress={leavePassage} className="flex-row items-center gap-2">
            <ArrowLeft size={18} color="#38BDF8" />
            <Text className="text-sm font-semibold text-accent">Kütüphane</Text>
          </Pressable>

          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Badge label={current.level} tone="accent" />
              <Badge label={CATEGORY_LABELS[current.category]} tone="muted" />
              <Text className="text-xs text-muted">{current.estimatedMinutes} dk</Text>
            </View>
            <Text className="text-2xl font-bold text-white" accessibilityRole="header">{current.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={speaking ? 'Sesli okumayı durdur' : 'Tüm metni sesli oku'}
              onPress={toggleSpeech}
              className="flex-row items-center gap-2 self-start rounded-xl border border-accent/40 bg-surface px-4 py-2"
            >
              {speaking ? <VolumeX size={16} color="#38BDF8" /> : <Volume2 size={16} color="#38BDF8" />}
              <Text className="text-sm font-semibold text-accent">{speaking ? 'Durdur' : 'Tüm metni sesli oku'}</Text>
            </Pressable>
          </View>

          <InteractiveText content={current.content} activeKey={activeKey} onWordPress={(word, sentence, key) => {
            setActiveKey(key);
            void lookupWord(word, sentence);
          }} />

          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Anahtar kelimeler</Text>
            <View className="flex-row flex-wrap gap-2">
              {current.keyVocabulary.map((item) => (
                <Badge key={item.term} label={`${item.term} · ${item.translationTR}`} tone="muted" />
              ))}
            </View>
          </View>

          <ComprehensionQuiz key={current.id} questions={current.comprehensionQuestions} />
        </ScrollView>

        <WordLookupSheet lookup={lookup} onClose={closeSheet} onSave={() => void saveLookup()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="gap-5 px-5 pb-10 pt-4">
        <Text className="text-2xl font-bold text-white" accessibilityRole="header">Okuma</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View className="flex-row gap-2">
            {FILTERS.map((filter) => (
              <Chip key={filter} label={filter === 'ALL' ? 'Tümü' : filter} active={levelFilter === filter} onPress={() => setLevelFilter(filter)} />
            ))}
          </View>
        </ScrollView>

        {listStatus === 'loading' ? <Text className="text-muted">Metinler yükleniyor…</Text> : null}
        {listStatus === 'error' ? (
          <View className="gap-3">
            <Text className="text-danger">{listError ?? 'Metinler yüklenemedi'}</Text>
            <Button title="Tekrar dene" variant="secondary" onPress={() => void loadPassages()} />
          </View>
        ) : null}
        {listStatus === 'ready' && passages.length === 0 ? <Text className="text-muted">Bu seviyede metin yok.</Text> : null}

        {currentStatus === 'loading' ? <Text className="text-muted">Metin açılıyor…</Text> : null}
        {currentStatus === 'error' ? <Text className="text-danger">{currentError ?? 'Metin açılamadı'}</Text> : null}

        {passages.map((passage) => (
          <PassageListItem key={passage.id} passage={passage} onPress={() => void openPassage(passage.id)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
