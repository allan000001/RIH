// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'wifi.router': 'router',
  'antenna.radiowaves.left.and.right': 'wifi',
  'checkmark.circle.fill': 'check-circle',
  'arrow.clockwise.circle': 'refresh',
  'circle': 'radio-button-unchecked',
  'exclamationmark.circle.fill': 'error',
  'bell.fill': 'notifications',
  'gear': 'settings',
  'plus.circle.fill': 'add-circle',
  'link': 'link',
  'qrcode.viewfinder': 'qr-code-scanner',
  'magnifyingglass': 'search',
  'person.crop.circle.fill': 'account-circle',
  'bell': 'notifications-none',
  'checkmark.circle': 'check-circle-outline',
  'xmark.circle': 'cancel',
  'info.circle': 'info',
  'exclamationmark.triangle': 'warning',
  'arrow.up.circle': 'keyboard-arrow-up',
  'arrow.down.circle': 'keyboard-arrow-down',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'star.fill': 'star',
  'crown.fill': 'emoji-events',
  'giftcard.fill': 'card-giftcard',
  'info.circle.fill': 'info',
  'exclamationmark.triangle.fill': 'warning',
  'gearshape.fill': 'settings',
  'chart.bar.fill': 'bar-chart',
  'person.2.fill': 'people',
  'questionmark.circle.fill': 'help',
  'xmark': 'close',
  'wifi': 'wifi',
  'sparkles': 'auto-awesome',
  'share': 'share',
  'bolt.fill': 'bolt',
  'gauge.high': 'speed',
  'trophy.fill': 'emoji-events',
  'flame.fill': 'local-fire-department',
  'person.badge.plus': 'person-add',
  'arrow.clockwise': 'refresh',
  'xmark.circle.fill': 'cancel',
  'trash.circle.fill': 'delete',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
