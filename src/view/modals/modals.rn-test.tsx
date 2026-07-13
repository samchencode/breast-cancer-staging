import { render, screen, userEvent } from '@testing-library/react-native';

import { InstallInstructionsModal } from './InstallInstructionsModal';
import { InstallPromptModal } from './InstallPromptModal';
import { SelectorModal } from './SelectorModal';

describe('frontend modals', () => {
  test('InstallPromptModal renders install actions', async () => {
    const user = userEvent.setup();
    const onDismiss = jest.fn();
    const onInstall = jest.fn();

    await render(<InstallPromptModal visible primaryActionLabel="Install" onDismiss={onDismiss} onInstall={onInstall} />);

    expect(screen.getByText('Install Web App')).toBeOnTheScreen();
    expect(screen.getByText('Add this calculator to your device for a standalone app window.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Not now' }));
    await user.press(screen.getByRole('button', { name: 'Install' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onInstall).toHaveBeenCalledTimes(1);
  });

  test('InstallInstructionsModal renders the iOS install steps', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    await render(<InstallInstructionsModal visible onClose={onClose} />);

    expect(screen.getByText('Install Web App')).toBeOnTheScreen();
    expect(screen.getByText('Open this page in Safari first if you are using another browser.')).toBeOnTheScreen();
    expect(screen.getByText('Tap the Share button')).toBeOnTheScreen();
    expect(screen.getByText('If you only see the "..." menu, tap "..." first, then choose Share.')).toBeOnTheScreen();
    expect(screen.getByText('Scroll all the way down in the share menu.')).toBeOnTheScreen();
    expect(screen.getByText('Tap Add to Home Screen.')).toBeOnTheScreen();
    expect(screen.getByText('Tap Add in the top right.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Done' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('SelectorModal renders options and reports selection', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSelect = jest.fn();

    await render(
      <SelectorModal
        title="Tumor"
        visible
        options={['T1c', 'T2']}
        selected="T1c"
        getDescription={(value) => (value === 'T1c' ? 'Small invasive tumor' : 'Larger invasive tumor')}
        onClose={onClose}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText('Tumor')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /T1c Selected Small invasive tumor/, selected: true })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /T2 Larger invasive tumor/ }));
    await user.press(screen.getByRole('button', { name: 'Close' }));

    expect(onSelect).toHaveBeenCalledWith('T2');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
