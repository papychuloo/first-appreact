import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function App() {

    const [counter, setCounter] = useState(0);

    return (
        <View style={styles.container}>
            <Button title='Press me'
                onPress={() => {
                    console.log('test');
                    setCounter(counter + 2)
                }}></Button>

            <Text>{counter}</Text>

            <Link href="/">Accueil</Link>

            <StatusBar style="dark" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
