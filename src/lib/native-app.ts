import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Keyboard } from "@capacitor/keyboard";
import { PushNotifications } from "@capacitor/push-notifications";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

let initialized = false;

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function initializeNativeApp() {
  if (initialized || !isNativeApp()) return;
  initialized = true;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#F9F8F6" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {}

  try {
    await Keyboard.setResizeMode({ mode: "body" });
  } catch {}

  try {
    await SplashScreen.hide();
  } catch {}

  try {
    await PushNotifications.requestPermissions();
  } catch {}

  App.addListener("appStateChange", () => {});
}

export async function tapHaptic() {
  if (!isNativeApp()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
}
