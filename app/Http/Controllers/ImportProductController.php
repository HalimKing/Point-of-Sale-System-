<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Reader\Exception;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;


class ImportProductController extends Controller
{
    //
        /**
     * Import products from Excel file
     */
    /**
 * Import products from CSV file
 */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'csv_file' => 'required|file|mimes:csv,txt|max:10240' // 10MB max
        ]);
        

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $file = $request->file('csv_file');
            $filePath = $file->getPathname();

            $importedCount = 0;
            $errors = [];
            $rowNumber = 0;

            if (($handle = fopen($filePath, 'r')) !== FALSE) {
                while (($data = fgetcsv($handle, 1000, ',')) !== FALSE) {
                    $rowNumber++;
                    
                    // Skip header row (first row)
                    if ($rowNumber === 1) {
                        continue;
                    }

                    // Skip empty rows
                    if (empty($data) || empty(array_filter($data))) {
                        continue;
                    }

                    // Validate required columns exist
                    if (count($data) < 7) {
                        $errors[] = "Row {$rowNumber}: Insufficient data columns";
                        continue;
                    }

                    // Map CSV columns to data
                    $productData = [
                        'name' => trim($data[0] ?? ''),
                        'category_name' => trim($data[1] ?? ''),
                        'supplier_email' => trim($data[2] ?? ''),
                        'selling_price' => trim($data[3] ?? ''),
                        'cost_price' => trim($data[4] ?? ''),
                        'total_quantity' => trim($data[5] ?? ''),
                        'reorder_level' => trim($data[6] ?? 0),
                        'expiry_date' => trim($data[7] ?? ''),
                    ];

                    // return response()->json($productData);

                    // Validate product data
                    $productValidator = Validator::make($productData, [
                        'name' => 'required|string|max:255',
                        'category_name' => 'required|string|max:255',
                        'supplier_email' => 'required|email',
                        'selling_price' => 'required|numeric|min:0',
                        'cost_price' => 'required|numeric|min:0',
                        'total_quantity' => 'required|integer|min:0',
                        'reorder_level' => 'nullable|integer|min:0',
                        'expiry_date' => 'required|date',
                    ]);

                    if ($productValidator->fails()) {
                        $errorMessages = implode(', ', $productValidator->errors()->all());
                        $errors[] = "Row {$rowNumber}: {$errorMessages}";
                        continue;
                    }

                    // Check if category exists
                   
                    // Check if supplier exists
                    $supplier = DB::table('suppliers')->where('email', $productData['supplier_email'])->first();
                    if (!$supplier) {
                        $errors[] = "Row {$rowNumber}: Supplier with email '{$productData['supplier_email']}' does not exist";
                        continue;
                    }

                    try {
                        $product = new Product();

                         $category = DB::table('categories')->where('name', $productData['category_name'])->first();
                        if (!$category) {
                            // create category if not existed
                            $category = new Category();
                            $category->name = $productData['category_name'];
                            $category->description = 'Imported category';
                            $category->save();
                            continue;
                        }


                        $product->name = $productData['name'];
                        $product->category_id = is_object($category) ? $category->id : $category;
                        $product->supplier_id = $supplier->id;
                        $product->selling_price = $productData['selling_price'];
                        $product->cost_price = $productData['cost_price'];
                        $product->total_quantity = $productData['total_quantity'];
                        $product->reorder_level = $productData['reorder_level'] ?? 0;
                        $product->expiry_date = Carbon::parse($productData['expiry_date'])->format('Y-m-d');
                        $product->profit = $product->selling_price - $product->cost_price;
                        $product->total_profit = $product->profit * $product->total_quantity;
                        $product->quantity_left = $product->total_quantity;
                        $product->quantity_sold = 0;                 
                        $product->save();
                        // ::create([
                        //     'name' => $productData['name'],
                        //     'category_id' => $productData['category_id'],
                        //     'supplier_id' => $productData['supplier_id'],
                        //     'selling_price' => $productData['selling_price'],
                        //     'cost_price' => $productData['cost_price'],
                        //     'total_quantity' => $productData['total_quantity'],
                        //     'quantity_left' => $productData['total_quantity'],
                        //     'quantity_sold' => 0,
                        //     'expiry_date' => $productData['expiry_date'],
                        //     'reorder_level' => $productData['reorder_level'],
                        //     'status' => 'in-stock',
                        // ]);

                        // Calculate profits

                        $importedCount++;
                    } catch (\Exception $e) {
                        $errors[] = "Row {$rowNumber}: Failed to create product - " . $e->getMessage();
                    }
                }
                fclose($handle);
            }

            DB::commit();

            $response = [
                'message' => "Successfully imported {$importedCount} products",
                'imported_count' => $importedCount,
            ];

            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['message'] .= ". " . count($errors) . " rows failed.";
            }

            return response()->json($response);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error importing file: ' . $e->getMessage()
            ], 500);
        }
    }
}
