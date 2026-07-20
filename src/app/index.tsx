import { Redirect } from 'expo-router';

export default function Index() {
  // _layout.tsx handles the actual redirection logic based on auth state
  // We just return null here, or a redirect to login as a safe fallback
  return <Redirect href="/(auth)/login" />;
}
