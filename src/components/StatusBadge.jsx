function StatusBadge({ status }) {
  const className = getStatusClass(status);

  return (
    <span className={`status-badge ${className}`}>
      {status || 'Chưa có thông tin'}
    </span>
  );
}

function getStatusClass(status = '') {
  if (status === 'Đã duyệt') return 'approved';
  if (status.includes('từ chối')) return 'rejected';
  if (status.includes('Chờ')) return 'pending';
  if (status.includes('đã duyệt')) return 'approved';

  return 'neutral';
}

export default StatusBadge;