import { useState } from 'react';
import { submitLeaveRequest } from '../api';
import { DEPARTMENTS, LEAVE_TYPES, INITIAL_LEAVE_FORM } from '../constants/options';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Field from '../components/Field';

function LeaveRequestForm() {
  const [form, setForm] = useState(INITIAL_LEAVE_FORM);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [lastRequestId, setLastRequestId] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function resetForm() {
    setForm(INITIAL_LEAVE_FORM);
    setNotice(null);
    setLastRequestId('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setNotice(null);
    setLastRequestId('');

    try {
      const response = await submitLeaveRequest(form);

      if (!response.success) {
        throw new Error(response.message || 'Gửi đơn thất bại.');
      }

      setNotice({
        type: 'success',
        message: 'Gửi đơn thành công. Vui lòng lưu mã đơn để tra cứu trạng thái.'
      });

      setLastRequestId(response.requestId);
      setForm(INITIAL_LEAVE_FORM);
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
    <form className="stack" onSubmit={handleSubmit}>
      {notice && (
        <Alert type={notice.type}>
          <div>{notice.message}</div>

          {lastRequestId && (
            <div className="request-code">
              Mã đơn: <strong>{lastRequestId}</strong>
            </div>
          )}
        </Alert>
      )}

      <Card title="1. Thông tin nhân sự">
        <div className="form-grid">
          <Field label="Họ và tên *">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </Field>

          <Field label="Bộ phận *">
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
            >
              <option value="">Chọn bộ phận</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Vị trí *">
            <input
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Nhập vị trí"
              required
            />
          </Field>

          <Field label="Email nhân sự *">
            <input
              type="email"
              name="employeeEmail"
              value={form.employeeEmail}
              onChange={handleChange}
              placeholder="email@company.com"
              required
            />
          </Field>
        </div>
      </Card>

      <Card title="2. Thông tin nghỉ phép">
        <div className="form-grid">
          <Field label="Ngày bắt đầu nghỉ *">
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Ngày quay lại làm việc *">
            <input
              type="date"
              name="returnDate"
              value={form.returnDate}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Số ngày nghỉ *">
            <input
              type="number"
              step="0.5"
              min="0.5"
              name="totalDays"
              value={form.totalDays}
              onChange={handleChange}
              placeholder="Ví dụ: 0.5, 1, 1.5"
              required
            />
          </Field>

          <Field label="Buổi nghỉ *">
            <select
              name="leaveSession"
              value={form.leaveSession}
              onChange={handleChange}
              required
            >
              <option value="Sáng">Sáng</option>
              <option value="Chiều">Chiều</option>
              <option value="Cả ngày">Cả ngày</option>
            </select>
          </Field>

          <Field label="Loại nghỉ phép *">
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              required
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Lý do nghỉ *" full>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Nhập lý do nghỉ"
              required
            />
          </Field>
        </div>
      </Card>

      <Card title="3. Thông tin bàn giao công việc">
        <div className="form-grid">
          <Field label="Họ tên người nhận bàn giao *">
            <input
              name="handoverName"
              value={form.handoverName}
              onChange={handleChange}
              placeholder="Nhập họ tên người nhận bàn giao"
              required
            />
          </Field>

          <Field label="Email người nhận bàn giao *">
            <input
              type="email"
              name="handoverEmail"
              value={form.handoverEmail}
              onChange={handleChange}
              placeholder="email@company.com"
              required
            />
          </Field>

          <Field label="Số điện thoại người nhận bàn giao">
            <input
              name="handoverPhone"
              value={form.handoverPhone}
              onChange={handleChange}
              placeholder="Không bắt buộc"
            />
          </Field>

          <Field label="Công việc bàn giao cụ thể *" full>
            <textarea
              name="handoverDetails"
              value={form.handoverDetails}
              onChange={handleChange}
              placeholder="Nhập chi tiết các đầu việc cần bàn giao"
              required
            />
          </Field>
        </div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={resetForm}>
            Hủy
          </button>

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi đơn'}
          </button>
        </div>
      </Card>
    </form>
  );
}

export default LeaveRequestForm;