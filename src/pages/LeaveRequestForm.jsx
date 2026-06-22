
import { useEffect, useMemo, useState } from 'react';

import { getLineManagers, submitLeaveRequest } from '../api';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Field from '../components/Field';

import {
  DEPARTMENTS,
  LEAVE_TYPES,
  INITIAL_LEAVE_FORM
} from '../constants/options';

function LeaveRequestForm() {
  const [form, setForm] = useState(INITIAL_LEAVE_FORM);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [lastRequestId, setLastRequestId] = useState('');
  const [lineManagers, setLineManagers] = useState([]);
  const [successModal, setSuccessModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const totalDaysNumber = Number(form.totalDays);

  const hasHalfDay = useMemo(() => {
    if (!form.totalDays) return false;
    if (Number.isNaN(totalDaysNumber)) return false;

    return totalDaysNumber % 1 !== 0;
  }, [form.totalDays, totalDaysNumber]);

  const leaveTimeText = useMemo(() => {
    return buildLeaveTimeText({
      ...form,
      startDate: formatDateVN(form.startDate),
      returnDate: formatDateVN(form.returnDate),
      hasHalfDay
    });
  }, [form, hasHalfDay]);

  const lineManagerOptions = useMemo(() => {
    if (!form.department) return [];

    return lineManagers.filter((manager) => manager.department === form.department);
  }, [lineManagers, form.department]);

  useEffect(() => {
    async function loadLineManagers() {
      try {
        const response = await getLineManagers();

        if (response.success) {
          setLineManagers(response.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadLineManagers();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    if (name === 'totalDays') {
      const numberValue = Number(value);
      const isHalfDayValue =
        value !== '' && !Number.isNaN(numberValue) && numberValue % 1 !== 0;

      setForm((prev) => ({
        ...prev,
        totalDays: value,
        startSession: isHalfDayValue ? prev.startSession || 'Sáng' : '',
        returnSession: isHalfDayValue ? prev.returnSession || 'Sáng' : '',
        leaveSession: ''
      }));

      return;
    }

    if (name === 'department') {
      setForm((prev) => ({
        ...prev,
        department: value,
        lineManagerEmail: ''
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function resetForm() {
    setForm(INITIAL_LEAVE_FORM);
    setNotice(null);
    setLastRequestId('');
    setSuccessModal(null);
    setCopied(false);
  }


async function copyRequestId() {
  if (!successModal?.requestId) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(successModal.requestId);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = successModal.requestId;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
  } catch (error) {
    setNotice({
      type: 'error',
      message: 'Không thể copy mã đơn. Vui lòng copy thủ công.'
    });
  }
}

  function closeSuccessModal() {
    setSuccessModal(null);
    setCopied(false);
  }

  function validateFormBeforeSubmit() {
    if (!form.fullName.trim()) {
      throw new Error('Vui lòng nhập họ và tên.');
    }

    if (!form.department) {
      throw new Error('Vui lòng chọn bộ phận.');
    }

    if (!form.position.trim()) {
      throw new Error('Vui lòng nhập vị trí.');
    }

    if (!form.employeeEmail.trim()) {
      throw new Error('Vui lòng nhập email nhân sự.');
    }

    if (!form.lineManagerEmail) {
      throw new Error('Vui lòng chọn quản lý trực tiếp.');
    }

    if (!form.startDate) {
      throw new Error('Vui lòng chọn ngày bắt đầu nghỉ.');
    }

    if (!form.returnDate) {
      throw new Error('Vui lòng chọn ngày quay lại làm việc.');
    }

    if (isStartDateAfterReturnDate(form.startDate, form.returnDate)) {
      throw new Error('Ngày bắt đầu nghỉ không được sau ngày quay lại làm việc.');
    }

    if (Number.isNaN(totalDaysNumber) || totalDaysNumber <= 0) {
      throw new Error('Số ngày nghỉ phải lớn hơn 0.');
    }

    if (totalDaysNumber % 0.5 !== 0) {
      throw new Error('Số ngày nghỉ chỉ được nhập theo bước 0.5 ngày.');
    }

    if (!hasHalfDay && isSameDate(form.startDate, form.returnDate)) {
      throw new Error('Nếu nghỉ nguyên ngày, ngày quay lại làm việc phải sau ngày bắt đầu nghỉ.');
    }

    if (hasHalfDay && (!form.startSession || !form.returnSession)) {
      throw new Error('Vui lòng chọn buổi bắt đầu nghỉ và buổi quay lại làm việc.');
    }

    if (hasHalfDay && isInvalidSameDaySession(form)) {
      throw new Error(
        'Nếu nghỉ nửa buổi trong cùng một ngày, hệ thống chỉ hỗ trợ nghỉ buổi sáng và quay lại làm việc buổi chiều.'
      );
    }

    if (!leaveTimeText) {
      throw new Error('Vui lòng kiểm tra lại thời gian nghỉ.');
    }

    if (!form.reason.trim()) {
      throw new Error('Vui lòng nhập lý do nghỉ.');
    }

    if (!form.handoverName.trim()) {
      throw new Error('Vui lòng nhập họ tên người nhận bàn giao.');
    }

    if (!form.handoverEmail.trim()) {
      throw new Error('Vui lòng nhập email người nhận bàn giao.');
    }

    if (!form.handoverDetails.trim()) {
      throw new Error('Vui lòng nhập công việc bàn giao cụ thể.');
    }

    if (!form.policyAccepted) {
      throw new Error('Vui lòng xác nhận đã đọc và hiểu quy định của Công ty trước khi gửi đơn.');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setNotice(null);
    setLastRequestId('');

    try {
      validateFormBeforeSubmit();

      const payload = {
        ...form,
        position: form.position.trim(),
        startDate: formatDateVN(form.startDate),
        returnDate: formatDateVN(form.returnDate),
        leaveSession: leaveTimeText
      };

      const response = await submitLeaveRequest(payload);

      if (!response.success) {
        throw new Error(response.message || 'Gửi đơn thất bại.');
      }

      const newRequestId = response.requestId || '';

      setNotice(null);
      setLastRequestId(newRequestId);
      setSuccessModal({
        requestId: newRequestId
      });
      setCopied(false);
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
              placeholder="Nhập vị trí hiện tại"
              required
            />
          </Field>

          <Field label="Quản lý trực tiếp *">
            <select
              name="lineManagerEmail"
              value={form.lineManagerEmail}
              onChange={handleChange}
              disabled={!form.department}
              required
            >
              <option value="">
                {!form.department ? 'Chọn bộ phận trước' : 'Chọn Line Manager'}
              </option>

              {lineManagerOptions.map((manager) => (
                <option key={manager.email + manager.position} value={manager.email}>
                  {manager.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Email nhân sự *">
            <input
              type="email"
              name="employeeEmail"
              value={form.employeeEmail}
              onChange={handleChange}
              placeholder="email@gmail.com"
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

          {hasHalfDay && (
            <>
              <Field label="Nghỉ từ buổi *">
                <select
                  name="startSession"
                  value={form.startSession}
                  onChange={handleChange}
                  required
                >
                  <option value="Sáng">Sáng</option>
                  <option value="Chiều">Chiều</option>
                </select>
              </Field>

              <Field label="Quay lại làm việc vào buổi *">
                <select
                  name="returnSession"
                  value={form.returnSession}
                  onChange={handleChange}
                  required
                >
                  <option value="Sáng">Sáng</option>
                  <option value="Chiều">Chiều</option>
                </select>
              </Field>
            </>
          )}

          {leaveTimeText && (
            <div className="leave-preview full-row">
              <span>Thời gian nghỉ hiển thị cho quản lý:</span>
              <strong>{leaveTimeText}</strong>
            </div>
          )}

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
        <Alert type="info">
          <strong>Lưu ý:</strong> Nhân sự xác nhận đã trao đổi nội dung công việc với Người nhận bàn giao.
        </Alert>

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
              placeholder="email@gmail.com"
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

        <div className="policy-confirm-box">
          <label className="policy-check">
            <input
              type="checkbox"
              name="policyAccepted"
              checked={form.policyAccepted}
              onChange={handleChange}
              required
            />

            <span>
              Trước khi nộp Đơn xin nghỉ phép, nhân viên xác nhận đã đọc và hiểu những
              quy định của Công ty. Bất kỳ thông tin nào do nhân viên cung cấp không
              đúng sự thật sẽ được xem là vi phạm Quy định Công ty và bị xem xét xử lý
              vi phạm kỷ luật.
            </span>
          </label>
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

      {successModal && (
        <div className="success-modal-backdrop">
          <div className="success-modal">
            <div className="success-icon">✓</div>

            <h3>Gửi đơn thành công</h3>

            <p>
              Đơn nghỉ phép của bạn đã được ghi nhận. Vui lòng lưu mã đơn để tra cứu
              trạng thái xử lý khi cần.
            </p>

            <div className="success-request-box">
              <span>Mã đơn phép</span>
              <strong>{successModal.requestId}</strong>
            </div>

            <div className="success-modal-actions">
              <button
                type="button"
                className="btn primary"
                onClick={copyRequestId}
              >
                {copied ? 'Đã copy mã đơn' : 'Copy mã đơn'}
              </button>

              <button
                type="button"
                className="btn ghost"
                onClick={closeSuccessModal}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function buildLeaveTimeText({
  startDate,
  returnDate,
  startSession,
  returnSession,
  totalDays,
  hasHalfDay
}) {
  if (!startDate || !returnDate || !totalDays) {
    return '';
  }

  const totalText = ` — Tổng: ${totalDays} ngày`;

  if (!hasHalfDay) {
    return `Nghỉ từ ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
  }

  if (!startSession || !returnSession) {
    return '';
  }

  if (startDate === returnDate) {
    if (startSession === 'Sáng' && returnSession === 'Chiều') {
      return `Nghỉ buổi sáng ngày ${startDate}, quay lại làm việc buổi chiều cùng ngày${totalText}`;
    }

    return `Thời gian nghỉ chưa hợp lệ${totalText}`;
  }

  if (startSession === 'Chiều' && returnSession === 'Sáng') {
    return `Nghỉ từ buổi chiều ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
  }

  if (startSession === 'Sáng' && returnSession === 'Chiều') {
    return `Nghỉ từ ngày ${startDate}, quay lại làm việc buổi chiều ngày ${returnDate}${totalText}`;
  }

  if (startSession === 'Sáng' && returnSession === 'Sáng') {
    return `Nghỉ từ ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
  }

  if (startSession === 'Chiều' && returnSession === 'Chiều') {
    return `Nghỉ từ buổi chiều ngày ${startDate}, quay lại làm việc buổi chiều ngày ${returnDate}${totalText}`;
  }

  return `Nghỉ từ ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
}

function isInvalidSameDaySession({ startDate, returnDate, startSession, returnSession }) {
  if (startDate !== returnDate) {
    return false;
  }

  return !(startSession === 'Sáng' && returnSession === 'Chiều');
}

function isStartDateAfterReturnDate(startDate, returnDate) {
  if (!startDate || !returnDate) return false;

  return new Date(`${startDate}T00:00:00`).getTime() > new Date(`${returnDate}T00:00:00`).getTime();
}

function isSameDate(startDate, returnDate) {
  return startDate && returnDate && startDate === returnDate;
}

function formatDateVN(value) {
  if (!value) return '';

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export default LeaveRequestForm;
