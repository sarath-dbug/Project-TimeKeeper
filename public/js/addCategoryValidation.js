

function categoryErrorValidation() {
    // Input fields
    const categoryName = document.getElementById('categoryName');

    // Error fields
    const categoryNameError = document.getElementById('categoryNameError');

    // Regex
    const nameRegex = /^[A-Z]/;

    let isValid = true; // A flag to track overall validation

    // Function to clear error message with a delay
    function clearErrorWithDelay(errorField) {
        setTimeout(() => {
            errorField.innerHTML = '';
        }, 5000); // 5000 milliseconds = 5 seconds
    }

    // Function to validate category name and submit to the database
    function validateAndSubmit() {
        if (categoryName.value.trim() === '') {
            categoryNameError.innerHTML = 'Category name cannot be empty';
            clearErrorWithDelay(categoryNameError);
            isValid = false;
        } else if (!nameRegex.test(categoryName.value)) {
            categoryNameError.innerHTML = 'First letter should be capital';
            clearErrorWithDelay(categoryNameError);
            isValid = false;
        } else {
            categoryNameError.innerHTML = ''; // Clear error message

        }
    }

    // Validate category name and submit if valid
    validateAndSubmit();

    return isValid;
}


