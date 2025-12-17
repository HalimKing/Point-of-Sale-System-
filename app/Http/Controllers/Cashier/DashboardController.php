<?php

namespace App\Http\Controllers\Cashier;

use App\Models\Product;
use App\Models\Sales;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class CashierDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('cashier/dashboard');
    }

    public function getDashboardData(Request $request): JsonResponse
    {
        // Get authenticated cashier
        $cashier = Auth::user();
        
        if (!$cashier || $cashier->role_id !== 3) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $timeRange = $request->get('timeRange', 'today');
        
        $data = [
            'cashierInfo' => $this->getCashierInfo($cashier),
            'shiftMetrics' => $this->getShiftMetrics($cashier, $timeRange),
            'shiftSalesTrend' => $this->getShiftSalesTrend($cashier, $timeRange),
            'shiftCategoryData' => $this->getShiftCategoryData($cashier, $timeRange),
            'shiftTopProducts' => $this->getShiftTopProducts($cashier, $timeRange),
            'recentShiftTransactions' => $this->getRecentShiftTransactions($cashier),
            'dailyPerformance' => $this->getDailyPerformance($cashier),
            'paymentMethods' => $this->getPaymentMethods($cashier, $timeRange),
        ];

        return response()->json($data);
    }

    private function getCashierInfo($cashier): array
    {
        // Get current shift start time (you might want to track this in a separate table)
        $shiftStart = $cashier->last_login_at ?? now()->subHours(8);
        $shiftDuration = $shiftStart->diff(now());
        
        // Get total shifts completed (this should come from a shifts table)
        $totalShifts = Sales::where('cashier_id', $cashier->id)
            ->select(DB::raw('COUNT(DISTINCT DATE(created_at)) as total_shifts'))
            ->value('total_shifts') ?? 0;

        // Get average rating (if you have a rating system)
        $averageRating = $this->getCashierRating($cashier);

        return [
            'name' => $cashier->name,
            'id' => $cashier->employee_id ?? 'CSH-' . str_pad($cashier->id, 3, '0', STR_PAD_LEFT),
            'shiftStart' => $shiftStart->format('g:i A'),
            'shiftDuration' => $shiftDuration->format('%hh %im'),
            'totalShifts' => $totalShifts,
            'rating' => $averageRating,
        ];
    }

    private function getShiftMetrics($cashier, string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);
        
        // Today's Sales for this cashier
        $todaySales = Sales::where('cashier_id', $cashier->id)
            ->whereDate('created_at', today())
            ->sum('grand_total');

        // Total Transactions for time range
        $totalTransactions = Sales::where('cashier_id', $cashier->id)
            ->whereBetween('created_at', $dateRange)
            ->count();

        // Average Transaction Value
        $avgTransaction = $totalTransactions > 0 ? $todaySales / $totalTransactions : 0;

        // Items sold today
        $itemsSold = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.cashier_id', $cashier->id)
            ->whereDate('sales.created_at', today())
            ->sum('sale_items.quantity');

        // Refunds processed
        $refunds = Sales::where('cashier_id', $cashier->id)
            ->whereDate('created_at', today())
            ->where('is_refund', true)
            ->count();

        // Void items
        $voidItems = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.cashier_id', $cashier->id)
            ->whereDate('sales.created_at', today())
            ->where('sale_items.is_void', true)
            ->count();

        // Customer rating for today
        $todayRating = $this->getCashierRating($cashier, today());

        // Shift duration
        $shiftStart = $cashier->last_login_at ?? now()->subHours(8);
        $shiftDuration = $shiftStart->diff(now());

        // Calculate changes from previous shift
        $previousDaySales = Sales::where('cashier_id', $cashier->id)
            ->whereDate('created_at', today()->subDay())
            ->sum('grand_total');

        $salesChange = $previousDaySales > 0 
            ? (($todaySales - $previousDaySales) / $previousDaySales) * 100 
            : ($todaySales > 0 ? 100 : 0);

        $previousDayTransactions = Sales::where('cashier_id', $cashier->id)
            ->whereDate('created_at', today()->subDay())
            ->count();

        $transactionsChange = $previousDayTransactions > 0
            ? (($totalTransactions - $previousDayTransactions) / $previousDayTransactions) * 100
            : ($totalTransactions > 0 ? 100 : 0);

        return [
            [
                'title' => "Today's Sales",
                'value' => 'GHS ' . number_format($todaySales, 2),
                'change' => round($salesChange, 1),
            ],
            [
                'title' => 'Transactions',
                'value' => number_format($totalTransactions),
                'change' => round($transactionsChange, 1),
            ],
            [
                'title' => 'Avg Transaction',
                'value' => 'GHS ' . number_format($avgTransaction, 2),
                'change' => 0,
            ],
            [
                'title' => 'Items Sold',
                'value' => number_format($itemsSold),
                'change' => 0,
            ],
            [
                'title' => 'Refunds',
                'value' => number_format($refunds),
                'change' => 0,
            ],
            [
                'title' => 'Void Items',
                'value' => number_format($voidItems),
                'change' => 0,
            ],
            [
                'title' => 'Customer Rating',
                'value' => number_format($todayRating, 1),
                'change' => 0,
            ],
            [
                'title' => 'Shift Duration',
                'value' => $shiftDuration->format('%hh %im'),
                'change' => 0,
            ],
        ];
    }

    private function getShiftSalesTrend($cashier, string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);
        
        $salesData = Sales::where('cashier_id', $cashier->id)
            ->whereBetween('created_at', $dateRange)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('SUM(grand_total) as sales'),
                DB::raw('COUNT(*) as transactions')
            )
            ->groupBy('date', 'hour')
            ->orderBy('date')
            ->orderBy('hour')
            ->get();

        // Format data for chart - show hourly data for today, daily for week/month
        if ($timeRange === 'today') {
            $formattedData = $this->formatHourlyData($salesData);
        } else {
            $formattedData = $this->formatDailyData($salesData, $dateRange);
        }

        return $formattedData;
    }

    private function formatHourlyData($salesData): array
    {
        $formattedData = [];
        
        // Create hourly buckets for the current day
        $currentHour = now()->startOfDay();
        
        for ($i = 0; $i < 24; $i++) {
            $hourString = $currentHour->format('g A');
            $hourValue = $currentHour->hour;
            
            $saleRecord = $salesData->first(function ($record) use ($hourValue) {
                return $record->hour == $hourValue && $record->date == now()->format('Y-m-d');
            });
            
            $formattedData[] = [
                'date' => $hourString,
                'sales' => $saleRecord ? (float) $saleRecord->sales : 0,
                'transactions' => $saleRecord ? $saleRecord->transactions : 0,
            ];
            
            $currentHour->addHour();
        }
        
        return $formattedData;
    }

    private function formatDailyData($salesData, array $dateRange): array
    {
        $formattedData = [];
        $currentDate = Carbon::parse($dateRange[0]);
        $endDate = Carbon::parse($dateRange[1]);

        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');
            $dailySales = $salesData->where('date', $dateString);
            
            $totalSales = $dailySales->sum('sales');
            $totalTransactions = $dailySales->sum('transactions');
            
            $formattedData[] = [
                'date' => $currentDate->format('M d'),
                'sales' => (float) $totalSales,
                'transactions' => $totalTransactions,
            ];

            $currentDate->addDay();
        }

        return $formattedData;
    }

    private function getShiftCategoryData($cashier, string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);

        $categorySales = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.cashier_id', $cashier->id)
            ->whereBetween('sales.created_at', $dateRange)
            ->select(
                'sale_items.category_id',
                DB::raw('SUM(sale_items.total_amount) as total_sales')
            )
            ->groupBy('sale_items.category_id')
            ->get();

        $categories = Category::whereIn('id', $categorySales->pluck('category_id'))
            ->pluck('name', 'id');

        $totalSales = $categorySales->sum('total_sales');
        
        $colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'];
        $categoryData = [];
        $colorIndex = 0;

        foreach ($categorySales as $sale) {
            $categoryName = $categories[$sale->category_id] ?? 'Unknown Category';
            $percentage = $totalSales > 0 ? ($sale->total_sales / $totalSales) * 100 : 0;
            
            $categoryData[] = [
                'name' => $categoryName,
                'value' => round($percentage, 1),
                'color' => $colors[$colorIndex % count($colors)],
            ];
            $colorIndex++;
        }

        if (count($categoryData) > 5) {
            $mainCategories = array_slice($categoryData, 0, 4);
            $otherCategories = array_slice($categoryData, 4);
            
            $otherTotal = array_sum(array_column($otherCategories, 'value'));
            
            $mainCategories[] = [
                'name' => 'Others',
                'value' => round($otherTotal, 1),
                'color' => $colors[4],
            ];
            
            $categoryData = $mainCategories;
        }

        return $categoryData;
    }

    private function getShiftTopProducts($cashier, string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);

        $topProducts = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.cashier_id', $cashier->id)
            ->whereBetween('sales.created_at', $dateRange)
            ->select(
                'sale_items.product_name',
                DB::raw('SUM(sale_items.quantity) as total_quantity'),
                DB::raw('SUM(sale_items.total_amount) as total_revenue')
            )
            ->groupBy('sale_items.product_name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        return $topProducts->map(function ($product) {
            return [
                'name' => $product->product_name,
                'quantity' => (int) $product->total_quantity,
                'revenue' => (float) $product->total_revenue,
            ];
        })->toArray();
    }

    private function getRecentShiftTransactions($cashier): array
    {
        $recentTransactions = Sales::with('saleItems')
            ->where('cashier_id', $cashier->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $recentTransactions->map(function ($sale) {
            return [
                'id' => '#TXN-' . substr($sale->id, 0, 8),
                'time' => $sale->created_at->format('g:i A'),
                'items' => $sale->saleItems->sum('quantity'),
                'amount' => (float) $sale->grand_total,
                'payment' => $this->formatPaymentMethod($sale->payment_method),
            ];
        })->toArray();
    }

    private function getDailyPerformance($cashier): array
    {
        $startDate = now()->subDays(6)->startOfDay();
        $endDate = now()->endOfDay();

        $dailySales = Sales::where('cashier_id', $cashier->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(grand_total) as sales')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $formattedData = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');
            $saleRecord = $dailySales->firstWhere('date', $dateString);
            
            $salesAmount = $saleRecord ? (float) $saleRecord->sales : 0;
            $target = $this->getDailyTarget($currentDate);
            
            $formattedData[] = [
                'day' => $currentDate->format('D'),
                'sales' => $salesAmount,
                'target' => $target,
            ];

            $currentDate->addDay();
        }

        return $formattedData;
    }

    private function getPaymentMethods($cashier, string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);

        $payments = Sales::where('cashier_id', $cashier->id)
            ->whereBetween('created_at', $dateRange)
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(grand_total) as amount')
            )
            ->groupBy('payment_method')
            ->get();

        $totalAmount = $payments->sum('amount');
        
        return $payments->map(function ($payment) use ($totalAmount) {
            $percentage = $totalAmount > 0 ? ($payment->amount / $totalAmount) * 100 : 0;
            
            return [
                'method' => $this->formatPaymentMethod($payment->payment_method),
                'count' => (int) $payment->count,
                'amount' => (float) $payment->amount,
                'percentage' => round($percentage, 1),
            ];
        })->toArray();
    }

    private function getCashierRating($cashier, $date = null): float
    {
        // This is a placeholder - implement your actual rating logic
        // You might have a feedback/ratings table
        
        // For now, return a random rating between 4.0 and 5.0
        return 4.5 + (mt_rand(0, 10) / 100);
    }

    private function getDailyTarget(Carbon $date): float
    {
        // Sample daily target calculation
        $baseTarget = 1000.00; // GHS 1,000 per day
        
        // Adjust for weekends
        if ($date->isWeekend()) {
            return $baseTarget * 1.2; // 20% higher on weekends
        }
        
        return $baseTarget;
    }

    private function formatPaymentMethod(?string $method): string
    {
        if (!$method) return 'Unknown';
        
        return match ($method) {
            'credit_card' => 'Credit Card',
            'debit_card' => 'Debit Card',
            'cash' => 'Cash',
            'mobile_money' => 'Mobile Money',
            default => ucfirst(str_replace('_', ' ', $method)),
        };
    }

    private function getDateRange(string $timeRange): array
    {
        return match ($timeRange) {
            'week' => [
                now()->startOfWeek()->startOfDay(),
                now()->endOfDay()
            ],
            'month' => [
                now()->startOfMonth()->startOfDay(),
                now()->endOfDay()
            ],
            default => [ // today
                now()->startOfDay(),
                now()->endOfDay()
            ],
        };
    }
}