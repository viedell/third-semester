const originalWord = "Processor";

const reversedWord = originalWord
    .split('')
    .reverse()
    .join('');

console.log(`Original: "${originalWord}"`);
console.log(`Reversed: "${reversedWord}"`);
console.log("-".repeat(30));