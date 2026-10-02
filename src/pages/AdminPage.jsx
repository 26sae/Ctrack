import React, { useState, useEffect } from 'react';
import { API_URL } from '../constants';

function AdminPage({ user, onNavigate, onLogout }) {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'Pending' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('Pending');
  const [toast, setToast] = useState({ message: '', type: '', show: false });
  const [activityLog, setActivityLog] = useState([]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      setReports(data.map(d => ({
        ...d,
        id: d.Document_ID || d.id,
        title: d.title || d.type || '',
        description: d.description || d.address || '',
        status: d.status || 'Pending',
        createdAt: d.createdAt || d.created_at || new Date().toISOString()
      })));
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast('Error fetching reports from server', 'error');
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const addActivity = (action, details) => {
    setActivityLog(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      action,
      details,
    }, ...prev.slice(0, 19)]);
  };

  const handleAdd = async () => {
    if (!form.title || !form.description) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createdAt: new Date().toISOString() })
      });
      if (!res.ok) throw new Error('Failed to create report');
      setForm({ title: '', description: '', status: 'Pending' });
      setShowForm(false);
      fetchReports();
      showToast('Report added successfully');
      addActivity('Created', form.title);
    } catch (error) {
      showToast('Error adding report', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to update report');
      setEditingId(null);
      setForm({ title: '', description: '', status: 'Pending' });
      setShowForm(false);
      fetchReports();
      showToast('Report updated successfully');
      addActivity('Updated', form.title);
    } catch (error) {
      showToast('Error updating report', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete report');
      fetchReports();
      showToast('Report deleted');
      addActivity('Deleted', 'Report ID: ' + id);
    } catch (error) {
      showToast('Error deleting report', 'error');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.size === 0) {
      showToast('Please select reports', 'error');
      return;
    }
    try {
      for (let id of selectedIds) {
        await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: bulkStatus })
        });
      }
      setSelectedIds(new Set());
      fetchReports();
      showToast(`Updated ${selectedIds.size} reports to ${bulkStatus}`);
      addActivity('Bulk Update', `Changed ${selectedIds.size} reports to ${bulkStatus}`);
    } catch (error) {
      showToast('Error updating reports', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      showToast('Please select reports', 'error');
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.size} reports?`)) return;
    try {
      for (let id of selectedIds) {
        await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });
      }
      setSelectedIds(new Set());
      fetchReports();
      showToast(`Deleted ${selectedIds.size} reports`);
      addActivity('Bulk Delete', `Deleted ${selectedIds.size} reports`);
    } catch (error) {
      showToast('Error deleting reports', 'error');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title, description: item.description, status: item.status || 'Pending' });
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm({ title: '', description: '', status: 'Pending' });
    setShowForm(false);
  };

  const statusColor = (status) => {
    if (status === 'Resolved') return 'var(--g600)';
    if (status === 'In Progress') return '#f59e0b';
    return '#ef4444';
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = (r.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (r.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date') {
      const aTime = new Date(a.createdAt || 0).getTime() || 0;
      const bTime = new Date(b.createdAt || 0).getTime() || 0;
      return bTime - aTime;
    }
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'status') return (a.status || 'Pending').localeCompare(b.status || 'Pending');
    return 0;
  });

  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const paginatedReports = sortedReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const exportToCSV = () => {
    const csv = [
      ['Title', 'Description', 'Status', 'Created Date'],
      ...filteredReports.map(r => [
        r.title || 'N/A',
        r.description || 'N/A',
        r.status || 'Pending',
        new Date(r.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Reports exported as CSV');
    addActivity('Export', `Exported ${filteredReports.length} reports to CSV`);
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'Pending' || !r.status).length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
  };

  return (
    <div style={{ background: 'var(--gray100)', minHeight: '100dvh' }}>
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          background: toast.type === 'error' ? '#ef4444' : 'var(--g600)',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}

      {/* HEADER */}
      <div className="auth-hdr" style={{ paddingBottom: '1.5rem', position: 'relative' }}>
        <div className="auth-hdr-blob" style={{ pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>Admin Panel</h2>
            <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>
              Welcome, {user?.name || 'Admin'}
            </p>
          </div>
          <button
            onClick={() => onLogout()}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '8px',
              color: 'white',
              padding: '0.4rem 0.9rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              position: 'relative',
              zIndex: 20,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '1rem', paddingBottom: '6rem' }}>
        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total', count: stats.total },
            { label: 'Pending', count: stats.pending },
            { label: 'In Progress', count: stats.inProgress },
            { label: 'Resolved', count: stats.resolved },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '0.75rem',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
            }}>
              <div style={{ fontWeight: 700, fontSize: '1.3rem', color: 'var(--g800)' }}>{s.count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--g500)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* SEARCH & FILTER */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto',
        }}>
          <input
            type="text"
            placeholder="Search "
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              height: '2rem',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              border: '1.5px solid var(--gray300)',
              fontSize: '0.84rem',
              marginBottom: '0.5rem',
            }}
          />
          <div style={{
            height: '1px',
            background: 'rgba(0, 0, 0, 0.08)',
            margin: '0.4rem 0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
          }} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                flex: 1,
                height: '2rem',
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: '1.5px solid var(--gray300)',
                fontSize: '0.84rem',
                background: 'white',
              }}
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                flex: 1,
                height: '2rem',
                padding: '0.45rem 0.5rem',
                borderRadius: '8px',
                border: '1.5px solid var(--gray300)',
                fontSize: '0.84rem',
                background: 'white',
              }}
            >
              <option value="date">Sort: Date</option>
              <option value="title">Sort: Title</option>
              <option value="status">Sort: Status</option>
            </select>
            <button
              onClick={exportToCSV}
              style={{
                height: '2rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--g600)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: 600,
              }}
            >
              Export
            </button>
          </div>
        </div>

        {/* ADD BUTTON */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-green"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            + Add New Report
          </button>
        )}

        {/* FORM */}
        {showForm && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}>
            <h3 style={{ margin: '0 0 0.75rem', color: 'var(--g800)', fontSize: '1rem' }}>
              {editingId ? '✏️ Edit Report' : '➕ New Report'}
            </h3>
            <div className="fg">
              <label>Title</label>
              <input
                type="text"
                placeholder="Report title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="fg">
              <label>Description</label>
              <input
                type="text"
                placeholder="Report description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="fg">
              <label>Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--gray300)',
                  fontSize: '0.95rem',
                  background: 'white',
                  color: 'var(--g800)',
                }}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="btn-green"
                style={{ flex: 1 }}
              >
                {editingId ? 'Update' : 'Add Report'}
              </button>
              <button
                onClick={cancelForm}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--gray300)',
                  background: 'white',
                  color: 'var(--g600)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* BULK ACTIONS */}
        {selectedIds.size > 0 && (
          <div style={{
            background: '#f0f9ff',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            border: '2px solid #0ea5e9',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--g800)' }}>
              {selectedIds.size} report{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #0ea5e9',
                  fontSize: '0.85rem',
                  background: 'white',
                }}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0ea5e9',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Update Status
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* REPORTS LIST */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, color: 'var(--g800)', fontSize: '1rem' }}>
            All Reports ({filteredReports.length})
          </h3>
          {filteredReports.length > 0 && (
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '0.4rem',
                borderRadius: '6px',
                border: '1px solid var(--gray300)',
                fontSize: '0.8rem',
                background: 'white',
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
            </select>
          )}
        </div>

        {filteredReports.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--g500)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            <p style={{ margin: 0 }}>No reports found</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {paginatedReports.map(item => (
            <div key={item.id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  style={{ marginTop: '0.35rem', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'var(--g800)', fontSize: '0.95rem' }}>
                    {item.title}
                  </p>
                  <p style={{ margin: '0 0 0.5rem', color: 'var(--g500)', fontSize: '0.82rem' }}>
                    {item.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--g500)' }}>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'No date'}</span>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: statusColor(item.status),
                    background: `${statusColor(item.status)}18`,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    display: 'inline-block',
                    marginTop: '0.5rem',
                  }}>
                    {item.status || 'Pending'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{
                      background: 'var(--g100)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 0.7rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: 'var(--g700)',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--g200)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--g100)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: '#fef2f2',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 0.7rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: '#ef4444',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fef2f2';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justify: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--gray300)',
                background: currentPage === 1 ? 'var(--gray100)' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: page === currentPage ? 'none' : '1px solid var(--gray300)',
                  background: page === currentPage ? 'var(--g600)' : 'white',
                  color: page === currentPage ? 'white' : 'var(--g800)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: page === currentPage ? 600 : 400,
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--gray300)',
                background: currentPage === totalPages ? 'var(--gray100)' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ACTIVITY LOG */}
        {activityLog.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}>
            <h4 style={{ margin: '0 0 0.75rem', color: 'var(--g800)', fontSize: '0.9rem', fontWeight: 700 }}>
              📋 Recent Activity
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activityLog.slice(0, 10).map((log, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justify: 'space-between',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: 'var(--gray100)',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: 'var(--g800)', fontWeight: 500 }}>
                    {log.action}: {log.details}
                  </span>
                  <span style={{ color: 'var(--g500)' }}>{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION - MODULE SWITCHER */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid var(--gray300)',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        justify: 'space-around',
        alignItems: 'center',
        padding: '0.5rem 0',
        zIndex: 50,
      }}>
        {[
          { id: 'reports', label: 'Reports', icon: '📊', enabled: true },
          { id: 'users', label: 'Users', icon: '👥', enabled: false },
          { id: 'analytics', label: 'Analytics', icon: '📈', enabled: false },
          { id: 'settings', label: 'Settings', icon: '⚙️', enabled: false },
        ].map(module => (
          <button
            key={module.id}
            onClick={() => {
              if (module.enabled && module.id !== 'reports') {
                onNavigate(module.id);
              }
            }}
            disabled={!module.enabled}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              borderRadius: '0',
              border: 'none',
              background: module.id === 'reports' ? 'var(--g50)' : 'transparent',
              color: module.id === 'reports' ? 'var(--g600)' : module.enabled ? 'var(--g600)' : 'var(--gray400)',
              cursor: module.enabled ? 'pointer' : 'default',
              fontSize: '0.75rem',
              fontWeight: module.id === 'reports' ? 600 : 500,
              textAlign: 'center',
              opacity: module.enabled ? 1 : 0.5,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onMouseEnter={e => {
              if (module.enabled) {
                e.currentTarget.style.background = 'var(--g50)';
              }
            }}
            onMouseLeave={e => {
              if (module.id !== 'reports') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div>{module.label}</div>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminPage;