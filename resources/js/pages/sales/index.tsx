import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  DollarSign,
  X,
  Check,
  Printer,
  Percent
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import axios from 'axios';
import { error } from 'console';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  image?: string;
}

interface CompanySettings {
  logo?: string;
  company_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  return_policy?: string;
  thank_you_message?: string;
}

interface SalesProps {
  productsData: Product[];
  companySettings: CompanySettings;
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
    name: string;
  }>;
  customer_name: string;
  subtotal: number;
  discount_percentage?: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card';
  amount_received: number;
  change_amount: number;
  transaction_id?: string;
  date?: string;
}

// Helper functions for localStorage
const CART_STORAGE_KEY = 'pos_cart_data';
const CUSTOMER_STORAGE_KEY = 'pos_customer_name';
const DISCOUNT_STORAGE_KEY = 'pos_discount';

const loadCartFromStorage = (availableProducts: Product[]): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];
    
    const parsedCart = JSON.parse(storedCart);
    
    // Validate and filter cart items against available products
    const validCart = parsedCart.filter((cartItem: CartItem) => {
      const productExists = availableProducts.find(p => p.id === cartItem.id);
      return productExists && cartItem.quantity > 0;
    });
    
    console.log('Loaded cart from storage:', validCart);
    return validCart;
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    console.log('Saved cart to storage:', cart);
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const loadCustomerNameFromStorage = (): string => {
  try {
    return localStorage.getItem(CUSTOMER_STORAGE_KEY) || '';
  } catch (error) {
    console.error('Error loading customer name from storage:', error);
    return '';
  }
};

const saveCustomerNameToStorage = (name: string) => {
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, name);
  } catch (error) {
    console.error('Error saving customer name to storage:', error);
  }
};

const loadDiscountFromStorage = (): number => {
  try {
    const discount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    return discount ? parseFloat(discount) : 0;
  } catch (error) {
    console.error('Error loading discount from storage:', error);
    return 0;
  }
};

const saveDiscountToStorage = (discount: number) => {
  try {
    localStorage.setItem(DISCOUNT_STORAGE_KEY, discount.toString());
  } catch (error) {
    console.error('Error saving discount to storage:', error);
  }
};

const POSCashierInterface: React.FC<SalesProps> = ({ productsData, companySettings }) => {
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
  const [lastTransaction, setLastTransaction] = useState<TransactionData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(productsData)

  // Load data from localStorage after productsData is available
  useEffect(() => {
    if (allProducts && productsData.length > 0 && !isCartLoaded) {
      // console.log('Products data loaded, now loading cart...', allProducts);
      const savedCart = loadCartFromStorage(allProducts);
      const savedCustomerName = loadCustomerNameFromStorage();
      const savedDiscount = loadDiscountFromStorage();
      
      setCart(savedCart);
      setCustomerName(savedCustomerName);
      setDiscount(savedDiscount);
      setIsCartLoaded(true);
      
      console.log('Cart loaded from storage:', savedCart);
    }
  }, [allProducts, isCartLoaded]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (isCartLoaded && cart.length > 0) {
      saveCartToStorage(cart);
    }
  }, [cart, isCartLoaded]);

  // Save customer name to localStorage whenever it changes
  useEffect(() => {
    if (isCartLoaded) {
      saveCustomerNameToStorage(customerName);
    }
  }, [customerName, isCartLoaded]);

  // Save discount to localStorage whenever it changes
  useEffect(() => {
    if (isCartLoaded) {
      saveDiscountToStorage(discount);
    }
  }, [discount, isCartLoaded]);

  var filteredProducts = allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

 

  useEffect(() => {
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
        const updatedCart = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCart(updatedCart);
      }
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = allProducts.find(p => p.id === productId);
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (product && newQuantity <= product.stock) {
      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (price * item.quantity);
    }, 0);
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
    // Also clear from localStorage
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    // console.log('Cart cleared from storage');
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const saveTransaction = async (): Promise<{ success: boolean; transaction?: TransactionData }> => {
    try {
      const transactionData: TransactionData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          subtotal: (typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity,
          name: item.name
        })),
        customer_name: customerName || 'Walk-in Customer',
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        discount_percentage: discount,
        total_amount: calculateTotal(),
        payment_method: paymentMethod!,
        amount_received: parseFloat(amountReceived) || calculateTotal(),
        change_amount: paymentMethod === 'cash' ? calculateChange() : 0,
        transaction_id: `TXN-${Date.now()}`
      };

      const response = await axios.post('/sales/save/transaction', transactionData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.status === 200) {
        // console.log('Transaction saved successfully:', response.data);
        
        const savedTransaction = {
          ...transactionData,
          transaction_id: response.data.transaction_id || transactionData.transaction_id,
          date: new Date().toLocaleString()
        };
        
        return { success: true, transaction: savedTransaction };
      } else {
        console.error('Failed to save transaction:', response.data);
        return { success: false };
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      return { success: false };
    }
  };

  // fetch products
  const fetchProducts = async () => {
    try{
      const response = await axios.get('/sales/products/fetch-all-products');
      console.log('raw response', response.data);
      setAllProducts(response.data);
      
    } catch (error) {
      console.error('Fetching Error', error);
      
    }
    
  }

  const printReceipt = (transaction: TransactionData) => {
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      
      const formatPrice = (price: any): string => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '0.00' : num.toFixed(2);
      };

      const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${transaction.transaction_id}</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0;
                padding: 20px 0;
                display: flex;
                justify-content: center;
                min-height: auto;
              }
              .receipt-container {
                margin: 0 auto;
                transform: translateY(0);
              }
            }
            
            @media screen {
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
            }
            
            .receipt-container {
              font-family: 'Courier New', monospace, Arial, sans-serif;
              font-size: 12px;
              max-width: 280px;
              width: 100%;
              background: white;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              margin: 0 auto;
            }
            
            .store-info {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
            }
            
            .receipt-title {
              text-align: center;
              margin: 10px 0;
              font-weight: bold;
              font-size: 14px;
            }
            
            .line {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              padding: 1px 0;
            }
            
            .items-header {
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin: 10px 0 5px 0;
            }
            
            .total-line {
              font-weight: bold;
              border-top: 2px dashed #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            
            .thank-you {
              text-align: center;
              font-weight: bold;
              margin: 15px 0;
              padding: 10px 0;
            }
            
            .button-container {
              text-align: center;
              margin-top: 20px;
            }
            
            button {
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 12px;
              margin: 0 5px;
            }
            
            .print-btn {
              background: #007bff;
              color: white;
            }
            
            .close-btn {
              background: #6c757d;
              color: white;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <!-- Store Header -->
            <div class="store-info">
              <h2 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">${companySettings.company_name}</h2>
              <p style="margin: 2px 0;">${companySettings.address}</p>
              <p style="margin: 2px 0;">Tel: ${companySettings.phone}</p>
              <p style="margin: 2px 0;">Email: ${companySettings.email}</p>
            </div>

            <!-- Receipt Title -->
            <div class="receipt-title">
              SALES RECEIPT
            </div>

            <!-- Transaction Info -->
            <div class="line">
              <span>Date:</span>
              <span>${transaction.date || new Date().toLocaleString()}</span>
            </div>
            <div class="line">
              <span>Receipt #:</span>
              <span>${transaction.transaction_id}</span>
            </div>
            <div class="line">
              <span>Customer:</span>
              <span>${transaction.customer_name}</span>
            </div>
            
            <!-- Items Header -->
            <div class="items-header">
              <div class="line">
                <span>ITEM</span>
                <span>QTY x PRICE</span>
                <span>TOTAL</span>
              </div>
            </div>
            
            <!-- Items List -->
            ${transaction.items.map(item => `
              <div class="line">
                <span style="flex: 2; text-align: left;">${item.name}</span>
                <span style="flex: 1; text-align: center;">${item.quantity} x GHS${formatPrice(item.price)}</span>
                <span style="flex: 1; text-align: right;">GHS${formatPrice(item.subtotal)}</span>
              </div>
            `).join('')}
            
            <!-- Totals Section -->
            <div class="line">
              <span>Subtotal:</span>
              <span>GHS${formatPrice(transaction.subtotal)}</span>
            </div>
            
            ${transaction.discount_percentage && transaction.discount_percentage > 0 ? `
              <div class="line">
                <span>Discount (${transaction.discount_percentage}%):</span>
                <span>-GHS${formatPrice(transaction.discount_amount)}</span>
              </div>
            ` : ''}
            
            <div class="line total-line">
              <span>TOTAL:</span>
              <span>GHS${formatPrice(transaction.total_amount)}</span>
            </div>
            
            <!-- Payment Info -->
            <div class="line">
              <span>Payment Method:</span>
              <span>${transaction.payment_method.toUpperCase()}</span>
            </div>
            
            ${transaction.payment_method === 'cash' ? `
              <div class="line">
                <span>Amount Received:</span>
                <span>GHS${formatPrice(transaction.amount_received)}</span>
              </div>
              <div class="line">
                <span>Change:</span>
                <span>GHS${formatPrice(transaction.change_amount)}</span>
              </div>
            ` : ''}

            <!-- Thank You Message -->
            <div class="thank-you">
              THANK YOU FOR YOUR BUSINESS!
            </div>

            <!-- Footer -->
            <div class="footer">
            
             ${companySettings.return_policy?.length !== 0 ? `<p style="margin: 5px 0;">Return Policy: ${companySettings.return_policy}</p>` : ''}
              ${companySettings.thank_you_message?.length !== 0 ? `<p style="margin: 5px 0;">${companySettings.thank_you_message}</p>` : ''}
            </div>

            <!-- Print Buttons (Hidden when printing) -->
            <div class="button-container">
              <button class="print-btn" onclick="window.print()">Print Receipt</button>
              <button class="close-btn" onclick="window.close()">Close</button>
            </div>
          </div>
          
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `;
    
      receiptWindow.document.write(receiptContent);
      receiptWindow.document.close();
    }
  };

  const completeTransaction = async () => {
    if (cart.length === 0 || !paymentMethod) return;
    
    setIsProcessing(true);

    try {
      const result = await saveTransaction();
      
      if (result.success && result.transaction) {
        setLastTransaction(result.transaction);
        
        alert(`Transaction completed successfully!\nTotal: GHS${calculateTotal().toFixed(2)}`);
        
        const shouldPrint = window.confirm('Would you like to print the receipt?');
        
        if (shouldPrint) {
          setTimeout(() => {
            printReceipt(result.transaction!);
          }, 100);
        }
        fetchProducts();
        resetAfterTransaction();
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

  const resetAfterTransaction = () => {
    setShowPaymentModal(false);
    setPaymentMethod(null);
    setAmountReceived('');
    clearCart(); // This will clear both state and localStorage
    setLastTransaction(null);
    setShowReceiptModal(false);
  };

  const handleDiscountChange = (value: string) => {
    const newDiscount = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setDiscount(newDiscount);
  };

  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name);
  };

  // Add debug info to check what's happening
  // useEffect(() => {
  //   console.log('Current cart state:', cart);
  //   console.log('Is cart loaded?', isCartLoaded);
  //   console.log('Products data available?', allProducts && allProducts.length > 0);
  // }, [cart, isCartLoaded, allProducts]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
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
                <div>
                  
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
                </div>
              ))}
            </div>
            <div>
              <p className='text-center text-neutral-600'>{filteredProducts.length == 0 && 'There is no products for this category!'}</p>
            
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
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart className="w-16 h-16 mb-4" />
                <p className="text-sm">No items in cart</p>
                {!isCartLoaded && (
                  <p className="text-xs text-gray-500 mt-2">Loading cart...</p>
                )}
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
                  onChange={(e) => handleDiscountChange(e.target.value)}
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

      {/* Rest of your modal components remain the same */}
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

      {/* Receipt Modal */}
      {showReceiptModal && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Receipt Preview</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="text-center text-gray-500">
                Receipt preview available in print view
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => printReceipt(lastTransaction)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600"
              >
                Close
              </button>
            </div>
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

export default function Sales({productsData, companySettings}: SalesProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="POS System" />
      <POSCashierInterface productsData={productsData} companySettings={companySettings} />
    </AppLayout>
  );
}