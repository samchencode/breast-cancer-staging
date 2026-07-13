export type InstallInstructionSegment =
  | { type: 'text'; text: string }
  | { type: 'shareIcon'; accessibilityLabel: string };

export type InstallInstructionStep = {
  number: string;
  segments: InstallInstructionSegment[];
};

export const installInstructionIntro = 'Open this page in Safari first if you are using another browser.';

export const installInstructionSteps: InstallInstructionStep[] = [
  {
    number: '1',
    segments: [
      { type: 'text', text: 'Tap the Share button' },
      { type: 'shareIcon', accessibilityLabel: 'Share icon' },
      { type: 'text', text: 'in Safari.' },
    ],
  },
  {
    number: '2',
    segments: [{ type: 'text', text: 'If you only see the "..." menu, tap "..." first, then choose Share.' }],
  },
  {
    number: '3',
    segments: [{ type: 'text', text: 'Scroll all the way down in the share menu.' }],
  },
  {
    number: '4',
    segments: [{ type: 'text', text: 'Tap Add to Home Screen.' }],
  },
  {
    number: '5',
    segments: [{ type: 'text', text: 'Tap Add in the top right.' }],
  },
];
