import { useState } from 'react';
import { lookupLeaveRequest } from '../api';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Field from '../components/Field';
import RequestDetail from '../components/RequestDetail';

function LookupPage() {
  const [requestId, setRequestId] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [result, setResult] = useState(null);

  async function handleLookup(event) {
    event.preventDefault();

    setLoading(true);
    setNotice(null);
    setResult(null);

    try {
      const response = await lookupLeaveRequest(requestId, employeeEmail);

      if (!response.success) {
        throw new Error(response.message || 'Không thể tra cứu đơn phép.');
      }

      setResult(response.data);
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <Card title="Tra cứu trạng thái đơn phép">
        <Alert type="info">
          Nhập đúng <strong>Mã đơn phép</strong> và <strong>Email nhân sự</strong> đã dùng khi gửi đơn.
        </Alert>

        {notice && <Alert type={notice.type}>{notice.message}</Alert>}

        <form onSubmit={handleLookup} className="form-grid">
          <Field label="Mã đơn phép *">
            <input
              value={requestId}
              onChange={(event) => setRequestId(event.target.value)}
              placeholder="Ví dụ: LR-20260618-1234"
              required
            />
          </Field>

          <Field label="Email nhân sự *">
            <input
              type="email"
              value={employeeEmail}
              onChange={(event) => setEmployeeEmail(event.target.value)}
              placeholder="Email đã dùng khi gửi đơn"
              required
            />
          </Field>

          <div className="actions full-row">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Đang tra cứu...' : 'Tra cứu'}
            </button>
          </div>
        </form>
      </Card>

      {result && <RequestDetail data={result} />}
    </section>
  );
}

export default LookupPage;