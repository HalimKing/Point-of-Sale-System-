// components/batches/BatchDialog.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product, Batch } from '@/types';

interface BatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (batch: Omit<Batch, 'id'>) => void;
  batch?: Batch | null;
  product: Product | null;
}

export function BatchDialog({ isOpen, onClose, onSave, batch, product }: BatchDialogProps) {
  const [formData, setFormData] = useState({
    batch_number: '',
    expiry_date: '',
    quantity: 0,
    purchase_price: 0,
    manufacturer: '',
    date_received: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        batch_number: batch.batch_number,
        expiry_date: batch.expiry_date,
        quantity: batch.quantity,
        purchase_price: batch.purchase_price,
        manufacturer: batch.manufacturer,
        date_received: batch.date_received
      });
    } else {
      setFormData({
        batch_number: '',
        expiry_date: '',
        quantity: 0,
        purchase_price: 0,
        manufacturer: '',
        date_received: new Date().toISOString().split('T')[0]
      });
    }
  }, [batch, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    const batchData: Omit<Batch, 'id'> = {
      ...formData,
      product_id: product.id,
      quantity: Number(formData.quantity),
      purchase_price: Number(formData.purchase_price)
    };

    onSave(batchData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {batch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            {product && (
              <p className="text-sm text-gray-600">For: {product.name}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number *</Label>
            <Input
              id="batch_number"
              value={formData.batch_number}
              onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              placeholder="e.g., BATCH-A123"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_received">Date Received *</Label>
              <Input
                id="date_received"
                type="date"
                value={formData.date_received}
                onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="Manufacturer name"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {batch ? 'Update' : 'Create'} Batch
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}