
function addProductValidate() {
    const productName = document.getElementById('product_name').value;
    const description = document.getElementById('description').value;
    const regularPrice = document.getElementById('regular_price').value;
    const salePrice = document.getElementById('sales_price').value;
    const stock = document.getElementById('stock').value;

    // Error fields
    document.getElementById('productNameError').textContent = '';
    document.getElementById('descriptionError').textContent = '';
    document.getElementById('regularPriceError').textContent = '';
    document.getElementById('salesPriceError').textContent = '';
    document.getElementById('stockError').textContent = '';
    document.getElementById('brandError').textContent = '';
    document.getElementById('colorError').textContent = '';
    document.getElementById('categoryError').textContent = '';

    let isValid = true;

    // Name Regex validation
    if (!validateName(productName)) {
        document.getElementById('productNameError').textContent = 'First letter should be capital';
        isValid = false;
    }
  
 
    // Field checking
    if (productName.trim() === '') {
        document.getElementById('productNameError').textContent = 'First name cannot be empty';
        isValid = false;
    }

    // Description field
    if (description.trim() === '') {
        document.getElementById('descriptionError').textContent = 'Description is required';
        isValid = false;
    }

    // // Stock validation
    // if (!validatePrice(stock)) {
    //     document.getElementById('stockError').textContent = 'Stock should be a positive number';
    //     isValid = false;
    // }

    // Stock field empty
    if (stock.trim() === '') {
        document.getElementById('stockError').textContent = 'Stock is required';
        isValid = false;
    }

    // Regular price validation
    // if (!validatePrice(regularPrice)) {
    //     document.getElementById('regularPriceError').textContent = 'Price should be a positive number';
    //     isValid = false;
    // }

    // Regular price field validate
    if (regularPrice.trim() === '') {
        document.getElementById('regularPriceError').textContent = 'Regular Price is required';
        isValid = false;
    }

    // // Sale price validation
    // if (!validatePrice(salePrice)) {
    //     document.getElementById('salesPriceError').textContent = 'Price should be a positive number';
    //     isValid = false;
    // }

    // Sale price validation
    if (salePrice.trim() === '') {
        document.getElementById('salesPriceError').textContent = 'Sale Price is required';
        isValid = false;
    }

    // Brand validation
    const brand = document.getElementById('brand').value;
    if (!validateBrand(brand)) {
        document.getElementById('brandError').textContent = 'Brand should start with a capital letter';
        isValid = false;
    }

    // Color validation
    const color = document.getElementById('color').value;
    if (!validateColor(color)) {
        document.getElementById('colorError').textContent = 'Color is not valid';
        isValid = false;
    }

    // Category validation
    const category = document.getElementById('category').value;
    if (category === 'Select') {
        document.getElementById('categoryError').textContent = 'Category is required';
        isValid = false;
    }

    return isValid;
}

function validateName(name) {
    const namePattern = /^[A-Z][a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/|\-=\s]*$/;
    return namePattern.test(name);
}

function validatePrice(price) {
    const pricePattern = /^[0-9]*\.?[0-9]+$/;
    return pricePattern.test(price);
}

function validateBrand(brand) {
    const brandPattern = /^[A-Z][a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/|\-=\s]*$/;
    return brandPattern.test(brand);
}

function validateColor(color) {
    // You can add your color validation logic here
    return true;
}

