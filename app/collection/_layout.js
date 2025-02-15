import { Stack } from 'expo-router';

export default function CollectionLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Ma Collection",
        }}
      />
      <Stack.Screen
        name="wishlist"
        options={{
          title: "Ma Liste de Souhaits",
        }}
      />
    </Stack>
  );
}
