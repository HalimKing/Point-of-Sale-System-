"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types'

// Validation schema
const categoryFormSchema = z.object({
  name: z.string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must not exceed 50 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal('')),
  status: z.enum(["active", "inactive"]).default("active"),
  color: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

// Default form values
const defaultValues: Partial<CategoryFormValues> = {
  name: "",
  description: "",
  status: "active",
  color: "#3b82f6", // Default blue color
}

const colorOptions = [
  { value: "#3b82f6", label: "Blue", bgColor: "bg-blue-500" },
  { value: "#ef4444", label: "Red", bgColor: "bg-red-500" },
  { value: "#10b981", label: "Green", bgColor: "bg-green-500" },
  { value: "#f59e0b", label: "Amber", bgColor: "bg-amber-500" },
  { value: "#8b5cf6", label: "Violet", bgColor: "bg-violet-500" },
  { value: "#ec4899", label: "Pink", bgColor: "bg-pink-500" },
  { value: "#06b6d4", label: "Cyan", bgColor: "bg-cyan-500" },
  { value: "#84cc16", label: "Lime", bgColor: "bg-lime-500" },
]

export default function CreateCategory() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
    mode: "onChange",
  })

  // Watch the color field to show preview
  const selectedColor = form.watch("color")

  function onSubmit(data: CategoryFormValues) {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log("Creating category:", data)
      setIsSubmitting(false)
      
      // Here you would typically:
      // 1. Make API call to create category
      // 2. Handle success/error
      // 3. Redirect to categories list
      alert("Category created successfully!")
      
      // Redirect would happen here
      // window.location.href = '/categories'
    }, 1000)
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Categories',
      href: '/categories',
    },
    {
      title: 'Create Category',
      href: '/categories/create',
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Category" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
              <p className="text-muted-foreground">
                Add a new product category to organize your inventory
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
                <CardDescription>
                  Enter the details for your new product category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Category Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Electronics, Clothing, Food..." 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for your product category.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what products belong to this category..."
                              className="resize-none"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description to help identify this category.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    Active
                                  </div>
                                </SelectItem>
                                <SelectItem value="inactive">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                                    Inactive
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Active categories can be assigned to products.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Color */}
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colorOptions.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="h-4 w-4 rounded-full border"
                                        style={{ backgroundColor: color.value }}
                                      />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose a color to identify this category.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Create Category
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Category Preview</CardTitle>
                <CardDescription>
                  How your category will appear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedColor && (
                    <div 
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: selectedColor }}
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {form.watch("name") || "Category Name"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {form.watch("description") || "Category description will appear here"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={form.watch("status") === "active" ? "default" : "secondary"}>
                    {form.watch("status") === "active" ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    0 products
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span>Use clear, descriptive names for easy identification</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span>Inactive categories won't appear in product assignment</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <span>Colors help visually organize categories in lists</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}