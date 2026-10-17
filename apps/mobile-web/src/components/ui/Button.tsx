import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  testID?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, { container: string; label: string }> = {
  primary: { container: 'bg-accent', label: 'text-bg' },
  secondary: { container: 'bg-surface border border-accent/40', label: 'text-accent' },
  ghost: { container: 'bg-transparent', label: 'text-muted' },
  danger: { container: 'bg-danger', label: 'text-white' },
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, icon, testID }: ButtonProps) {
  const classes = VARIANT_CLASSES[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: Boolean(inactive) }}
      testID={testID}
      onPress={inactive ? undefined : onPress}
      className={`flex-row items-center justify-center gap-2 rounded-xl px-5 py-3 ${classes.container} ${inactive ? 'opacity-50' : 'active:opacity-80'}`}
    >
      {loading ? <ActivityIndicator color="#0F172A" /> : icon}
      <View>
        <Text className={`text-base font-semibold ${classes.label}`}>{title}</Text>
      </View>
    </Pressable>
  );
}
