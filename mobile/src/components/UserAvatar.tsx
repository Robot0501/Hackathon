import React from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

type Props = {
  uri?: string;
  name?: string;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function UserAvatar({ uri, name = 'Richfield User', size = 40, radius, style }: Props) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'RU';
  const borderRadius = radius ?? size / 2;

  if (uri?.trim()) {
    return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius }, style as any]} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius }, style]}>
      <Text style={[styles.initials, { fontSize: Math.max(10, Math.round(size * 0.34)) }]}>{letters}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: theme.colors.slate200,
    borderWidth: 1,
    borderColor: theme.colors.slate300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.navy,
    fontWeight: '900',
  },
});
