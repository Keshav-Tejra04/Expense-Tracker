import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const { userData } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Family Finance!</Text>
      <Text style={styles.subtitle}>Logged in as {userData?.name}</Text>
      
      <Button 
        title="Logout" 
        variant="danger" 
        onPress={logoutUser} 
        style={{ marginTop: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.background,
  },
  title: {
    fontSize: 24,
    color: colors.dark.textPrimary,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    marginTop: 8,
  },
});
