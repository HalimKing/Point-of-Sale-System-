import React from 'react';

interface ReceiptItem {
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  name: string;
}

interface ReceiptProps {
  transaction: {
    items: ReceiptItem[];
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
  };
}

export const Receipt: React.FC<ReceiptProps> = ({ transaction }) => {
  const currentDate = new Date().toLocaleString();
  
  const companyInfo = {
    name: "YOUR STORE NAME",
    address: "123 Main Street, Accra",
    phone: "+233 XX XXX XXXX",
  };

  return (
    <div className="bg-white p-6 max-w-xs mx-auto font-mono text-xs">
      {/* Company Header */}
      <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-3">
        <h2 className="font-bold text-sm uppercase">{companyInfo.name}</h2>
        <p className="text-xs">{companyInfo.address}</p>
        <p className="text-xs">Tel: {companyInfo.phone}</p>
      </div>

      {/* Transaction Info */}
      <div className="mb-3 border-b border-dashed border-gray-400 pb-3">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{transaction.date || currentDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{transaction.transaction_id || `TXN-${Date.now()}`}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span>{transaction.customer_name}</span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-3 border-b border-dashed border-gray-400 pb-3">
        <div className="grid grid-cols-12 gap-1 mb-1 font-semibold">
          <div className="col-span-6">ITEM</div>
          <div className="col-span-2 text-center">QTY</div>
          <div className="col-span-2 text-right">PRICE</div>
          <div className="col-span-2 text-right">TOTAL</div>
        </div>
        
        {transaction.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-1 py-1">
            <div className="col-span-6 truncate">{item.name}</div>
            <div className="col-span-2 text-center">{item.quantity}</div>
            <div className="col-span-2 text-right">GHS{item.price.toFixed(2)}</div>
            <div className="col-span-2 text-right">GHS{item.subtotal.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mb-3 border-b border-dashed border-gray-400 pb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>GHS{transaction.subtotal.toFixed(2)}</span>
        </div>
        
        {transaction.discount_percentage && transaction.discount_percentage > 0 && (
          <div className="flex justify-between">
            <span>Discount ({transaction.discount_percentage}%):</span>
            <span>-GHS{transaction.discount_amount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold mt-1">
          <span>TOTAL:</span>
          <span>GHS{transaction.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-3 border-b border-dashed border-gray-400 pb-3">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="uppercase">{transaction.payment_method}</span>
        </div>
        
        {transaction.payment_method === 'cash' && (
          <>
            <div className="flex justify-between">
              <span>Amount Received:</span>
              <span>GHS{transaction.amount_received.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>GHS{transaction.change_amount.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-xs font-semibold">THANK YOU FOR YOUR BUSINESS!</p>
        <p className="text-xs mt-1">Returns accepted within 7 days with receipt</p>
      </div>
    </div>
  );
};