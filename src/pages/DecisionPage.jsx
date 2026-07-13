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
      approver: searchParams.get('approver') || '',
      title: searchParams.get('title') || searchParams.get('approverTitle') || ''
    };
  }, []);

  const roleLabel = useMemo(() => {
    return getApproverRoleLabel(params);
  }, [params]);

  const decisionLabel = useMemo(() => {
    if (params.decision === 'approve') return 'Duyệt đơn';
    if (params.decision === 'reject') return 'Từ chối đơn';
    return 'Xử lý đơn';
  }, [params.decision]);

  const processNote = useMemo(() => {
    if (params.role === 'hr') {
      return `Đây là bước xử lý cấp cuối. Sau khi ${roleLabel} duyệt hoặc từ chối, hệ thống sẽ gửi kết quả về email nhân sự.`;
    }

    if (params.role === 'leader') {
      return `Sau khi ${roleLabel} duyệt, đơn sẽ được chuyển tiếp đến cấp duyệt tiếp theo.`;
    }

    if (params.role === 'line') {
      return `Sau khi ${roleLabel} duyệt, đơn sẽ được chuyển tiếp đến cấp duyệt cuối.`;
    }

    return 'Sau khi xử lý, hệ thống sẽ cập nhật trạng thái đơn nghỉ phép.';
  }, [params.role, roleLabel]);

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

function getApproverRoleLabel(params) {
  const titleFromUrl = String(params.title || '').trim();

  if (titleFromUrl) {
    return titleFromUrl;
  }

  const approver = String(params.approver || '').trim();
  const role = String(params.role || '').trim();

  if (approver === 'director') return 'Director';
  if (approver === 'hr_manager') return 'HR Manager';
  if (approver === 'line_manager') return 'Line Manager/Manager';
  if (approver === 'leader') return 'Leader';

  if (approver === 'ec_leader') return 'EC Leader';
  if (approver === 'ec_manager') return 'EC Manager';
  if (approver === 'ga_leader') return 'GA Leader';
  if (approver === 'ga_manager') return 'GA Manager';
  if (approver === 'aca_leader') return 'ACA Leader';
  if (approver === 'aca_manager') return 'ACA Manager';
  if (approver === 'prc_leader') return 'PRC Leader';
  if (approver === 'prc_manager') return 'PRC Manager';
  if (approver === 'tse_leader') return 'TSE Leader';

  if (role === 'leader') return 'Leader';
  if (role === 'line') return 'Line Manager/Manager';
  if (role === 'hr') return 'HR Manager';

  return 'Người duyệt';
}

export default DecisionPage;