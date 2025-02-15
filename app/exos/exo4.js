import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
    const [inputText, setInputText] = useState("");
    const [textFinal, setTextFinal] = useState("");

    return (
        <View style={styles.container}>
            {/* Champs input + button */}
            <TextInput style={styles.textinput}
                onChangeText={setInputText}
            ></TextInput>
            <Button onPress={() => {
                setTextFinal(inputText)
            }} title="Mettre à jour le texte"></Button>
            <Text>{textFinal}</Text>

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
    textinput: {
        borderColor: "black",
        borderWidth: 0.8,
        padding: 10
    }
});
