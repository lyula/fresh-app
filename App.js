import * as React from 'react';
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
  return (
    <UserProvider>
      <DripsyProvider theme={theme}>
        <NavigationContainer>
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
          <StatusBar style="auto" />
        </NavigationContainer>
      </DripsyProvider>
    </UserProvider>
  );
}

import { DripsyProvider } from 'dripsy';
import { useAppTheme } from './theme';
