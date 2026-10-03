import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';
import { tripService } from '../services/tripService';
import { deliveryService } from '../services/deliveryService';
import StatusBadge from '../components/StatusBadge';
import AlertMessage from '../components/AlertMessage';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vData, tData, dData] = await Promise.all([
        vehicleService.getAll(),
        tripService.getAll(),
        deliveryService.getAll()
      ]);
      setVehicles(vData || []);
      setTrips(tData || []);
      setDeliveries(dData || []);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS');
  const pendingDeliveries = deliveries.filter(d => d.status === 'PENDING');

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <div className="page-subtitle">Real-time overview of fleet operations and logistics</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="content-body">
        {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

        {loading ? (
          <div className="loading-box">Loading fleet operations data...</div>
        ) : (
          <>
            {/* 4 Summary Cards calculated from actual backend data */}
            <div className="summary-grid">
              <div className="stat-card">
                <div className="stat-title">Total Vehicles</div>
                <div className="stat-value">{totalVehicles}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Available Vehicles</div>
                <div className="stat-value" style={{ color: 'var(--badge-green-text)' }}>
                  {availableVehicles}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Active Trips</div>
                <div className="stat-value" style={{ color: 'var(--primary)' }}>
                  {activeTrips.length}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Pending Deliveries</div>
                <div className="stat-value" style={{ color: 'var(--badge-amber-text)' }}>
                  {pendingDeliveries.length}
                </div>
              </div>
            </div>

            {/* Active Trips Table */}
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Active Trips</h3>
              </div>
              <div className="table-responsive">
                {activeTrips.length === 0 ? (
                  <div className="empty-box">No active trips currently in progress.</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Trip ID</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTrips.map(trip => (
                        <tr key={trip.id}>
                          <td><strong>#{trip.id}</strong></td>
                          <td>{trip.vehicleNumber || `Vehicle #${trip.vehicleId}`}</td>
                          <td>{trip.driverName || `Driver #${trip.driverId}`}</td>
                          <td>{trip.source}</td>
                          <td>{trip.destination}</td>
                          <td><StatusBadge status={trip.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Deliveries Table */}
            <div className="panel">
              <div className="panel-header">
                <h3 className="panel-title">Recent Deliveries</h3>
              </div>
              <div className="table-responsive">
                {deliveries.length === 0 ? (
                  <div className="empty-box">No deliveries found.</div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Tracking Number</th>
                        <th>Customer</th>
                        <th>Trip ID</th>
                        <th>Scheduled Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.slice(0, 5).map(del => (
                        <tr key={del.id}>
                          <td><strong>{del.trackingNumber}</strong></td>
                          <td>{del.customerName}</td>
                          <td>#{del.tripId}</td>
                          <td>{formatDate(del.scheduledDate)}</td>
                          <td><StatusBadge status={del.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
