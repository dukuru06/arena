import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../theme';
import { NeonButton } from '../components/ui';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// User
import HomeScreen from '../screens/user/HomeScreen';
import TournamentsScreen from '../screens/user/TournamentsScreen';
import TournamentDetailScreen from '../screens/user/TournamentDetailScreen';
import JoinTournamentScreen from '../screens/user/JoinTournamentScreen';
import PaymentUploadScreen from '../screens/user/PaymentUploadScreen';
import MyTournamentsScreen from '../screens/user/MyTournamentsScreen';
import LeaderboardScreen from '../screens/user/LeaderboardScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import WinnersScreen from '../screens/user/WinnersScreen';
import GalleryScreen from '../screens/user/GalleryScreen';
// Admin
import DashboardScreen from '../screens/admin/DashboardScreen';
import AdminTournamentsScreen from '../screens/admin/AdminTournamentsScreen';
import TournamentFormScreen from '../screens/admin/TournamentFormScreen';
import PaymentsScreen from '../screens/admin/PaymentsScreen';
import RegistrationsScreen from '../screens/admin/RegistrationsScreen';
import RoomManagerScreen from '../screens/admin/RoomManagerScreen';
import ResultsScreen from '../screens/admin/ResultsScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import HomeCMSScreen from '../screens/admin/HomeCMSScreen';
import SendNotificationScreen from '../screens/admin/SendNotificationScreen';
import WinnersManagerScreen from '../screens/admin/WinnersManagerScreen';
import GalleryManagerScreen from '../screens/admin/GalleryManagerScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminMoreScreen from '../screens/admin/AdminMoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bgElevated, primary: colors.neonBlue },
};

const stackOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  headerTitle: '',
  contentStyle: { backgroundColor: colors.bg },
};

const tabOptions = ({ icons }) => ({ route }) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.bgElevated,
    borderTopColor: colors.cardBorder,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarActiveTintColor: colors.neonBlue,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
  tabBarIcon: ({ color, focused }) => (
    <Ionicons name={focused ? icons[route.name].replace('-outline', '') : icons[route.name]} size={22} color={color} />
  ),
});

function UserTabs() {
  const icons = {
    Home: 'home-outline', Tournaments: 'game-controller-outline',
    MyTournaments: 'ticket-outline', Winners: 'trophy-outline', Profile: 'person-outline',
  };
  return (
    <Tab.Navigator screenOptions={tabOptions({ icons })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tournaments" component={TournamentsScreen} />
      <Tab.Screen name="MyTournaments" component={MyTournamentsScreen} options={{ title: 'My Games' }} />
      <Tab.Screen name="Winners" component={WinnersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const icons = {
    Dashboard: 'grid-outline', AdminTournaments: 'game-controller-outline',
    Payments: 'card-outline', AdminUsers: 'people-outline', More: 'menu-outline',
  };
  return (
    <Tab.Navigator screenOptions={tabOptions({ icons })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="AdminTournaments" component={AdminTournamentsScreen} options={{ title: 'Tournaments' }} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="AdminUsers" component={UsersScreen} options={{ title: 'Users' }} />
      <Tab.Screen name="More" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
}

function BlockedScreen() {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Ionicons name="ban" size={56} color={colors.danger} />
      <Text style={[typography.h2, { marginTop: 16 }]}>Account Suspended</Text>
      <Text style={[typography.caption, { textAlign: 'center', marginVertical: 12 }]}>
        Your account has been suspended by the admin. Contact support if you believe this is a mistake.
      </Text>
      <NeonButton title="LOGOUT" variant="outline" onPress={logout} />
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="trophy" size={56} color={colors.neonBlue} />
      <Text style={[typography.h3, { marginTop: 16 }]}>ARENA ESPORTS</Text>
    </View>
  );
}

function AuthErrorScreen({ message, onRetry }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Ionicons name="warning" size={56} color={colors.danger} />
      <Text style={[typography.h2, { marginTop: 16 }]}>Couldn't load profile</Text>
      <Text style={[typography.caption, { textAlign: 'center', marginVertical: 12 }]}>
        {message}{'\n\n'}This usually means Firestore security rules haven't been deployed yet for this project.
      </Text>
      <NeonButton title="RETRY" onPress={onRetry} />
    </View>
  );
}

export default function RootNavigator() {
  const { user, profile, initializing, authError, isAdmin, isBlocked, logout } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (authError) return <AuthErrorScreen message={authError} onRetry={logout} />;
  if (user && !profile) return <LoadingScreen />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={stackOptions}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : isBlocked ? (
          <Stack.Screen name="Blocked" component={BlockedScreen} options={{ headerShown: false }} />
        ) : isAdmin ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
            <Stack.Screen name="TournamentForm" component={TournamentFormScreen} />
            <Stack.Screen name="Registrations" component={RegistrationsScreen} />
            <Stack.Screen name="RoomManager" component={RoomManagerScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="HomeCMS" component={HomeCMSScreen} />
            <Stack.Screen name="SendNotification" component={SendNotificationScreen} />
            <Stack.Screen name="WinnersManager" component={WinnersManagerScreen} />
            <Stack.Screen name="GalleryManager" component={GalleryManagerScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            {/* Admin can also browse user views */}
            <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
            <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
            <Stack.Screen name="JoinTournament" component={JoinTournamentScreen} />
            <Stack.Screen name="PaymentUpload" component={PaymentUploadScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Gallery" component={GalleryScreen} />
            <Stack.Screen name="WinnersPage" component={WinnersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
