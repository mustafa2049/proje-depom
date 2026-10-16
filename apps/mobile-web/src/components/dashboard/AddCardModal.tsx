import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useDeckStore } from '../../store/useDeckStore';
import { ApiError } from '../../services/api';
import type { DeckSummary } from '../../types/api';
import {
  parseSynonyms,
  PART_OF_SPEECH_OPTIONS,
  validateCardForm,
  type CardFormErrors,
  type CardFormValues,
} from '../../utils/validation';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TextField } from '../ui/TextField';

const EMPTY_FORM: CardFormValues = {
  term: '',
  partOfSpeech: 'noun',
  translationTR: '',
  definitionEN: '',
  exampleSentence1: '',
  exampleSentence2: '',
  phonetic: '',
  synonyms: '',
};

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  decks: DeckSummary[];
}

export function AddCardModal({ visible, onClose, decks }: AddCardModalProps) {
  const createCard = useDeckStore((state) => state.createCard);
  const [values, setValues] = useState<CardFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [deckId, setDeckId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const userDecks = decks.filter((deck) => !deck.isSystem);

  function update<K extends keyof CardFormValues>(key: K, value: CardFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    const validation = validateCardForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await createCard({
        ...(deckId ? { deckId } : {}),
        term: values.term.trim(),
        partOfSpeech: values.partOfSpeech,
        translationTR: values.translationTR.trim(),
        definitionEN: values.definitionEN.trim(),
        exampleSentence1: values.exampleSentence1.trim(),
        ...(values.exampleSentence2.trim() ? { exampleSentence2: values.exampleSentence2.trim() } : {}),
        ...(values.phonetic.trim() ? { phonetic: values.phonetic.trim() } : {}),
        synonyms: parseSynonyms(values.synonyms),
      });
      setValues(EMPTY_FORM);
      setErrors({});
      onClose();
    } catch (error) {
      setServerError(error instanceof ApiError || error instanceof Error ? error.message : 'Kart eklenemedi');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} title="Yeni kart ekle" onClose={onClose}>
      <View className="gap-4 pb-2">
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted">Deste</Text>
          <View className="flex-row flex-wrap gap-2">
            <Chip label="Kelimelerim (varsayılan)" active={deckId === undefined} onPress={() => setDeckId(undefined)} />
            {userDecks.map((deck) => (
              <Chip key={deck.id} label={deck.title} active={deckId === deck.id} onPress={() => setDeckId(deck.id)} />
            ))}
          </View>
        </View>

        <TextField label="Kelime / kalıp" value={values.term} onChangeText={(v) => update('term', v)} error={errors.term} autoCapitalize="none" testID="card-term" />
        <TextField label="Telaffuz (IPA, isteğe bağlı)" value={values.phonetic} onChangeText={(v) => update('phonetic', v)} autoCapitalize="none" />

        <View className="gap-2">
          <Text className="text-sm font-medium text-muted">Sözcük türü</Text>
          <View className="flex-row flex-wrap gap-2">
            {PART_OF_SPEECH_OPTIONS.map((option) => (
              <Chip key={option} label={option} active={values.partOfSpeech === option} onPress={() => update('partOfSpeech', option)} />
            ))}
          </View>
        </View>

        <TextField label="Türkçe karşılık" value={values.translationTR} onChangeText={(v) => update('translationTR', v)} error={errors.translationTR} />
        <TextField label="İngilizce tanım" value={values.definitionEN} onChangeText={(v) => update('definitionEN', v)} error={errors.definitionEN} multiline />
        <TextField label="Örnek cümle 1" value={values.exampleSentence1} onChangeText={(v) => update('exampleSentence1', v)} error={errors.exampleSentence1} multiline />
        <TextField label="Örnek cümle 2 (isteğe bağlı)" value={values.exampleSentence2} onChangeText={(v) => update('exampleSentence2', v)} multiline />
        <TextField label="Eş anlamlılar (virgülle)" value={values.synonyms} onChangeText={(v) => update('synonyms', v)} autoCapitalize="none" />

        {serverError ? <Text className="text-sm text-danger">{serverError}</Text> : null}

        <Button title="Kartı kaydet" onPress={() => void submit()} loading={submitting} />
      </View>
    </Modal>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${active ? 'border-accent bg-accent/15' : 'border-slate-700 bg-bg'}`}
    >
      <Text className={`text-sm ${active ? 'font-semibold text-accent' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}
