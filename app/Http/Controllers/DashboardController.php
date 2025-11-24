<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sales;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard');
    }

    public function getDashboardData(Request $request): JsonResponse
    {
        $timeRange = $request->get('timeRange', '7d');
        
        $data = [
            'metrics' => $this->getMetrics($timeRange),
            'salesTrend' => $this->getSalesTrend($timeRange),
            'categoryData' => $this->getCategoryData($timeRange),
            'topProducts' => $this->getTopProducts($timeRange),
            'recentTransactions' => $this->getRecentTransactions(),
            'last30DaysSales' => $this->getLast30DaysSales(),
            'financialYearSales' => $this->getFinancialYearSales(),
        ];

        return response()->json($data);
    }

    private function getMetrics(string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);
        
        // Today's Sales
        $todaySales = Sales::whereDate('created_at', today())
            ->sum('grand_total');

        // Yesterday's Sales
        $yesterdaySales = Sales::whereDate('created_at', today()->subDay())
            ->sum('grand_total');

        // Total Revenue for time range
        $totalRevenue = Sales::whereBetween('created_at', $dateRange)
            ->sum('grand_total');

        // Total Products
        $totalProducts = Product::count();

        // Total Transactions for time range
        $totalTransactions = Sales::whereBetween('created_at', $dateRange)
            ->count();

        // Average Transaction Value
        $avgTransaction = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        // Total Customers (assuming customer_name is stored)
        $totalCustomers = Sales::whereBetween('created_at', $dateRange)
            ->whereNotNull('customer_name')
            ->where('customer_name', '!=', '')
            ->distinct('customer_name')
            ->count('customer_name');

        // Total Users
        $totalUsers = User::count();

        // Calculate changes
        $previousRange = $this->getPreviousDateRange($timeRange);
        $previousRevenue = Sales::whereBetween('created_at', $previousRange)
            ->sum('grand_total');
        
        $revenueChange = $previousRevenue > 0 
            ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 
            : ($totalRevenue > 0 ? 100 : 0);

        $previousTransactions = Sales::whereBetween('created_at', $previousRange)->count();
        $transactionsChange = $previousTransactions > 0
            ? (($totalTransactions - $previousTransactions) / $previousTransactions) * 100
            : ($totalTransactions > 0 ? 100 : 0);

        return [
            [
                'title' => "Today's Sales",
                'value' => 'GHS ' . number_format($todaySales, 2),
                'change' => $this->calculateDailyChange($todaySales, $yesterdaySales),
            ],
            [
                'title' => "Yesterday's Sales",
                'value' => 'GHS ' . number_format($yesterdaySales, 2),
                'change' => 0,
            ],
            [
                'title' => 'Total Revenue',
                'value' => 'GHS ' . number_format($totalRevenue, 2),
                'change' => round($revenueChange, 1),
            ],
            [
                'title' => 'Total Products',
                'value' => number_format($totalProducts),
                'change' => 0,
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
                'title' => 'Customers',
                'value' => number_format($totalCustomers),
                'change' => 0,
            ],
            [
                'title' => 'Users',
                'value' => number_format($totalUsers),
                'change' => 0,
            ],
        ];
    }

    private function getSalesTrend(string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);
        
        $salesData = Sales::whereBetween('created_at', $dateRange)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(grand_total) as sales'),
                DB::raw('COUNT(*) as transactions')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Format data for chart
        $formattedData = [];
        $currentDate = Carbon::parse($dateRange[0]);
        $endDate = Carbon::parse($dateRange[1]);

        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');
            $saleRecord = $salesData->firstWhere('date', $dateString);
            
            $formattedData[] = [
                'date' => $currentDate->format('D'),
                'sales' => $saleRecord ? (float) $saleRecord->sales : 0,
                'transactions' => $saleRecord ? $saleRecord->transactions : 0,
            ];

            $currentDate->addDay();
        }

        return $formattedData;
    }

    private function getCategoryData(string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);

        $categorySales = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereBetween('sales.created_at', $dateRange)
            ->select(
                'sale_items.category_id',
                DB::raw('SUM(sale_items.total_amount) as total_sales')
            )
            ->groupBy('sale_items.category_id')
            ->get();

        // Get category names
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

        // If you have more than 5 categories, group the rest as "Others"
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

    private function getTopProducts(string $timeRange): array
    {
        $dateRange = $this->getDateRange($timeRange);

        $topProducts = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
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

    private function getRecentTransactions(): array
    {
        $recentTransactions = Sales::with('saleItems')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return $recentTransactions->map(function ($sale) {
            return [
                'id' => '#TXN-' . substr($sale->id, 0, 8),
                'time' => $sale->created_at->format('M d, g:i A'),
                'items' => $sale->saleItems->sum('quantity'),
                'amount' => (float) $sale->grand_total,
                'payment' => $this->formatPaymentMethod($sale->payment_method),
            ];
        })->toArray();
    }

    /**
     * Get sales data for the last 30 days (daily breakdown)
     */
    private function getLast30DaysSales(): array
    {
        $startDate = now()->subDays(29)->startOfDay();
        $endDate = now()->endOfDay();

        $salesData = Sales::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(grand_total) as sales'),
                DB::raw('COUNT(*) as transactions')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $formattedData = [];
        $currentDate = Carbon::parse($startDate);

        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');
            $saleRecord = $salesData->firstWhere('date', $dateString);
            
            $formattedData[] = [
                'date' => $currentDate->format('M d'),
                'sales' => $saleRecord ? (float) $saleRecord->sales : 0,
                'transactions' => $saleRecord ? $saleRecord->transactions : 0,
            ];

            $currentDate->addDay();
        }

        return $formattedData;
    }

    /**
     * Get financial year sales data (monthly breakdown with targets)
     */
    private function getFinancialYearSales(): array
    {
        // Define financial year (assuming April to March)
        $currentYear = now()->year;
        $financialYearStart = now()->month >= 4 
            ? Carbon::create($currentYear, 4, 1)->startOfMonth()
            : Carbon::create($currentYear - 1, 4, 1)->startOfMonth();
        
        $financialYearEnd = $financialYearStart->copy()->addYear()->subDay()->endOfMonth();

        $monthlySales = Sales::whereBetween('created_at', [$financialYearStart, $financialYearEnd])
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(grand_total) as sales'),
                DB::raw('COUNT(*) as transactions')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $formattedData = [];
        $currentMonth = $financialYearStart->copy();

        while ($currentMonth <= $financialYearEnd) {
            $year = $currentMonth->year;
            $month = $currentMonth->month;
            
            $saleRecord = $monthlySales->first(function ($record) use ($year, $month) {
                return $record->year == $year && $record->month == $month;
            });

            $salesAmount = $saleRecord ? (float) $saleRecord->sales : 0;
            
            // Calculate target (you can modify this logic based on your business rules)
            $target = $this->calculateMonthlyTarget($currentMonth, $salesAmount);

            $formattedData[] = [
                'month' => $currentMonth->format('M Y'),
                'sales' => $salesAmount,
                'target' => $target,
                'achievement' => $target > 0 ? round(($salesAmount / $target) * 100, 1) : 0,
            ];

            $currentMonth->addMonth();
        }

        return $formattedData;
    }

    /**
     * Calculate monthly target based on business logic
     * This is a sample implementation - modify according to your business needs
     */
    private function calculateMonthlyTarget(Carbon $month, float $actualSales): float
    {
        // Sample target calculation logic:
        // You can replace this with your actual target calculation
        
        // Option 1: Fixed monthly target
        // return 10000.00; // GHS 10,000 monthly target

        // Option 2: Progressive target based on month
        $baseTarget = 8000.00; // Base monthly target
        
        // Increase target for holiday months (December, November)
        if ($month->month == 12) {
            return $baseTarget * 1.5; // 50% higher in December
        } elseif ($month->month == 11) {
            return $baseTarget * 1.3; // 30% higher in November
        }

        // Option 3: Calculate target based on previous performance
        // Get previous month's sales and add growth expectation
        $previousMonth = $month->copy()->subMonth();
        $previousSales = Sales::whereYear('created_at', $previousMonth->year)
            ->whereMonth('created_at', $previousMonth->month)
            ->sum('grand_total');

        $growthFactor = 1.1; // 10% growth expectation
        return $previousSales > 0 ? $previousSales * $growthFactor : $baseTarget;

        // Option 4: Seasonal adjustment
        // return $this->calculateSeasonalTarget($month, $baseTarget);
    }

    /**
     * Alternative method for seasonal target calculation
     */
    private function calculateSeasonalTarget(Carbon $month, float $baseTarget): float
    {
        $seasonalFactors = [
            1 => 0.9,  // January - 90% of base
            2 => 0.8,  // February - 80% of base
            3 => 0.9,  // March - 90% of base
            4 => 1.0,  // April - 100% of base
            5 => 1.1,  // May - 110% of base
            6 => 1.2,  // June - 120% of base
            7 => 1.1,  // July - 110% of base
            8 => 1.0,  // August - 100% of base
            9 => 1.1,  // September - 110% of base
            10 => 1.3, // October - 130% of base
            11 => 1.5, // November - 150% of base
            12 => 1.6, // December - 160% of base
        ];

        $factor = $seasonalFactors[$month->month] ?? 1.0;
        return $baseTarget * $factor;
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
            '30d' => [
                now()->subDays(30)->startOfDay(),
                now()->endOfDay()
            ],
            '90d' => [
                now()->subDays(90)->startOfDay(),
                now()->endOfDay()
            ],
            default => [ // 7d
                now()->subDays(7)->startOfDay(),
                now()->endOfDay()
            ],
        };
    }

    private function getPreviousDateRange(string $timeRange): array
    {
        return match ($timeRange) {
            '30d' => [
                now()->subDays(60)->startOfDay(),
                now()->subDays(30)->endOfDay()
            ],
            '90d' => [
                now()->subDays(180)->startOfDay(),
                now()->subDays(90)->endOfDay()
            ],
            default => [ // 7d
                now()->subDays(14)->startOfDay(),
                now()->subDays(7)->endOfDay()
            ],
        };
    }

    private function calculateDailyChange(float $current, float $previous): float
    {
        if ($previous === 0.0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}