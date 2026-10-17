import { Text, View } from 'react-native';

export type BadgeTone = 'accent' | 'success' | 'danger' | 'warning' | 'muted';

const TONE_CLASSES: Record<BadgeTone, { container: string; label: string }> = {
  accent: { container: 'bg-accent/15 border-accent/40', label: 'text-accent' },
  success: { container: 'bg-success/15 border-success/40', label: 'text-success' },
  danger: { container: 'bg-danger/15 border-danger/40', label: 'text-danger' },
  warning: { container: 'bg-warning/15 border-warning/40', label: 'text-warning' },
  muted: { container: 'bg-surface border-muted/40', label: 'text-muted' },
};

export function Badge({ label, tone = 'muted' }: { label: string; tone?: BadgeTone }) {
  const classes = TONE_CLASSES[tone];
  return (
    <View className={`rounded-full border px-2.5 py-0.5 ${classes.container}`}>
      <Text className={`text-xs font-semibold ${classes.label}`}>{label}</Text>
    </View>
  );
}
