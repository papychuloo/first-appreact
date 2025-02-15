import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function App() {

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Coucou c'est magique !</Text>
            <Text style={styles.text}>Test n°2</Text>


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
    text: {
        color: "red"
    },
});
