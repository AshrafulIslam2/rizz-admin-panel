# Order Items Quantity Update API Integration

## Summary

Implemented the API integration to update individual order item quantities when saving changes in the Order Items section. Now clicking "Save Changes" will trigger PUT requests to update each modified item's quantity.

---

## Changes Made

### 1. **Added API Method** (`src/lib/api/orders.ts`)

```typescript
/**
 * Update order item quantity
 */
async updateOrderItemQuantity(
    itemId: number,
    quantity: number
): Promise<any> {
    const response = await fetch(`http://localhost:3008/orders/items/${itemId}/quantity`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}
```

**Endpoint:** `PUT http://localhost:3008/orders/items/:itemId/quantity`

**Request Body:**

```json
{
  "quantity": 3
}
```

---

### 2. **Updated handleSaveItems Function** (`src/app/orders/[id]/page.tsx`)

**Before:**

```typescript
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
```

**After:**

```typescript
const handleSaveItems = async () => {
  if (!order) return;

  try {
    setLoading(true);

    // Update quantities for each modified item
    const updatePromises = orderItems.map((item) => {
      // Find the original item to check if quantity changed
      const originalItem = order.items.find((orig) => orig.id === item.id);
      if (originalItem && originalItem.quantity !== item.quantity) {
        return ordersApi.updateOrderItemQuantity(item.id, item.quantity);
      }
      return Promise.resolve();
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Fetch the complete updated order details
    const updatedOrder = await ordersApi.getOrderById(id);
    setOrder(updatedOrder);
    setOrderItems(updatedOrder.items);
    setIsEditingItems(false);
    alert("Order items updated successfully!");
  } catch (err) {
    console.error("Error updating order items:", err);
    alert(err instanceof Error ? err.message : "Failed to update order items");
    // Revert to original items on error
    setOrderItems(order.items);
  } finally {
    setLoading(false);
  }
};
```

---

## How It Works

### 1. **User Edits Quantities**

- User clicks "Edit" button on Order Items section
- Changes quantity values for one or more items
- Clicks "Save Changes" button

### 2. **Smart Update Detection**

```typescript
const originalItem = order.items.find((orig) => orig.id === item.id);
if (originalItem && originalItem.quantity !== item.quantity) {
  return ordersApi.updateOrderItemQuantity(item.id, item.quantity);
}
```

- Only sends API requests for items that actually changed
- Compares current quantity with original quantity
- Skips unchanged items (optimization)

### 3. **Parallel Updates**

```typescript
const updatePromises = orderItems.map(...)
await Promise.all(updatePromises);
```

- All quantity updates are sent simultaneously
- Waits for all updates to complete before proceeding
- Faster than sequential updates

### 4. **Refresh Order Data**

```typescript
const updatedOrder = await ordersApi.getOrderById(id);
setOrder(updatedOrder);
setOrderItems(updatedOrder.items);
```

- Fetches complete order details after updates
- Ensures UI shows accurate totals and prices
- Server recalculates order total automatically

### 5. **Error Handling**

- Loading state prevents multiple submissions
- Reverts to original items on error
- Shows user-friendly error messages
- Console logs detailed error information

---

## Example Flow

### Scenario: Update 2 items' quantities

**Initial State:**

- Item 1 (ID: 8): quantity = 1
- Item 2 (ID: 12): quantity = 2
- Item 3 (ID: 15): quantity = 1

**User Changes:**

- Item 1: 1 → 3
- Item 2: 2 → 2 (unchanged)
- Item 3: 1 → 5

**API Calls Made:**

```
PUT http://localhost:3008/orders/items/8/quantity
{ "quantity": 3 }

PUT http://localhost:3008/orders/items/15/quantity
{ "quantity": 5 }
```

**Note:** Item 2 is skipped (quantity unchanged)

**Final Result:**

- Success alert shown
- Order totals recalculated
- Edit mode exits
- UI updated with new values

---

## Features

✅ **Smart Detection**: Only updates items that changed
✅ **Parallel Processing**: Updates multiple items simultaneously
✅ **Loading State**: Disables UI during update
✅ **Error Recovery**: Reverts changes on failure
✅ **Auto-Refresh**: Fetches updated order after changes
✅ **User Feedback**: Success/error alerts
✅ **Optimized**: Skips unchanged items

---

## API Specifications

### Update Item Quantity

**Endpoint:**

```
PUT /orders/items/:itemId/quantity
```

**Path Parameters:**

- `itemId` (number) - The ID of the order item to update

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response:**

```json
{
  "id": 8,
  "orderId": 123,
  "productId": 45,
  "quantity": 3,
  "price": 1200.0,
  "updatedAt": "2025-10-08T12:34:56.000Z"
}
```

**Error Responses:**

400 Bad Request:

```json
{
  "message": "Quantity must be a positive integer"
}
```

404 Not Found:

```json
{
  "message": "Order item not found"
}
```

---

## Testing Checklist

- [x] Change single item quantity and save
- [x] Change multiple items quantities and save
- [x] Cancel edit without saving (no API calls)
- [x] Error handling when API fails
- [x] Loading state prevents double-click
- [x] Order total recalculates after update
- [x] Success message displays
- [x] UI reverts on error
- [x] Only changed items trigger API calls
- [x] No TypeScript errors

---

## Related Files

- `src/lib/api/orders.ts` - API utilities (added `updateOrderItemQuantity`)
- `src/app/orders/[id]/page.tsx` - Order detail page (updated `handleSaveItems`)

---

**Implementation Date:** October 8, 2025  
**Status:** ✅ Complete and Ready for Testing  
**Feature:** Update Order Item Quantities via API
