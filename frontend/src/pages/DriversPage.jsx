import React, { useState, useEffect } from 'react';
import { driverService } from '../services/driverService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertMessage from '../components/AlertMessage';

export default function DriversPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    status: 'AVAILABLE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async (currentSearch = search) => {
    setLoading(true);
    setError('');
    try {
      const data = await driverService.getAll(currentSearch);
      setDrivers(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load drivers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDrivers(search);
  };

  const handleOpenCreate = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      status: 'AVAILABLE'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDriver(d);
    setFormData({
      name: d.name,
      phone: d.phone,
      licenseNumber: d.licenseNumber,
      status: d.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.licenseNumber.trim()) {
      setFormError('Please fill in all driver fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      if (editingDriver) {
        await driverService.update(editingDriver.id, formData);
        setSuccess(`Driver ${formData.name} updated successfully.`);
      } else {
        await driverService.create(formData);
        setSuccess(`Driver ${formData.name} registered successfully.`);
      }
      setModalOpen(false);
      loadDrivers();
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
      await driverService.delete(deleteTarget.id);
      setSuccess(`Driver ${deleteTarget.name} removed.`);
      setDeleteTarget(null);
      loadDrivers();
    } catch (err) {
      setError(err.message || 'Failed to delete driver.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Drivers</h2>
          <div className="page-subtitle">Manage driver records, contact details, and license verification</div>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Add Driver
          </button>
        )}
      </div>

      <div className="content-body">
        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />}

        <div className="panel">
          <div className="panel-header">
            <form onSubmit={handleSearchSubmit} className="filter-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, license #, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="loading-box">Loading drivers...</div>
            ) : drivers.length === 0 ? (
              <div className="empty-box">No drivers found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Driver Name</th>
                    <th>Phone</th>
                    <th>License Number</th>
                    <th>Status</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id}>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.phone}</td>
                      <td>{d.licenseNumber}</td>
                      <td><StatusBadge status={d.status} /></td>
                      {canManage && (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(d)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteTarget(d)}
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

      {/* Driver Modal */}
      <Modal
        isOpen={modalOpen}
        title={editingDriver ? 'Edit Driver' : 'Register New Driver'}
        onClose={() => setModalOpen(false)}
      >
        {formError && <AlertMessage type="error" message={formError} onClose={() => setFormError('')} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91-9876543210"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Commercial License Number *</label>
            <input
              type="text"
              className="form-input"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="e.g. DL-0420110012345"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_TRIP">ON_TRIP</option>
              <option value="INACTIVE">INACTIVE</option>
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
              {submitting ? 'Saving...' : editingDriver ? 'Update Driver' : 'Register Driver'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Driver"
        message={`Are you sure you want to delete driver ${deleteTarget?.name}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
