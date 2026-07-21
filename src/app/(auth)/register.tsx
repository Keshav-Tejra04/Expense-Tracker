import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../../lib/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'join' | 'create'>('join');
  
  // Specific fields
  const [familyCode, setFamilyCode] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [initialCashBalance, setInitialCashBalance] = useState('');
  const [initialOnlineBalance, setInitialOnlineBalance] = useState('');
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in your basic details');
      return;
    }

    if (mode === 'join' && !familyCode) {
      Alert.alert('Error', 'Please enter a family code to join');
      return;
    }

    if (mode === 'create' && !familyName) {
      Alert.alert('Error', 'Please enter a name for your new family');
      return;
    }

    setLoading(true);
    try {
      await registerUser(
        email, 
        password, 
        name, 
        mode === 'create' ? familyName : undefined, 
        mode === 'join' ? familyCode : undefined,
        mode === 'create' && initialCashBalance ? Number(initialCashBalance) : undefined,
        mode === 'create' && initialOnlineBalance ? Number(initialOnlineBalance) : undefined
      );
      // AuthContext will handle redirect to (tabs) automatically
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Join the Family</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Your Name"
            placeholder="e.g. Papa, Mummy, Rahul"
            value={name}
            onChangeText={setName}
          />
          
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.modeToggle}>
            <Button 
              title="Join Family" 
              variant={mode === 'join' ? 'primary' : 'secondary'}
              onPress={() => setMode('join')}
              style={styles.modeButton}
            />
            <View style={{ width: 10 }} />
            <Button 
              title="Create Family" 
              variant={mode === 'create' ? 'primary' : 'secondary'}
              onPress={() => setMode('create')}
              style={styles.modeButton}
            />
          </View>

          {mode === 'join' ? (
            <Input
              label="Family Code"
              placeholder="e.g. A3X7K9"
              value={familyCode}
              onChangeText={setFamilyCode}
              autoCapitalize="characters"
            />
          ) : (
            <>
              <Input
                label="Family Name"
                placeholder="e.g. Sharma Family"
                value={familyName}
                onChangeText={setFamilyName}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Input
                    label="Initial Cash (₹)"
                    placeholder="0"
                    value={initialCashBalance}
                    onChangeText={setInitialCashBalance}
                    keyboardType="default"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Input
                    label="Initial Online (₹)"
                    placeholder="0"
                    value={initialOnlineBalance}
                    onChangeText={setInitialOnlineBalance}
                    keyboardType="default"
                  />
                </View>
              </View>
            </>
          )}

          <Button 
            title={mode === 'join' ? "Register & Join" : "Register & Create"} 
            onPress={handleRegister} 
            isLoading={loading}
            style={styles.registerButton} 
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Button 
            title="Go to Login" 
            variant="secondary"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(auth)/login' as any);
              }
            }} 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.textSecondary,
  },
  card: {
    padding: 20,
  },
  modeToggle: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
  },
  registerButton: {
    marginTop: 24,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
});
