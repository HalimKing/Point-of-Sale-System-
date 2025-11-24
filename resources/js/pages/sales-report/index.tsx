"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Filter, X, Plus, TrendingUp, Download, Calendar, BarChart3, Users, DollarSign, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { DatePicker } from "@/components/ui/date-picker"
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import { sum } from "lodash"
import axios from "axios"



export type SalesRecord = {
  id: string
  productId: string
  productName: string
  category: string
  customerName: string
  customerEmail: string
  quantity: number
  sellingPrice: number
  totalAmount: number
  costPrice: number
  profit: number
  profitMargin: number
  saleDate: Date
  paymentMethod: "credit_card" | "paypal" | "cash" | "bank_transfer"
  salesPerson: string
}

export const salesColumns: ColumnDef<SalesRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "saleDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sale Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("saleDate"))
      const formatted = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("productName")}</div>,
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("category")}</div>,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      const customerName = row.getValue("customerName") as string
      return (
        <div>
          <div className="font-medium">{customerName}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => {
      const quantity = parseInt(row.getValue("quantity"))
      return <div className="text-center font-medium">{quantity}</div>
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sellingPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount)
      return <div className="text-right">{formatted}</div>
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(amount)
      return <div className="text-right font-bold">{formatted}</div>
    },
  },
  {
    accessorKey: "profit",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Profit
          <TrendingUp className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const profit = parseFloat(row.getValue("profit"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GHS",
      }).format(profit)
      const isPositive = profit >= 0
      const className = `text-right font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`
      
      return (
        <div className={className}>
          {isPositive ? '+' : ''}{formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "profitMargin",
    header: "Margin %",
    cell: ({ row }) => {
      const margin = parseFloat(row.getValue("profitMargin"))
      const className = margin >= 30 ? 'text-green-600 font-bold' : margin >= 20 ? 'text-orange-600' : 'text-red-600'
      return <div className={`text-right ${className}`}>{margin.toFixed(1)}%</div>
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string
      const getMethodLabel = (method: string) => {
        switch (method) {
          case "credit_card": return "Credit Card"
          case "paypal": return "PayPal"
          case "cash": return "Cash"
          case "bank_transfer": return "Bank Transfer"
          default: return method
        }
      }
      
      return (
        <Badge variant="outline" className="capitalize">
          {getMethodLabel(method)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "salesPerson",
    header: "Sales Person",
    cell: ({ row }) => <div>{row.getValue("salesPerson")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const sale = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                console.log("View sale details:", sale.id)
              }}
            >
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                console.log("Edit sale:", sale.id)
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                console.log("Refund sale:", sale.id)
              }}
            >
              Process Refund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

type TopProductsData = {
  productName: string
  totalQuantity: number
  totalProfit: number
  category: string
  totalSales: number
}

type SalesByCategoryData = {
  category: string
  totalSales: number
}

interface SalesReportPageProps {
  topProductsData: TopProductsData[]
  salesByCategoryData: SalesByCategoryData[]
}

const SalesReportPage = ({topProductsData, salesByCategoryData}: SalesReportPageProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [_topProducts, _setTopProducts] = React.useState<TopProductsData[]>(topProductsData ? topProductsData : [])
  const [salesByCategory, setSalesByCategory] = React.useState<SalesByCategoryData[]>(salesByCategoryData ? salesByCategoryData : [])
  const [dateRange, setDateRange] = React.useState<{ from: Date | null; to: Date | null }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [sales, setSales] = React.useState<SalesRecord[]>([])

  
  const table = useReactTable({
    data: sales,
    columns: salesColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })


  // Sales details
  const salesDetails = async () => {
    const response = await axios.get('api/sales/sales-details')
    setSales(response.data);
  }

  React.useEffect(() => {
    salesDetails();
  }, [])
  

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    const filteredSales = sales.filter(sale => {
      if (!dateRange.from || !dateRange.to) return true
      const saleDate = new Date(sale.saleDate)
      return saleDate >= dateRange.from && saleDate <= dateRange.to
    })

    return filteredSales.reduce((acc, sale) => {
      acc.totalSales += Number(sale.totalAmount)
      acc.totalProfit += Number(sale.profit)
      acc.totalItemsSold += sale.quantity
      acc.totalTransactions += 1
      return acc
    }, {
      totalSales: 0,
      totalProfit: 0,
      totalItemsSold: 0,
      totalTransactions: 0
    })
  }, [sales, dateRange])

  
  const categories = React.useMemo(() => {
    return Array.from(new Set(sales.map(sale => sale.category)))
  }, [sales])

  const salesPersons = React.useMemo(() => {
    return Array.from(new Set(sales.map(sale => sale.salesPerson)))
  }, [sales])

  const getActiveFiltersCount = () => {
    return columnFilters.filter(filter => 
      filter.value && (Array.isArray(filter.value) ? filter.value.length > 0 : filter.value !== "")
    ).length
  }

  const calculateTotalOfAllProducts = () => {
    return (salesByCategory.reduce((total, sales) => total + Number(sales.totalSales), 0));
  }

  const clearAllFilters = () => {
    setColumnFilters([])
  }

  const exportToCSV = () => {
    const headers = [
      'Sale Date',
      'Product',
      'Category',
      'Customer',
      'Quantity',
      'Selling Price',
      'Total Amount',
      'Profit',
      'Profit Margin',
      'Payment Method',
      'Sales Person'
    ].join(',')

    const csvData = sales.map(sale => [
      new Date(sale.saleDate).toLocaleDateString(),
      sale.productName,
      sale.category,
      sale.customerName,
      sale.quantity,
      sale.sellingPrice,
      sale.totalAmount,
      sale.profit,
      sale.profitMargin + '%',
      sale.paymentMethod,
      sale.salesPerson
    ].join(','))

    const csv = [headers, ...csvData].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground">
            Analyze sales performance, track revenue, and monitor profitability
          </p>
        </div>
        
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "GHS",
              }).format(summary.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {summary.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalProfit >= 0 ? '+' : ''}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "GHS",
              }).format(summary.totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalSales > 0 ? ((summary.totalProfit / summary.totalSales) * 100).toFixed(1) : 0}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalItemsSold.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "GHS",
              }).format(summary.totalTransactions > 0 ? summary.totalSales / summary.totalTransactions : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Sales Overview</TabsTrigger>
          <TabsTrigger value="details">Sales Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Best selling products by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {_topProducts.map((product: any, index) => (
                    <div key={product.productName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "GHS",
                          }).format(product.totalSales)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.totalQuantity} units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>
                  Revenue distribution across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesByCategory.map(category => {
                    const percentage = calculateTotalOfAllProducts() > 0 ? (category.totalSales / calculateTotalOfAllProducts()) * 100 : 0
                    
                    return (
                      <div key={category.category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "GHS",
                            }).format(category.totalSales)}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Filters Section */}
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
                {/* Date Range */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Date Range:</span>
                  <Input
                    type="date"
                    value={dateRange.from?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : null }))}
                    className="w-full"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={dateRange.to?.toISOString().split('T')[0] || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : null }))}
                    className="w-full"
                  />
                </div>

                {/* Product Search */}
                <div className="w-full lg:max-w-sm">
                  <Input
                    placeholder="Search products..."
                    value={(table.getColumn("productName")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      table.getColumn("productName")?.setFilterValue(event.target.value)
                    }
                    className="w-full"
                  />
                </div>

                {/* Sales Person Filter */}
                <div className="w-full lg:max-w-[200px]">
                  <Select
                    value={(table.getColumn("salesPerson")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) => 
                      table.getColumn("salesPerson")?.setFilterValue(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sales Person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sales Persons</SelectItem>
                      {salesPersons.map((person) => (
                        <SelectItem key={person} value={person}>
                          {person}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-2">
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-9"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters ({getActiveFiltersCount()})
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      Columns
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id === "productName" ? "Product Name" : 
                             column.id === "saleDate" ? "Sale Date" :
                             column.id === "totalAmount" ? "Total Amount" :
                             column.id === "profitMargin" ? "Profit Margin" :
                             column.id === "paymentMethod" ? "Payment Method" :
                             column.id === "salesPerson" ? "Sales Person" :
                             column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2">
                {columnFilters.map((filter, index) => {
                  if (!filter.value || (Array.isArray(filter.value) && filter.value.length === 0)) return null
                  
                  return (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {filter.id}: {Array.isArray(filter.value) ? filter.value.join(" - ") : filter.value.toString()}
                      <button
                        onClick={() => {
                          setColumnFilters(prev => prev.filter((_, i) => i !== index))
                        }}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sales Table */}
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={salesColumns.length}
                      className="h-24 text-center"
                    >
                      No sales records found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination and Selection Info */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-muted-foreground flex-1 text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Sales Report',
    href: '/sales',
  },
];

export default function SalesReport({topProductsData, salesByCategoryData}: {topProductsData: TopProductsData[], salesByCategoryData: SalesByCategoryData[]}) {

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Sales Report" />
      <div className="w-full px-10 lg:px-10 max-sm:px-6 ">
        <SalesReportPage topProductsData={topProductsData} salesByCategoryData={salesByCategoryData}  />
      </div>
    </AppLayout>
  );
}