import { Tabs } from 'expo-router';
import { House } from 'lucide-react-native';

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
