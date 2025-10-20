import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SignupScreen from './src/screens/SignupScreen';

export default function App() {
  return <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      
          <AppNavigator />
          <SignupScreen/>
        
      </SafeAreaView>
    </SafeAreaProvider>;
}
