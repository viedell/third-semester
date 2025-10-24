// Ensure the code runs only after the entire HTML document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get references to the HTML elements using their IDs
    const clickButton = document.getElementById('myClickButton');
    const messageDisplay = document.getElementById('messageDisplay');

    // 2. Add an event listener to the button
    clickButton.addEventListener('click', (event) => {
        // This function executes when the button is clicked

        // 3. Update the text of the message display element
        messageDisplay.textContent = 'Button clicked successfully! Time: ' + new Date().toLocaleTimeString();

        // Optional: Log the action to the browser console
        console.log('Click event fired.');
    });
});