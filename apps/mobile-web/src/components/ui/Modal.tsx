import { Modal as RNModal, Pressable, ScrollView, Text, View } from 'react-native';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ visible, title, onClose, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 px-4">
        <View className="max-h-[90%] w-full max-w-lg rounded-2xl bg-surface p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} className="p-1">
              <Text className="text-base text-muted">Kapat</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </RNModal>
  );
}
