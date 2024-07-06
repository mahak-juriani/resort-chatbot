const express = require("express");
const { 
    createProduct, 
    getAllProducts, 
    getProductById, 
    updateProductById,
    deleteProductById
} = require("../controllers/products");

const router = express.Router();

router.route("/products")
    // Get all products
    .get(getAllProducts)
    // Create a new product
    .post(createProduct);
router.route("/products/:id")
//     // Get a product by ID
    .get(getProductById)
//     // Update a product by ID
    .put(updateProductById)
//     // Delete a product by ID
    .delete(deleteProductById)
// Export the router
module.exports = router;