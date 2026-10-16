import { Pressable, Text, View } from 'react-native';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-xl bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center rounded-lg px-2 py-2 ${active ? 'bg-accent' : ''}`}
          >
            <Text className={`text-center text-xs font-semibold ${active ? 'text-bg' : 'text-muted'}`}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
