"use client";

import React, { useState, use, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Edit,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import { ordersApi, ApiOrder } from "@/lib/api/orders";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [shippingForm, setShippingForm] = useState({
    address: "",
    deliveryArea: "",
  });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await ordersApi.getOrderById(id);
        setOrder(data);
        setCustomerForm({
          name: data.user.name,
          email: data.user.email,
          phone: data.shipping.phone,
        });
        setShippingForm({
          address: data.shipping.address1,
          deliveryArea: data.shipping.deliveryArea,
        });
        setSelectedStatus(data.status);
        setOrderItems(data.items);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch order");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "out-for-delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-cyan-500";
      case "processing":
        return "bg-blue-500";
      case "out-for-delivery":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSaveStatus = () => {
    if (!order) return;
    setOrder({ ...order, status: selectedStatus });
    setIsEditingStatus(false);
    // Add API call here to save status
  };

  const handleCancelStatus = () => {
    if (!order) return;
    setSelectedStatus(order.status);
    setIsEditingStatus(false);
  };

  const handleSaveCustomer = () => {
    if (!order) return;
    setOrder({
      ...order,
      user: {
        ...order.user,
        name: customerForm.name,
        email: customerForm.email,
      },
      shipping: { ...order.shipping, phone: customerForm.phone },
    });
    setIsEditingCustomer(false);
    // Add API call here to save customer data
  };

  const handleCancelCustomer = () => {
    if (!order) return;
    setCustomerForm({
      name: order.user.name,
      email: order.user.email,
      phone: order.shipping.phone,
    });
    setIsEditingCustomer(false);
  };

  const handleSaveShipping = () => {
    if (!order) return;
    setOrder({
      ...order,
      shipping: {
        ...order.shipping,
        address1: shippingForm.address,
        deliveryArea: shippingForm.deliveryArea,
      },
    });
    setIsEditingShipping(false);
    // Add API call here to save shipping address
  };

  const handleCancelShipping = () => {
    if (!order) return;
    setShippingForm({
      address: order.shipping.address1,
      deliveryArea: order.shipping.deliveryArea,
    });
    setIsEditingShipping(false);
  };

  const handleSaveItems = () => {
    if (!order) return;
    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const total = subtotal + order.deliveryCharge;

    setOrder({
      ...order,
      items: orderItems,
      total,
    });
    setIsEditingItems(false);
    // Add API call here to save order items
  };

  const handleCancelItems = () => {
    if (!order) return;
    setOrderItems(order.items);
    setIsEditingItems(false);
  };

  const handleRemoveItem = (itemId: number) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || "Order not found"}</p>
          <Link href="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-500">Order #{order.orderCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditingStatus ? (
            <>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSaveStatus} size="sm">
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleCancelStatus} size="sm">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingStatus(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </div>
              {!isEditingCustomer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingCustomer(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingCustomer ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Name</Label>
                  <Input
                    id="customerName"
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm({ ...customerForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm({
                        ...customerForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveCustomer} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelCustomer}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{order.shipping.phone}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </div>
              {!isEditingShipping && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingShipping(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingShipping ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shippingForm.address}
                    onChange={(e) => {
                      setShippingForm({
                        ...shippingForm,
                        address: e.target.value,
                      });
                    }}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryArea">Delivery Area</Label>
                  <Input
                    id="deliveryArea"
                    value={shippingForm.deliveryArea}
                    onChange={(e) => {
                      setShippingForm({
                        ...shippingForm,
                        deliveryArea: e.target.value,
                      });
                    }}
                    placeholder="e.g. Inside Dhaka, Outside Dhaka"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveShipping} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelShipping}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <address className="not-italic">
                <p>{order.shipping.address1}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Delivery Area: {order.shipping.deliveryArea}
                </p>
              </address>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Cash on Delivery</p>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Order Code</p>
              <p className="font-medium">{order.orderCode}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="font-medium">{order.items.length}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Delivery Charge</p>
              <p className="font-medium">৳{order.deliveryCharge.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </div>
            {!isEditingItems && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditingItems(true);
                  setOrderItems([...order.items]);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEditingItems ? (
              <>
                {orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="space-y-2 p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1">
                        <div className="relative w-20 h-20 rounded overflow-hidden border bg-gray-100">
                          {item.product?.product_image?.[0]?.url ? (
                            <Image
                              src={item.product.product_image[0].url}
                              alt={
                                item.product.product_image[0].alt ||
                                item.product.title
                              }
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <Label>Product Name</Label>
                            <p className="font-medium">
                              {item.product?.title ||
                                `Product ID: ${item.productId}`}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label>SKU</Label>
                              <p className="text-sm text-gray-500">
                                {item.product?.sku || "N/A"}
                              </p>
                            </div>
                            <div>
                              <Label>Size</Label>
                              <p className="text-sm text-gray-500">
                                {item.size?.value || item.sizeId}
                              </p>
                            </div>
                            <div>
                              <Label>Color</Label>
                              <p className="text-sm text-gray-500">
                                {item.color?.name || item.colorId}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="flex-1">
                              <Label htmlFor={`quantity-${item.id}`}>
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-24"
                              />
                            </div>
                            <div>
                              <Label>Price</Label>
                              <p className="font-medium">
                                ৳{item.price.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <Label>Total</Label>
                              <p className="font-medium">
                                ৳{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {index < orderItems.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveItems} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelItems}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {order.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex gap-4 items-start">
                      <div className="relative w-20 h-20 rounded overflow-hidden border flex-shrink-0 bg-gray-100">
                        {item.product?.product_image?.[0]?.url ? (
                          <Image
                            src={item.product.product_image[0].url}
                            alt={
                              item.product.product_image[0].alt ||
                              item.product.title
                            }
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">
                          {item.product?.title ||
                            `Product ID: ${item.productId}`}
                        </p>
                        <div className="flex gap-4 mt-1">
                          <p className="text-sm text-gray-500">
                            Color: {item.color?.name || item.colorId}
                          </p>
                          <p className="text-sm text-gray-500">
                            Size: {item.size?.value || item.sizeId}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">৳{item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          ৳{(item.price * item.quantity).toFixed(2)} total
                        </p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </>
            )}

            <div className="space-y-2 pt-4">
              <div className="flex justify-between">
                <p className="text-gray-500">Subtotal</p>
                <p className="font-medium">
                  ৳
                  {order.items
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Delivery Charge</p>
                <p className="font-medium">
                  ৳{order.deliveryCharge.toFixed(2)}
                </p>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <p>Total</p>
                <p>৳{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
