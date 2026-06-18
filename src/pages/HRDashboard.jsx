import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { getLeaveRequestsForHR } from '../api';
import { DEPARTMENTS, FINAL_STATUSES } from '../constants/options';

import Card from '../components/Card';
import Alert from '../components/Alert';
import Field from '../components/Field';
import StatusBadge from '../components/StatusBadge';

function HRDashboard() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  async function fetchRequests(inputPassword = password, shouldLogin = false) {
    setLoading(true);
    setNotice(null);

    try {
      const response = await getLeaveRequestsForHR(inputPassword);

      if (!response.success) {
        throw new Error(response.message || 'Không thể tải danh sách đơn.');
      }

      setRequests(response.data || []);

      if (shouldLogin) {
        setLoggedIn(true);
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

  function handleLogin(event) {
    event.preventDefault();
    fetchRequests(password, true);
  }

  function handleLogout() {
    setLoggedIn(false);
    setPassword('');
    setRequests([]);
    setSearch('');
    setDepartmentFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setNotice(null);
  }

  function resetFilters() {
    setSearch('');
    setDepartmentFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  }

  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(() => {
      fetchRequests(password, false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loggedIn, password]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const searchableText = [
        item.requestId,
        item.fullName,
        item.employeeEmail,
        item.department,
        item.position,
        item.leaveType,
        item.finalStatus
      ]
        .join(' ')
        .toLowerCase();

      const matchSearch = searchableText.includes(search.toLowerCase().trim());
      const matchDepartment = departmentFilter ? item.department === departmentFilter : true;
      const matchStatus = statusFilter ? item.finalStatus === statusFilter : true;

      const startDateValue = toDateValue(item.startDate);
      const fromDateValue = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
      const toDateValueFilter = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

      const matchFromDate = fromDateValue ? startDateValue >= fromDateValue : true;
      const matchToDate = toDateValueFilter ? startDateValue <= toDateValueFilter : true;

      return matchSearch && matchDepartment && matchStatus && matchFromDate && matchToDate;
    });
  }, [requests, search, departmentFilter, statusFilter, fromDate, toDate]);

  const summary = useMemo(() => {
    const approved = filteredRequests.filter((item) => item.finalStatus === 'Đã duyệt').length;

    const pending = filteredRequests.filter((item) =>
      ['Chờ Line Manager duyệt', 'Chờ HR Manager duyệt'].includes(item.finalStatus)
    ).length;

    const rejected = filteredRequests.filter((item) =>
      ['Line Manager từ chối', 'HR Manager từ chối'].includes(item.finalStatus)
    ).length;

    return {
      total: filteredRequests.length,
      approved,
      pending,
      rejected
    };
  }, [filteredRequests]);

  function exportExcel() {
    if (filteredRequests.length === 0) {
      setNotice({
        type: 'error',
        message: 'Không có dữ liệu để xuất file.'
      });
      return;
    }

    const exportData = filteredRequests.map((item) => ({
      'Mã đơn': item.requestId,
      'Thời gian tạo đơn': item.createdAt,
      'Họ và tên': item.fullName,
      'Bộ phận': item.department,
      'Vị trí': item.position,
      'Email nhân sự': item.employeeEmail,
      'Loại nghỉ phép': item.leaveType,
      'Ngày bắt đầu nghỉ': item.startDate,
      'Ngày quay lại làm việc': item.returnDate,
      'Số ngày nghỉ': item.totalDays,
      'Buổi nghỉ': item.leaveSession,
      'Lý do nghỉ': item.reason,
      'Người nhận bàn giao': item.handoverName,
      'Email người nhận bàn giao': item.handoverEmail,
      'SĐT người nhận bàn giao': item.handoverPhone,
      'Công việc bàn giao': item.handoverDetails,
      'Email quản lý trực tiếp': item.lineManagerEmail,
      'Trạng thái Line Manager': item.lineStatus,
      'Thời gian Line Manager xử lý': item.lineDecisionAt,
      'Lý do từ chối Line': item.lineRejectReason || '',
      'Email HR Manager': item.hrManagerEmail,
      'Trạng thái HR Manager': item.hrStatus,
      'Thời gian HR Manager xử lý': item.hrDecisionAt,
      'Lý do từ chối HR': item.hrRejectReason || '',
      'Trạng thái cuối': item.finalStatus,
      'Thời gian cập nhật': item.updatedAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đơn phép');

    const today = new Date();
    const fileDate = today.toISOString().slice(0, 10);

    XLSX.writeFile(workbook, `don-phep-${fileDate}.xlsx`);
  }

  if (!loggedIn) {
    return (
      <Card title="HR Dashboard">
        <Alert type="info">
          Khu vực dành cho HR xem toàn bộ danh sách đơn phép, trạng thái xử lý và xuất dữ liệu.
        </Alert>

        {notice && <Alert type={notice.type}>{notice.message}</Alert>}

        <form className="form-grid" onSubmit={handleLogin}>
          <Field label="Mật khẩu HR *">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu HR Dashboard"
              required
            />
          </Field>

          <div className="actions full-row">
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card title="HR Dashboard">
      {notice && <Alert type={notice.type}>{notice.message}</Alert>}

      <div className="dashboard-topbar">
        <div>
          <p className="dashboard-kicker">Quản lý đơn nghỉ phép</p>
          <h3>Danh sách đơn phép</h3>
          <p className="muted">
            Dashboard tự cập nhật mỗi 10 giây. Dữ liệu gốc được lưu trong Google Sheet.
          </p>
        </div>

        <div className="dashboard-actions">
          <button className="btn ghost" type="button" onClick={() => fetchRequests(password, false)}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>

          <button className="btn primary" type="button" onClick={exportExcel}>
            Xuất Excel
          </button>

          <button className="btn ghost" type="button" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="dashboard-summary">
        <SummaryItem label="Tổng đơn hiển thị" value={summary.total} />
        <SummaryItem label="Đang chờ" value={summary.pending} />
        <SummaryItem label="Đã duyệt" value={summary.approved} />
        <SummaryItem label="Từ chối" value={summary.rejected} />
      </div>

      <div className="filter-card">
        <div className="dashboard-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, tên, email, loại phép..."
          />

          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
          >
            <option value="">Tất cả bộ phận</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {FINAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button className="btn ghost" type="button" onClick={resetFilters}>
            Xóa lọc
          </button>
        </div>

        <div className="dashboard-toolbar date-toolbar">
          <Field label="Từ ngày bắt đầu nghỉ">
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </Field>

          <Field label="Đến ngày bắt đầu nghỉ">
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </Field>
        </div>
      </div>

      <p className="table-note">
        Đang hiển thị <strong>{filteredRequests.length}</strong> / {requests.length} đơn.
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày gửi</th>
              <th>Nhân sự</th>
              <th>Bộ phận</th>
              <th>Thông tin nghỉ</th>
              <th>Bàn giao</th>
              <th>Line Manager</th>
              <th>HR Manager</th>
              <th>Trạng thái cuối</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="9">Chưa có dữ liệu phù hợp.</td>
              </tr>
            ) : (
              filteredRequests.map((item) => (
                <tr key={item.requestId}>
                  <td>
                    <strong>{item.requestId}</strong>
                  </td>

                  <td>{item.createdAt}</td>

                  <td>
                    <strong>{item.fullName}</strong>
                    <span>{item.employeeEmail}</span>
                  </td>

                  <td>
                    <strong>{item.department}</strong>
                    <span>{item.position}</span>
                  </td>

                  <td>
                    <strong>{item.leaveType}</strong>
                    <span>{item.startDate} → {item.returnDate}</span>
                    <span>{item.totalDays} ngày - {item.leaveSession}</span>
                    <span>Lý do: {item.reason}</span>
                  </td>

                  <td>
                    <strong>{item.handoverName}</strong>
                    <span>{item.handoverEmail}</span>
                    {item.handoverPhone && <span>{item.handoverPhone}</span>}
                    <span>{item.handoverDetails}</span>
                  </td>

                  <td>
                    <StatusBadge status={item.lineStatus} />
                    {item.lineDecisionAt && <span>{item.lineDecisionAt}</span>}

                    {item.lineRejectReason && (
                      <span className="reject-inline">
                        Lý do: {item.lineRejectReason}
                      </span>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={item.hrStatus} />
                    {item.hrDecisionAt && <span>{item.hrDecisionAt}</span>}

                    {item.hrRejectReason && (
                      <span className="reject-inline">
                        Lý do: {item.hrRejectReason}
                      </span>
                    )}
                  </td>

                  <td>
                    <StatusBadge status={item.finalStatus} />
                    {item.updatedAt && <span>{item.updatedAt}</span>}

                    {item.finalStatus === 'Line Manager từ chối' && item.lineRejectReason && (
                      <span className="reject-inline">
                        Lý do: {item.lineRejectReason}
                      </span>
                    )}

                    {item.finalStatus === 'HR Manager từ chối' && item.hrRejectReason && (
                      <span className="reject-inline">
                        Lý do: {item.hrRejectReason}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function toDateValue(value) {
  if (!value) return 0;

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(`${value.slice(0, 10)}T00:00:00`).getTime();
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    const [datePart] = value.split(' ');
    const [day, month, year] = datePart.split('/');

    return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

export default HRDashboard;