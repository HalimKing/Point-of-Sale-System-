// components/products/ProductsList.tsx
import React, { useState } from 'react';
import { Plus, Package, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, Batch, ProductWithBatches } from '@/types';
import { ProductDialog } from './ProductDialog';
import { BatchDialog } from '@/components/batches/BatchDialog';

interface ProductsListProps {
  products: ProductWithBatches[];
  onProductCreate: (product: Omit<Product, 'id'>) => void;
  onProductUpdate: (id: string, product: Omit<Product, 'id'>) => void;
  onBatchCreate: (batch: Omit<Batch, 'id'>) => void;
  onBatchUpdate: (id: string, batch: Omit<Batch, 'id'>) => void;
}

export function ProductsList({ 
  products, 
  onProductCreate, 
  onProductUpdate,
  onBatchCreate,
  onBatchUpdate 
}: ProductsListProps) {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleAddBatch = (product: Product) => {
    setSelectedProduct(product);
    setSelectedBatch(null);
    setIsBatchDialogOpen(true);
  };

  const handleEditBatch = (batch: Batch, product: Product) => {
    setSelectedProduct(product);
    setSelectedBatch(batch);
    setIsBatchDialogOpen(true);
  };

  const handleProductSave = (productData: Omit<Product, 'id'>) => {
    if (selectedProduct) {
      onProductUpdate(selectedProduct.id, productData);
    } else {
      onProductCreate(productData);
    }
  };

  const handleBatchSave = (batchData: Omit<Batch, 'id'>) => {
    if (selectedBatch) {
      onBatchUpdate(selectedBatch.id, batchData);
    } else {
      onBatchCreate(batchData);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays < 30) return 'expiring-soon';
    return 'good';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
        <Button onClick={() => {
          setSelectedProduct(null);
          setIsProductDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border shadow-sm">
            {/* Product Header */}
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {product.sku} | Category: {product.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold">${product.price}</div>
                  <div className="text-sm text-gray-600">
                    Stock: <span className="font-medium">{product.totalStock}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddBatch(product)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Batch
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setExpandedProduct(
                      expandedProduct === product.id ? null : product.id
                    )}
                  >
                    {expandedProduct === product.id ? 'Hide' : 'Show'} Batches
                  </Button>
                </div>
              </div>
            </div>

            {/* Batches List */}
            {expandedProduct === product.id && (
              <div className="border-t bg-gray-50">
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Product Batches</h4>
                  <div className="space-y-2">
                    {product.batches.map((batch) => {
                      const expiryStatus = getExpiryStatus(batch.expiry_date);
                      const statusColors = {
                        expired: 'bg-red-100 text-red-800',
                        'expiring-soon': 'bg-yellow-100 text-yellow-800',
                        good: 'bg-green-100 text-green-800'
                      };

                      return (
                        <div key={batch.id} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{batch.batch_number}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[expiryStatus]}`}>
                                Expires: {new Date(batch.expiry_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Qty: <span className="font-medium">{batch.quantity}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Cost: <span className="font-medium">${batch.purchase_price}</span>
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditBatch(batch, product)}
                          >
                            Edit
                          </Button>
                        </div>
                      );
                    })}
                    
                    {product.batches.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No batches added yet. Click "Add Batch" to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <ProductDialog
        isOpen={isProductDialogOpen}
        onClose={() => {
          setIsProductDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleProductSave}
        product={selectedProduct}
      />

      <BatchDialog
        isOpen={isBatchDialogOpen}
        onClose={() => {
          setIsBatchDialogOpen(false);
          setSelectedProduct(null);
          setSelectedBatch(null);
        }}
        onSave={handleBatchSave}
        batch={selectedBatch}
        product={selectedProduct}
      />
    </div>
  );
}