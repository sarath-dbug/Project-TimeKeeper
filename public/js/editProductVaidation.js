
function editProductValidate() {
    // Fetch values from form fields
    const productName = document.getElementById('product_name').value;
    const description = document.getElementById('description').value;
    const regularPrice = document.getElementById('regular_price').value;
    const salePrice = document.getElementById('sales_price').value;
    const stock = document.getElementById('stock').value;
    const brand = document.getElementById('brand').value;
    const color = document.getElementById('color').value;
    const category = document.getElementById('category').value;

    // Error fields
    const productNameError = document.getElementById('productNameError');
    const descriptionError = document.getElementById('descriptionError');
    const regularPriceError = document.getElementById('regularPriceError');
    const salesPriceError = document.getElementById('salesPriceError');
    const stockError = document.getElementById('stockError');
    const brandError = document.getElementById('brandError');
    const colorError = document.getElementById('colorError');
    const categoryError = document.getElementById('categoryError');

    // Reset error messages
    productNameError.textContent = '';
    descriptionError.textContent = '';
    regularPriceError.textContent = '';
    salesPriceError.textContent = '';
    stockError.textContent = '';
    brandError.textContent = '';
    colorError.textContent = '';
    categoryError.textContent = '';

    let isValid = true;

    // Validation functions
    function isNotEmpty(value) {
        return value.trim() !== '';
    }

    function isPositiveNumber(value) {
        return !isNaN(value) && parseFloat(value) >= 0;
    }

    function startsWithCapital(value) {
        return /^[A-Z].*$/.test(value);
    }

    // Product Name validation
    if (!isNotEmpty(productName)) {
        productNameError.textContent = 'Product name is required';
        isValid = false;
    }

    if (!startsWithCapital(productName)) {
        productNameError.textContent = 'Product name should start with a capital letter';
        isValid = false;
    }

    // Description validation
    if (!isNotEmpty(description)) {
        descriptionError.textContent = 'Description is required';
        isValid = false;
    }

    // Regular Price validation
    if (!isNotEmpty(regularPrice)) {
        regularPriceError.textContent = 'Regular price is required';
        isValid = false;
    }

    if (!isPositiveNumber(regularPrice)) {
        regularPriceError.textContent = 'Regular price should be a positive number';
        isValid = false;
    }

    // Sale Price validation
    if (!isNotEmpty(salePrice)) {
        salesPriceError.textContent = 'Sale price is required';
        isValid = false;
    }

    if (!isPositiveNumber(salePrice)) {
        salesPriceError.textContent = 'Sale price should be a positive number';
        isValid = false;
    }

    // Stock validation
    if (!isNotEmpty(stock)) {
        stockError.textContent = 'Stock is required';
        isValid = false;
    }

    if (!isPositiveNumber(stock)) {
        stockError.textContent = 'Stock should be a positive number';
        isValid = false;
    }

    // Brand validation
    if (!startsWithCapital(brand)) {
        brandError.textContent = 'Brand should start with a capital letter';
        isValid = false;
    }

    // Color validation
    if (!isNotEmpty(color)) {
        colorError.textContent = 'Color is required';
        isValid = false;
    }

    // Category validation
    if (category === 'Select') {
        categoryError.textContent = 'Category is required';
        isValid = false;
    }

    return isValid;
}

