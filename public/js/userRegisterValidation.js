function userRegisterValidation() {
   // Input fields
   const firstName = document.getElementById('firstName');
   const lastName = document.getElementById('lastName');
   const email = document.getElementById('email');
   const password = document.getElementById('password');
   const mobile = document.getElementById('mobile');
   const confirmPassword = document.getElementById('confirmPassword');
   const otp = document.getElementById('otp');

   // Error fields
   const firstNameError = document.getElementById('firstNameError');
   const lastNameError = document.getElementById('lastNameError');
   const emailError = document.getElementById('emailError');
   const passwordError = document.getElementById('passwordError');
   const mobileError = document.getElementById('mobileError');
   const confirmPasswordError = document.getElementById('confirmPasswordError');
   const otpError = document.getElementById('otpError');

   // Regex
   const nameRegex = /^[A-Z]/;
   // const emailRegex = /^[a-z0-9._%+-]+@gmail+\.[a-z]{3}$/;
   const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
   const mobileRegex = /^[0-9]{10}$/;

   let isValid = true; // A flag to track overall validation

   // Function to clear error message with a delay
   function clearErrorWithDelay(errorField) {
      setTimeout(() => {
         errorField.innerHTML = '';
      }, 5000); // 5000 milliseconds = 5 seconds
   }

   // Function to validate first name
   function validateFirstName() {
      if (firstName.value.trim() === '') {
         firstNameError.innerHTML = 'First name cannot be empty';
         clearErrorWithDelay(firstNameError);
         isValid = false;
      } else if (!nameRegex.test(firstName.value)) {
         firstNameError.innerHTML = 'First letter should be capital';
         clearErrorWithDelay(firstNameError);
         isValid = false;
      } else {
         firstNameError.innerHTML = ''; // Clear error message
      }
   }

   // Function to validate last name
   function validateLastName() {
      if (lastName.value.trim() === '') {
         lastNameError.innerHTML = 'Last name cannot be empty';
         clearErrorWithDelay(lastNameError);
         isValid = false;
      } else if (!nameRegex.test(lastName.value)) {
         lastNameError.innerHTML = 'First letter should be capital';
         clearErrorWithDelay(lastNameError);
         isValid = false;
      } else {
         lastNameError.innerHTML = ''; // Clear error message
      }
   }

   // Function to validate mobile number
   function validateMobile() {
      if (mobile.value.trim() === '') {
         mobileError.innerHTML = 'Mobile Number cannot be empty';
         clearErrorWithDelay(mobileError);
         isValid = false;
      } else if (!mobileRegex.test(mobile.value)) {
         mobileError.innerHTML = 'Please enter a valid number';
         clearErrorWithDelay(mobileError);
         isValid = false;
      } else {
         mobileError.innerHTML = ''; // Clear error message
      }
   }

   // Function to validate email
   function validateEmail() {
      if (email.value.trim() === '') {
         emailError.innerHTML = 'Email cannot be empty';
         clearErrorWithDelay(emailError);
         isValid = false;
      } else if (!emailRegex.test(email.value)) {
         emailError.innerHTML = 'Please enter a valid email';
         clearErrorWithDelay(emailError);
         isValid = false;
      } else {
         emailError.innerHTML = ''; // Clear error message
      }
   }

   // Function to validate password
   function validatePassword() {
      if (password.value.trim() === '') {
         passwordError.innerHTML = 'Password cannot be empty';
         clearErrorWithDelay(passwordError);
         isValid = false;
      } else if (!passwordRegex.test(password.value)) {
         passwordError.innerHTML = 'Enter a strong password (Must contain 8 characters; should include at least one special character, one uppercase letter, and one number)';
         clearErrorWithDelay(passwordError);
         isValid = false;
      } else {
         passwordError.innerHTML = ''; // Clear error message
      }
   }

   // Function to validate confirm password
   function validateConfirmPassword() {
      if (confirmPassword.value.trim() === '') {
         confirmPasswordError.innerHTML = 'Confirm Password cannot be empty';
         clearErrorWithDelay(confirmPasswordError);
         isValid = false;
      } else if (confirmPassword.value !== password.value) {
         confirmPasswordError.innerHTML = 'Passwords do not match';
         clearErrorWithDelay(confirmPasswordError);
         isValid = false;
      } else {
         confirmPasswordError.innerHTML = ''; // Clear error message
      }
   }

   // Function to validate OTP
   function validateOTP() {
      if (otp.value.trim() === '') {
         otpError.innerHTML = 'OTP is empty';
         clearErrorWithDelay(otpError);
         isValid = false;
      } else if (otp.value.trim() !== userController.generatedOTP.trim()) {
         otpError.innerHTML = 'Invalid OTP';
         clearErrorWithDelay(otpError);
         isValid = false;
      } else {
         otpError.innerHTML = ''; // Clear error message
      }
   }

   // Validate fields one by one
   validateFirstName();
   if (isValid) validateLastName();
   if (isValid) validateMobile();
   if (isValid) validateEmail();
   if (isValid) validatePassword();
   if (isValid) validateConfirmPassword();
   if (isValid) validateOTP();

   return isValid;
}
