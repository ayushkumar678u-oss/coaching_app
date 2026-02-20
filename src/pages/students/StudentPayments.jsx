import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  .pm-root {
    --bg:        #f0f4ff;
    --surface:   #ffffff;
    --border:    #e4e9f7;
    --text:      #1a1d2e;
    --muted:     #7b82a0;
    --primary:   #6366f1;
    --primary-l: #e0e1ff;
    --green:     #10b981;
    --green-l:   #d1fae5;
    --amber:     #f59e0b;
    --amber-l:   #fef3c7;
    --rose:      #f43f5e;
    --rose-l:    #ffe4e8;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    background: var(--bg);
    min-height: 100vh;
    padding: 32px 28px;
  }
  .pm-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .pm-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .pm-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--text);
  }

  .pm-subtitle {
    font-size: 13px;
    color: var(--muted);
    margin-top: 4px;
  }

  .pm-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--primary);
  }

  .stat-label {
    font-size: 12px;
    color: var(--muted);
    font-weight: 400;
  }

  .pm-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .search-box {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    flex: 1;
    min-width: 200px;
    background: var(--surface);
  }

  .filter-select {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    background: var(--surface);
    cursor: pointer;
  }

  .pm-table-wrapper {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .pm-table {
    width: 100%;
    border-collapse: collapse;
  }

  .pm-table th {
    background: var(--primary-l);
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: var(--primary);
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pm-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }

  .pm-table tr:last-child td { border-bottom: none; }

  .status-completed {
    background: var(--green-l);
    color: var(--green);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .status-pending {
    background: var(--amber-l);
    color: var(--amber);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .status-failed {
    background: var(--rose-l);
    color: var(--rose);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 12px;
    display: inline-block;
  }

  .txn-id {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    background: #f0f4ff;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--primary);
    font-weight: 500;
  }

  .invoice-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    background: var(--primary);
    color: white;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
  }

  .invoice-btn:hover {
    background: #4f46e5;
    transform: translateY(-1px);
  }

  .invoice-btn:disabled {
    background: var(--muted);
    cursor: not-allowed;
    transform: none;
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    font-size: 16px;
    color: var(--muted);
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--border);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 12px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-msg {
    background: var(--rose-l);
    color: var(--rose);
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 12px;
    font-size: 16px;
    color: var(--muted);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }

  @media (max-width: 1024px) {
    .pm-root {
      padding: 20px 16px;
    }

    .pm-stats {
      grid-template-columns: 1fr 1fr;
    }

    .pm-table {
      font-size: 12px;
    }

    .pm-table th,
    .pm-table td {
      padding: 12px 10px;
    }
  }

  @media (max-width: 640px) {
    .pm-stats {
      grid-template-columns: 1fr;
    }

    .pm-controls {
      flex-direction: column;
    }

    .search-box,
    .filter-select {
      width: 100%;
    }

    .pm-table {
      font-size: 11px;
    }

    .pm-table th,
    .pm-table td {
      padding: 8px 6px;
    }
  }
`;

const StudentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/payments/my-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch payments');

      const data = await response.json();
      setPayments(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      setDownloadingId(paymentId);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BASE_URL}/api/payments/invoice/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${paymentId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download invoice: ' + err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (payment.course_title || '').toLowerCase().includes(search.toLowerCase()) ||
      (payment.transaction_id || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || payment.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalPayments: payments.length,
    totalSpent: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    completedCount: payments.filter((p) => p.payment_status === 'completed').length,
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="pm-root">
      <style>{css}</style>

      <div className="pm-header">
        <div>
          <div className="pm-title">Payment History</div>
          <div className="pm-subtitle">View all your course payments and invoices</div>
        </div>
      </div>

      {/* Stats */}
      <div className="pm-stats">
        <div className="stat-box">
          <div className="stat-value">{stats.totalPayments}</div>
          <div className="stat-label">Total Payments</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">₹{stats.totalSpent.toFixed(2)}</div>
          <div className="stat-label">Total Spent</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{stats.completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {error && (
        <div className="error-msg">⚠️ {error}</div>
      )}

      {/* Controls */}
      <div className="pm-controls">
        <input
          type="text"
          placeholder="Search by course or transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading payments...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <div>No payments found</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {payments.length === 0 ? 'You haven\'t made any payments yet' : 'No payments match your search'}
          </div>
        </div>
      ) : (
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.course_title || 'Course'}</td>
                  <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                  <td>
                    <span className={getStatusBadgeClass(payment.payment_status)}>
                      {payment.payment_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    {payment.transaction_id ? (
                      <span className="txn-id">{payment.transaction_id.substring(0, 12)}...</span>
                    ) : (
                      <span style={{ opacity: 0.5 }}>N/A</span>
                    )}
                  </td>
                  <td>{formatDate(payment.created_at)}</td>
                  <td>
                    <button
                      onClick={() => handleDownloadInvoice(payment.id)}
                      disabled={downloadingId === payment.id}
                      className="invoice-btn"
                    >
                      {downloadingId === payment.id ? '⏳' : '📥'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;
