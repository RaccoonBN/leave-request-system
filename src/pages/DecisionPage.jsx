import { useEffect, useMemo, useRef, useState } from 'react';

import { handleDecision } from '../api';
import Card from '../components/Card';
import Alert from '../components/Alert';

function DecisionPage() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasAutoSubmitted = useRef(false);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);

    return {
      requestId: searchParams.get('requestId') || '',
      role: searchParams.get('role') || '',
      decision: searchParams.get('decision') || '',
      token: searchParams.get('token') || '',
      approver: searchParams.get('approver') || ''
    };
  }, []);

  const roleLabel = useMemo(() => {
    if (params.approver === 'ec_leader') return 'Team Lead / EC Leader';
    if (params.approver === 'ec_manager') return 'Line Manager / EC Manager';
    if (params.approver === 'line_manager') return 'Line Manager';

    if (params.role === 'line') return 'Line Manager';
    if (params.role === 'hr') return 'HR Manager';

    return 'Người duyệt';
  }, [params.role, params.approver]);

  const decisionLabel = useMemo(() => {
    if (params.decision === 'approve') return 'Duyệt đơn';
    if (params.decision === 'reject') return 'Từ chối đơn';
    return 'Xử lý đơn';
  }, [params.decision]);

  const processNote = useMemo(() => {
    if (params.approver === 'ec_leader') {
      return 'Sau khi EC Leader duyệt, đơn sẽ được chuyển tiếp đến Line Manager / EC Manager.';
    }

    if (params.approver === 'ec_manager') {
      return 'Sau khi EC Manager duyệt, đơn sẽ được chuyển tiếp đến HR Manager.';
    }

    if (params.role === 'hr') {
      return 'Đây là bước xử lý cấp cuối. Sau khi HR Manager duyệt hoặc từ chối, hệ thống sẽ gửi kết quả về email nhân sự.';
    }

    return 'Sau khi Line Manager duyệt, đơn sẽ được chuyển tiếp đến HR Manager.';
  }, [params.role, params.approver]);

  useEffect(() => {
    const isValid =
      params.requestId &&
      params.role &&
      params.decision &&
      params.token;

    if (!isValid) {
      setStatus('error');
      setMessage('Thiếu thông tin xử lý đơn hoặc liên kết không hợp lệ.');
      return;
    }

    if (params.decision === 'reject') {
      setStatus('ready-reject');
      return;
    }

    if (params.decision === 'approve' && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      submitDecision('');
    }
  }, [params]);

  async function submitDecision(reasonText = '') {
    try {
      setSubmitting(true);
      setStatus('processing');
      setMessage('');

      const response = await handleDecision({
        requestId: params.requestId,
        role: params.role,
        decision: params.decision,
        token: params.token,
        rejectReason: reasonText
      });

      if (!response.success) {
        throw new Error(response.message || 'Không thể xử lý đơn.');
      }

      setStatus('success');
      setMessage(response.message || 'Xử lý đơn thành công.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Có lỗi xảy ra khi xử lý đơn.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRejectSubmit(event) {
    event.preventDefault();

    if (!rejectReason.trim()) {
      setMessage('Vui lòng nhập lý do từ chối.');
      return;
    }

    await submitDecision(rejectReason.trim());
  }

  return (
    <div className="approval-page stack">
      <section className="approval-hero">
        <div className="approval-hero-copy">
          <span className="eyebrow">XỬ LÝ ĐƠN PHÉP CHO NHÂN VIÊN</span>
          <h1>Xử lý đơn nghỉ phép</h1>
          <p>Ghi nhận thao tác duyệt hoặc từ chối đơn nghỉ phép.</p>
        </div>

        <div className="approval-hero-logo">
          <img src="/company-logo.png" alt="WESET" />
        </div>
      </section>
      <section className="approval-info-grid">
        <div className="approval-mini-card">
          <span>Vai trò xử lý</span>
          <strong>{roleLabel}</strong>
        </div>

        <div className="approval-mini-card">
          <span>Thao tác</span>
          <strong>{decisionLabel}</strong>
        </div>

        <div className="approval-mini-card">
          <span>Mã đơn</span>
          <strong>{params.requestId || '---'}</strong>
        </div>
      </section>

      {status === 'loading' && (
        <Card title="Đang tải dữ liệu">
          <div className="approval-state">
            <div className="approval-spinner" />
            <h3>Đang kiểm tra liên kết xử lý</h3>
            <p>Hệ thống đang xác thực thông tin đơn nghỉ phép...</p>
          </div>
        </Card>
      )}

      {status === 'processing' && (
        <Card title="Đang xử lý đơn">
          <div className="approval-state">
            <div className="approval-spinner" />
            <h3>Hệ thống đang ghi nhận thao tác của bạn</h3>
            <p>Vui lòng chờ trong giây lát, không tắt trang lúc này.</p>
          </div>
        </Card>
      )}

      {status === 'ready-reject' && (
        <Card title={`Xác nhận từ chối đơn - ${roleLabel}`}>
          <form className="approval-reject-form" onSubmit={handleRejectSubmit}>
            <Alert type="warning">
              <strong>Lưu ý:</strong> Bạn đang xử lý đơn với vai trò{' '}
              <strong>{roleLabel}</strong>. Vui lòng nhập rõ lý do từ chối để nhân sự
              nắm được thông tin và điều chỉnh khi cần.
            </Alert>

            {message && (
              <Alert type="error">
                <div>{message}</div>
              </Alert>
            )}

            <div className="approval-reject-box">
              <label htmlFor="rejectReason">Lý do từ chối *</label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Nhập lý do từ chối đơn nghỉ phép"
                rows={6}
                required
              />
            </div>

            <div className="approval-actions">
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Quay về trang chủ
              </button>

              <button
                type="submit"
                className="btn danger"
                disabled={submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {status === 'success' && (
        <Card title="Xử lý thành công">
          <div className="approval-state approval-state-success">
            <div className="approval-state-icon success">✓</div>

            <h3>Thao tác đã được ghi nhận</h3>
            <p>{message}</p>

            <Alert type="info">
              {processNote}
            </Alert>

            <div className="approval-result-box">
              <div>
                <span>Mã đơn phép</span>
                <strong>{params.requestId}</strong>
              </div>

              <div>
                <span>Người xử lý</span>
                <strong>{roleLabel}</strong>
              </div>

              <div>
                <span>Trạng thái</span>
                <strong>{decisionLabel}</strong>
              </div>
            </div>

            <div className="approval-actions center">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </Card>
      )}

      {status === 'error' && (
        <Card title="Không thể xử lý đơn">
          <div className="approval-state approval-state-error">
            <div className="approval-state-icon error">!</div>

            <h3>Có lỗi xảy ra</h3>
            <p>{message}</p>

            <div className="approval-actions center">
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Quay về trang chủ
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default DecisionPage;