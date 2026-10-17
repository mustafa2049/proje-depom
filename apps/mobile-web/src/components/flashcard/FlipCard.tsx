import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Turtle, Volume2 } from 'lucide-react-native';

import { NORMAL_RATE, SLOW_RATE, speak } from '../../services/ttsService';
import type { CardView } from '../../types/api';
import { splitHighlight } from '../../utils/highlight';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const FLIP_DURATION_MS = 350;
const SHAKE_STEP_MS = 60;

interface FlipCardProps {
  card: CardView;
  isFlipped: boolean;
  onFlip: () => void;
  slowMode: boolean;
  onToggleSlow: () => void;
  /** Her artış sarsıntı animasyonunu tetikler (yanlış cevap geri bildirimi). */
  shakeSignal: number;
}

export function FlipCard({ card, isFlipped, onFlip, slowMode, onToggleSlow, shakeSignal }: FlipCardProps) {
  const progress = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isFlipped ? 1 : 0, { duration: FLIP_DURATION_MS });
  }, [isFlipped, progress]);

  useEffect(() => {
    if (shakeSignal === 0) {
      return;
    }
    shake.value = withSequence(
      withTiming(-12, { duration: SHAKE_STEP_MS }),
      withTiming(12, { duration: SHAKE_STEP_MS }),
      withTiming(-8, { duration: SHAKE_STEP_MS }),
      withTiming(8, { duration: SHAKE_STEP_MS }),
      withTiming(0, { duration: SHAKE_STEP_MS }),
    );
  }, [shakeSignal, shake]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { perspective: 1000 },
      { rotateY: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { perspective: 1000 },
      { rotateY: `${interpolate(progress.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  const rate = slowMode ? SLOW_RATE : NORMAL_RATE;

  return (
    <View className="w-full max-w-md self-center" style={{ minHeight: 360 }}>
      <Animated.View
        pointerEvents={isFlipped ? 'none' : 'auto'}
        style={[{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }, frontStyle]}
        className="rounded-3xl border border-slate-700 bg-surface p-6"
      >
        <Pressable accessibilityRole="button" accessibilityLabel="Kartı çevir" onPress={onFlip} className="flex-1 gap-5">
          <View className="flex-row items-center justify-between">
            <Badge label={card.partOfSpeech} tone="accent" />
            {card.phonetic ? <Text className="text-base text-muted">{card.phonetic}</Text> : null}
          </View>

          <Text className="text-center text-4xl font-bold text-white" accessibilityRole="header">
            {card.term}
          </Text>

          <View className="flex-row flex-wrap justify-center gap-2">
            <Button title="US" variant="secondary" icon={<Volume2 size={16} color="#38BDF8" />} onPress={() => speak(card.term, { accent: 'en-US', rate })} />
            <Button title="UK" variant="secondary" icon={<Volume2 size={16} color="#38BDF8" />} onPress={() => speak(card.term, { accent: 'en-GB', rate })} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={slowMode ? 'Yavaş telaffuz açık' : 'Yavaş telaffuz kapalı'}
              onPress={onToggleSlow}
              className={`items-center justify-center rounded-xl border px-3 ${slowMode ? 'border-accent bg-accent/15' : 'border-slate-700 bg-surface'}`}
            >
              <Turtle size={20} color={slowMode ? '#38BDF8' : '#94A3B8'} />
            </Pressable>
          </View>

          <Text className="mt-auto text-center text-lg leading-7 text-slate-200">
            {splitHighlight(card.exampleSentence1, card.term).map((segment, index) => (
              <Text key={index} className={segment.highlighted ? 'font-bold text-accent' : ''}>
                {segment.text}
              </Text>
            ))}
          </Text>
          <Text className="text-center text-xs text-muted">Kartı çevirmek için dokunun</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        pointerEvents={isFlipped ? 'auto' : 'none'}
        style={[{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }, backStyle]}
        className="rounded-3xl border border-slate-700 bg-surface p-6"
      >
        <View className="flex-1 gap-4">
          <Text className="text-center text-3xl font-semibold text-accent">{card.translationTR}</Text>
          <Text className="text-center text-base leading-6 text-slate-200">{card.definitionEN}</Text>
          <Text className="text-center text-base italic leading-6 text-slate-300">{card.exampleSentence2 ?? card.exampleSentence1}</Text>

          {card.synonyms.length > 0 ? (
            <View className="flex-row flex-wrap justify-center gap-2">
              {card.synonyms.map((synonym) => (
                <Badge key={synonym} label={synonym} tone="muted" />
              ))}
            </View>
          ) : null}

          <View className="mt-auto flex-row flex-wrap justify-center gap-2">
            <Button title="Örneği dinle" variant="secondary" onPress={() => speak(card.exampleSentence1, { rate })} />
            <Button title="Terimi dinle" variant="ghost" onPress={() => speak(card.term, { rate })} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
