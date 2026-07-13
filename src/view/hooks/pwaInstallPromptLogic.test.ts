import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type BrowserWindowLike,
  hasDismissedPwaInstallPrompt,
  isIosWebBrowser,
  isRunningAsInstalledPwa,
  pwaInstallPromptDismissedKey,
  rememberPwaInstallPromptDismissed,
} from './pwaInstallPromptLogic';

function storage(initial: Record<string, string> = {}) {
  const data = { ...initial };

  return {
    data,
    getItem(key: string) {
      return data[key] ?? null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

test('PWA install helpers do not touch browser APIs on native platforms', () => {
  const throwingWindow: BrowserWindowLike = {
    localStorage: {
      getItem() {
        throw new Error('localStorage should not be read');
      },
      setItem() {
        throw new Error('localStorage should not be written');
      },
    },
    matchMedia() {
      throw new Error('matchMedia should not be called');
    },
  };

  assert.equal(hasDismissedPwaInstallPrompt('ios', throwingWindow), true);
  assert.doesNotThrow(() => rememberPwaInstallPromptDismissed('android', throwingWindow));
  assert.equal(isRunningAsInstalledPwa('ios', throwingWindow), false);
  assert.equal(isIosWebBrowser('android', throwingWindow), false);
});

test('dismissal state is read and written only in web storage', () => {
  const fakeStorage = storage();
  const browserWindow: BrowserWindowLike = { localStorage: fakeStorage };

  assert.equal(hasDismissedPwaInstallPrompt('web', browserWindow), false);
  rememberPwaInstallPromptDismissed('web', browserWindow);
  assert.equal(fakeStorage.data[pwaInstallPromptDismissedKey], 'true');
  assert.equal(hasDismissedPwaInstallPrompt('web', browserWindow), true);
});

test('storage failures do not break install dismissal helpers', () => {
  const browserWindow: BrowserWindowLike = {
    localStorage: {
      getItem() {
        throw new Error('storage unavailable');
      },
      setItem() {
        throw new Error('storage unavailable');
      },
    },
  };

  assert.equal(hasDismissedPwaInstallPrompt('web', browserWindow), false);
  assert.doesNotThrow(() => rememberPwaInstallPromptDismissed('web', browserWindow));
});

test('installed PWA detection supports display-mode and iOS standalone state', () => {
  assert.equal(
    isRunningAsInstalledPwa('web', {
      matchMedia: (query) => ({ matches: query === '(display-mode: standalone)' }),
      navigator: {},
    }),
    true,
  );
  assert.equal(isRunningAsInstalledPwa('web', { navigator: { standalone: true } }), true);
  assert.equal(isRunningAsInstalledPwa('web', { navigator: { standalone: false } }), false);
});

test('iOS web detection covers iPhone user agents and iPad desktop mode', () => {
  assert.equal(isIosWebBrowser('web', { navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' } }), true);
  assert.equal(isIosWebBrowser('web', { navigator: { platform: 'MacIntel', maxTouchPoints: 5, userAgent: 'Mozilla/5.0' } }), true);
  assert.equal(isIosWebBrowser('web', { navigator: { platform: 'Win32', maxTouchPoints: 0, userAgent: 'Mozilla/5.0' } }), false);
});
