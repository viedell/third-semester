const ageList = [12, 18, 25, 30, 15];

const adultsOnly = ageList.filter(age => age >= 18);

console.log(`Original ages: [${ageList.join(', ')}]`);
console.log(`Ages 18 and over (Adults Only): [${adultsOnly.join(', ')}]`);
console.log("-".repeat(30));