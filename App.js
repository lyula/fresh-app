

import { DripsyProvider } from 'dripsy';
import { useAppTheme } from './theme';
import * as React from 'react';
import Sidebar from './components/Sidebar';
import { SidebarProvider } from './context/SidebarContext';
import { UserProvider } from './context/user';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TermsScreen from './screens/TermsScreen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  const theme = useAppTheme();
  const navigationRef = React.useRef();
  return (
    <UserProvider>
      <DripsyProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef}>
            <SidebarProvider getNavigation={() => navigationRef.current}>
              <Stack.Navigator initialRouteName="Login" screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: theme.colors.$primaryBlue,
                headerTitleAlign: 'center',
                headerTitleStyle: { color: theme.colors.$primaryBlue, fontWeight: 'bold' },
                animation: 'none',
              }}>
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
                <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
                <Stack.Screen name="PostsFeed" component={require('./screens/PostsFeedScreen').default} options={{ title: 'Feed', headerShown: false }} />
                  <Stack.Screen name="CreatePost" component={require('./screens/CreatePostScreen').default} options={{ title: 'Create Post' }} />
                  <Stack.Screen name="MessagesScreen" component={require('./screens/MessagesScreen').default} options={{ title: 'Messages', headerShown: false }} />
                  <Stack.Screen name="NotificationsScreen" component={require('./screens/NotificationsScreen').default} options={{ title: 'Notifications', headerShown: false }} />
                  <Stack.Screen name="ChatScreen" component={require('./screens/ChatScreen').default} options={{ title: 'Chat', headerShown: false }} />
                  <Stack.Screen name="PublicProfileScreen" component={require('./screens/PublicProfileScreen').default} options={{ title: 'Profile', headerShown: false }} />
                  <Stack.Screen name="AllProfileSuggestions" component={require('./screens/AllProfileSuggestionsScreen').default} options={{ title: 'All Suggestions' }} />
                  <Stack.Screen name="PaymentsScreen" component={require('./screens/PaymentsScreen').default} options={{ title: 'Payments' }} />
                  <Stack.Screen name="PaymentsDetailScreen" component={require('./screens/PaymentsDetailScreen').default} options={{ title: 'Payment Details' }} />
                </Stack.Navigator>
                <Sidebar />
              </SidebarProvider>
            </NavigationContainer>
        </SafeAreaProvider>
      </DripsyProvider>
    </UserProvider>
  );
}


