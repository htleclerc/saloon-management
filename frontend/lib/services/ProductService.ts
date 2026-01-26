/**
 * Product Service
 * 
 * Business logic for inventory products
 */

import { BaseService } from './BaseService';
import type { Product } from '@/types';

export class ProductService extends BaseService {
    /**
     * Get all products for a salon
     */
    async getAll(salonId: number): Promise<Product[]> {
        return this.provider.getProducts(salonId);
    }

    /**
     * Get product by ID
     */
    async getById(id: number): Promise<Product | null> {
        return this.provider.getProduct(id);
    }

    /**
     * Create a new product
     */
    async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Product> {
        return this.provider.createProduct(data);
    }

    /**
     * Update an existing product
     */
    async update(id: number, data: Partial<Product>): Promise<Product> {
        return this.provider.updateProduct(id, data);
    }

    /**
     * Delete a product
     */
    async delete(id: number): Promise<void> {
        return this.provider.deleteProduct(id);
    }

    /**
     * Update product stock
     */
    async updateStock(id: number, quantity: number): Promise<Product> {
        return this.provider.updateProductStock(id, quantity);
    }
}

export const productService = new ProductService();
