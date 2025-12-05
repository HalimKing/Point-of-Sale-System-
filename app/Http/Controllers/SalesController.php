<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTransactionRequest;
use App\Models\CompanySetting;
use App\Models\Product;
use App\Models\SaleItem;
use App\Models\Sales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SalesController extends Controller
{

    //
    public function index()
    {
        $productsData = $this->allProducts();
        $companySettings = CompanySetting::first();
        return Inertia::render('sales/index', compact('productsData', 'companySettings'));
    }

    public function saveTransactions(StoreTransactionRequest $request): JsonResponse
    {
        DB::beginTransaction();
        // return response()->json($request->all());

        try {
            $stockErrors = [];
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                if (!$product) {
                    $stockErrors[] = "Product with ID {$item['product_id']} not found.";
                    continue;
                }

                if ($product->quantity_left < $item['quantity']) {
                    $stockErrors[] = "Insufficient stock for {$product->name}. Available: {$product->quantity_left}, Requested: {$item['quantity']}";
                }
            }

            if (!empty($stockErrors)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Stock validation failed',
                    'errors' => $stockErrors
                ], 422);
            }

            // Save Transaction
            Log::info('Saving transaction', $request->all());

            // calculate grand total in
            $grandTotal = round($request->subtotal - $request->discount_amount, 2);

            $sale = new Sales();
            $sale->transaction_id = 'TNX-'. uniqid(10, false);
            $sale->user_id = auth()->id() ?? null;
            $sale->sub_total = $request->subtotal;
            $sale->discount_amount = $request->discount_amount;
            $sale->discount_percentage = $request->discount_percentage;
            $sale->grand_total = $grandTotal;
            $sale->status = 'completed';
            $sale->amount_paid = $request->amount_received;
            $sale->change_amount = $request->change_amount;
            $sale->payment_method = $request->payment_method;
            $sale->customer_name = $request->customer_name;
            $sale->save();

            // Update Stock
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                // $product->total_quantity -= $item['quantity'];
                $product->quantity_left -= $item['quantity'];
                $product->quantity_sold += $item['quantity'];

                // create sales details
                $saleItems = new SaleItem();
                $saleItems->product_id = $product->id;
                $saleItems->category_id = $product->category_id;
                $saleItems->sale_id = $sale->id;
                $saleItems->product_name = $product->name;
                $saleItems->quantity = $item['quantity'];
                $saleItems->price = $product->selling_price;
                $saleItems->total_amount = $item['subtotal'];
                // Quantity of stock at the of making order
                $saleItems->quantity_left = $product->quantity_left;
                $saleItems->quantity_sold = $product->quantity_sold;
                $saleItems->profit = $product->profit * $item['quantity'];
                $saleItems->expiry_date = $product->expiry_date;
                $saleItems->save();
                $product->save();
            }


            // Commit the transaction
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Transaction saved successfully.']);

        }catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction failed: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Transaction failed. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    private function allProducts()
    {
        $products = Product::with('category')->get();
        $productsData = $products->map(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category->name,
                'stock' => $product->quantity_left,
                'price' => $product->selling_price,
                'image' => $product->product_image,
            ];
        });

        return $productsData;

    }

    public function fetchAllProducts()
    {
        return response()->json($this->allProducts());
    }
}
