import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertMessage from '../components/AlertMessage';

export default function VehiclesPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'TRUCK',
    model: '',
    capacity: '',
    status: 'AVAILABLE'
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [statusFilter, typeFilter]);

  const loadVehicles = async (currentSearch = search) => {
    setLoading(true);
    setError('');
    try {
      const data = await vehicleService.getAll({
        status: statusFilter || undefined,
        vehicleType: typeFilter || undefined,
        search: currentSearch || undefined
      });
      setVehicles(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVehicles(search);
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: '',
      vehicleType: 'TRUCK',
      model: '',
      capacity: '',
      status: 'AVAILABLE'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      vehicleNumber: v.vehicleNumber,
      vehicleType: v.vehicleType,
      model: v.model,
      capacity: v.capacity,
      status: v.status
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber.trim() || !formData.model.trim() || !formData.capacity) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const payload = {
      ...formData,
      capacity: parseFloat(formData.capacity)
    };

    setSubmitting(true);
    setFormError('');
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, payload);
        setSuccess(`Vehicle ${payload.vehicleNumber} updated successfully.`);
      } else {
        await vehicleService.create(payload);
        setSuccess(`Vehicle ${payload.vehicleNumber} registered successfully.`);
      }
      setModalOpen(false);
      loadVehicles();
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
      await vehicleService.delete(deleteTarget.id);
      setSuccess(`Vehicle ${deleteTarget.vehicleNumber} removed.`);
      setDeleteTarget(null);
      loadVehicles();
    } catch (err) {
      setError(err.message || 'Failed to delete vehicle.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Vehicles</h2>
          <div className="page-subtitle">Manage fleet assets, specifications, and availability</div>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Add Vehicle
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
                placeholder="Search by vehicle # or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="IN_USE">IN_USE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="TRUCK">TRUCK</option>
                <option value="VAN">VAN</option>
                <option value="ELECTRIC_VAN">ELECTRIC_VAN</option>
                <option value="CAR">CAR</option>
              </select>
            </form>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="loading-box">Loading vehicles...</div>
            ) : vehicles.length === 0 ? (
              <div className="empty-box">No vehicles found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle Number</th>
                    <th>Type</th>
                    <th>Model</th>
                    <th>Capacity (kg)</th>
                    <th>Status</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id}>
                      <td><strong>{v.vehicleNumber}</strong></td>
                      <td>{v.vehicleType}</td>
                      <td>{v.model}</td>
                      <td>{v.capacity}</td>
                      <td><StatusBadge status={v.status} /></td>
                      {canManage && (
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(v)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteTarget(v)}
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

      {/* Create / Edit Vehicle Modal */}
      <Modal
        isOpen={modalOpen}
        title={editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
        onClose={() => setModalOpen(false)}
      >
        {formError && <AlertMessage type="error" message={formError} onClose={() => setFormError('')} />}
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Vehicle Registration Number *</label>
            <input
              type="text"
              className="form-input"
              value={formData.vehicleNumber}
              onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
              placeholder="e.g. DL01-EF-9012"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Vehicle Type *</label>
            <select
              className="form-select"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              required
            >
              <option value="TRUCK">TRUCK</option>
              <option value="VAN">VAN</option>
              <option value="ELECTRIC_VAN">ELECTRIC_VAN</option>
              <option value="CAR">CAR</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Make &amp; Model *</label>
            <input
              type="text"
              className="form-input"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. Ashok Leyland Ecomet"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Capacity (kg) *</label>
            <input
              type="number"
              step="any"
              min="1"
              className="form-input"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="e.g. 12000"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Current Status *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="IN_USE">IN_USE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
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
              {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${deleteTarget?.vehicleNumber}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
