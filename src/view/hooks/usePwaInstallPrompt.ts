import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  type BeforeInstallPromptEvent,
  type BrowserWindowLike,
  hasDismissedPwaInstallPrompt,
  isIosWebBrowser,
  isRunningAsInstalledPwa,
  rememberPwaInstallPromptDismissed,
} from './pwaInstallPromptLogic';

export function usePwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isIosWebInstall, setIsIosWebInstall] = useState(false);
  const isWeb = Platform.OS === 'web';
  const canInstallOnWeb = installPromptEvent != null || isIosWebInstall;

  useEffect(() => {
    const browserWindow = getBrowserWindow();

    if (Platform.OS !== 'web' || !browserWindow) {
      return;
    }

    const installed = isRunningAsInstalledPwa(Platform.OS, browserWindow);
    const iosWebInstall = isIosWebBrowser(Platform.OS, browserWindow);

    setIsPwaInstalled(installed);
    setIsIosWebInstall(iosWebInstall);

    if (iosWebInstall && !installed && !hasDismissedPwaInstallPrompt(Platform.OS, browserWindow)) {
      setShowInstallPrompt(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;

      setInstallPromptEvent(promptEvent);

      if (!hasDismissedPwaInstallPrompt(Platform.OS, browserWindow)) {
        setShowInstallPrompt(true);
      }
    }

    function handleAppInstalled() {
      setInstallPromptEvent(null);
      setShowInstallPrompt(false);
      setIsPwaInstalled(true);
    }

    browserWindow.addEventListener?.('beforeinstallprompt', handleBeforeInstallPrompt);
    browserWindow.addEventListener?.('appinstalled', handleAppInstalled);

    return () => {
      browserWindow.removeEventListener?.('beforeinstallprompt', handleBeforeInstallPrompt);
      browserWindow.removeEventListener?.('appinstalled', handleAppInstalled);
    };
  }, []);

  async function promptPwaInstall() {
    if (Platform.OS !== 'web') {
      return;
    }

    setShowInstallPrompt(false);

    if (isIosWebInstall) {
      setShowInstallInstructions(true);
      return;
    }

    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();

    try {
      const choice = await installPromptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
    } finally {
      setInstallPromptEvent(null);
    }
  }

  function dismissPwaInstallPrompt() {
    rememberPwaInstallPromptDismissed(Platform.OS, getBrowserWindow());
    setShowInstallPrompt(false);
  }

  function closeInstallInstructions() {
    setShowInstallInstructions(false);
  }

  return {
    isWeb,
    canInstallOnWeb,
    isPwaInstalled,
    isIosWebInstall,
    showInstallPrompt,
    showInstallInstructions,
    installPromptPrimaryActionLabel: isIosWebInstall ? 'Show Steps' : 'Install',
    promptPwaInstall,
    dismissPwaInstallPrompt,
    closeInstallInstructions,
  };
}

function getBrowserWindow(): BrowserWindowLike | undefined {
  return typeof window === 'undefined' ? undefined : window;
}
