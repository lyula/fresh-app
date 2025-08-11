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

const Stack = createNativeStackNavigator();

export default function App() {
  const theme = useAppTheme();
  const navigationRef = React.useRef();
  return (
    <UserProvider>
      <DripsyProvider theme={theme}>
        <NavigationContainer ref={navigationRef}>
          <SidebarProvider getNavigation={() => navigationRef.current}>
            <Stack.Navigator initialRouteName="Login" screenOptions={{
              headerShown: true,
              headerStyle: { backgroundColor: theme.colors.$white },
              headerTintColor: theme.colors.$primaryBlue,
              headerTitleAlign: 'center',
              headerTitleStyle: { color: theme.colors.$primaryBlue, fontWeight: 'bold' },
            }}>
              <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
              <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms & Conditions' }} />
              <Stack.Screen name="PostsFeed" component={require('./screens/PostsFeedScreen').default} options={{ title: 'Feed', headerShown: false }} />
            </Stack.Navigator>
            <Sidebar />
            <StatusBar style="auto" />
          </SidebarProvider>
        </NavigationContainer>
      </DripsyProvider>
    </UserProvider>
  );
}

import { DripsyProvider } from 'dripsy';
import { useAppTheme } from './theme';
