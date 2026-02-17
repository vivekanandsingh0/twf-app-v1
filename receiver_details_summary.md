# Receiver Details Feature Implementation

## 1. Database Schema
- Created `add_column.sql` to add the following columns to `orders` table:
  - `receiver_name` (text)
  - `receiver_phone` (text)
  - `customer_name` (text)
  - `shipping_fee` (numeric)
  - `customer_phone` (text)

**Action Required:** Run the `add_column.sql` script in your Supabase SQL Editor.

## 2. User App Updates
### Address Management (`addresses.tsx`)
- Added "Receiver Name" and "Receiver Phone" optional input fields in the Add/Edit Address form.
- Updated `AddressContext` to store and sync these fields with Supabase `profiles` table (inside `addresses` JSONB column).

### Checkout Flow
- **Payment Screen (`payment.tsx`)**: Updated to pass the `receiverName` and `receiverPhone` from the selected address to the Order creation logic.
- **Confirm Address Screen (`confirm-address.tsx`)**: Updated to display Receiver Details on the confirmation card if they are set.

## 3. Vendor App Updates
### Data Handling (`VendorContext.tsx`)
- Updated `VendorOrder` interface to include `receiverName` and `receiverPhone`.
- Updated `fetchOrders` to retrieve these fields from the database.
- Updated `addOrder` to save these fields to the `orders` table.

### UI Display
- **Order Details (`vendor-order-details.tsx`)**: Added a "Receiver Info" section under Customer Details. It only appears if receiver details are present.
- **Invoice & Shipping Label (`(vendor-tabs)/orders.tsx`)**: Updated the generated HTML for invoices and shipping labels to:
  - Display "SHIP TO: [Receiver Name]" if available.
  - Display Receiver Phone if available.
  - Show "(Ordered by: [Customer Name])" for clarity if the receiver is different.

## 4. Admin Panel (`twf-admin`)
- Updated `InvoiceTemplate.tsx` to display Receiver Name and Phone in the "Billed To" section of the admin invoice printout.
