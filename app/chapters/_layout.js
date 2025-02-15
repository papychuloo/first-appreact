// File: c:/Users/andre/Documents/first-appreact/app/chapters/_layout.js
import { Stack } from 'expo-router';

export default function ChaptersLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: 'white' }
    }} />
  );
}