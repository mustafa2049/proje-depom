import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

/** Seçilebilir etiket (seviye filtresi, senaryo, mod seçimi). */
export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${active ? 'border-accent bg-accent/15' : 'border-slate-700 bg-surface'}`}
    >
      <Text className={`text-sm ${active ? 'font-semibold text-accent' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}
