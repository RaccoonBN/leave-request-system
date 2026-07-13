import { useEffect, useMemo, useRef, useState } from 'react';

import { getLineManagers, submitLeaveRequest } from '../api';
import Card from '../components/Card';
import Alert from '../components/Alert';
import Field from '../components/Field';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  DEPARTMENTS,
  LEAVE_TYPES,
  INITIAL_LEAVE_FORM,
  LEADER_LABELS,
  MANAGER_LABELS,
  BHXH_SICK_LEAVE_NOTICE
} from '../constants/options';

const MAX_CERTIFICATE_SIZE_MB = 5;

function LeaveRequestForm() {
  const [form, setForm] = useState(INITIAL_LEAVE_FORM);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [lastRequestId, setLastRequestId] = useState('');
  const [lineManagers, setLineManagers] = useState([]);
  const [successModal, setSuccessModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const certificateInputRef = useRef(null);

  const totalDaysNumber = Number(form.totalDays);
const hasCertificateFile = Boolean(
  form.sickLeaveCertificateBase64 || form.sickLeaveCertificateUrl
);

  const hasHalfDay = useMemo(() => {
    if (!form.totalDays) return false;
    if (Number.isNaN(totalDaysNumber)) return false;

    return totalDaysNumber % 1 !== 0;
  }, [form.totalDays, totalDaysNumber]);

  const isSingleHalfDay = useMemo(() => {
    return totalDaysNumber === 0.5;
  }, [totalDaysNumber]);

  const leaderLabel = useMemo(() => {
    return LEADER_LABELS?.[form.department] || 'Leader';
  }, [form.department]);

  const managerLabel = useMemo(() => {
    return MANAGER_LABELS?.[form.department] || 'Line Manager/Manager';
  }, [form.department]);

  const leaderOptions = useMemo(() => {
    if (!form.department) return [];

    return lineManagers.filter(
      (manager) =>
        manager.department === form.department &&
        isLeaderManager(manager)
    );
  }, [lineManagers, form.department]);

  const lineManagerOptions = useMemo(() => {
    if (!form.department) return [];

    return lineManagers.filter(
      (manager) =>
        manager.department === form.department &&
        isLineManager(manager)
    );
  }, [lineManagers, form.department]);

  const leaveTimeText = useMemo(() => {
    return buildLeaveTimeText({
      ...form,
      startDate: formatDateVN(form.startDate),
      returnDate: formatDateVN(form.returnDate),
      hasHalfDay,
      isSingleHalfDay
    });
  }, [form, hasHalfDay, isSingleHalfDay]);

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

    if (name === 'department') {
      setForm((prev) => ({
        ...prev,
        department: value,
        leaderEmail: '',
        teamLeadEmail: '',
        lineManagerEmail: ''
      }));

      return;
    }

    if (name === 'leaderEmail') {
      setForm((prev) => ({
        ...prev,
        leaderEmail: value,

        // Giữ tương thích với Apps Script cũ nếu còn đọc teamLeadEmail
        teamLeadEmail: value
      }));

      return;
    }

    if (name === 'totalDays') {
      const numberValue = Number(value);
      const isHalfDayValue =
        value !== '' && !Number.isNaN(numberValue) && numberValue % 1 !== 0;
      const isSingleHalfDayValue = numberValue === 0.5;

      setForm((prev) => ({
        ...prev,
        totalDays: value,
        halfDaySession: isSingleHalfDayValue ? prev.halfDaySession || 'Sáng' : prev.halfDaySession,
        startSession: isHalfDayValue && !isSingleHalfDayValue ? prev.startSession || 'Sáng' : '',
        returnSession: isHalfDayValue && !isSingleHalfDayValue ? prev.returnSession || 'Sáng' : '',
        leaveSession: ''
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
function handleDateChange(name, date) {
  setForm((prev) => ({
    ...prev,
    [name]: formatDatePickerValue(date)
  }));
}
  async function handleCertificateFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setForm((prev) => ({
        ...prev,
        sickLeaveCertificateBase64: '',
        sickLeaveCertificateFileName: '',
        sickLeaveCertificateMimeType: ''
      }));

      return;
    }
const isValidCertificateFile =
  file.type.startsWith('image/') ||
  file.type === 'application/pdf' ||
  file.name.toLowerCase().endsWith('.pdf');

if (!isValidCertificateFile) {
  event.target.value = '';

  setForm((prev) => ({
    ...prev,
    sickLeaveCertificateBase64: '',
    sickLeaveCertificateFileName: '',
    sickLeaveCertificateMimeType: ''
  }));

  setNotice({
    type: 'error',
    message: 'Minh chứng chỉ hỗ trợ file hình ảnh hoặc PDF.'
  });

  return;
}
    const fileSizeMb = file.size / 1024 / 1024;

    if (fileSizeMb > MAX_CERTIFICATE_SIZE_MB) {
      event.target.value = '';

      setForm((prev) => ({
        ...prev,
        sickLeaveCertificateBase64: '',
        sickLeaveCertificateFileName: '',
        sickLeaveCertificateMimeType: ''
      }));

      setNotice({
        type: 'error',
        message: `File giấy chứng nhận không được vượt quá ${MAX_CERTIFICATE_SIZE_MB}MB.`
      });

      return;
    }

    try {
      const base64 = await readFileAsDataUrl(file);

      setForm((prev) => ({
        ...prev,
        sickLeaveCertificateBase64: base64,
        sickLeaveCertificateFileName: file.name,
        sickLeaveCertificateMimeType: file.type || 'image/png'
      }));
    } catch (error) {
      setNotice({
        type: 'error',
        message: 'Không thể đọc file giấy chứng nhận. Vui lòng chọn lại file khác.'
      });
    }
  }

  function resetForm() {
    setForm(INITIAL_LEAVE_FORM);
    setNotice(null);
    setLastRequestId('');
    setSuccessModal(null);
    setCopied(false);

    if (certificateInputRef.current) {
      certificateInputRef.current.value = '';
    }
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

    if (!form.employeeCode.trim()) {
      throw new Error('Vui lòng nhập mã nhân viên.');
    }

    if (!form.department) {
      throw new Error('Vui lòng chọn bộ phận.');
    }

    if (!form.position.trim()) {
      throw new Error('Vui lòng nhập vị trí.');
    }

    if (!form.leaderEmail) {
      throw new Error('Vui lòng chọn Leader.');
    }

   if (form.department !== 'EC' && !form.lineManagerEmail) {
  throw new Error('Vui lòng chọn Line Manager/Manager.');
}
 if (form.department !== 'EC' && !form.lineManagerEmail) {
  throw new Error('Vui lòng chọn Line Manager/Manager.');
}

    if (!form.employeeEmail.trim()) {
      throw new Error('Vui lòng nhập email nhân sự.');
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

    if (hasHalfDay && isSameDate(form.startDate, form.returnDate) && totalDaysNumber !== 0.5) {
      throw new Error('Nếu nghỉ trong cùng một ngày, số ngày nghỉ chỉ có thể là 0.5 ngày.');
    }

    if (isSingleHalfDay && !form.halfDaySession) {
      throw new Error('Vui lòng chọn buổi nghỉ.');
    }

    if (hasHalfDay && !isSingleHalfDay && (!form.startSession || !form.returnSession)) {
      throw new Error('Vui lòng chọn buổi bắt đầu nghỉ và buổi quay lại làm việc.');
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

    if (!form.handoverEmployeeCode.trim()) {
      throw new Error('Vui lòng nhập mã nhân viên người nhận bàn giao.');
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
      fullName: form.fullName.trim(),
      employeeCode: form.employeeCode.trim(),
      department: form.department.trim(),
      position: form.position.trim(),
      employeeEmail: form.employeeEmail.trim(),
      leaderEmail: form.leaderEmail,
      teamLeadEmail: form.leaderEmail,
      lineManagerEmail: form.department === 'EC' ? '' : form.lineManagerEmail,
      startDate: formatDateVN(form.startDate),
      returnDate: formatDateVN(form.returnDate),
      leaveSession: leaveTimeText,
      reason: form.reason.trim(),
      handoverName: form.handoverName.trim(),
      handoverEmployeeCode: form.handoverEmployeeCode.trim(),
      handoverEmail: form.handoverEmail.trim(),
      handoverPhone: form.handoverPhone.trim(),
      handoverDetails: form.handoverDetails.trim(),
      hasBhxhSickLeave: hasCertificateFile
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

      if (certificateInputRef.current) {
        certificateInputRef.current.value = '';
      }
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

          <Field label="Mã nhân viên *">
            <input
              name="employeeCode"
              value={form.employeeCode}
              onChange={handleChange}
              placeholder="Nhập mã nhân viên"
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

          <Field label={`${leaderLabel} *`}>
            <select
              name="leaderEmail"
              value={form.leaderEmail}
              onChange={handleChange}
              disabled={!form.department}
              required
            >
              <option value="">
                {!form.department ? 'Chọn bộ phận trước' : `Chọn ${leaderLabel}`}
              </option>

              {leaderOptions.map((leader) => (
                <option
                  key={`${leader.email}-${leader.position}-${leader.role}-leader`}
                  value={leader.email}
                >
                  {leader.label}
                </option>
              ))}
            </select>
          </Field>

        {form.department !== 'EC' && (
        <Field label={`${managerLabel} *`}>
          <select
            name="lineManagerEmail"
            value={form.lineManagerEmail}
            onChange={handleChange}
            disabled={!form.department}
            required={form.department !== 'EC'}
          >
            <option value="">
              {!form.department ? 'Chọn bộ phận trước' : `Chọn ${managerLabel}`}
            </option>

            {lineManagerOptions.map((manager) => (
              <option
                key={`${manager.email}-${manager.position}-${manager.role}-manager`}
                value={manager.email}
              >
                {manager.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {form.department === 'EC' && (
        <div className="leave-preview">
          <span>Luồng duyệt EC:</span>
          <strong>EC Leader → HR Manager → Director</strong>
        </div>
      )}

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
            <DatePicker
            selected={parseDatePickerValue(form.startDate)}
            onChange={(date) => handleDateChange('startDate', date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className="date-picker-input"
            wrapperClassName="date-picker-wrapper"
            popperClassName="date-picker-popper"
            showPopperArrow={false}
            autoComplete="off"
            required
          />
          </Field>

          <Field label="Ngày quay lại làm việc *">
            <DatePicker
              selected={parseDatePickerValue(form.returnDate)}
              onChange={(date) => handleDateChange('returnDate', date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="date-picker-input"
              wrapperClassName="date-picker-wrapper"
              popperClassName="date-picker-popper"
              showPopperArrow={false}
              autoComplete="off"
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

          {isSingleHalfDay && (
            <Field label="Nghỉ buổi *">
              <select
                name="halfDaySession"
                value={form.halfDaySession}
                onChange={handleChange}
                required
              >
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
              </select>
            </Field>
          )}

          {hasHalfDay && !isSingleHalfDay && (
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

        <div className="bhxh-upload-card full-row">
  <div className="bhxh-upload-content">
    <strong>Lưu ý về hồ sơ nghỉ ốm hưởng BHXH</strong>

    <p>
      Trường hợp Người lao động nghỉ ốm đau có hưởng chế độ BHXH, vui lòng đính kèm
      hình ảnh hoặc file PDF{' '}
      <strong>“GIẤY CHỨNG NHẬN NGHỈ VIỆC HƯỞNG BẢO HIỂM XÃ HỘI”</strong> của bệnh viện
      để HR kiểm tra khi cần.
    </p>

    <p className="muted">
      Hỗ trợ file ảnh hoặc PDF, tối đa {MAX_CERTIFICATE_SIZE_MB}MB.
    </p>
  </div>

  <div className="bhxh-upload-action">
    <input
      ref={certificateInputRef}
      type="file"
      accept="image/*,.pdf,application/pdf"
      onChange={handleCertificateFileChange}
      className="hidden-file-input"
      id="sickLeaveCertificate"
    />

    <label htmlFor="sickLeaveCertificate" className="btn light bhxh-upload-btn">
      Tải lên minh chứng
    </label>
  </div>

  {form.sickLeaveCertificateFileName && (
    <div className="bhxh-file-preview">
      <span>
        File đã chọn: <strong>{form.sickLeaveCertificateFileName}</strong>
      </span>

      <button
        type="button"
        className="btn ghost btn-sm"
        onClick={() => {
          setForm((prev) => ({
            ...prev,
            sickLeaveCertificateBase64: '',
            sickLeaveCertificateFileName: '',
            sickLeaveCertificateMimeType: '',
            sickLeaveCertificateUrl: ''
          }));

          if (certificateInputRef.current) {
            certificateInputRef.current.value = '';
          }
        }}
      >
        Xóa file
      </button>
    </div>
  )}
</div>
          
        </div>
      </Card>

      <Card title="3. Thông tin bàn giao công việc">
        <Alert type="info">
          <strong>Lưu ý:</strong> Nhân sự xác nhận đã trao đổi nội dung công việc với
          Người nhận bàn giao.
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

          <Field label="Mã nhân viên người nhận bàn giao *">
            <input
              name="handoverEmployeeCode"
              value={form.handoverEmployeeCode}
              onChange={handleChange}
              placeholder="Nhập mã nhân viên người nhận bàn giao"
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
              Trước khi nộp Đơn xin nghỉ phép, nhân viên xác nhận đã đọc và hiểu những{' '}
              <a
                href="https://drive.google.com/file/d/1yXxqxxUoilTAFQpvKXmyvQIPdyaHslmp/view?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="policy-link"
              >
                quy định của Công ty
              </a>
              . Bất kỳ thông tin nào do nhân viên cung cấp không đúng sự thật sẽ được xem là
              vi phạm Quy định Công ty và bị xem xét xử lý vi phạm kỷ luật.
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
  halfDaySession,
  startSession,
  returnSession,
  totalDays,
  hasHalfDay,
  isSingleHalfDay
}) {
  if (!startDate || !returnDate || !totalDays) {
    return '';
  }

  const totalText = ` — Tổng: ${totalDays} ngày`;

  if (!hasHalfDay) {
    return `Nghỉ từ ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
  }

  if (isSingleHalfDay) {
    if (!halfDaySession) return '';

    if (halfDaySession === 'Sáng') {
      if (startDate === returnDate) {
        return `Nghỉ buổi sáng ngày ${startDate}, quay lại làm việc buổi chiều cùng ngày${totalText}`;
      }

      return `Nghỉ buổi sáng ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
    }

    if (startDate === returnDate) {
      return `Nghỉ buổi chiều ngày ${startDate}, quay lại làm việc vào ngày làm việc tiếp theo${totalText}`;
    }

    return `Nghỉ buổi chiều ngày ${startDate}, quay lại làm việc ngày ${returnDate}${totalText}`;
  }

  if (!startSession || !returnSession) {
    return '';
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

function isLeaderManager(manager) {
  if (manager.isLeader) return true;

  return hasRole(manager.role, 'LEADER') || hasRole(manager.role, 'EC_LEADER');
}

function isLineManager(manager) {
  if (manager.isLineManager) return true;

  return (
    hasRole(manager.role, 'LINE_MANAGER') ||
    hasRole(manager.role, 'MANAGER') ||
    hasRole(manager.role, 'HR_MANAGER')
  );
}

function hasRole(roleText, roleToFind) {
  const text = String(roleText || '').trim();

  if (!text) return false;

  const roles = text.split(/[,;|]/).map((role) => role.trim());

  return roles.includes(roleToFind) || text === roleToFind;
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function parseDatePickerValue(value) {
  if (!value) return null;

  // Dữ liệu đang lưu trong form dạng yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  // Phòng trường hợp dữ liệu đã là dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/').map(Number);

    return new Date(year, month - 1, day);
  }

  return null;
}

function formatDatePickerValue(date) {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Lưu trong form dạng yyyy-MM-dd để các hàm validate hiện tại vẫn chạy đúng
  return `${year}-${month}-${day}`;
}

export default LeaveRequestForm;