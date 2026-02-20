import { useState, useEffect, useRef } from 'react';
import apiFetch from '../../api/fetch.jsx';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await apiFetch('/notifications/unread-count', { method: 'GET' });
            if (response.success) {
                setUnreadCount(response.data?.unread_count || 0);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Fetch unread notifications
    const fetchUnreadNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/notifications/unread?limit=10', { method: 'GET' });
            if (response.success) {
                setNotifications(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            await apiFetch(`/notifications/${notificationId}/read`, { method: 'PUT' });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        try {
            await apiFetch('/notifications/mark-all/read', { method: 'PUT' });
            setNotifications([]);
            setUnreadCount(0);
            setShowDropdown(false);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Delete notification
    const handleDelete = async (notificationId) => {
        try {
            await apiFetch(`/notifications/${notificationId}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            await fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Open dropdown and fetch notifications
    const handleBellClick = () => {
        if (!showDropdown) {
            fetchUnreadNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type) => {
        const iconMap = {
            info: '📢',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            payment: '💳',
            ticket: '🎫',
            enrollment: '📚',
        };
        return iconMap[type] || '📢';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={handleBellClick}
                style={styles.bellButton}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div style={styles.dropdown}>
                    <div style={styles.header}>
                        <h3 style={styles.headerTitle}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                style={styles.clearButton}
                                title="Mark all as read"
                            >
                                ✓ Clear
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={styles.notificationsList}>
                        {loading ? (
                            <div style={styles.loading}>
                                <span style={styles.spinner}></span>
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={styles.empty}>
                                <p>✨ All caught up!</p>
                                <span>No new notifications</span>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} style={styles.notificationItem}>
                                    <div style={styles.notificationContent}>
                                        <div style={styles.notificationIcon}>
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div style={styles.notificationText}>
                                            <div style={styles.notificationTitle}>
                                                {notif.title}
                                            </div>
                                            <div style={styles.notificationMessage}>
                                                {notif.message}
                                            </div>
                                            <div style={styles.notificationTime}>
                                                {formatTime(notif.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.notificationActions}>
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id)}
                                            style={styles.actionButton}
                                            title="Mark as read"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            style={styles.deleteButton}
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div style={styles.footer}>
                            <a href="#notifications" style={styles.viewAllLink}>
                                View all notifications →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        position: 'relative',
        display: 'inline-block',
    },
    bellButton: {
        position: 'relative',
        width: '40px',
        height: '40px',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
    },
    badge: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        backgroundColor: '#ff0000',
        color: '#fff',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 'bold',
        border: '2px solid #fff',
    },
    dropdown: {
        position: 'absolute',
        top: '50px',
        right: '0',
        width: '380px',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        maxHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a1a1a',
        margin: '0',
    },
    clearButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#0066cc',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s',
    },
    notificationsList: {
        flex: 1,
        overflowY: 'auto',
        minHeight: '100px',
        maxHeight: '380px',
    },
    loading: {
        padding: '32px 16px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    spinner: {
        width: '24px',
        height: '24px',
        border: '2px solid #f0f0f0',
        borderTop: '2px solid #0066cc',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    empty: {
        padding: '32px 16px',
        textAlign: 'center',
        color: '#999',
    },
    notificationItem: {
        padding: '12px 16px',
        borderBottom: '1px solid #f5f5f5',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        transition: 'background-color 0.2s',
    },
    notificationContent: {
        flex: 1,
        display: 'flex',
        gap: '12px',
    },
    notificationIcon: {
        fontSize: '20px',
        marginTop: '2px',
        flexShrink: 0,
    },
    notificationText: {
        flex: 1,
        minWidth: '0',
    },
    notificationTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '4px',
        wordBreak: 'break-word',
    },
    notificationMessage: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '4px',
        lineHeight: '1.3',
        wordBreak: 'break-word',
    },
    notificationTime: {
        fontSize: '11px',
        color: '#999',
    },
    notificationActions: {
        display: 'flex',
        gap: '4px',
        flexShrink: 0,
    },
    actionButton: {
        width: '24px',
        height: '24px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: '#666',
    },
    deleteButton: {
        width: '24px',
        height: '24px',
        border: '1px solid #ffcccc',
        backgroundColor: '#fff5f5',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        color: '#ff6b6b',
    },
    footer: {
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        textAlign: 'center',
    },
    viewAllLink: {
        fontSize: '12px',
        color: '#0066cc',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.2s',
    },
};
