import React, { useState, useEffect } from 'react';
import { tripService } from '../services/tripService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertMessage from '../components/AlertMessage';

export default function TripsPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [trips, setTrips] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    source: '',
    destination: '',
    startDate: '',
    expectedEndDate: '',
    status: 'PLANNED'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTrips();
    if (canManage) {
      loadDropdownAssets();
    }
  }, [canManage]);

  const loadTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tripService.getAll();
      setTrips(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load trips.');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownAssets = async () => {
    try {
      const [vList, dList] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      setAvailableVehicles(vList || []);
      setAvailableDrivers(dList || []);
    } catch {
      // Fallback: vehicles/drivers will populate if accessible
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
    setEditingTrip(null);
    const now = new Date();
    const plusOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    setFormData({
      vehicleId: availableVehicles[0]?.id || '',
      driverId: availableDrivers[0]?.id || '',
      source: '',
      destination: '',
      startDate: toInputDatetime(now.toISOString()),
      expectedEndDate: toInputDatetime(plusOneDay.toISOString()),
      status: 'PLANNED'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTrip(t);
    setFormData({
      vehicleId: t.vehicleId,
      driverId: t.driverId,
      source: t.source,
      destination: t.destination,
      startDate: toInputDatetime(t.startDate),
      expectedEndDate: toInputDatetime(t.expectedEndDate),
      status: t.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.driverId || !formData.source.trim() || !formData.destination.trim() || !formData.startDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    // Ensure format matches yyyy-MM-dd'T'HH:mm:ss expected by backend
    const formatPayloadDate = (dt) => {
      if (!dt) return null;
      return dt.length === 16 ? `${dt}:00` : dt;
    };

    const payload = {
      vehicleId: Number(formData.vehicleId),
      driverId: Number(formData.driverId),
      source: formData.source.trim(),
      destination: formData.destination.trim(),
      startDate: formatPayloadDate(formData.startDate),
      expectedEndDate: formatPayloadDate(formData.expectedEndDate),
      status: formData.status
    };

    setSubmitting(true);
    setFormError('');
    try {
      if (editingTrip) {
        await tripService.update(editingTrip.id, payload);
        setSuccess(`Trip #${editingTrip.id} updated successfully.`);
      } else {
        const created = await tripService.create(payload);
        setSuccess(`Trip #${created.id} scheduled successfully.`);
      }
      setModalOpen(false);
      loadTrips();
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
      await tripService.delete(deleteTarget.id);
      setSuccess(`Trip #${deleteTarget.id} deleted.`);
      setDeleteTarget(null);
      loadTrips();
    } catch (err) {
      setError(err.message || 'Failed to delete trip.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Trips</h2>
          <div className="page-subtitle">Schedule, assign, and track freight and dispatch routes</div>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Schedule Trip
          </button>
        )}
      </div>

      <div className="content-body">
        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">All Scheduled Trips</h3>
            <button className="btn btn-secondary btn-sm" onClick={loadTrips}>Refresh</button>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="loading-box">Loading trips...</div>
            ) : trips.length === 0 ? (
              <div className="empty-box">No trips scheduled.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Departure</th>
                    <th>Est. Arrival</th>
                    <th>Status</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id}>
                      <td><strong>#{t.id}</strong></td>
                      <td>{t.vehicleNumber || `Vehicle #${t.vehicleId}`}</td>
                      <td>{t.driverName || `Driver #${t.driverId}`}</td>
                      <td>{t.source}</td>
                      <td>{t.destination}</td>
                      <td>{formatDate(t.startDate)}</td>
                      <td>{formatDate(t.expectedEndDate)}</td>
                      <td><StatusBadge status={t.status} /></td>
                      {canManage && (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteTarget(t)}
                            >
                              Delete
                            </button>
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

      {/* Trip Modal with real Vehicle & Driver Dropdowns */}
      <Modal
        isOpen={modalOpen}
        title={editingTrip ? `Edit Trip #${editingTrip.id}` : 'Schedule New Trip'}
        onClose={() => setModalOpen(false)}
      >
        {formError && <AlertMessage type="error" message={formError} onClose={() => setFormError('')} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Assign Vehicle *</label>
            <select
              className="form-select"
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              required
            >
              <option value="">-- Select Vehicle --</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} — {v.model} ({v.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Driver *</label>
            <select
              className="form-select"
              value={formData.driverId}
              onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
              required
            >
              <option value="">-- Select Driver --</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.licenseNumber} ({d.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Origin / Source *</label>
            <input
              type="text"
              className="form-input"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g. New Delhi"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination *</label>
            <input
              type="text"
              className="form-input"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g. Jaipur"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Departure Date &amp; Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expected Arrival Date &amp; Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={formData.expectedEndDate}
              onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trip Status *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
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
              {submitting ? 'Saving...' : editingTrip ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Cancel & Delete Trip"
        message={`Are you sure you want to delete Trip #${deleteTarget?.id} (${deleteTarget?.source} → ${deleteTarget?.destination})?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
