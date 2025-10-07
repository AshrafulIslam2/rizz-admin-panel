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
  Printer,
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
          name: data.shipping.fullName,
          email: data.shipping.email,
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
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PROCESSING", label: "Processing" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CONFIRMED":
        return "bg-cyan-500";
      case "PROCESSING":
        return "bg-blue-500";
      case "OUT_FOR_DELIVERY    ":
        return "bg-purple-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSaveStatus = async () => {
    if (!order) return;

    try {
      setLoading(true);
      // Update the status
      await ordersApi.updateOrderStatus(order.id, selectedStatus);

      // Fetch the complete updated order details
      const updatedOrder = await ordersApi.getOrderById(id);
      setOrder(updatedOrder);
      setIsEditingStatus(false);
      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert(
        err instanceof Error ? err.message : "Failed to update order status"
      );
      // Revert to original status on error
      setSelectedStatus(order.status);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelStatus = () => {
    if (!order) return;
    setSelectedStatus(order.status);
    setIsEditingStatus(false);
  };

  const handleSaveCustomer = async () => {
    if (!order) return;

    try {
      setLoading(true);
      // Update customer/shipping information
      await ordersApi.updateOrderShipping(order.shipping.id, {
        fullName: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email,
      });

      // Fetch the complete updated order details
      const updatedOrder = await ordersApi.getOrderById(id);
      setOrder(updatedOrder);
      setIsEditingCustomer(false);
      alert("Customer information updated successfully!");
    } catch (err) {
      console.error("Error updating customer information:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to update customer information"
      );
      // Revert to original data on error
      setCustomerForm({
        name: order.shipping.fullName,
        email: order.shipping.email,
        phone: order.shipping.phone,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCustomer = () => {
    if (!order) return;
    setCustomerForm({
      name: order.shipping.fullName,
      email: order.shipping.email,
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

  const handlePrintInvoice = () => {
    if (!order) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const subtotal = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderCode}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .company-info {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .logo {
              width: 80px;
              height: 80px;
              object-fit: contain;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #333;
            }
            .invoice-title {
              text-align: right;
            }
            .invoice-title h1 {
              font-size: 32px;
              color: #333;
              margin-bottom: 5px;
            }
            .invoice-number {
              font-size: 14px;
              color: #666;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-box {
              padding: 15px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .info-box h3 {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .info-box p {
              margin: 5px 0;
              line-height: 1.5;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table thead {
              background: #333;
              color: white;
            }
            .items-table th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #ddd;
            }
            .items-table tbody tr:hover {
              background: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            .totals-section {
              margin-left: auto;
              width: 300px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #ddd;
            }
            .total-row.final {
              font-size: 18px;
              font-weight: bold;
              border-top: 2px solid #333;
              border-bottom: 2px solid #333;
              margin-top: 10px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="company-info">
                <img src="/leather-goods-store-bangladesh-logo.png" alt="Rizz Leather" class="logo" />
                <div class="company-name">Rizz Leather</div>
              </div>
              <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">Order #${order.orderCode}</div>
                <div class="invoice-number">Date: ${new Date(
                  order.createdAt
                ).toLocaleDateString()}</div>
              </div>
            </div>

            <div class="info-section">
              <div class="info-box">
                <h3>Bill To</h3>
                <p><strong>${order.shipping.fullName}</strong></p>
                <p>${order.shipping.email}</p>
                <p>${order.shipping.phone}</p>
              </div>
              <div class="info-box">
                <h3>Ship To</h3>
                <p>${order.shipping.address1}</p>
                <p>Delivery Area: ${order.shipping.deliveryArea}</p>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${
                      item.product?.title || `Product ID: ${item.productId}`
                    }</td>
                    <td>${item.color?.name || item.colorId}</td>
                    <td>${item.size?.value || item.sizeId}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">৳${item.price.toFixed(2)}</td>
                    <td class="text-right">৳${(
                      item.price * item.quantity
                    ).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>৳${subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Delivery Charge:</span>
                <span>৳${order.deliveryCharge.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Delivery Area:</span>
                <span>${order.shipping.deliveryArea}</span>
              </div>
              <div class="total-row final">
                <span>Total:</span>
                <span>৳${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Payment Method: Cash on Delivery</p>
              <p>Thank you for your business!</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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
          <Button onClick={handlePrintInvoice} variant="default" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          {isEditingStatus ? (
            <>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                disabled={loading}
              >
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
              <Button onClick={handleSaveStatus} size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelStatus}
                size="sm"
                disabled={loading}
              >
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveCustomer}
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelCustomer}
                    size="sm"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{order.shipping.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.shipping.email}</p>
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
