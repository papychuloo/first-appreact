import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {

    const [text, setText] = useState("Titi");

    return (
        <View style={styles.container}>
            <Text>{text}</Text>
            <TextInput style={styles.textinput}
                onChangeText={(newTextValue) => {
                    setText(newTextValue);
                }}
            ></TextInput>

            <Link href="/">Accueil</Link>

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
