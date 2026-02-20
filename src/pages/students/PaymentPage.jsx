import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PaymentModal from '../../components/students/PaymentModal';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const token = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
});

const css = `
  .pp-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .pp-container {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: slideUp 0.4s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pp-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .pp-title {
    font-size: 24px;
    font-weight: 800;
    color: #1a1d2e;
    margin-bottom: 8px;
  }

  .pp-subtitle {
    font-size: 14px;
    color: #7b82a0;
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .pp-course-info {
    background: #f0f4ff;
    border: 2px solid #e0e7ff;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }

  .pp-course-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1d2e;
  }

  .pp-course-id {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
  }

  .pp-amount-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
    text-align: center;
  }

  .pp-amount-label {
    font-size: 12px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .pp-amount-value {
    font-size: 32px;
    font-weight: 800;
  }

  .pp-message {
    padding: 14px 16px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .pp-message.success {
    background: #d1fae5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }

  .pp-message.error {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .pp-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pp-btn {
    flex: 1;
    padding: 14px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 120px;
  }

  .pp-btn-pay {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
  }

  .pp-btn-pay:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  .pp-btn-pay:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .pp-btn-secondary {
    background: #f0f4ff;
    color: #667eea;
    border: 2px solid #e0e7ff;
  }

  .pp-btn-secondary:hover {
    background: #e0e7ff;
  }

  .pp-invoice-section {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e4e9f7;
  }

  .pp-invoice-title {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .pp-invoice-details {
    background: #f8fafc;
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 12px;
  }

  .pp-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .pp-container {
      padding: 28px 20px;
    }

    .pp-title {
      font-size: 20px;
    }

    .pp-amount-value {
      font-size: 28px;
    }

    .pp-actions {
      flex-direction: column;
    }

    .pp-btn {
      width: 100%;
    }
  }
`;

const PaymentPage = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = parseFloat(searchParams.get('amount')) || 0;
  const courseId = parseInt(searchParams.get('courseId')) || null;
  const courseName = searchParams.get('courseName') || 'Course Enrollment';

  useEffect(() => {
    if (amount && courseId) {
      setShowPaymentModal(true);
    }
  }, [amount, courseId]);

  const handlePaymentSuccess = async (paymentData) => {
    console.log('✅ Payment success:', paymentData);
    setSuccessData(paymentData);
    setMessage({
      type: 'success',
      text: '✅ Payment completed! Your enrollment is confirmed.'
    });
  };

  const handleDownloadInvoice = async () => {
    if (!successData?.payment_id) {
      setMessage({ type: 'error', text: '⚠️ Invoice not available' });
      return;
    }

    try {
      setDownloadingInvoice(true);
      const response = await fetch(
        `${BASE_URL}/api/payments/invoice/${successData.payment_id}`,
        { headers: authHeaders() }
      );

      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${successData.payment_id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: '📥 Invoice downloaded' });
    } catch (err) {
      setMessage({ type: 'error', text: `⚠️ ${err.message}` });
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="pp-root">
      <style>{css}</style>
      
      <div className="pp-container">
        <div className="pp-icon">💳</div>
        <h1 className="pp-title">Course Payment</h1>
        <p className="pp-subtitle">
          Complete your payment to access premium course content and start learning
        </p>

        {courseName && (
          <div className="pp-course-info">
            <div className="pp-course-title">{courseName}</div>
            {courseId && <div className="pp-course-id">Course ID: {courseId}</div>}
          </div>
        )}

        {amount > 0 && (
          <div className="pp-amount-box">
            <div className="pp-amount-label">Amount to Pay</div>
            <div className="pp-amount-value">₹{amount.toFixed(2)}</div>
          </div>
        )}

        {message && (
          <div className={`pp-message ${message.type}`}>
            <span>{message.text}</span>
          </div>
        )}

        <div className="pp-actions">
          {!successData ? (
            <>
              <button
                className="pp-btn pp-btn-secondary"
                onClick={() => navigate('/student/courses')}
              >
                ← Back
              </button>
              <button
                className="pp-btn pp-btn-pay"
                onClick={() => setShowPaymentModal(true)}
                disabled={loading || !amount || !courseId}
              >
                {loading ? <>Processing…</> : `Pay ₹${amount.toFixed(2)}`}
              </button>
            </>
          ) : (
            <>
              <button
                className="pp-btn pp-btn-secondary"
                onClick={() => navigate('/student/courses')}
              >
                📚 My Courses
              </button>
              <button
                className="pp-btn pp-btn-pay"
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
              >
                {downloadingInvoice ? '⏳' : '📥'} Invoice
              </button>
            </>
          )}
        </div>

        {successData && (
          <div className="pp-invoice-section">
            <div className="pp-invoice-title">Invoice</div>
            <div className="pp-invoice-details">
              <div>ID: <strong>{successData.payment_id?.substring(0, 16)}...</strong></div>
              <div style={{ marginTop: 4 }}>Amount: <strong>₹{parseFloat(successData.amount).toFixed(2)}</strong></div>
            </div>
            <button
              className="pp-btn pp-btn-pay"
              style={{ width: '100%' }}
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
            >
              📥 Download Invoice
            </button>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal
          amount={amount}
          courseId={courseId}
          courseName={courseName}
          onClose={() => {
            if (!successData) setShowPaymentModal(false);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PaymentPage;
