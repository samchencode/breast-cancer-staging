import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { BiomarkerToggle } from './BiomarkerToggle';
import { InstallButton } from './InstallButton';
import { OncotypeScoreInput } from './OncotypeScoreInput';
import { OptionGroup } from './OptionGroup';
import { SelectorField } from './SelectorField';

describe('frontend components', () => {
  test('OptionGroup renders selectable options and calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    await render(<OptionGroup label="Grade" options={['G1', 'G2', 'G3']} selected="G2" onSelect={onSelect} />);

    expect(screen.getByText('Grade')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'G2', selected: true })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'G3' }));

    expect(onSelect).toHaveBeenCalledWith('G3');
  });

  test('BiomarkerToggle renders compact status labels and calls onSelect', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    await render(<BiomarkerToggle label="ER" value="positive" onSelect={onSelect} />);

    expect(screen.getByText('ER')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '+', selected: true })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '-' }));

    expect(onSelect).toHaveBeenCalledWith('negative');
  });

  test('SelectorField renders the selected value and opens on press', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();

    await render(<SelectorField label="Tumor" value="T1c" description="Invasive tumor" onPress={onPress} />);

    expect(screen.getByText('Tumor')).toBeOnTheScreen();
    expect(screen.getByText('T1c')).toBeOnTheScreen();
    expect(screen.getByText('Invasive tumor')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /T1c Change Invasive tumor/ }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('OncotypeScoreInput renders the score value and forwards edits', async () => {
    const onChange = jest.fn();
    const onClear = jest.fn();

    await render(<OncotypeScoreInput value={10} onChange={onChange} onClear={onClear} />);

    expect(screen.getByLabelText('Oncotype DX recurrence score')).toHaveDisplayValue('10');
    expect(screen.getByText(/Optional 0-100 modifier/)).toBeOnTheScreen();

    fireEvent.changeText(screen.getByLabelText('Oncotype DX recurrence score'), '11');
    await userEvent.setup().press(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith('11');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test('InstallButton exposes install and installed states', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();

    const { rerender } = await render(<InstallButton disabled={false} installed={false} onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'INSTALL' }));
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(<InstallButton disabled installed onPress={onPress} />);

    expect(screen.getByRole('button', { name: 'Installed' })).toBeDisabled();
  });
});
