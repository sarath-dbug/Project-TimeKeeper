

function brandErrorValidation() {
    // Input fields
    const brandName = document.getElementById('brandName');

    // Error fields
    const brandNameError = document.getElementById('brandNameError');

    // Regex
    const nameRegex = /^[A-Z]/;

    let isValid = true; // A flag to track overall validation

    // Function to clear error message with a delay
    function clearErrorWithDelay(errorField) {
        setTimeout(() => {
            errorField.innerHTML = '';
        }, 5000); // 5000 milliseconds = 5 seconds
    }

    // Function to validate brand name and submit to the database
    function validateAndSubmit() {
        if (brandName.value.trim() === '') {
            brandNameError.innerHTML = 'brand name cannot be empty';
            clearErrorWithDelay(brandNameError);
            isValid = false;
        } else if (!nameRegex.test(brandName.value)) {
            brandNameError.innerHTML = 'First letter should be capital';
            clearErrorWithDelay(brandNameError);
            isValid = false;
        } else {
            brandNameError.innerHTML = ''; // Clear error message

        }
    }

    // Validate brand name and submit if valid
    validateAndSubmit();

    return isValid;
}


