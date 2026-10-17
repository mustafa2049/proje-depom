import { Text, View } from 'react-native';

import { sentenceAt, tokenizeText } from '../../utils/tokenize';

interface InteractiveTextProps {
  content: string;
  /** Şu an seçili kelimenin anahtarı ("paragrafIndex-konum"). */
  activeKey: string | null;
  onWordPress: (word: string, sentence: string, key: string) => void;
}

/**
 * Metni paragraflara ve tıklanabilir kelimelere ayırır. Her kelime bağlamındaki cümleyle birlikte bildirilir.
 */
export function InteractiveText({ content, activeKey, onWordPress }: InteractiveTextProps) {
  const paragraphs = content.split('\n\n').filter((paragraph) => paragraph.trim().length > 0);

  return (
    <View className="gap-5">
      {paragraphs.map((paragraph, paragraphIndex) => (
        <Text key={paragraphIndex} className="text-lg leading-8 text-slate-100" selectable={false}>
          {tokenizeText(paragraph).map((token) => {
            if (!token.isWord) {
              return <Text key={token.start}>{token.text}</Text>;
            }

            const key = `${paragraphIndex}-${token.start}`;
            const active = key === activeKey;
            return (
              <Text
                key={token.start}
                accessibilityRole="button"
                onPress={() => onWordPress(token.text, sentenceAt(paragraph, token.start), key)}
                className={active ? 'font-bold text-accent' : 'text-slate-100'}
                style={active ? { backgroundColor: 'rgba(56,189,248,0.18)' } : undefined}
              >
                {token.text}
              </Text>
            );
          })}
        </Text>
      ))}
    </View>
  );
}
