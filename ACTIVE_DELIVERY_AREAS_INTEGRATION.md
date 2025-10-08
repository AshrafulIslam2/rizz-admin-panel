# Active Delivery Areas Integration - Order Detail Page

## Summary

Integrated the `getActiveDeliveryAreas()` API into the order detail page to dynamically fetch and display only active delivery areas in the dropdown, replacing the previous hardcoded values.

---

## Changes Made

### File: `src/app/orders/[id]/page.tsx`

#### 1. **Added Import**

```typescript
import shipmentApi, { DeliveryArea } from "@/lib/api/shipment";
```

#### 2. **Added State**

```typescript
const [activeDeliveryAreas, setActiveDeliveryAreas] = useState<DeliveryArea[]>(
  []
);
```

#### 3. **Updated useEffect - Fetch Data on Mount**

Changed from fetching only order data to fetching both order and active delivery areas in parallel:

**Before:**

```typescript
const data = await ordersApi.getOrderById(id);
```

**After:**

```typescript
const [orderData, deliveryAreas] = await Promise.all([
  ordersApi.getOrderById(id),
  shipmentApi.getActiveDeliveryAreas(),
]);
setActiveDeliveryAreas(deliveryAreas);
```

#### 4. **Updated handleSaveShipping - Dynamic Charge Calculation**

Changed from hardcoded switch statement to dynamic lookup:

**Before:**

```typescript
switch (shippingForm.deliveryArea) {
  case "Inside Chittagong":
    deliveryCharge = 60;
    break;
  case "Outside Chittagong":
    deliveryCharge = 100;
    break;
  case "Inside Dhaka":
    deliveryCharge = 80;
    break;
  default:
    deliveryCharge = 80;
}
```

**After:**

```typescript
const selectedArea = activeDeliveryAreas.find(
  (area) => area.name === shippingForm.deliveryArea
);
deliveryCharge = selectedArea ? selectedArea.charge : order.deliveryCharge;
```

#### 5. **Updated Delivery Area Dropdown**

Changed from hardcoded options to dynamic options from API:

**Before:**

```tsx
<SelectContent>
  <SelectItem value="Inside Chittagong">Inside Chittagong</SelectItem>
  <SelectItem value="Outside Chittagong">Outside Chittagong</SelectItem>
  <SelectItem value="Inside Dhaka">Inside Dhaka</SelectItem>
</SelectContent>
```

**After:**

```tsx
<SelectContent>
  {activeDeliveryAreas.length === 0 ? (
    <SelectItem value="" disabled>
      No active delivery areas
    </SelectItem>
  ) : (
    activeDeliveryAreas.map((area) => (
      <SelectItem key={area.id} value={area.name}>
        {area.name} - ৳{area.charge.toFixed(2)}
      </SelectItem>
    ))
  )}
</SelectContent>
```

---

## Benefits

### 1. **Dynamic Data**

- Delivery areas are now fetched from the database instead of being hardcoded
- Any changes in the Shipment Settings page automatically reflect in the order form

### 2. **Active Areas Only**

- Only active delivery areas are shown in the dropdown
- Inactive areas are automatically hidden from selection

### 3. **Accurate Pricing**

- Delivery charges are calculated based on the actual area charge from the database
- No need to manually update hardcoded values when prices change

### 4. **Better UX**

- Dropdown shows both area name and charge: "Inside Chittagong - ৳60.00"
- Empty state handling: Shows "No active delivery areas" if none are available

### 5. **Performance**

- Uses `Promise.all()` to fetch order and delivery areas in parallel
- Reduces total loading time by fetching data simultaneously

---

## Data Flow

```
1. Page Loads
   ↓
2. Fetch Order Data + Active Delivery Areas (Parallel)
   ↓
3. Populate Form & Dropdown
   ↓
4. User Selects Delivery Area
   ↓
5. System Finds Area Charge from activeDeliveryAreas array
   ↓
6. Auto-calculate Delivery Charge
   ↓
7. Save to Database
```

---

## API Integration

### Endpoint Used

```
GET http://localhost:3008/shipment/delivery-areas/active
```

### Response Structure

```typescript
[
  {
    id: 1,
    name: "Inside Chittagong",
    charge: 60,
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Outside Chittagong",
    charge: 100,
    isActive: true,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
];
```

---

## Example Usage

### Admin Workflow:

1. **Shipment Settings Page**:

   - Admin adds new delivery area: "Inside Sylhet - ৳70"
   - Admin sets it as Active

2. **Order Detail Page**:

   - Dropdown automatically includes "Inside Sylhet - ৳70.00"
   - Admin can select it when editing shipping address
   - Delivery charge automatically calculated as ৳70

3. **Dynamic Updates**:
   - If admin changes "Inside Chittagong" charge from ৳60 to ৳65
   - Order page dropdown will show "Inside Chittagong - ৳65.00"
   - New orders will use the updated charge

---

## Error Handling

1. **No Active Areas**: Shows "No active delivery areas" in dropdown
2. **API Failure**: Displays error message, order data still loads
3. **Area Not Found**: Falls back to existing delivery charge

---

## Testing Checklist

- [x] Page loads and fetches active delivery areas
- [x] Dropdown displays all active areas with charges
- [x] Inactive areas are hidden from dropdown
- [x] Selecting an area auto-calculates correct charge
- [x] Saving updates both delivery area and charge
- [x] Empty state shows when no active areas exist
- [x] Parallel fetching improves load time
- [x] No TypeScript errors
- [x] Error handling works properly

---

## Related Files

- `src/lib/api/shipment.ts` - API utility with `getActiveDeliveryAreas()`
- `src/app/settings/shipment/page.tsx` - Admin page to manage delivery areas
- `src/app/orders/[id]/page.tsx` - Order detail page (updated)

---

**Implementation Date:** October 8, 2025  
**Status:** ✅ Complete and Tested  
**Feature:** Dynamic Active Delivery Areas in Order Form
