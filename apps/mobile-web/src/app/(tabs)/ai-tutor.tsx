import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History, Plus, Send } from 'lucide-react-native';

import { ChatBubble } from '../../components/ai/ChatBubble';
import { GrammarFeedbackCard } from '../../components/ai/GrammarFeedbackCard';
import { VocabularyChips } from '../../components/ai/VocabularyChips';
import { VoiceInputButton } from '../../components/ai/VoiceInputButton';
import { Button } from '../../components/ui/Button';
import { useTutorStore } from '../../store/useTutorStore';
import { SCENARIOS } from '../../utils/scenarios';
import type { ScenarioKey } from '../../types/api';

/** AI Konuşma Partneri: senaryo seçimi, sohbet, satır içi gramer geri bildirimi ve kelime kaydetme. */
export default function AiTutorScreen() {
  const scenario = useTutorStore((state) => state.scenario);
  const sessionId = useTutorStore((state) => state.sessionId);
  const messages = useTutorStore((state) => state.messages);
  const sessions = useTutorStore((state) => state.sessions);
  const sessionsStatus = useTutorStore((state) => state.sessionsStatus);
  const isSending = useTutorStore((state) => state.isSending);
  const errorMessage = useTutorStore((state) => state.errorMessage);
  const savedTerms = useTutorStore((state) => state.savedTerms);
  const loadSessions = useTutorStore((state) => state.loadSessions);
  const openSession = useTutorStore((state) => state.openSession);
  const startNewSession = useTutorStore((state) => state.startNewSession);
  const sendMessage = useTutorStore((state) => state.sendMessage);
  const saveVocabulary = useTutorStore((state) => state.saveVocabulary);

  const [draft, setDraft] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, isSending]);

  async function send(text: string) {
    const ok = await sendMessage(text);
    if (ok) {
      setDraft('');
    }
  }

  function pickScenario(key: ScenarioKey) {
    startNewSession(key);
    setShowHistory(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-row items-center justify-between px-5 pb-2 pt-4">
          <Text className="text-2xl font-bold text-white" accessibilityRole="header">AI Tutor</Text>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Geçmiş sohbetler"
              onPress={() => {
                setShowHistory((value) => !value);
                void loadSessions();
              }}
              className="rounded-full bg-surface p-2.5"
            >
              <History size={18} color="#38BDF8" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Yeni sohbet" onPress={() => startNewSession()} className="rounded-full bg-surface p-2.5">
              <Plus size={18} color="#38BDF8" />
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerClassName="gap-3 px-5 pb-3">
          {SCENARIOS.map((item) => {
            const active = item.key === scenario;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => pickScenario(item.key)}
                className={`w-48 gap-1 rounded-2xl border p-3 ${active ? 'border-accent bg-accent/15' : 'border-slate-700 bg-surface'}`}
              >
                <Text className={`font-semibold ${active ? 'text-accent' : 'text-white'}`}>{item.title}</Text>
                <Text className="text-xs text-muted">{item.description}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {showHistory ? (
          <View className="mx-5 mb-3 max-h-48 gap-2 rounded-2xl border border-slate-700 bg-surface p-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-muted">Geçmiş oturumlar</Text>
            {sessionsStatus === 'loading' ? <Text className="text-sm text-muted">Yükleniyor…</Text> : null}
            {sessionsStatus === 'ready' && sessions.length === 0 ? <Text className="text-sm text-muted">Henüz oturum yok.</Text> : null}
            <ScrollView>
              {sessions.map((session) => (
                <Pressable
                  key={session.id}
                  accessibilityRole="button"
                  onPress={() => {
                    void openSession(session.id);
                    setShowHistory(false);
                  }}
                  className={`mb-2 flex-row items-center justify-between rounded-xl px-3 py-2 ${session.id === sessionId ? 'bg-accent/15' : 'bg-bg'}`}
                >
                  <Text className="text-sm text-white">{session.scenario}</Text>
                  <Text className="text-xs text-muted">{session.messageCount} mesaj</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <ScrollView ref={scrollRef} className="flex-1" contentContainerClassName="gap-4 px-5 pb-4 pt-2">
          {messages.length === 0 ? (
            <View className="items-center gap-2 py-10">
              <Text className="text-center text-base text-muted">
                Bir senaryo seç ve İngilizce yazmaya ya da konuşmaya başla. Her mesajın altında gramer geri bildirimi göreceksin.
              </Text>
            </View>
          ) : null}

          {messages.map((message) => (
            <View key={message.id} className="gap-2">
              <ChatBubble message={message} />
              <GrammarFeedbackCard message={message} />
              {message.sender === 'AI' ? (
                <VocabularyChips items={message.vocabulary} savedTerms={savedTerms} onSave={(item) => void saveVocabulary(item)} />
              ) : null}
            </View>
          ))}

          {isSending ? <Text className="text-sm text-muted">Tutor yanıtlıyor…</Text> : null}
          {errorMessage ? <Text className="text-sm text-danger">{errorMessage}</Text> : null}
        </ScrollView>

        <View className="flex-row items-end gap-2 border-t border-slate-800 bg-bg px-4 py-3">
          <VoiceInputButton onTranscript={(text) => setDraft((current) => (current ? `${current} ${text}` : text))} disabled={isSending} />
          <TextInput
            accessibilityLabel="Mesajınız"
            value={draft}
            onChangeText={setDraft}
            placeholder="Write in English..."
            placeholderTextColor="#64748B"
            multiline
            editable={!isSending}
            onSubmitEditing={() => void send(draft)}
            className="max-h-32 min-h-[44px] flex-1 rounded-2xl border border-slate-700 bg-surface px-4 py-2.5 text-base text-white"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Gönder"
            accessibilityState={{ disabled: isSending || !draft.trim() }}
            disabled={isSending || !draft.trim()}
            onPress={() => void send(draft)}
            className={`h-11 w-11 items-center justify-center rounded-full bg-accent ${isSending || !draft.trim() ? 'opacity-40' : ''}`}
          >
            <Send size={18} color="#0F172A" />
          </Pressable>
        </View>
        {messages.length === 0 && !draft ? (
          <View className="px-5 pb-2">
            <Button title="Serbest sohbetle başla" variant="ghost" onPress={() => pickScenario('free-talk')} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
