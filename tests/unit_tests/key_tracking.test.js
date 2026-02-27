import {
    trackMistypedKey,
    trackCorrectKey,
    removeMistakeIndex,
    getKeyAccuracy,
    resetAccuracy
  } from '../../static/accuracy_calculation.js';
  
  
beforeEach(() => {
  resetAccuracy();
});

test('accuracy returns null when no key is typed yet', () => {
  const accuracy = getKeyAccuracy('a');
  expect(accuracy).toBeNull();
});

test('tracks a mistyped key once per index in sample text', () => {
  trackMistypedKey('a', 0);
  trackMistypedKey('a', 0); 

  const accuracy = getKeyAccuracy('a');

  expect(accuracy).toBe(0); 
});

test('tracks mistakes at different indices in sample text', () => {
  trackMistypedKey('a', 0);
  trackMistypedKey('a', 1);
  trackMistypedKey('a', 4);
  trackMistypedKey('a', 8);   // 4 mistyped keys

  trackCorrectKey('a', 10);   // 1 correct key

  const accuracy = getKeyAccuracy('a');   // 1 / (1 + 4) = 0.20

  expect(accuracy).toBe(20.00); 
});

test('mistyped key occurences are still counted even when removed or corrected with backspace', () => {
  trackMistypedKey('a', 0);
  trackMistypedKey('a', 1);
  trackMistypedKey('a', 4);   // 3 mistyped keys

  removeMistakeIndex(4);
  removeMistakeIndex(1);
  removeMistakeIndex(0);      // simulates backspace, but mistypes are still counted

  trackCorrectKey('a', 1);    // 1 correct key

  const accuracy = getKeyAccuracy('a');   // 1 / (1 + 3) = 0.25

  expect(accuracy).toBeCloseTo(25.00); 
});


// Prevents someone from artificially boosting correct counts with backspace
test('Correct keys are counted only once per position in sample text', () => {

  trackCorrectKey('a', 0);    // correct 'a' press at index 0 of sample text
  trackCorrectKey('a', 0);    // Correct 'a' keys stays at 1

  trackMistypedKey('a', 1);   // 1 mistyped key

  const accuracy = getKeyAccuracy('a');   // 1 / (1 + 1) = 0.5

  expect(accuracy).toBeCloseTo(50.0);
});

// Mistyped keys are counted every time they occur
test('mistyped key can be counted again as a mistype even after backspace', () => {
  trackMistypedKey('a', 0);
  removeMistakeIndex(0);         // simulates a backspace
  trackMistypedKey('a', 0);      // mistyped 'a' counted twice at same position in sample text

  trackCorrectKey('a', 1);
  trackCorrectKey('a', 2);       // 2 correct keys

  const accuracy = getKeyAccuracy('a');   // 2 / (2 + 2) = 0.5

  expect(accuracy).toBeCloseTo(50.00); 
});

test("accuracy calculation for 'a' key with correct and mistyped keys", () => {
  trackCorrectKey('a', 0);    // 1 correct key

  trackMistypedKey('a', 1);
  trackMistypedKey('a', 2);   // 2 mistyped keys

  const accuracy = getKeyAccuracy('a');     // 1 / (1 + 2) = 33.33

  expect(accuracy).toBeCloseTo(33.33, 1);
});

test("accuracy calculation for 'a' key with correct and mistyped keys (2)", () => {
  trackCorrectKey('a', 0);
  trackMistypedKey('a', 1);

  const accuracy = getKeyAccuracy('a');

  expect(accuracy).toBeCloseTo(50.00);

});

test("accuracy for key 'a' is 100 when only correct keys are pressed", () => {
  trackCorrectKey('a', 0);
  trackCorrectKey('a', 1);
  trackCorrectKey('a', 8);

  const accuracy = getKeyAccuracy('a');
  expect(accuracy).toBeCloseTo(100.0);
});

test("accuracy for key 'a' is 0 when only incorrect keys are pressed", () => {
  trackMistypedKey('a', 0);
  trackMistypedKey('a', 1);

  const accuracy = getKeyAccuracy('a');
  expect(accuracy).toBeCloseTo(0.0);
});

test('tracking different keys independently', () => {
  trackMistypedKey('a', 0);
  trackMistypedKey('a', 1);     // 2 mistyped 'a' keys

  trackCorrectKey('a', 2);      // 1 correct 'a' key

  trackMistypedKey('b', 6);     // 1 mistyped 'b' key

  trackCorrectKey('b', 4);      // 1 correct 'b' keys

  expect(getKeyAccuracy('a')).toBeCloseTo(33.33);   // 1 / (1 + 2) = 33.3
  expect(getKeyAccuracy('b')).toBeCloseTo(50.0);    // 1 / (1 + 1) = 50.0
});

