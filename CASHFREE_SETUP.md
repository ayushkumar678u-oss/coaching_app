# Cashfree Payment Integration Guide

## Frontend Setup Complete ✅

The frontend has been updated with Cashfree payment gateway integration.

## Required Backend Endpoints

Your backend needs to implement the following endpoints for Cashfree integration:

### 1. Create Cashfree Order
**Endpoint:** `POST /api/payments/cashfree/create`

**Request Body:**
```json
{
  "courseId": 123,
  "amount": 999.99,
  "currency": "INR"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "session_xxx_yyy",
    "order_id": "order_xxx_yyy",
    "cashfree_key": "YOUR_PUBLIC_KEY",
    "amount": 999.99,
    "currency": "INR"
  }
}
```

### 2. Verify Cashfree Payment
**Endpoint:** `POST /api/payments/cashfree/verify`

**Request Body:**
```json
{
  "order_id": "order_xxx_yyy",
  "payment_id": "pay_xxx_yyy",
  "courseId": 123,
  "amount": 999.99
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_xxx_yyy",
    "order_id": "order_xxx_yyy",
    "status": "SUCCESS",
    "amount": 999.99,
    "course_enrolled": true
  }
}
```

## Cashfree Sandbox Credentials

Your Cashfree dashboard credentials needed:
- **App ID**: Get from Cashfree Dashboard
- **Secret Key**: Get from Cashfree Dashboard (server-side only)
- **Public Key**: Get from Cashfree Dashboard (frontend)

## Backend Implementation Example (Node.js/Express)

```javascript
const axios = require('axios');

// Cashfree Config
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_PUBLIC_KEY = process.env.CASHFREE_PUBLIC_KEY;

const CASHFREE_API_URL = 'https://sandbox.cashfree.com'; // For testing
// const CASHFREE_API_URL = 'https://api.cashfree.com'; // For production

// Create Cashfree Order
exports.createCashfreeOrder = async (req, res) => {
  try {
    const { courseId, amount, currency = 'INR' } = req.body;
    const userId = req.user.id;

    // Generate unique order ID
    const orderId = `order_${userId}_${Date.now()}`;

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: userId,
        customer_email: req.user.email,
        customer_phone: req.user.phone || '',
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/cashfree/webhook`,
        upi_notify_url: `${process.env.BACKEND_URL}/api/payments/cashfree/webhook`,
      },
      order_note: `Course Purchase - ID: ${courseId}`,
    };

    // Create session at Cashfree
    const response = await axios.post(
      `${CASHFREE_API_URL}/api/v2/orders`,
      orderData,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        },
      }
    );

    // Save order in database
    await Order.create({
      orderId,
      userId,
      courseId,
      amount,
      paymentGateway: 'cashfree',
      status: 'pending',
      cashfreeOrderId: response.data.order_id,
    });

    res.json({
      success: true,
      data: {
        session_id: response.data.payment_session_id,
        order_id: orderId,
        cashfree_key: CASHFREE_PUBLIC_KEY,
        amount,
        currency,
      },
    });
  } catch (error) {
    console.error('Cashfree order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Cashfree Payment
exports.verifyCashfreePayment = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;
    const userId = req.user.id;

    // Fetch order details from Cashfree
    const response = await axios.get(
      `${CASHFREE_API_URL}/api/v2/orders/${order_id}`,
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': CASHFREE_APP_ID,
          'x-client-secret': CASHFREE_SECRET_KEY,
        },
      }
    );

    const orderStatus = response.data.order_status;

    if (orderStatus === 'PAID') {
      // Update database
      const order = await Order.findOne({ orderId: order_id });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Enroll user in course
      await Enrollment.create({
        userId,
        courseId: order.courseId,
        enrollmentDate: new Date(),
        paymentId: payment_id,
      });

      // Update order status
      order.status = 'completed';
      order.paymentId = payment_id;
      await order.save();

      // Create payment record
      const payment = await Payment.create({
        userId,
        orderId: order_id,
        paymentId: payment_id,
        amount: order.amount,
        currency: 'INR',
        paymentMethod: 'cashfree',
        status: 'success',
        transactionDate: new Date(),
      });

      res.json({
        success: true,
        data: {
          payment_id,
          order_id,
          status: 'SUCCESS',
          amount: order.amount,
          course_enrolled: true,
          payment_db_id: payment._id,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Payment status: ${orderStatus}`,
      });
    }
  } catch (error) {
    console.error('Cashfree payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cashfree Webhook Handler
exports.cashfreeWebhook = async (req, res) => {
  try {
    const { orderId, orderStatus, paymentId } = req.body;

    console.log('Cashfree Webhook Received:', req.body);

    if (orderStatus === 'PAID') {
      const order = await Order.findOne({ orderId });
      if (order) {
        order.status = 'completed';
        order.paymentId = paymentId;
        await order.save();

        // Enrollment logic here
        await Enrollment.create({
          userId: order.userId,
          courseId: order.courseId,
          enrollmentDate: new Date(),
          paymentId: paymentId,
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};
```

## Environment Variables Required

Add these to your backend `.env` file:

```bash
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_PUBLIC_KEY=your_public_key_here
FRONTEND_URL=https://yourfrontend.com
BACKEND_URL=https://yourbackend.com
```

## Frontend Implementation

The `PaymentModal.jsx` component now supports:

1. **Cashfree** - Secure payment gateway with Sandbox environment

## Testing Sandbox Payment

### Cashfree Sandbox Test Credentials:
- Use test cards provided by Cashfree for development
- All transactions are simulated and not real

### Test Card Details:
- **Card Number:** 4111111111111111
- **Expiry:** Any future date (MM/YY)
- **CVV:** Any 3 digits
- **OTP:** 123456 (if prompted)

## Integration Checklist

- [ ] Backend `/api/payments/cashfree/create` endpoint implemented
- [ ] Backend `/api/payments/cashfree/verify` endpoint implemented
- [ ] Backend Webhook handler configured
- [ ] Environment variables set in `.env`
- [ ] Cashfree API credentials obtained from dashboard
- [ ] Test payment in sandbox environment
- [ ] Frontend deployed with updated PaymentModal
- [ ] Test complete flow end-to-end

## Frontend Changes Made

✅ Added Cashfree SDK loader
✅ Added payment method selection (Razorpay/Cashfree)
✅ Integrated `startCashfreePayment()` function
✅ Updated payment UI to show both options
✅ Added Cashfree session state management

## Troubleshooting

### SDK Load Error
- Ensure Cashfree script URL is accessible: `https://sdk.cashfree.com/js/cashfree.js`
- Check browser console for network errors

### Session ID Missing
- Backend must return valid session_id in response
- Verify Cashfree API credentials are correct

### Payment Not Processing
- Check if order amount is valid (minimum check from Cashfree)
- Verify customer details are properly passed
- Check webhook logs for missed updates

## Next Steps

1. Implement backend endpoints as shown above
2. Test with sandbox credentials
3. Deploy and verify complete flow
4. Switch to production credentials when ready
5. Monitor webhook logs for payment updates

