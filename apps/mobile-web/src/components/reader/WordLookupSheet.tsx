import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Volume2, X } from 'lucide-react-native';

import { speak } from '../../services/ttsService';
import type { LookupState } from '../../store/useReaderStore';
import type { LookupResult } from '../../types/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const LOOKUP_SOURCE_LABELS: Record<LookupResult['source'], string> = {
  DECK: 'Destende mevcut',
  AI: 'Bağlamsal çeviri',
  OFFLINE: 'Çevrimdışı sözlük',
};

interface WordLookupSheetProps {
  lookup: LookupState | null;
  onClose: () => void;
  onSave: () => void;
}

/** Kelimeye tıklanınca alttan açılan sözlük paneli. */
export function WordLookupSheet({ lookup, onClose, onSave }: WordLookupSheetProps) {
  return (
    <Modal visible={lookup !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" accessibilityLabel="Paneli kapat" onPress={onClose} />
        <View className="max-h-[70%] rounded-t-3xl border-t border-slate-700 bg-surface px-5 pb-8 pt-4">
          <View className="mb-4 h-1 w-12 self-center rounded-full bg-slate-600" />
          <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} className="absolute right-5 top-4 p-1">
            <X size={20} color="#94A3B8" />
          </Pressable>

          <ScrollView contentContainerClassName="gap-4 pb-4">
            {lookup?.status === 'loading' ? <Text className="text-base text-muted">Anlam aranıyor…</Text> : null}

            {lookup?.status === 'error' ? (
              <Text className="text-base text-danger">{lookup.errorMessage ?? 'Kelime sorgulanamadı'}</Text>
            ) : null}

            {lookup?.status === 'ready' && lookup.result ? (
              <>
                <View className="flex-row items-center gap-3">
                  <Text className="flex-1 text-3xl font-bold text-white">{lookup.result.word}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Telaffuzu dinle" onPress={() => speak(lookup.result?.word ?? '')} className="rounded-full bg-accent/15 p-3">
                    <Volume2 size={20} color="#38BDF8" />
                  </Pressable>
                </View>

                <View className="flex-row flex-wrap items-center gap-2">
                  <Badge label={lookup.result.partOfSpeech} tone="accent" />
                  {lookup.result.phonetic ? <Text className="text-sm text-muted">{lookup.result.phonetic}</Text> : null}
                  <Badge label={LOOKUP_SOURCE_LABELS[lookup.result.source]} tone="muted" />
                </View>

                <Text className="text-2xl font-semibold text-accent">{lookup.result.translationTR}</Text>
                <Text className="text-base leading-6 text-slate-200">{lookup.result.definitionEN}</Text>
                <Text className="text-base italic leading-6 text-slate-300">“{lookup.result.exampleSentence}”</Text>

                {lookup.result.synonyms.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {lookup.result.synonyms.map((synonym) => (
                      <Badge key={synonym} label={synonym} tone="muted" />
                    ))}
                  </View>
                ) : null}

                <SaveButton status={lookup.saveStatus} onPress={onSave} />
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SaveButton({ status, onPress }: { status: LookupState['saveStatus']; onPress: () => void }) {
  const labels: Record<LookupState['saveStatus'], string> = {
    idle: 'SRS Desteme Ekle',
    saving: 'Ekleniyor…',
    saved: 'Eklendi ✓',
    duplicate: 'Bu kelime bu destede zaten var',
    error: 'Tekrar dene',
  };
  const done = status === 'saved' || status === 'duplicate';

  return (
    <Button
      title={labels[status]}
      variant={done ? 'secondary' : 'primary'}
      disabled={done || status === 'saving'}
      loading={status === 'saving'}
      onPress={onPress}
    />
  );
}
