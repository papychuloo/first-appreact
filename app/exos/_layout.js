import { Link, Slot } from 'expo-router';
import { Text, View } from 'react-native';
import { Header } from 'react-native/Libraries/NewAppScreen';

export default function HomeLayout() {
    return (
        <>
            <Text>Exercices</Text>
            <Slot />
        </>
    );
}