import { useState, useEffect } from 'react';
import apiFetch from '../../api/fetch.jsx';
import './StudentSupport.css';

export default function StudentSupport() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Fetch tickets
    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/support/my-tickets', { method: 'GET' });
            if (response.success) {
                setTickets(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.title.trim() || !formData.description.trim()) {
            setFormError('Title and description are required');
            return;
        }

        try {
            setFormSubmitting(true);
            const response = await apiFetch('/support/tickets', { method: 'POST', body: JSON.stringify(formData) });

            if (response.success) {
                setFormSuccess('Ticket created successfully!');
                setFormData({
                    title: '',
                    description: '',
                    category: 'other',
                    priority: 'medium',
                });
                setShowForm(false);
                setTimeout(() => {
                    fetchTickets();
                    setFormSuccess('');
                }, 1500);
            } else {
                setFormError(response.message || 'Failed to create ticket');
            }
        } catch (error) {
            setFormError(error.message || 'Error creating ticket');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleCloseTicket = async (ticketId) => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;

        try {
            const response = await apiFetch(`/support/tickets/${ticketId}/close`, { method: 'PUT' });
            if (response.success) {
                fetchTickets();
                setSelectedTicket(null);
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    };

    // Filter and search tickets
    const filteredTickets = tickets.filter((ticket) => {
        const matchesFilter =
            filter === 'all' ||
            ticket.status === filter ||
            (filter === 'open' && ticket.status === 'open') ||
            (filter === 'closed' && (ticket.status === 'resolved' || ticket.status === 'closed'));

        const matchesSearch =
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            open: { bg: '#ff6b6b', color: '#fff', label: 'Open' },
            in_progress: { bg: '#ffd43b', color: '#000', label: 'In Progress' },
            resolved: { bg: '#51cf66', color: '#fff', label: 'Resolved' },
            closed: { bg: '#868e96', color: '#fff', label: 'Closed' },
        };
        const s = statusMap[status] || statusMap.open;
        return (
            <span
                style={{
                    backgroundColor: s.bg,
                    color: s.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                }}
            >
                {s.label}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            low: '#4dabf7',
            medium: '#ffa94d',
            high: '#ff8787',
            critical: '#ff0000',
        };
        return (
            <span
                style={{
                    backgroundColor: priorityMap[priority] || '#4dabf7',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'inline-block',
                }}
            >
                {priority.toUpperCase()}
            </span>
        );
    };

    const getCategoryLabel = (category) => {
        const labels = {
            technical: '🔧 Technical',
            course: '📚 Course',
            payment: '💳 Payment',
            enrollment: '📝 Enrollment',
            other: '❓ Other',
        };
        return labels[category] || category;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📞 Support Tickets</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ ...styles.button, ...styles.createButton }}
                >
                    {showForm ? '✕ Cancel' : '+ Create Ticket'}
                </button>
            </div>

            {/* Create Ticket Form */}
            {showForm && (
                <div style={styles.formContainer}>
                    <h2 style={{ marginBottom: '20px', fontSize: '18px' }}>Create New Support Ticket</h2>

                    {formError && (
                        <div style={{ ...styles.alert, backgroundColor: '#ffe0e0', color: '#c92a2a' }}>
                            {formError}
                        </div>
                    )}
                    {formSuccess && (
                        <div style={{ ...styles.alert, backgroundColor: '#e7f5e7', color: '#2f7d32' }}>
                            {formSuccess}
                        </div>
                    )}

                    <form onSubmit={handleCreateTicket} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Brief title of your issue"
                                style={styles.input}
                                disabled={formSubmitting}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Detailed description of your issue..."
                                style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }}
                                disabled={formSubmitting}
                            />
                        </div>

                        <div style={styles.twoCol}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    disabled={formSubmitting}
                                >
                                    <option value="technical">🔧 Technical Issue</option>
                                    <option value="course">📚 Course Related</option>
                                    <option value="payment">💳 Payment Issue</option>
                                    <option value="enrollment">📝 Enrollment</option>
                                    <option value="other">❓ Other</option>
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                    disabled={formSubmitting}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{ ...styles.button, ...styles.submitButton }}
                            disabled={formSubmitting}
                        >
                            {formSubmitting ? '⏳ Creating...' : '✓ Create Ticket'}
                        </button>
                    </form>
                </div>
            )}

            {/* Search and Filter */}
            <div style={styles.controlsContainer}>
                <input
                    type="text"
                    placeholder="🔍 Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />

                <div style={styles.filterButtons}>
                    {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                ...styles.filterButton,
                                ...(filter === status ? styles.filterButtonActive : {}),
                            }}
                        >
                            {status === 'all'
                                ? 'All'
                                : status === 'in_progress'
                                ? 'In Progress'
                                : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tickets List */}
            {loading ? (
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading tickets...</p>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div style={styles.emptyState}>
                    <p style={{ fontSize: '16px', color: '#666' }}>
                        {tickets.length === 0
                            ? 'No support tickets yet. Create one to get help!'
                            : 'No tickets match your search or filter.'}
                    </p>
                </div>
            ) : (
                <div style={styles.ticketsGrid}>
                    {filteredTickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            style={{
                                ...styles.ticketCard,
                                ...(selectedTicket?.id === ticket.id ? styles.ticketCardActive : {}),
                            }}
                        >
                            <div style={styles.ticketCardHeader}>
                                <div style={styles.ticketCardTitle}>{ticket.title}</div>
                                {getStatusBadge(ticket.status)}
                            </div>
                            <p style={styles.ticketCardDesc}>{ticket.description.substring(0, 100)}...</p>
                            <div style={styles.ticketCardFooter}>
                                <div style={styles.ticketCardMeta}>
                                    {getCategoryLabel(ticket.category)}
                                </div>
                                {getPriorityBadge(ticket.priority)}
                            </div>
                            <div style={styles.ticketCardDate}>
                                Created: {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Ticket Details */}
            {selectedTicket && (
                <div style={styles.detailsContainer}>
                    <button
                        onClick={() => setSelectedTicket(null)}
                        style={styles.closeDetails}
                    >
                        ✕
                    </button>

                    <div style={styles.detailsHeader}>
                        <h2 style={styles.detailsTitle}>{selectedTicket.title}</h2>
                        <div style={styles.detailsBadges}>
                            {getStatusBadge(selectedTicket.status)}
                            {getPriorityBadge(selectedTicket.priority)}
                        </div>
                    </div>

                    <div style={styles.detailsGrid}>
                        <div style={styles.detailsItem}>
                            <label>Category</label>
                            <p>{getCategoryLabel(selectedTicket.category)}</p>
                        </div>
                        <div style={styles.detailsItem}>
                            <label>Created</label>
                            <p>{new Date(selectedTicket.created_at).toLocaleString()}</p>
                        </div>
                    </div>

                    <div style={styles.detailsSection}>
                        <h3>Description</h3>
                        <p style={styles.descriptionText}>{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.response && (
                        <div style={styles.responseSection}>
                            <h3>Admin Response</h3>
                            <p style={styles.responseText}>{selectedTicket.response}</p>
                            {selectedTicket.updated_at && (
                                <p style={styles.responseDate}>
                                    Response received: {new Date(selectedTicket.updated_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}

                    {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                        <button
                            onClick={() => handleCloseTicket(selectedTicket.id)}
                            style={styles.closeButton}
                        >
                            🔒 Close Ticket
                        </button>
                    )}

                    {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
                        <div style={styles.resolvedBanner}>
                            ✓ This ticket has been resolved
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a202c',
        margin: '0',
    },
    button: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    createButton: {
        backgroundColor: '#007bff',
        color: 'white',
    },
    submitButton: {
        backgroundColor: '#28a745',
        color: 'white',
        width: '100%',
        marginTop: '10px',
    },
    formContainer: {
        backgroundColor: '#f8f9fa',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: '1px solid #dee2e6',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    input: {
        padding: '10px 12px',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    },
    select: {
        padding: '10px 12px',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'inherit',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    alert: {
        padding: '12px 16px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px',
        fontWeight: '500',
    },
    controlsContainer: {
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        minWidth: '250px',
        padding: '10px 14px',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
    },
    filterButtons: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },
    filterButton: {
        padding: '8px 14px',
        border: '1px solid #dee2e6',
        backgroundColor: '#fff',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#666',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    filterButtonActive: {
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff',
    },
    ticketsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    ticketCard: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderLeft: '4px solid #007bff',
    },
    ticketCardActive: {
        backgroundColor: '#e7f1ff',
        borderLeftColor: '#0056b3',
        boxShadow: '0 2px 8px rgba(0,123,255,0.2)',
    },
    ticketCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
        gap: '8px',
    },
    ticketCardTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#1a202c',
        flex: 1,
    },
    ticketCardDesc: {
        fontSize: '13px',
        color: '#666',
        margin: '8px 0',
        lineHeight: '1.4',
    },
    ticketCardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        marginTopTop: '8px',
    },
    ticketCardMeta: {
        fontSize: '12px',
        color: '#888',
    },
    ticketCardDate: {
        fontSize: '11px',
        color: '#999',
        marginTop: '8px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        color: '#666',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f0f0f0',
        borderTop: '4px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '16px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 24px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        color: '#666',
    },
    detailsContainer: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '12px',
        padding: '32px',
        position: 'relative',
    },
    closeDetails: {
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#999',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        transition: 'all 0.2s',
    },
    detailsHeader: {
        marginBottom: '24px',
    },
    detailsTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '12px',
    },
    detailsBadges: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '24px',
    },
    detailsItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    detailsSection: {
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid #dee2e6',
    },
    descriptionText: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#555',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    responseSection: {
        backgroundColor: '#f0f7ff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        borderLeft: '4px solid #007bff',
    },
    responseText: {
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#333',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    responseDate: {
        fontSize: '12px',
        color: '#999',
        marginTop: '8px',
    },
    closeButton: {
        padding: '12px 24px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '16px',
        transition: 'all 0.2s',
    },
    resolvedBanner: {
        padding: '12px 16px',
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        marginTop: '16px',
    },
};
