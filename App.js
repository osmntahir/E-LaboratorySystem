import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3f51b5',
        accent: '#f1c40f',
    },
};

const App = () => {
    return (
        <PaperProvider theme={theme}>
            <AuthProvider>
                <AppNavigator />
            </AuthProvider>
        </PaperProvider>
    );
};

export default App;
