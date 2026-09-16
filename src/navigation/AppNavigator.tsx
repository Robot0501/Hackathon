import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Compass, Briefcase, Users, Sparkles, User, ShieldAlert } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { theme } from '../theme';
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import FeedScreen from '../screens/FeedScreen';
import OpportunitiesScreen from '../screens/OpportunitiesScreen';
import NetworkScreen from '../screens/NetworkScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { currentUser } = useApp();
  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const isBusiness = role === 'business';

  const screenOptions = {
    headerStyle: { backgroundColor: theme.colors.navy },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: '800' as const },
    tabBarActiveTintColor: theme.colors.navy,
    tabBarInactiveTintColor: theme.colors.slate500,
    tabBarStyle: { height: 62, paddingBottom: 6, paddingTop: 4, backgroundColor: '#fff', borderTopColor: theme.colors.slate200 },
    tabBarLabelStyle: { fontSize: 9, fontWeight: '700' as const },
  };

  // Administrators use a dedicated governance workspace. They do not need
  // student career tools such as job applications, skills, AI coaching, etc.
  if (isAdmin) {
    return (
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{
            title: 'Admin',
            headerTitle: 'Admin Console',
            tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Account',
            headerTitle: 'Administrator Account',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Campus Feed',
          headerTitle: 'Enrich • Campus Feed',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Opportunities"
        component={OpportunitiesScreen}
        options={{
          title: isBusiness ? 'Recruit' : 'Jobs',
          headerTitle: isBusiness ? 'Recruitment Hub' : 'Career Hub',
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Network"
        component={NetworkScreen}
        options={{
          title: 'Network',
          headerTitle: 'Richfield Network',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      {!isBusiness && (
        <Tab.Screen
          name="AI"
          component={AIAssistantScreen}
          options={{
            title: 'Enrich AI',
            headerTitle: 'Enrich AI',
            tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: isBusiness ? 'Company' : 'Profile',
          headerTitle: isBusiness ? 'Company Profile' : 'My Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, isBootstrapping } = useApp();

  if (isBootstrapping) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.slate50 }}><ActivityIndicator size="large" color={theme.colors.royal} /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.navy },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.colors.slate50 },
        }}
      >
        {currentUser ? (
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In to Enrich' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Join Enrich' }} />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={{ title: 'Verify Email' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
