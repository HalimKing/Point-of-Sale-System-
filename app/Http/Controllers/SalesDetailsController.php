<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SaleItem;
use Carbon\Carbon;

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
            ];
        });

        return response()->json($sales);
    }
}
