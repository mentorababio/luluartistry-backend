const BaseService = require('./BaseService');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

class ProductService extends BaseService {
  constructor() {
    super(Product);
  }

  async getProducts(filters = {}, options = {}) {
    try {
      // Add isActive filter for public access
      if (!options.includeInactive) {
        filters.isActive = true;
      }

      const query = this.model.find(filters).populate('category', 'name slug');
      
      // Handle search
      if (filters.search) {
        query.find({ $text: { $search: filters.search } });
        delete filters.search;
      }

      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      return await this.create(productData);
    } catch (error) {
      throw error;
    }
  }

  async getProductBySlug(slug) {
    try {
      const product = await this.model
        .findOne({ slug, isActive: true })
        .populate('category', 'name slug')
        .populate('reviews');
      
      if (!product) {
        throw new ErrorResponse('Product not found', 404);
      }
      
      return product;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();