import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { getLeaveRequestsForHR } from '../api';
import { DEPARTMENTS, FINAL_STATUSES } from '../constants/options';

import Card from '../components/Card';
import Alert from '../components/Alert';
import Field from '../components/Field';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 5;

function HRDashboard() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
    setNotice(null);
    setSelectedRequest(null);
  }

  function resetFilters() {
    setSearch('');
    setDepartmentFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
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
      item.employeeCode,
      item.employeeEmail,
      item.department,
      item.position,
      item.leaveType,
      item.ecLeaderEmail,
      item.lineManagerEmail,
      item.hrManagerEmail,
      item.ecLeaderStatus,
      item.lineStatus,
      item.hrStatus,
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, statusFilter, fromDate, toDate, requests.length]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRequests.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRequests, currentPage]);

  const pageStart = filteredRequests.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredRequests.length);

  const summary = useMemo(() => {
    const approved = filteredRequests.filter((item) => item.finalStatus === 'Đã duyệt').length;

   const pending = filteredRequests.filter((item) =>
      [
        'Chờ EC Leader duyệt',
        'Chờ EC Manager duyệt',
        'Chờ Line Manager duyệt',
        'Chờ HR Manager duyệt'
      ].includes(item.finalStatus)
    ).length;

    const rejected = filteredRequests.filter((item) =>
      [
        'EC Leader từ chối',
        'EC Manager từ chối',
        'Line Manager từ chối',
        'HR Manager từ chối'
      ].includes(item.finalStatus)
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
    'Mã nhân viên': item.employeeCode,
    'Bộ phận': item.department,
    'Vị trí': item.position,
    'Email nhân sự': item.employeeEmail,
    'Loại nghỉ phép': item.leaveType,
    'Ngày bắt đầu nghỉ': item.startDate,
    'Ngày quay lại làm việc': item.returnDate,
    'Số ngày nghỉ': item.totalDays,
    'Thời gian nghỉ': item.leaveSession,
    'Lý do nghỉ': item.reason,
    'Người nhận bàn giao': item.handoverName,
    'Email người nhận bàn giao': item.handoverEmail,
    'SĐT người nhận bàn giao': item.handoverPhone,
    'Công việc bàn giao': item.handoverDetails,

    'Email Team Lead/EC Leader': item.ecLeaderEmail,
    'Trạng thái EC Leader': item.ecLeaderStatus,
    'Thời gian EC Leader xử lý': item.ecLeaderDecisionAt,
    'Lý do từ chối EC Leader': item.ecLeaderRejectReason || '',

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
      <section className="hr-login-page">
        <div className="hr-login-panel">
          <div className="hr-login-header">
            <div>
              <p className="dashboard-kicker">Phát triển bởi HR Team</p>
              <h1>HR Dashboard</h1>
              <p>Quản lý, theo dõi và xuất dữ liệu đơn nghỉ phép.</p>
            </div>

            <div className="hr-login-logo">
              <img src="/company-logo.png" alt="Company logo" />
            </div>
          </div>

          <div className="hr-login-content">
            <div className="hr-login-intro">
              <span className="hr-login-badge">Private Area</span>

              <h2>Đăng nhập khu vực HR</h2>

              <p>
                Dữ liệu đơn nghỉ phép chỉ hiển thị khi nhập đúng mật khẩu HR.
                Vui lòng không chia sẻ quyền truy cập cho người không liên quan.
              </p>

              <div className="hr-login-points">
                <div>
                  <strong>01</strong>
                  <span>Xem toàn bộ đơn phép</span>
                </div>

                <div>
                  <strong>02</strong>
                  <span>Theo dõi trạng thái duyệt</span>
                </div>

                <div>
                  <strong>03</strong>
                  <span>Xuất dữ liệu báo cáo</span>
                </div>
              </div>
            </div>

            <div className="hr-login-form">
              <h3>Đăng nhập</h3>
              <p>Nhập mật khẩu để truy cập dashboard.</p>

              {notice && <Alert type={notice.type}>{notice.message}</Alert>}

              <form onSubmit={handleLogin}>
                <Field label="Mật khẩu HR *">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu HR Dashboard"
                    required
                  />
                </Field>

                <button type="submit" className="btn primary hr-login-btn" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
  <section className="hr-dashboard-page">
    {notice && <Alert type={notice.type}>{notice.message}</Alert>}

    <div className="hr-dashboard-header">
      <div className="hr-dashboard-title-wrap">
        <div className="hr-dashboard-logo">
          <img src="/company-logo.png" alt="Company logo" />
        </div>

        <div>
          <p className="dashboard-kicker">Phát triển bởi HR Team</p>
          <h1>HR Dashboard</h1>
          <p>
            Quản lý đơn nghỉ phép tập trung, theo dõi trạng thái xử lý và xuất dữ liệu nhanh chóng.
          </p>
        </div>
      </div>

      <button className="btn danger hr-logout-btn" type="button" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>

    <div className="hr-summary-grid">
      <SummaryItem label="Tổng đơn hiển thị" value={summary.total} />
      <SummaryItem label="Đang chờ" value={summary.pending} />
      <SummaryItem label="Đã duyệt" value={summary.approved} />
      <SummaryItem label="Từ chối" value={summary.rejected} />
    </div>

    <Card title="Danh sách đơn phép">
      <div className="hr-list-head">
        <div>
          <p className="muted">
            Dashboard tự cập nhật mỗi 10 giây. Dữ liệu gốc được lưu trong Google Sheet.
          </p>
        </div>

        <div className="hr-list-actions">
          <button className="btn ghost" type="button" onClick={() => fetchRequests(password, false)}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>

          <button className="btn primary" type="button" onClick={exportExcel}>
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="hr-filter-card">
        <div className="hr-filter-grid">
          <Field label="Tìm kiếm">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã đơn, tên, mã nhân viên, email, loại phép..."
            />
          </Field>

          <Field label="Bộ phận">
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
          </Field>

          <Field label="Trạng thái">
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
          </Field>

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

          <div className="hr-filter-clear">
            <button className="btn light" type="button" onClick={resetFilters}>
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <p className="table-note">
        Đang hiển thị <strong>{pageStart} - {pageEnd}</strong> / {filteredRequests.length} đơn phù hợp
        <span className="table-note-total"> · Tổng dữ liệu: {requests.length} đơn</span>
      </p>

      <div className="hr-table-wrap">
        <table className="hr-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Nhân sự</th>
              <th>Nghỉ phép</th>
              <th>EC Leader</th>
              <th>Line Manager</th>
              <th>HR Manager</th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="hr-empty-state">
                    Chưa có đơn phù hợp với bộ lọc hiện tại.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRequests.map((item) => (
                <tr key={item.requestId}>
                  <td data-label="Mã đơn">
                    <strong className="hr-request-id">{item.requestId}</strong>
                  </td>

                  <td data-label="Nhân sự">
                    <strong>{item.fullName}</strong>
                    {item.employeeCode && (
                      <span className="muted">Mã NV: {item.employeeCode}</span>
                    )}
                  </td>

                  <td data-label="Nghỉ phép">
                    <strong>{item.leaveType}</strong>
                  </td>

                  <td data-label="EC Leader">
                    {item.department === 'EC' ? (
                      <StatusBadge status={item.ecLeaderStatus} />
                    ) : (
                      <span className="muted">Không áp dụng</span>
                    )}
                  </td>

                  <td data-label="Line Manager">
                    <StatusBadge status={item.lineStatus} />
                  </td>

                  <td data-label="HR Manager">
                    <StatusBadge status={item.hrStatus} />
                  </td>

                  <td data-label="Trạng thái">
                    <StatusBadge status={item.finalStatus} />
                  </td>

                  <td data-label="Chi tiết">
                    <button
                      type="button"
                      className="hr-icon-btn"
                      title="Xem chi tiết"
                      aria-label={`Xem chi tiết đơn ${item.requestId}`}
                      onClick={() => setSelectedRequest(item)}
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
         {filteredRequests.length > PAGE_SIZE && (
        <div className="hr-pagination">
          <button
            type="button"
            className="hr-page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            aria-label="Trang trước"
          >
            <FiChevronLeft />
          </button>

          <div className="hr-page-info">
            Trang <strong>{currentPage}</strong> / {totalPages}
          </div>

          <button
            type="button"
            className="hr-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            aria-label="Trang sau"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </Card>

   
          {selectedRequest && (
            <div
              className="detail-modal-backdrop"
              onClick={() => setSelectedRequest(null)}
            >
              <div
                className="detail-modal"
                onClick={(event) => event.stopPropagation()}
              >
          <div className="detail-modal-header">
            <div>
              <p className="dashboard-kicker">Chi tiết đơn phép</p>
              <h3>{selectedRequest.requestId}</h3>
            </div>

            <button
              type="button"
              className="btn ghost btn-sm"
              onClick={() => setSelectedRequest(null)}
            >
              Đóng
            </button>
          </div>

          <div className="detail-modal-status">
            <StatusBadge status={selectedRequest.finalStatus} />
            <span>Cập nhật: {selectedRequest.updatedAt || 'Chưa có thông tin'}</span>
          </div>

          <div className="detail-modal-grid">
            <DetailItem label="Họ và tên" value={selectedRequest.fullName} />
            <DetailItem label="Mã nhân viên" value={selectedRequest.employeeCode} />
            <DetailItem label="Email nhân sự" value={selectedRequest.employeeEmail} />
            <DetailItem label="Bộ phận" value={selectedRequest.department} />
            <DetailItem label="Vị trí" value={selectedRequest.position} />

            <DetailItem label="Loại nghỉ phép" value={selectedRequest.leaveType} />
            <DetailItem label="Ngày bắt đầu nghỉ" value={selectedRequest.startDate} />
            <DetailItem label="Ngày quay lại làm việc" value={selectedRequest.returnDate} />
            <DetailItem label="Số ngày nghỉ" value={`${selectedRequest.totalDays} ngày`} />

            <DetailItem label="Thời gian nghỉ" value={selectedRequest.leaveSession} wide />
            <DetailItem label="Lý do nghỉ" value={selectedRequest.reason} wide />

            <DetailItem label="Người nhận bàn giao" value={selectedRequest.handoverName} />
            <DetailItem label="Email bàn giao" value={selectedRequest.handoverEmail} />
            <DetailItem label="SĐT bàn giao" value={selectedRequest.handoverPhone || 'Không có'} />
            <DetailItem label="Công việc bàn giao" value={selectedRequest.handoverDetails} wide />

            {selectedRequest.department === 'EC' && (
              <>
                <DetailItem
                  label="Email Team Lead/EC Leader"
                  value={selectedRequest.ecLeaderEmail}
                />
                <DetailItem
                  label="Trạng thái EC Leader"
                  value={selectedRequest.ecLeaderStatus}
                />
                <DetailItem
                  label="Thời gian EC Leader xử lý"
                  value={selectedRequest.ecLeaderDecisionAt || 'Chưa xử lý'}
                />
              </>
            )}

            <DetailItem
              label={selectedRequest.department === 'EC' ? 'Email EC Manager' : 'Email Line Manager'}
              value={selectedRequest.lineManagerEmail}
            />
            <DetailItem
              label={selectedRequest.department === 'EC' ? 'Trạng thái EC Manager' : 'Trạng thái Line Manager'}
              value={selectedRequest.lineStatus}
            />
            <DetailItem
              label={selectedRequest.department === 'EC' ? 'Thời gian EC Manager xử lý' : 'Thời gian Line xử lý'}
              value={selectedRequest.lineDecisionAt || 'Chưa xử lý'}
            />

            <DetailItem label="Email HR Manager" value={selectedRequest.hrManagerEmail} />
            <DetailItem label="Trạng thái HR Manager" value={selectedRequest.hrStatus} />
            <DetailItem
              label="Thời gian HR xử lý"
              value={selectedRequest.hrDecisionAt || 'Chưa xử lý'}
            />

            {selectedRequest.department === 'EC' &&
              isMeaningfulRejectReason(selectedRequest.ecLeaderRejectReason) && (
                <DetailItem
                  label="Lý do EC Leader từ chối"
                  value={selectedRequest.ecLeaderRejectReason}
                  wide
                  danger
                />
              )}

            {selectedRequest.lineRejectReason && (
              <DetailItem
                label={selectedRequest.department === 'EC' ? 'Lý do EC Manager từ chối' : 'Lý do Line từ chối'}
                value={selectedRequest.lineRejectReason}
                wide
                danger
              />
            )}

            {selectedRequest.hrRejectReason && (
              <DetailItem
                label="Lý do HR từ chối"
                value={selectedRequest.hrRejectReason}
                wide
                danger
              />
            )}
          </div>
        </div>
      </div>
    )}
  </section>
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

function DetailItem({ label, value, wide = false, danger = false }) {
  return (
    <div className={wide ? 'modal-detail-item modal-detail-wide' : 'modal-detail-item'}>
      <span>{label}</span>
      <strong className={danger ? 'danger-text' : ''}>
        {value || 'Chưa có thông tin'}
      </strong>
    </div>
  );
}


function isMeaningfulRejectReason(value) {
  const text = String(value || '').trim();

  if (!text) return false;

  // Ẩn token uuid bị map nhầm, ví dụ: c67b44978b4b4493ba75c99a3e290978
  if (/^[a-f0-9]{24,}$/i.test(text)) return false;

  return true;
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
