import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertTriangle, Truck, Plus, Edit, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const inventorySchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  minQuantity: z.number().min(0, "Minimum quantity must be 0 or greater").optional(),
  maxQuantity: z.number().min(0, "Maximum quantity must be 0 or greater").optional(),
  unitCost: z.number().min(0, "Unit cost must be 0 or greater").optional(),
  location: z.string().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

export default function Inventory() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      itemName: "",
      category: "",
      description: "",
      quantity: 0,
      minQuantity: 10,
      maxQuantity: 100,
      unitCost: 0,
      location: "",
      supplier: "",
      notes: "",
    },
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      const response = await fetch(`/api/inventory?${params}`);
      return response.json();
    },
    enabled: !!user,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InventoryFormData> }) => {
      const response = await apiRequest("PATCH", `/api/inventory/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsUpdateDialogOpen(false);
      setSelectedItem(null);
      form.reset();
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryFormData) => {
    if (selectedItem) {
      updateInventoryMutation.mutate({ id: selectedItem.id, data });
    }
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    form.reset({
      itemName: item.itemName,
      category: item.category,
      description: item.description || "",
      quantity: parseInt(item.quantity),
      minQuantity: parseInt(item.minQuantity) || 10,
      maxQuantity: parseInt(item.maxQuantity) || 100,
      unitCost: parseFloat(item.unitCost) || 0,
      location: item.location || "",
      supplier: item.supplier || "",
      notes: item.notes || "",
    });
    setIsUpdateDialogOpen(true);
  };

  const lowStockItems = inventory.filter((item: any) => 
    parseInt(item.quantity) <= parseInt(item.minQuantity || 10)
  );

  const totalValue = inventory.reduce((sum: number, item: any) => 
    sum + (parseFloat(item.unitCost || 0) * parseInt(item.quantity || 0)), 0
  );

  const categories = ["uniforms", "equipment", "supplies", "academic"];
  const categoryColors = {
    uniforms: "bg-navy",
    equipment: "bg-island-green", 
    supplies: "bg-gold",
    academic: "bg-blue-500"
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-navy px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-semibold">Inventory</h1>
          <button 
            className="text-white hover:text-gold" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-navy mb-2">Equipment Inventory</h1>
                <p className="text-gray-600">Track equipment, supplies, and resource allocation</p>
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Package className="mr-2 h-4 w-4" />
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">
                    {inventory.length}
                  </div>
                  <p className="text-xs text-gray-600">Across all categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {lowStockItems.length}
                  </div>
                  <p className="text-xs text-gray-600">Items need restocking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    ${totalValue.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-600">Current inventory value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm">
                    <Truck className="mr-2 h-4 w-4" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy">
                    {new Set(inventory.map((item: any) => item.category)).size}
                  </div>
                  <p className="text-xs text-gray-600">Active categories</p>
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
              <Card className="mb-6 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockItems.map((item: any) => (
                      <div key={item.id} className="border border-red-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{item.itemName}</h4>
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Current: {item.quantity} | Min: {item.minQuantity || 10}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditItem(item)}
                          className="text-xs"
                        >
                          Update Stock
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-600">Loading inventory...</p>
                ) : inventory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Item Name</th>
                          <th className="text-left py-2">Category</th>
                          <th className="text-left py-2">Quantity</th>
                          <th className="text-left py-2">Location</th>
                          <th className="text-left py-2">Unit Cost</th>
                          <th className="text-left py-2">Total Value</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item: any) => {
                          const quantity = parseInt(item.quantity || 0);
                          const minQuantity = parseInt(item.minQuantity || 10);
                          const unitCost = parseFloat(item.unitCost || 0);
                          const totalValue = quantity * unitCost;
                          const isLowStock = quantity <= minQuantity;

                          return (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="py-2">
                                <div>
                                  <p className="font-medium">{item.itemName}</p>
                                  {item.description && (
                                    <p className="text-xs text-gray-600 truncate max-w-xs">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="py-2">
                                <Badge 
                                  className={`${categoryColors[item.category as keyof typeof categoryColors] || 'bg-gray-500'} text-white`}
                                >
                                  {item.category}
                                </Badge>
                              </td>
                              <td className="py-2">
                                <div className="text-sm">
                                  <p className={isLowStock ? "text-red-600 font-medium" : ""}>
                                    {quantity}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Min: {minQuantity}
                                  </p>
                                </div>
                              </td>
                              <td className="py-2 text-sm">
                                {item.location || "Not specified"}
                              </td>
                              <td className="py-2 text-sm">
                                ${unitCost.toFixed(2)}
                              </td>
                              <td className="py-2 text-sm font-medium">
                                ${totalValue.toFixed(2)}
                              </td>
                              <td className="py-2">
                                {isLowStock ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Low Stock
                                  </Badge>
                                ) : quantity >= parseInt(item.maxQuantity || 100) ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Overstocked
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Normal
                                  </Badge>
                                )}
                              </td>
                              <td className="py-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditItem(item)}
                                  className="text-xs"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No inventory items found</p>
                )}
              </CardContent>
            </Card>

            {/* Update Item Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Update Inventory Item</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="itemName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Item name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Item description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="minQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="maxQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="unitCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Cost ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Storage location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <Input placeholder="Supplier name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsUpdateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-island-green hover:bg-island-green/90"
                        disabled={updateInventoryMutation.isPending}
                      >
                        {updateInventoryMutation.isPending ? "Updating..." : "Update Item"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}