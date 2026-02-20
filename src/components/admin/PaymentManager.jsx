import { useState, useEffect } from 'react';
import apiFetch from '../../api/fetch';

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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 22px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
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
    align-items: center;
  }

  .search-box {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    font-size: 14px;
    color: var(--text);
    font-family: 'Outfit', sans-serif;
  }

  .search-box::placeholder {
    color: var(--muted);
  }

  .filter-select {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    font-size: 14px;
    color: var(--text);
    font-family: 'Outfit', sans-serif;
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

  .pm-table thead {
    background: #f8fafb;
    border-bottom: 1px solid var(--border);
  }

  .pm-table th {
    padding: 16px 20px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pm-table td {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }

  .pm-table tbody tr:hover {
    background: #f8fafb;
  }

  .pm-table tbody tr:last-child td {
    border-bottom: none;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-weight: 600;
    color: var(--text);
  }

  .user-email {
    font-size: 12px;
    color: var(--muted);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    width: fit-content;
  }

  .status-completed {
    background: var(--green-l);
    color: var(--green);
  }

  .status-pending {
    background: var(--amber-l);
    color: var(--amber);
  }

  .status-failed {
    background: var(--rose-l);
    color: var(--rose);
  }

  .txn-id {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: #f0f4ff;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--primary);
    font-weight: 500;
  }

  .action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
  }

  .invoice-btn {
    background: var(--primary);
    color: white;
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

  .amount {
    font-weight: 600;
    color: var(--green);
  }

  .course-title {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

const PaymentManager = () => {
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
      const response = await apiFetch('/payments/admin/all-payments');
      setPayments(response.data || []);
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/invoice/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      payment.name.toLowerCase().includes(search.toLowerCase()) ||
      payment.email.toLowerCase().includes(search.toLowerCase()) ||
      payment.course_title.toLowerCase().includes(search.toLowerCase()) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || payment.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalPayments: payments.length,
    totalRevenue: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    completedCount: payments.filter((p) => p.payment_status === 'completed').length,
    pendingCount: payments.filter((p) => p.payment_status === 'pending').length,
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="pm-root">
      <style>{css}</style>

      {/* Header */}
      <div className="pm-header">
        <div>
          <h1 className="pm-title">💳 Payment Management</h1>
          <p className="pm-subtitle">
            View and manage all student payments and invoices
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="pm-stats">
        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#e0e1ff' }}>
            💰
          </div>
          <div className="stat-content">
            <div className="stat-value">₹{stats.totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            ✅
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedCount}</div>
            <div className="stat-label">Completed Payments</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            ⏳
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingCount}</div>
            <div className="stat-label">Pending Payments</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon" style={{ background: '#e0e1ff' }}>
            📊
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPayments}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="pm-controls">
        <input
          type="text"
          placeholder="Search by name, email, course, or transaction ID..."
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
        <button onClick={fetchPayments} className="action-btn" style={{ background: '#6366f1', color: 'white' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="error-msg">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading payments...
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div>No payments found</div>
          {search || statusFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
              className="action-btn"
              style={{ background: '#6366f1', color: 'white', marginTop: '8px' }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Student Info</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{payment.name}</span>
                      <span className="user-email">{payment.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="course-title" title={payment.course_title}>
                      {payment.course_title}
                    </span>
                  </td>
                  <td>
                    <span className="amount">₹{Number(payment.amount).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="txn-id">{payment.transaction_id || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(payment.payment_status)}`}>
                      {payment.payment_status.charAt(0).toUpperCase() +
                        payment.payment_status.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(payment.created_at)}</td>
                  <td>
                    <button
                      onClick={() => handleDownloadInvoice(payment.id)}
                      disabled={downloadingId === payment.id}
                      className="action-btn invoice-btn"
                    >
                      {downloadingId === payment.id ? '...Downloading' : '📥 Invoice'}
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

export default PaymentManager;
