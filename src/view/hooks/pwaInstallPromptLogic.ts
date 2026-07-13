export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export type BrowserStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type BrowserNavigatorLike = {
  maxTouchPoints?: number;
  platform?: string;
  standalone?: boolean;
  userAgent?: string;
};

export type BrowserWindowLike = {
  addEventListener?: (type: string, listener: (event: Event) => void) => void;
  localStorage?: BrowserStorageLike;
  matchMedia?: (query: string) => { matches: boolean };
  navigator?: BrowserNavigatorLike;
  removeEventListener?: (type: string, listener: (event: Event) => void) => void;
};

export const pwaInstallPromptDismissedKey = 'breastCancerStagingPwaInstallPromptDismissed';

export function hasDismissedPwaInstallPrompt(platformOs: string, browserWindow: BrowserWindowLike | undefined) {
  if (!isWebBrowserRuntime(platformOs, browserWindow)) {
    return true;
  }

  try {
    return browserWindow.localStorage?.getItem(pwaInstallPromptDismissedKey) === 'true';
  } catch {
    return false;
  }
}

export function rememberPwaInstallPromptDismissed(platformOs: string, browserWindow: BrowserWindowLike | undefined) {
  if (!isWebBrowserRuntime(platformOs, browserWindow)) {
    return;
  }

  try {
    browserWindow.localStorage?.setItem(pwaInstallPromptDismissedKey, 'true');
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

export function isRunningAsInstalledPwa(platformOs: string, browserWindow: BrowserWindowLike | undefined) {
  if (!isWebBrowserRuntime(platformOs, browserWindow)) {
    return false;
  }

  const standaloneDisplayMode = browserWindow.matchMedia?.('(display-mode: standalone)').matches === true;
  const iosStandalone = browserWindow.navigator?.standalone === true;

  return standaloneDisplayMode || iosStandalone;
}

export function isIosWebBrowser(platformOs: string, browserWindow: BrowserWindowLike | undefined) {
  if (!isWebBrowserRuntime(platformOs, browserWindow)) {
    return false;
  }

  const maxTouchPoints = browserWindow.navigator?.maxTouchPoints ?? 0;
  const platform = browserWindow.navigator?.platform ?? '';
  const userAgent = browserWindow.navigator?.userAgent ?? '';
  const iosDevice = /iPad|iPhone|iPod/.test(userAgent);
  const ipadOsDesktopMode = platform === 'MacIntel' && maxTouchPoints > 1;

  return iosDevice || ipadOsDesktopMode;
}

function isWebBrowserRuntime(platformOs: string, browserWindow: BrowserWindowLike | undefined): browserWindow is BrowserWindowLike {
  return platformOs === 'web' && browserWindow != null;
}
