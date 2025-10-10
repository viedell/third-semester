const checkNum = 17; 
let isPrime = true;

if (checkNum <= 1 || isNaN(checkNum)) {
    isPrime = false; 
} else {
    for (let i = 2; i <= Math.floor(Math.sqrt(checkNum)); i++) {
        if (checkNum % i === 0) {
            isPrime = false;
            break;
        }
    }
}

if (isPrime) {
    console.log(`The number ${checkNum} is a Prime Number.`);
} else {
    console.log(`The number ${checkNum} is not a Prime Number.`);
}
console.log("-".repeat(30));