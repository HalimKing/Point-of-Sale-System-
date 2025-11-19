import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  DollarSign,
  User,
  Percent,
  X,
  Check,
  Printer
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface TransactionData {
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  customer_name: string;
  subtotal: number;
  discount_percentage?: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card';
  amount_received: number;
  change_amount: number;
}

const POSCashierInterface: React.FC<{ productsData: Product[] }> = ({ productsData }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [discount, setDiscount] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [amountReceived, setAmountReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);


  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    // Fetch all categories from the API
    axios.get('/categories/data/fetch/all-categories')
      .then(response => {
        const categories: string[] = ['All'];
        response.data.forEach((category: any) => {
          categories.push(category.label);
        });
        setAllCategories(categories);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = productsData.find(p => p.id === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (product && newQuantity <= product.stock) {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return (calculateSubtotal() * discount) / 100;
  };


  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    return received - calculateTotal();
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setSearchQuery('');
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const saveTransaction = async (): Promise<boolean> => {
    try {
      const transactionData: TransactionData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        customer_name: 'Walk-in Customer',
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        discount_percentage: discount,
        total_amount: calculateTotal(),
        payment_method: paymentMethod!,
        amount_received: parseFloat(amountReceived) || calculateTotal(),
        change_amount: paymentMethod === 'cash' ? calculateChange() : 0
      };

      const response = await axios.post('/sales/save/transaction', transactionData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      console.log('Raw response', response);
      

      if (response.status === 200) {
        console.log('Transaction saved successfully:', response.data);
        return true;
      } else {
        console.error('Failed to save transaction:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      return false;
    }
  };

  const completeTransaction = async () => {
    if (cart.length === 0 || !paymentMethod) return;
    
    setIsProcessing(true);

    try {
      // Save transaction to database
      const isSaved = await saveTransaction();
      
      if (isSaved) {
        // Show success message
        alert(`Transaction completed successfully!\nPayment Method: ${paymentMethod}\nTotal: GHS${calculateTotal().toFixed(2)}`);
        
        // Reset everything
        setShowPaymentModal(false);
        setPaymentMethod(null);
        setAmountReceived('');
        clearCart();
      } else {
        alert('Failed to save transaction. Please try again.');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      alert('An error occurred while processing the transaction. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Print receipt function (optional enhancement)
  const printReceipt = async (transactionId?: string) => {
    if (transactionId) {
      // You can implement receipt printing here
      console.log('Printing receipt for transaction:', transactionId);
      // window.print() or call a receipt API
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Search and Categories */}
          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or scan barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow border border-gray-200 text-left cursor-pointer"
                >
                  {product.image ?  (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <img src={`storage/${product.image}`} alt={product.name} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">GHS{product.price}</span>
                    <span className="text-xs text-gray-500">Stock: {product.stock}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Current Order</h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-4" />
                <p className="text-sm">No items in cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        <p className="text-sm text-gray-600">GHS{item.price} each</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        GHS{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">GHS{calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-600" />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>Discount ({discount}%)</span>
                  <span>-GHS{calculateDiscount().toFixed(2)}</span>
                </div>
              )}

              

              <div className="flex items-center justify-between text-lg font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">GHS{calculateTotal().toFixed(2)}</span>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Process Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-blue-600">GHS{calculateTotal().toFixed(2)}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <DollarSign className={`w-8 h-8 mx-auto mb-2 ${
                    paymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <p className="font-semibold text-sm">Cash</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                    paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <p className="font-semibold text-sm">Card</p>
                </button>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount Received
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {parseFloat(amountReceived) >= calculateTotal() && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Change</p>
                    <p className="text-xl font-bold text-green-600">
                      GHS{calculateChange().toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={completeTransaction}
              disabled={!paymentMethod || (paymentMethod === 'cash' && parseFloat(amountReceived) < calculateTotal()) || isProcessing}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Complete Transaction
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

export default function Sales({productsData}: {productsData: Product[]}) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <POSCashierInterface productsData={productsData} />
    </AppLayout>
  );
}