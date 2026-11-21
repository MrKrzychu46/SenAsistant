import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Feather, ChevronLeft, ShieldAlert } from 'lucide-react-native';
import { COLORS } from '../theme/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onOpenGM?: () => void;
  showGMButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'SEN',
  subtitle = 'Licznik Kruków',
  onBack,
  onOpenGM,
  showGMButton = false,
}) => {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.iconButton} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder}>
          <Moon size={22} color={COLORS.moonGold} />
        </View>
      )}

      <View style={styles.titleContainer}>
        <View style={styles.row}>
          <Text style={styles.titleText}>{title}</Text>
          <Feather size={18} color={COLORS.dreamCyan} style={{ marginLeft: 6 }} />
        </View>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>

      {showGMButton && onOpenGM ? (
        <TouchableOpacity style={styles.gmButton} onPress={onOpenGM} activeOpacity={0.7}>
          <ShieldAlert size={20} color={COLORS.moonGold} />
          <Text style={styles.gmButtonText}>GM</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgGlass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  subtitleText: {
    fontSize: 11,
    color: COLORS.dreamCyan,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
    fontWeight: '600',
  },
  gmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  gmButtonText: {
    color: COLORS.moonGold,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
