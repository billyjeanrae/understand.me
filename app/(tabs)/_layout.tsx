import { Tabs } from 'expo-router';
import { useResponsive } from '../../utils/platform';
import { Home, TrendingUp, MessageSquare, User } from 'lucide-react-native';

export default function TabLayout() {
  const { isWeb, spacing, fontSize } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          borderTopWidth: 1,
          height: isWeb ? 60 : 80,
          paddingBottom: isWeb ? spacing(8) : spacing(20),
          paddingTop: spacing(8),
        },
        tabBarLabelStyle: {
          fontSize: fontSize(12),
          fontFamily: 'Inter-Medium',
          marginTop: spacing(4),
        },
        tabBarIconStyle: {
          marginTop: spacing(4),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="growth"
        options={{
          title: 'Growth',
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
