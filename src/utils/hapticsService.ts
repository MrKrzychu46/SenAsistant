import * as Haptics from 'expo-haptics';

export function triggerImpactFeedback(): void {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Ignore when haptics are unavailable on the target device
  }
}

export function triggerSuccessFeedback(): void {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Ignore when haptics are unavailable on the target device
  }
}

export function triggerSelectionFeedback(): void {
  try {
    Haptics.selectionAsync();
  } catch {
    // Ignore when haptics are unavailable on the target device
  }
}
