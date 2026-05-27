import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuthStore();

  
  if (isAuthenticated && user) {
    if (user.role === 'GESTOR') {
      return <Redirect href="/(gestor)/denuncias" />;
    }
    return <Redirect href="/(denunciante)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
