import { useState, useEffect, useRef } from 'react';

// Load Cashfree SDK
const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  .pm-overlay {
    position: fixed; inset: 0;
    background: rgba(2, 8, 20, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 60;
    backdrop-filter: blur(6px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }

  .pm-box {
    font-family: 'Sora', sans-serif;
    width: 100%; max-width: 480px;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: slideUp 0.25s ease;
  }

  .pm-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
    padding: 24px 28px 20px;
    position: relative;
  }
  .pm-header-label {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    color: #60a5fa; text-transform: uppercase; margin-bottom: 6px;
  }
  .pm-header-title {
    font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 2px;
  }
  .pm-header-secure {
    font-size: 12px; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-top: 4px;
  }
  .pm-lock { font-size: 11px; }

  .pm-body { padding: 24px 28px 28px; }

  .pm-summary {
    background: #f8faff;
    border: 1px solid #e0e7ff;
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pm-course-name { font-size: 14px; font-weight: 600; color: #1e293b; }
  .pm-course-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
  .pm-amount-badge {
    background: #1a1a2e;
    color: #fff;
    font-size: 18px; font-weight: 700;
    padding: 8px 16px;
    border-radius: 10px;
    white-space: nowrap;
  }

  .pm-section-label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: #94a3b8; margin-bottom: 10px;
  }

  .pm-method-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 22px; }
  .pm-method {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #fff;
  }
  .pm-method:hover { border-color: #818cf8; background: #fafbff; }
  .pm-method.selected { border-color: #4f46e5; background: #eef2ff; }
  .pm-method-icon { font-size: 22px; width: 32px; text-align: center; }
  .pm-method-info { flex: 1; }
  .pm-method-name { font-size: 14px; font-weight: 600; color: #1e293b; }
  .pm-method-desc { font-size: 12px; color: #64748b; margin-top: 1px; }
  .pm-method-check {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: transparent;
    transition: all 0.15s;
  }
  .pm-method.selected .pm-method-check {
    background: #4f46e5; border-color: #4f46e5; color: #fff;
  }

  .pm-status-box {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    margin-bottom: 16px;
    font-size: 13px; font-weight: 500;
  }
  .pm-status-box.info { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .pm-status-box.error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .pm-spin {
    width: 14px; height: 14px;
    border: 2px solid #93c5fd;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg) } }

  .pm-actions { display: flex; gap: 10px; margin-top: 4px; }
  .pm-btn-cancel {
    padding: 13px 20px;
    border-radius: 11px; border: 1.5px solid #e2e8f0;
    background: #fff; color: #64748b;
    font-family: 'Sora', sans-serif;
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.15s;
  }
  .pm-btn-cancel:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
  .pm-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

  .pm-btn-pay {
    flex: 1; padding: 13px 20px;
    border-radius: 11px; border: none;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff;
    font-family: 'Sora', sans-serif;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 4px 14px rgba(79,70,229,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .pm-btn-pay:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.45); }
  .pm-btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .pm-badge {
    text-align: center; margin-top: 16px;
    font-size: 11px; color: #94a3b8;
  }
`;

const BASE_URL = import.meta.env.VITE_API_URL || '';

const token = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
});

const PaymentModal = ({
  amount = 0,
  courseId = null,
  courseName = 'Course Enrollment',
  onClose = () => {},
  onSuccess = () => {},
}) => {
  const [processing, setProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const startCashfreePayment = async () => {
    console.log('=== startCashfreePayment called ===');
    console.log('BASE_URL:', BASE_URL);
    console.log('amount:', amount, 'courseId:', courseId);
    console.log('token:', token());
    
    setProcessing(true);
    setErrorMsg('');
    setStatusMsg('Initializing Cashfree…');

    try {
      /* Step 1: Create Cashfree order on backend */
      console.log('Creating Cashfree order at:', `${BASE_URL}/api/payments/cashfree/create`);
      
      const createRes = await fetch(`${BASE_URL}/api/payments/cashfree/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          courseId: courseId ? parseInt(courseId) : null,
          amount: parseFloat(amount),
          currency: 'INR',
        }),
      });

      console.log('Response status:', createRes.status);
      const createJson = await createRes.json();
      console.log('Response JSON:', createJson);
      
      if (!createJson.success) throw new Error(createJson.message || 'Order creation failed');

      const { session_id, order_id, cashfree_key } = createJson.data;
      console.log('Extracted:', { session_id, order_id, cashfree_key });
      
      if (!session_id) throw new Error('Missing session ID from server');
      
      console.log('Order created:', order_id);

      setSessionId(session_id);

      /* Step 2: Load Cashfree SDK */
      setStatusMsg('Loading secure checkout…');
      const cashfreeLoaded = await loadCashfreeScript();
      if (!cashfreeLoaded) {
        throw new Error('Failed to load Cashfree SDK. Please check your internet connection.');
      }
      console.log('Cashfree SDK loaded');

      /* Step 3: Initialize Cashfree Checkout */
      setStatusMsg('Opening Cashfree checkout…');
      
      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not available');
      }

      // Initialize Cashfree SDK
      window.Cashfree.setPublicKey(cashfree_key);

      // Create checkout options
      const checkoutOptions = {
        paymentSessionId: session_id,
        redirectTarget: '_self',
      };

      // Open Cashfree checkout modal
      window.Cashfree.checkout(checkoutOptions).then((response) => {
        console.log('Cashfree response:', response);
        
        if (response.error) {
          throw new Error('Payment failed: ' + response.error.message);
        }

        if (response.redirect) {
          /* Redirect to payment page or success page */
          console.log('Redirecting to:', response.redirect);
          window.location.href = response.redirect;
        }
      }).catch((error) => {
        console.error('Cashfree error:', error);
        setProcessing(false);
        setStatusMsg('');
        setErrorMsg(error.message || 'Payment failed');
      });

    } catch (e) {
      console.error('❌ Payment error:', e);
      setProcessing(false);
      setStatusMsg('');
      if (e.message !== 'Payment cancelled by user') {
        setErrorMsg(e.message || 'Something went wrong. Please try again.');
      }
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {};
  }, []);

  return (
    <div
      className="pm-overlay"
      onClick={(e) => e.target.classList.contains('pm-overlay') && !processing && onClose()}
    >
      <style>{css}</style>
      <div className="pm-box">

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-label">Secure Checkout</div>
          <div className="pm-header-title">Complete Your Purchase</div>
          <div className="pm-header-secure">
            <span className="pm-lock">🔒</span>
            256-bit SSL encrypted · PCI DSS compliant
          </div>
        </div>

        <div className="pm-body">

          {/* Order Summary */}
          <div className="pm-summary">
            <div>
              <div className="pm-course-name">{courseName}</div>
              <div className="pm-course-sub">Course ID: {courseId ?? 'N/A'}</div>
            </div>
            <div className="pm-amount-badge">
              ₹{parseFloat(amount).toFixed(2)}
            </div>
          </div>

          {/* Payment Method - Cashfree Only */}
          <div className="pm-section-label">Payment Gateway</div>
          <div className="pm-method-grid">
            <div className="pm-method selected" style={{ cursor: 'default' }}>
              <div className="pm-method-icon">🪙</div>
              <div className="pm-method-info">
                <div className="pm-method-name">Cashfree</div>
                <div className="pm-method-desc">Secure & Fast Checkout</div>
              </div>
              <div className="pm-method-check">✓</div>
            </div>
          </div>

          {/* Status / Error / Info */}
          {statusMsg && (
            <div className="pm-status-box info">
              <div className="pm-spin" />
              {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div className="pm-status-box error">
              ⚠️ {errorMsg}
            </div>
          )}
          {!statusMsg && !errorMsg && (
            <div className="pm-status-box info" style={{ fontSize: '12px', fontWeight: '500' }}>
              🔒 Secure payment powered by Cashfree
            </div>
          )}

          {/* Actions */}
          <div className="pm-actions">
            <button
              className="pm-btn-cancel"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              className="pm-btn-pay"
              onClick={() => {
                console.log('Pay button clicked');
                startCashfreePayment();
              }}
              disabled={processing}
            >
              {processing
                ? <><div className="pm-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Processing…</>
                : `Pay ₹${parseFloat(amount).toFixed(2)}`
              }
            </button>
          </div>

          {/* Security badge */}
          <div className="pm-badge">
            🔒 Secure payment powered by Cashfree
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;