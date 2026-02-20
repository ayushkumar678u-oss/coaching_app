import { useState, useEffect } from 'react';
import apiFetch from '../../api/fetch.jsx';

export default function AdminSupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [responseText, setResponseText] = useState('');
    const [responseSending, setResponseSending] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
    });

    // Fetch tickets
    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/support/admin/all-tickets?limit=100&offset=0', { method: 'GET' });
            if (response.success) {
                const allTickets = response.data || [];
                setTickets(allTickets);

                // Calculate stats
                setStats({
                    total: allTickets.length,
                    open: allTickets.filter(t => t.status === 'open').length,
                    in_progress: allTickets.filter(t => t.status === 'in_progress').length,
                    resolved: allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
                });
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!selectedTicket || !responseText.trim()) return;

        try {
            setResponseSending(true);
            const newStatus = selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status;
            const response = await apiFetch(`/support/admin/tickets/${selectedTicket.id}/response`, {
                method: 'PUT',
                body: JSON.stringify({
                    response: responseText,
                    status: newStatus,
                }),
            });

            if (response.success) {
                setResponseText('');
                fetchTickets();
                setSelectedTicket(null);
            }
        } catch (error) {
            console.error('Error sending response:', error);
        } finally {
            setResponseSending(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedTicket) return;

        try {
            const response = await apiFetch(`/support/admin/tickets/${selectedTicket.id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.success) {
                fetchTickets();
                setSelectedTicket(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
        const matchesSearch = 
            ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesPriority && matchesSearch;
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
            <span style={{
                backgroundColor: s.bg,
                color: s.color,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block',
            }}>
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
            <span style={{
                backgroundColor: priorityMap[priority] || '#4dabf7',
                color: '#fff',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-block',
            }}>
                {priority.toUpperCase()}
            </span>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📞 Support Tickets</h1>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.total}</div>
                    <div style={styles.statLabel}>Total Tickets</div>
                </div>
                <div style={{ ...styles.statCard, borderLeftColor: '#ff6b6b' }}>
                    <div style={styles.statNumber}>{stats.open}</div>
                    <div style={styles.statLabel}>Open</div>
                </div>
                <div style={{ ...styles.statCard, borderLeftColor: '#ffd43b' }}>
                    <div style={styles.statNumber}>{stats.in_progress}</div>
                    <div style={styles.statLabel}>In Progress</div>
                </div>
                <div style={{ ...styles.statCard, borderLeftColor: '#51cf66' }}>
                    <div style={styles.statNumber}>{stats.resolved}</div>
                    <div style={styles.statLabel}>Resolved</div>
                </div>
            </div>

            {/* Controls */}
            <div style={styles.controlsContainer}>
                <input
                    type="text"
                    placeholder="🔍 Search by title, description, or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={styles.searchInput}
                />

                <div style={styles.filterGroup}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={styles.select}
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        style={styles.select}
                    >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>

            {/* Tickets Grid */}
            <div style={styles.contentContainer}>
                <div style={styles.ticketsListContainer}>
                    {loading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.spinner}></div>
                            <p>Loading tickets...</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div style={styles.emptyState}>
                            <p>No tickets found</p>
                        </div>
                    ) : (
                        <div style={styles.ticketsList}>
                            {filteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    style={{
                                        ...styles.ticketItem,
                                        ...(selectedTicket?.id === ticket.id ? styles.ticketItemActive : {}),
                                    }}
                                >
                                    <div style={styles.ticketItemHeader}>
                                        <div style={styles.ticketItemTitle}>{ticket.title}</div>
                                        {getStatusBadge(ticket.status)}
                                    </div>
                                    <p style={styles.ticketItemDesc}>{ticket.description.substring(0, 80)}...</p>
                                    <div style={styles.ticketItemMeta}>
                                        <span>{ticket.user_name || 'Unknown'}</span>
                                        {getPriorityBadge(ticket.priority)}
                                        <span style={styles.ticketItemDate}>
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                {selectedTicket && (
                    <div style={styles.detailsPanel}>
                        <button
                            onClick={() => setSelectedTicket(null)}
                            style={styles.closeBtn}
                        >
                            ✕
                        </button>

                        <h2 style={styles.detailsTitle}>{selectedTicket.title}</h2>

                        <div style={styles.detailsBadges}>
                            {getStatusBadge(selectedTicket.status)}
                            {getPriorityBadge(selectedTicket.priority)}
                        </div>

                        <div style={styles.detailsGrid}>
                            <div>
                                <label style={styles.detailsLabel}>User</label>
                                <p style={styles.detailsValue}>{selectedTicket.user_name || 'Unknown'}</p>
                            </div>
                            <div>
                                <label style={styles.detailsLabel}>Category</label>
                                <p style={styles.detailsValue}>{selectedTicket.category}</p>
                            </div>
                            <div>
                                <label style={styles.detailsLabel}>Created</label>
                                <p style={styles.detailsValue}>
                                    {new Date(selectedTicket.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <label style={styles.detailsLabel}>Updated</label>
                                <p style={styles.detailsValue}>
                                    {new Date(selectedTicket.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Description</h3>
                            <p style={styles.descriptionText}>{selectedTicket.description}</p>
                        </div>

                        {selectedTicket.response && (
                            <div style={styles.responseSection}>
                                <h3 style={styles.sectionTitle}>Your Response</h3>
                                <p style={styles.responseText}>{selectedTicket.response}</p>
                            </div>
                        )}

                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Status</h3>
                            <select
                                value={selectedTicket.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                style={styles.statusSelect}
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {selectedTicket.status !== 'closed' && (
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Add Response</h3>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Type your response here..."
                                    style={styles.responseInput}
                                    disabled={responseSending}
                                />
                                <button
                                    onClick={handleSendResponse}
                                    style={styles.sendBtn}
                                    disabled={!responseText.trim() || responseSending}
                                >
                                    {responseSending ? '⏳ Sending...' : '✓ Send Response'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '24px',
        maxWidth: '1600px',
        margin: '0 auto',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    header: {
        marginBottom: '24px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a202c',
        margin: '0',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        borderLeft: '4px solid #007bff',
    },
    statNumber: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a202c',
    },
    statLabel: {
        fontSize: '13px',
        color: '#666',
        marginTop: '6px',
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
    filterGroup: {
        display: 'flex',
        gap: '12px',
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
    contentContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        gap: '16px',
        minHeight: '500px',
    },
    ticketsListContainer: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    ticketsList: {
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    ticketItem: {
        padding: '16px',
        borderBottom: '1px solid #dee2e6',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: '#fff',
    },
    ticketItemActive: {
        backgroundColor: '#e7f1ff',
        borderLeftColor: '#007bff',
        borderLeft: '4px solid #007bff',
    },
    ticketItemHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '8px',
        marginBottom: '8px',
    },
    ticketItemTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1a202c',
        flex: 1,
    },
    ticketItemDesc: {
        fontSize: '12px',
        color: '#666',
        margin: '6px 0',
        lineHeight: '1.4',
    },
    ticketItemMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#999',
        gap: '8px',
    },
    ticketItemDate: {
        fontSize: '11px',
        color: '#bbb',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        color: '#999',
        fontSize: '14px',
    },
    detailsPanel: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        padding: '20px',
        overflow: 'auto',
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'transparent',
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
    detailsTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '12px',
        paddingRight: '32px',
    },
    detailsBadges: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        flexWrap: 'wrap',
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #dee2e6',
    },
    detailsLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#888',
        display: 'block',
        marginBottom: '4px',
    },
    detailsValue: {
        fontSize: '14px',
        color: '#333',
        margin: '0',
    },
    section: {
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #dee2e6',
    },
    sectionTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1a202c',
        marginBottom: '8px',
    },
    descriptionText: {
        fontSize: '13px',
        lineHeight: '1.6',
        color: '#555',
        margin: '0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    responseSection: {
        backgroundColor: '#f0f7ff',
        padding: '12px',
        borderRadius: '6px',
        borderLeft: '4px solid #007bff',
        marginBottom: '16px',
    },
    responseText: {
        fontSize: '13px',
        lineHeight: '1.6',
        color: '#333',
        margin: '0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
    statusSelect: {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'inherit',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    responseInput: {
        width: '100%',
        minHeight: '100px',
        padding: '10px 12px',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'inherit',
        resize: 'vertical',
        marginBottom: '10px',
    },
    sendBtn: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
};
