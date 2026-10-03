import React, { useState, useEffect } from 'react';
import { deliveryService } from '../services/deliveryService';
import { tripService } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertMessage from '../components/AlertMessage';

export default function DeliveriesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERATOR';
  const canDelete = user?.role === 'ADMIN';

  const [deliveries, setDeliveries] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    tripId: '',
    customerName: '',
    deliveryAddress: '',
    scheduledDate: '',
    status: 'PENDING'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDeliveries();
    loadTrips();
  }, [statusFilter]);

  const loadDeliveries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await deliveryService.getAll(statusFilter || undefined);
      setDeliveries(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load deliveries.');
    } finally {
      setLoading(false);
    }
  };

  const loadTrips = async () => {
    try {
      const data = await tripService.getAll();
      setTrips(data || []);
    } catch {
      // Ignored if user has limited trip read permissions
    }
  };

  const toInputDatetime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  const handleOpenCreate = () => {
    setEditingDelivery(null);
    const now = new Date();
    const plusTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    setFormData({
      trackingNumber: `TRK-${Math.floor(10000 + Math.random() * 90000)}`,
      tripId: trips[0]?.id || '',
      customerName: '',
      deliveryAddress: '',
      scheduledDate: toInputDatetime(plusTwoDays.toISOString()),
      status: 'PENDING'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (del) => {
    setEditingDelivery(del);
    setFormData({
      trackingNumber: del.trackingNumber,
      tripId: del.tripId,
      customerName: del.customerName,
      deliveryAddress: del.deliveryAddress,
      scheduledDate: toInputDatetime(del.scheduledDate),
      status: del.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trackingNumber.trim() || !formData.tripId || !formData.customerName.trim() || !formData.deliveryAddress.trim() || !formData.scheduledDate) {
      setFormError('Please fill in all delivery details.');
      return;
    }

    const formatPayloadDate = (dt) => {
      if (!dt) return null;
      return dt.length === 16 ? `${dt}:00` : dt;
    };

    const payload = {
      trackingNumber: formData.trackingNumber.trim(),
      tripId: Number(formData.tripId),
      customerName: formData.customerName.trim(),
      deliveryAddress: formData.deliveryAddress.trim(),
      scheduledDate: formatPayloadDate(formData.scheduledDate),
      status: formData.status
    };

    setSubmitting(true);
    setFormError('');
    try {
      if (editingDelivery) {
        await deliveryService.update(editingDelivery.id, payload);
        setSuccess(`Delivery ${payload.trackingNumber} updated successfully.`);
      } else {
        await deliveryService.create(payload);
        setSuccess(`Delivery ${payload.trackingNumber} registered successfully.`);
      }
      setModalOpen(false);
      loadDeliveries();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deliveryService.delete(deleteTarget.id);
      setSuccess(`Delivery ${deleteTarget.trackingNumber} removed.`);
      setDeleteTarget(null);
      loadDeliveries();
    } catch (err) {
      setError(err.message || 'Failed to delete delivery.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredDeliveries = search
    ? deliveries.filter(d => 
        d.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.customerName.toLowerCase().includes(search.toLowerCase())
      )
    : deliveries;

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Deliveries</h2>
          <div className="page-subtitle">Customer order tracking, destination addresses, and status dispatch</div>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Add Delivery
          </button>
        )}
      </div>

      <div className="content-body">
        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="panel">
          <div className="panel-header">
            <div className="filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search tracking # or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="loading-box">Loading deliveries...</div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="empty-box">No deliveries found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking Number</th>
                    <th>Customer Name</th>
                    <th>Delivery Address</th>
                    <th>Trip ID</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                    {(canEdit || canDelete) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((del) => (
                    <tr key={del.id}>
                      <td><strong>{del.trackingNumber}</strong></td>
                      <td>{del.customerName}</td>
                      <td>{del.deliveryAddress}</td>
                      <td>#{del.tripId}</td>
                      <td>{formatDate(del.scheduledDate)}</td>
                      <td><StatusBadge status={del.status} /></td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div className="action-buttons">
                            {canEdit && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenEdit(del)}
                              >
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteTarget(del)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      <Modal
        isOpen={modalOpen}
        title={editingDelivery ? `Edit Delivery ${editingDelivery.trackingNumber}` : 'Create New Delivery'}
        onClose={() => setModalOpen(false)}
      >
        {formError && <AlertMessage type="error" message={formError} onClose={() => setFormError('')} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Tracking Number *</label>
            <input
              type="text"
              className="form-input"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              placeholder="e.g. TRK-1001"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Associated Trip *</label>
            <select
              className="form-select"
              value={formData.tripId}
              onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
              required
            >
              <option value="">-- Select Trip --</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  Trip #{t.id} — {t.source} → {t.destination} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Priya Mehra"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address *</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              placeholder="Full street address and city"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Scheduled Date &amp; Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Status *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="PENDING">PENDING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '20px -20px -20px -20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : editingDelivery ? 'Update Delivery' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Delivery Order"
        message={`Are you sure you want to delete delivery tracking ${deleteTarget?.trackingNumber}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
