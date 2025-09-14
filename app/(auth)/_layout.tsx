import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      {/* <Stack.Screen name="welcome" /> */}
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      {/* <Stack.Screen name="registration" /> */}
    </Stack>
  );
}
