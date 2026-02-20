/**
 * BACKEND API ROUTES - Cashfree Payment Integration
 * Add these routes to your backend (Express.js example)
 * 
 * Location: backend/routes/payments.js or similar
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// CASHFREE API CONFIGURATION
// ============================================

const CASHFREE_CONFIG = {
  APP_ID: process.env.CASHFREE_APP_ID, // From Cashfree Dashboard
  SECRET_KEY: process.env.CASHFREE_SECRET_KEY, // From Cashfree Dashboard
  PUBLIC_KEY: process.env.CASHFREE_PUBLIC_KEY, // From Cashfree Dashboard
  API_URL: 'https://sandbox.cashfree.com/api/v2', // Sandbox environment
  // API_URL: 'https://api.cashfree.com/api/v2', // Production environment
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique order ID
 */
const generateOrderId = (userId) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD_${userId}_${timestamp}_${random}`;
};

/**
 * Make Cashfree API request
 */
const makeCashfreeRequest = async (method, endpoint, data = null) => {
  try {
    const headers = {
      'x-api-version': '2022-09-01',
      'x-client-id': CASHFREE_CONFIG.APP_ID,
      'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
      'Content-Type': 'application/json',
    };

    const url = `${CASHFREE_CONFIG.API_URL}${endpoint}`;

    const config = {
      method,
      url,
      headers,
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Cashfree API Error:', error.response?.data || error.message);
    throw error;
  }
};

// ============================================
// ROUTES
// ============================================

/**
 * @route   POST /api/payments/cashfree/create
 * @desc    Create a Cashfree payment order
 * @access  Private
 * @body    { courseId, amount, currency }
 * @returns { success, data: { session_id, order_id, cashfree_key, amount, currency } }
 */
router.post('/cashfree/create', authenticateToken, async (req, res) => {
  try {
    console.log('📦 Creating Cashfree Order...');
    
    const { courseId, amount, currency = 'INR' } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Generate unique order ID
    const orderId = generateOrderId(userId);

    // Prepare order payload for Cashfree
    const orderPayload = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: currency,
      order_note: `Course Enrollment - ID: ${courseId}`,
      customer_details: {
        customer_id: userId.toString(),
        customer_email: userEmail,
        customer_phone: req.user.phone || '+91-0000000000', // Provide phone if available
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/cashfree/webhook`,
        upi_notify_url: `${process.env.BACKEND_URL}/api/payments/cashfree/webhook`,
      },
    };

    console.log('Sending to Cashfree:', orderPayload);

    // Create order at Cashfree
    const cashfreeResponse = await makeCashfreeRequest(
      'POST',
      '/orders',
      orderPayload
    );

    console.log('Cashfree Response:', cashfreeResponse);

    // Extract session ID from response
    const sessionId = cashfreeResponse.payment_session_id;
    
    if (!sessionId) {
      throw new Error('Failed to get session ID from Cashfree');
    }

    // Save order in database (example using simple object - adapt to your DB)
    // await Order.create({
    //   orderId,
    //   userId,
    //   courseId,
    //   amount,
    //   currency,
    //   paymentGateway: 'cashfree',
    //   status: 'pending',
    //   sessionId,
    //   createdAt: new Date(),
    // });

    // You should implement actual database save:
    console.log('✅ Order created successfully');

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        order_id: orderId,
        cashfree_key: CASHFREE_CONFIG.PUBLIC_KEY,
        amount: parseFloat(amount),
        currency,
      },
    });
  } catch (error) {
    console.error('❌ Error creating Cashfree order:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/payments/cashfree/verify
 * @desc    Verify Cashfree payment and enroll user in course
 * @access  Private
 * @body    { order_id, payment_id, courseId, amount }
 * @returns { success, data: { payment_id, order_id, status, amount, course_enrolled } }
 */
router.post('/cashfree/verify', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Verifying Cashfree Payment...');
    
    const { order_id, payment_id, courseId, amount } = req.body;
    const userId = req.user.id;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Get order details from Cashfree
    const orderDetails = await makeCashfreeRequest(
      'GET',
      `/orders/${order_id}`
    );

    console.log('Order Details from Cashfree:', orderDetails);

    const paymentStatus = orderDetails.order_status;

    if (paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: `Payment status: ${paymentStatus}. Expected: PAID`,
      });
    }

    // Verify amount matches
    if (parseFloat(orderDetails.order_amount) !== parseFloat(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch - potential fraud attempt',
      });
    }

    // Update your database - mark order as completed
    // await Order.updateOne(
    //   { orderId: order_id },
    //   {
    //     status: 'completed',
    //     paymentId: payment_id,
    //     verifiedAt: new Date(),
    //   }
    // );

    // Enroll user in course
    // await Enrollment.create({
    //   userId,
    //   courseId,
    //   enrollmentDate: new Date(),
    //   paymentId: payment_id,
    //   paymentGateway: 'cashfree',
    // });

    // Create payment record
    // await Payment.create({
    //   userId,
    //   orderId: order_id,
    //   paymentId: payment_id,
    //   amount: parseFloat(amount),
    //   currency: 'INR',
    //   paymentMethod: 'cashfree',
    //   status: 'success',
    //   transactionDate: new Date(),
    // });

    console.log('✅ Payment verified and order updated');

    res.json({
      success: true,
      data: {
        payment_id: payment_id,
        order_id: order_id,
        status: 'SUCCESS',
        amount: parseFloat(amount),
        course_enrolled: true,
      },
    });
  } catch (error) {
    console.error('❌ Error verifying Cashfree payment:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @route   POST /api/payments/cashfree/webhook
 * @desc    Cashfree Webhook handler for payment status updates
 * @access  Public (but verify signature in production)
 * @body    Cashfree webhook payload
 */
router.post('/cashfree/webhook', async (req, res) => {
  try {
    console.log('🔔 Cashfree Webhook Received:', req.body);

    const { event, data } = req.body;

    if (event === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { orderId, payment, order } = data;

      console.log('💰 Payment Success Webhook');
      console.log('Order ID:', orderId);
      console.log('Payment Status:', payment.paymentStatus);
      console.log('Payment ID:', payment.paymentId);

      // Update order status in database
      // await Order.updateOne(
      //   { orderId },
      //   {
      //     status: 'completed',
      //     paymentId: payment.paymentId,
      //     webhookVerifiedAt: new Date(),
      //   }
      // );

      // Enroll user in course if not already
      // const orderData = await Order.findOne({ orderId });
      // if (orderData && !orderData.enrollmentProcessed) {
      //   await Enrollment.create({
      //     userId: orderData.userId,
      //     courseId: orderData.courseId,
      //     enrollmentDate: new Date(),
      //     paymentId: payment.paymentId,
      //     paymentGateway: 'cashfree',
      //   });

      //   await Order.updateOne(
      //     { orderId },
      //     { enrollmentProcessed: true }
      //   );
      // }

      res.json({ success: true });
    } else {
      console.log('⚠️ Other webhook event:', event);
      res.json({ success: true });
    }
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

// ============================================
// DATABASE MODELS (Example - Adapt to your DB)
// ============================================

/*
// Order Schema (MongoDB example)
const orderSchema = new Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Number },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentGateway: { type: String, enum: ['razorpay', 'cashfree'] },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  sessionId: String,
  paymentId: String,
  enrollmentProcessed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  webhookVerifiedAt: Date,
});

// Enrollment Schema
const enrollmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Number, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  paymentId: String,
  paymentGateway: String,
  status: { type: String, default: 'active' },
});

// Payment Schema
const paymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: String,
  paymentId: String,
  amount: Number,
  currency: String,
  paymentMethod: String,
  status: String,
  transactionDate: { type: Date, default: Date.now },
});
*/

// ============================================
// ENVIRONMENT VARIABLES NEEDED
// ============================================

/*
# .env file
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_PUBLIC_KEY=your_public_key
FRONTEND_URL=https://yourfrontend.com
BACKEND_URL=https://yourbackend.com
NODE_ENV=development
*/
