import Card from './Card';
import StatusBadge from './StatusBadge';

function RequestDetail({ data }) {
  const hasLineRejectReason =
    data.finalStatus === 'Line Manager từ chối' && data.lineRejectReason;

  const hasHrRejectReason =
    data.finalStatus === 'HR Manager từ chối' && data.hrRejectReason;

  return (
    <Card title="Kết quả tra cứu">
      <div className="lookup-header">
        <div>
          <p className="dashboard-kicker">Thông tin đơn phép</p>
          <h3>{data.requestId}</h3>
          <p className="muted">
            Cập nhật lần cuối: {data.updatedAt || 'Chưa có thông tin'}
          </p>
        </div>

        <StatusBadge status={data.finalStatus} />
      </div>

      <div className="detail-section">
        <h4>1. Thông tin nhân sự</h4>

        <div className="detail-grid">
          <DetailItem label="Họ và tên" value={data.fullName} />
          <DetailItem label="Bộ phận" value={data.department} />
          <DetailItem label="Vị trí" value={data.position} />
          <DetailItem label="Email nhân sự" value={data.employeeEmail} />
          <DetailItem label="Thời gian tạo đơn" value={data.createdAt} />
        </div>
      </div>

      <div className="detail-section">
        <h4>2. Thông tin nghỉ phép</h4>

        <div className="detail-grid">
          <DetailItem label="Loại nghỉ phép" value={data.leaveType} />
          <DetailItem label="Ngày bắt đầu nghỉ" value={data.startDate} />
          <DetailItem label="Ngày quay lại làm việc" value={data.returnDate} />
          <DetailItem label="Số ngày nghỉ" value={data.totalDays} />
          <DetailItem label="Buổi nghỉ" value={data.leaveSession} />
          <DetailItem label="Lý do nghỉ" value={data.reason} />
        </div>
      </div>

      <div className="detail-section">
        <h4>3. Thông tin bàn giao</h4>

        <div className="detail-grid">
          <DetailItem label="Người nhận bàn giao" value={data.handoverName} />
          <DetailItem label="Email người nhận bàn giao" value={data.handoverEmail} />
          <DetailItem label="SĐT người nhận bàn giao" value={data.handoverPhone} />
          <DetailItem
            label="Công việc bàn giao"
            value={data.handoverDetails}
            wide
          />
        </div>
      </div>

      <div className="detail-section">
        <h4>4. Tiến trình xử lý</h4>

        <div className="status-flow">
          <div>
            <span>Line Manager</span>
            <StatusBadge status={data.lineStatus} />
            <small>{data.lineDecisionAt || 'Chưa xử lý'}</small>

            {data.lineRejectReason && (
              <p className="reject-note">
                Lý do: {data.lineRejectReason}
              </p>
            )}
          </div>

          <div>
            <span>HR Manager</span>
            <StatusBadge status={data.hrStatus} />
            <small>{data.hrDecisionAt || 'Chưa xử lý'}</small>

            {data.hrRejectReason && (
              <p className="reject-note">
                Lý do: {data.hrRejectReason}
              </p>
            )}
          </div>

          <div>
            <span>Trạng thái cuối</span>
            <StatusBadge status={data.finalStatus} />
            <small>{data.updatedAt || 'Chưa cập nhật'}</small>
          </div>
        </div>
      </div>

      {hasLineRejectReason && (
        <div className="reject-reason">
          <strong>Lý do từ chối từ Line Manager</strong>
          <p>{data.lineRejectReason}</p>
        </div>
      )}

      {hasHrRejectReason && (
        <div className="reject-reason">
          <strong>Lý do từ chối từ HR Manager</strong>
          <p>{data.hrRejectReason}</p>
        </div>
      )}
    </Card>
  );
}

function DetailItem({ label, value, wide = false }) {
  return (
    <div className={wide ? 'detail-item detail-item-wide' : 'detail-item'}>
      <span>{label}</span>
      <strong>{value || 'Chưa có thông tin'}</strong>
    </div>
  );
}

export default RequestDetail;