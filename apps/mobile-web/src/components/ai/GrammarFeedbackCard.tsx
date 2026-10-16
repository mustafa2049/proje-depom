import { Text, View } from 'react-native';

import type { TutorMessage } from '../../store/useTutorStore';
import { Badge } from '../ui/Badge';

/** Kullanıcı mesajının hemen altında gramer ve doğallık geri bildirimi. */
export function GrammarFeedbackCard({ message }: { message: TutorMessage }) {
  if (message.sender !== 'USER') {
    return null;
  }

  if (message.isPerfect) {
    return (
      <View className="max-w-[90%] gap-2 self-end rounded-2xl border border-success/40 bg-success/10 p-3">
        <Badge label="Kusursuz Cümle!" tone="success" />
        {message.nativeAlternative ? (
          <Text className="text-sm text-slate-200">
            <Text className="font-semibold text-success">Doğal alternatif: </Text>
            {message.nativeAlternative}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="max-w-[90%] gap-2 self-end rounded-2xl border border-warning/40 bg-warning/10 p-3">
      <Badge label="Geliştirme önerisi" tone="warning" />
      {message.correctedContent ? (
        <Text className="text-sm text-slate-200">
          <Text className="font-semibold text-warning">Düzeltilmiş: </Text>
          {message.correctedContent}
        </Text>
      ) : null}
      {message.grammarExplanation ? <Text className="text-sm text-slate-300">{message.grammarExplanation}</Text> : null}
      {message.nativeAlternative ? (
        <Text className="text-sm text-slate-200">
          <Text className="font-semibold text-accent">Ana dili gibi: </Text>
          {message.nativeAlternative}
        </Text>
      ) : null}
    </View>
  );
}
