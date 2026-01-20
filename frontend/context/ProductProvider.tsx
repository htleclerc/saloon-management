"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

interface ProductContextType {
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (id: number, product: Partial<Product>) => void;
    deleteProduct: (id: number) => void;
    getProduct: (id: number) => Product | undefined;
    decrementStock: (id: number, quantity: number) => void;
    incrementStock: (id: number, quantity: number) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Mock initial data
const INITIAL_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Hair Oil Premium",
        price: 25,
        stock: 50,
        description: "Organic hair growth oil with essential oils.",
        category: "Care"
    },
    {
        id: 2,
        name: "Shampoo Revitalizing",
        price: 18,
        stock: 30,
        description: "Professional grade revitalizing shampoo.",
        category: "Cleaning"
    },
    {
        id: 3,
        name: "Conditioner Silk",
        price: 22,
        stock: 25,
        description: "Silk protein conditioner for soft hair.",
        category: "Care"
    },
    {
        id: 4,
        name: "Hair Extensions Silk",
        price: 150,
        stock: 10,
        description: "High quality silk hair extensions.",
        category: "Extensions"
    }
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

    const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: Date.now(),
        };
        setProducts(prev => [...prev, newProduct]);
    }, []);

    const updateProduct = useCallback((id: number, updates: Partial<Product>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const deleteProduct = useCallback((id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    }, []);

    const getProduct = useCallback((id: number) => {
        return products.find(p => p.id === id);
    }, [products]);

    const decrementStock = useCallback((id: number, quantity: number) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, stock: Math.max(0, (p.stock || 0) - quantity) } : p
        ));
    }, []);

    const incrementStock = useCallback((id: number, quantity: number) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, stock: (p.stock || 0) + quantity } : p
        ));
    }, []);

    return (
        <ProductContext.Provider value={{
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            getProduct,
            decrementStock,
            incrementStock
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
