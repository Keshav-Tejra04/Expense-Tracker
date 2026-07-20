import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../hooks/useFamily';
import { logoutUser } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { userData } = useAuth();
  const { family } = useFamily();

  const handleCopyCode = () => {
    if (family?.code) {
      Clipboard.setString(family.code);
      Alert.alert('Copied!', 'Family Code has been copied to your clipboard. Share it with your family members so they can join.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logoutUser }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>

      {/* User Profile */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="account-circle-outline" size={24} color={colors.dark.primary} />
          <Text style={styles.cardTitle}>My Profile</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{userData?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userData?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{userData?.role}</Text>
        </View>
      </Card>

      {/* Family Info */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="home-group" size={24} color={colors.dark.income} />
          <Text style={styles.cardTitle}>Family Settings</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Family Name</Text>
          <Text style={styles.infoValue}>{family?.name || 'Loading...'}</Text>
        </View>
        
        <View style={styles.codeContainer}>
          <View>
            <Text style={styles.infoLabel}>Invite Code</Text>
            <Text style={styles.codeValue}>{family?.code || '...'}</Text>
          </View>
          <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
            <MaterialCommunityIcons name="content-copy" size={20} color={colors.dark.primary} />
            <Text style={styles.copyText}>Copy Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.infoLabel}>Members ({family?.members?.length || 0})</Text>
          <View style={styles.membersList}>
            {family?.members?.map((member, index) => (
              <View key={index} style={styles.memberBadge}>
                <MaterialCommunityIcons name="account" size={16} color={colors.dark.textSecondary} />
                <Text style={styles.memberName}>{member}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <Button 
        title="Logout" 
        variant="danger" 
        onPress={handleLogout} 
        style={styles.logoutBtn}
      />
      
      <Text style={styles.version}>Family Finance v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.dark.textPrimary,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark.background,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.dark.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    color: colors.dark.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  membersSection: {
    marginTop: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceHover,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  memberName: {
    color: colors.dark.textPrimary,
    marginLeft: 4,
    fontSize: 14,
  },
  logoutBtn: {
    marginTop: 8,
  },
  version: {
    textAlign: 'center',
    color: colors.dark.textMuted,
    marginTop: 24,
    fontSize: 12,
  },
});
