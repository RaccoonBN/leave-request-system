import { useEffect, useMemo, useState } from 'react';
import { handleDecision } from '../api';
import Card from '../components/Card';
import Alert from '../components/Alert';

function DecisionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const payload = useMemo(() => {
    const params = new URLSearchParams(window.location.search);

    return {
      role: params.get('role'),
      decision: params.get('decision'),
      requestId: params.get('requestId'),
      token: params.get('token')
    };
  }, []);

  const isReject = payload.decision === 'reject';

  async function submitDecision(extraData = {}) {
    setLoading(true);
    setResult(null);

    try {
      const response = await handleDecision({
        ...payload,
        ...extraData
      });

      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isReject) {
      submitDecision();
    }
  }, [isReject]);

  if (isReject && !result) {
    return (
      <Card title="Nhập lý do từ chối đơn">
        <Alert type="info">
          Vui lòng nhập lý do từ chối để nhân sự nắm được thông tin và HR có căn cứ lưu trữ.
        </Alert>

        <div className="reject-box">
          <label className="field full-row">
            <span>Lý do từ chối *</span>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Ví dụ: Chưa đảm bảo thời gian báo trước / Trùng lịch vận hành / Cần bổ sung bàn giao..."
              required
            />
          </label>

          <div className="actions">
            <button
              type="button"
              className="btn danger"
              disabled={loading || !rejectReason.trim()}
              onClick={() => submitDecision({ rejectReason })}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card title="Đang xử lý đơn">
        <p className="muted">Hệ thống đang ghi nhận thao tác duyệt/từ chối...</p>
      </Card>
    );
  }

  return (
    <Card title={result?.success ? 'Xử lý thành công' : 'Không thể xử lý'}>
      <Alert type={result?.success ? 'success' : 'error'}>
        {result?.message || 'Không có phản hồi từ hệ thống.'}
      </Alert>

      <p className="muted">
        Bạn có thể đóng tab này hoặc quay lại email để tiếp tục công việc.
      </p>
    </Card>
  );
}

export default DecisionPage;