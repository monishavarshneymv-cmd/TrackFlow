import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const s = String(status).toLowerCase();
  
  return (
    <span className={`status-badge ${s}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
