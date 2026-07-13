import { render, screen, userEvent } from '@testing-library/react-native';

import { StagingCalculatorScreen } from './StagingCalculatorScreen';

describe('StagingCalculatorScreen', () => {
  test('renders the default calculator state on native', async () => {
    await render(<StagingCalculatorScreen />);

    expect(screen.getByText('Breast cancer staging')).toBeOnTheScreen();
    expect(screen.getByText('Stage calculator')).toBeOnTheScreen();
    expect(screen.getByText('TNM')).toBeOnTheScreen();
    expect(screen.getByText('cT1c cN0 M0')).toBeOnTheScreen();
    expect(screen.getByText('Anatomic stage')).toBeOnTheScreen();
    expect(screen.getAllByText('IA')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'INSTALL' })).not.toBeOnTheScreen();
  });

  test('opens a selector modal from the tumor field', async () => {
    const user = userEvent.setup();

    await render(<StagingCalculatorScreen />);

    await user.press(screen.getByRole('button', { name: /T1c Change/ }));

    expect(screen.getByRole('button', { name: /T2/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Close' })).toBeOnTheScreen();
  });
});
