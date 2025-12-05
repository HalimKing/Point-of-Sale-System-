<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SaleItem;
use Carbon\Carbon;

use function Pest\Laravel\session;

class SalesDetailsController extends Controller
{
    //
    public function salesDetails ()
    {
        $query = SaleItem::with(['product', 'category', 'sale', 'sale.user'])->get();

        $sales = $query->map(function ($sale) {
            return [
                'id' => $sale->id,
                'saleDate' => date(Carbon::parse($sale->created_at)->format('Y-m-d')),
                'productName' => $sale->product_name,
                'category' => $sale->category->name,
                'customerName' => $sale->sale->customer_name,
                'quantity' => $sale->quantity,
                'sellingPrice' => $sale->price,
                'totalAmount' => $sale->total_amount,
                'profit' => $sale->profit,
                'paymentMethod' => $sale->sale->payment_method,
                'salesPerson' => $sale->sale->user->name,
                'profitMargin' => round(($sale->profit / $sale->price) * 100, 2),
                'transactionId' => $sale->sale->transaction_id,
            ];
        });

        return response()->json($sales);
    }

    public function transactions ()
    {
        //
        $query = SaleItem::with(['sale'])->get()->groupBy('sale_id');
        // map through the grouped data to get transaction details
        $data = $query->map(function ($items, $saleId) {
            $sale = $items->first()->sale;
            return [
                'saleId' => $sale->id,
                'transactionId' => $sale->transaction_id,
                'customerName' => $sale->customer_name,
                'totalItems' => $items->sum('quantity'),
                'subTotal' => $sale->sub_total,
                'discountAmount' => $sale->discount_amount,
                'amountPaid' => $sale->amount_paid,
                'changeAmount' => $sale->change_amount,
                'grandTotal' => $sale->grand_total,
                'paymentMethod' => $sale->payment_method,
                'salesPerson' => $sale->user ? $sale->user->name : 'N/A',
                'date' => $sale->created_at,
                'status' => $sale->status,
            ];
        })->values();
       
        return response()->json($data);
    }


    public function saleItems (String $id)
    {
        $saleItems = SaleItem::with(['product', 'category'])->where('sale_id', $id)->get();
        // session(['company_info'])->g;
        return response()->json($saleItems);
    }

    public function transactionDetails (String $id)
    {
        $sale = SaleItem::with(['sale.user', 'sale'])->where('sale_id', $id)->first();
        return response()->json($sale);
    }
}
