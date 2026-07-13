import assert from 'node:assert/strict';
import test from 'node:test';

import { installInstructionIntro, installInstructionSteps } from './installInstructions';

test('iOS install instructions start with Safari guidance', () => {
  assert.equal(installInstructionIntro, 'Open this page in Safari first if you are using another browser.');
});

test('iOS install instructions include the expected ordered steps', () => {
  assert.deepEqual(
    installInstructionSteps.map((step) => step.number),
    ['1', '2', '3', '4'],
  );

  const text = installInstructionSteps
    .flatMap((step) => step.segments)
    .filter((segment) => segment.type === 'text')
    .map((segment) => segment.text)
    .join(' ');

  assert.match(text, /Tap the Share button/);
  assert.match(text, /If you only see the "..." menu, tap "..." first, then choose Share./);
  assert.match(text, /Scroll all the way down in the share menu./);
  assert.match(text, /Tap Add to Home Screen./);
  assert.match(text, /Tap Add in the top right./);
});

test('iOS install instructions include share fallback guidance in the share step', () => {
  const shareStep = installInstructionSteps[0];
  const shareStepText = shareStep.segments
    .filter((segment) => segment.type === 'text')
    .map((segment) => segment.text)
    .join(' ');

  assert.ok(shareStep.segments.some((segment) => segment.type === 'shareIcon'));
  assert.match(shareStepText, /If you only see the "\.\.\." menu, tap "\.\.\." first, then choose Share./);
});
