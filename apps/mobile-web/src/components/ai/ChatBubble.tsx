import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Volume2 } from 'lucide-react-native';

import { speak } from '../../services/ttsService';
import type { TutorMessage } from '../../store/useTutorStore';

/** Kullanıcı mesajı sağda; AI yanıtı solda, çeviri gösterme/gizleme ve sesli dinleme ile. */
export function ChatBubble({ message }: { message: TutorMessage }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isUser = message.sender === 'USER';

  if (isUser) {
    return (
      <View className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-accent/20 px-4 py-3">
        <Text className="text-base text-white" accessibilityLabel={`Sen: ${message.content}`}>
          {message.content}
        </Text>
      </View>
    );
  }

  return (
    <View className="max-w-[90%] gap-2 self-start rounded-2xl rounded-bl-sm bg-surface px-4 py-3">
      <Text className="text-base leading-6 text-slate-100" accessibilityLabel={`AI: ${message.content}`}>
        {message.content}
      </Text>

      <View className="flex-row items-center gap-4">
        {message.replyTranslationTR ? (
          <Pressable accessibilityRole="button" onPress={() => setShowTranslation((value) => !value)}>
            <Text className="text-xs font-semibold text-accent">{showTranslation ? 'Çeviriyi gizle' : 'Çeviriyi göster'}</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Yanıtı dinle" onPress={() => speak(message.content)}>
          <Volume2 size={16} color="#38BDF8" />
        </Pressable>
      </View>

      {showTranslation && message.replyTranslationTR ? (
        <Text className="text-sm italic text-muted">{message.replyTranslationTR}</Text>
      ) : null}
    </View>
  );
}
