const studentScore = 75; 
let finalGrade;

if (studentScore >= 90 && studentScore <= 100) {
    finalGrade = "A";
} else if (studentScore >= 80) {
    finalGrade = "B";
} else if (studentScore >= 70) {
    finalGrade = "C";
} else if (studentScore >= 0) {
    finalGrade = "Fail";
} else {
    finalGrade = "Invalid Score";
}

console.log(`A score of ${studentScore} corresponds to a grade of: ${finalGrade}`);
console.log("-".repeat(30));