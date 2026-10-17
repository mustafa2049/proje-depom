import { Tabs } from 'expo-router';
import { Bot, BookOpen, House, Puzzle, UserRound } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#94A3B8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Pratik',
          tabBarIcon: ({ color, size }) => <Puzzle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ai-tutor"
        options={{
          title: 'AI Tutor',
          tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: 'Okuma',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />
      {/* Odak modu: çalışma ekranında alt navigasyon gizlenir; ekran yalnızca yönlendirmeyle açılır. */}
      <Tabs.Screen
        name="study"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
