const Product = require('../db/models/products');

// for creating a new product
// Controller for creating a new product
exports.createProduct = async (req, res) => {
  try {

    const { name, price, description } = req.body;
    if(!name){
      res.status(400).send('Name must have a value')
    }
    const product = await Product.create({ name, price, description });
    res.json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};