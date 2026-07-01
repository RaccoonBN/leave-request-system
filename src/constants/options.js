export const DEPARTMENTS = [
  'GA',
  'EC',
  'ACA',
  'PRC',
  'TSE'
];

export const LEADER_LABELS = {
  GA: 'GA Leader',
  EC: 'EC Leader',
  ACA: 'ACA Leader',
  PRC: 'PRC Leader',
  TSE: 'TSE Leader'
};

export const MANAGER_LABELS = {
  GA: 'GA Manager',
  EC: 'EC Manager',
  ACA: 'ACA Manager',
  PRC: 'PRC Manager',
  TSE: 'Line Manager'
};

export const INITIAL_LEAVE_FORM = {
  fullName: '',
  department: '',
  position: '',
  employeeEmail: '',
  employeeCode: '',

  // Flow duyệt mới: mọi bộ phận đều có Leader trước Manager
  leaderEmail: '',

  // Giữ lại field cũ để không vỡ các phần code cũ nếu vẫn còn dùng teamLeadEmail
  teamLeadEmail: '',

  lineManagerEmail: '',

  leaveType: 'Nghỉ phép năm',
  startDate: '',
  returnDate: '',
  totalDays: '',
  startSession: 'Sáng',
  returnSession: 'Sáng',

  // Dùng cho trường hợp nghỉ 0.5 ngày trong cùng một ngày
  halfDaySession: 'Sáng',

  leaveSession: '',
  reason: '',

  handoverName: '',
  handoverEmployeeCode: '',
  handoverEmail: '',
  handoverPhone: '',
  handoverDetails: '',

  // Nghỉ ốm đau hưởng chế độ BHXH
  hasBhxhSickLeave: false,
  sickLeaveCertificateUrl: '',
  sickLeaveCertificateBase64: '',
  sickLeaveCertificateFileName: '',
  sickLeaveCertificateMimeType: '',

  policyAccepted: false
};

export const LEAVE_TYPES = [
  'Nghỉ phép năm',
  'Nghỉ không lương',
  'Nghỉ ốm đau hưởng chế độ BHXH',
  'Nghỉ theo chế độ (thai sản, ốm đau, tang chế,...)',
  'Khác'
];

export const FINAL_STATUSES = [
  // Leader pending
  'Chờ EC Leader duyệt',
  'Chờ PRC Leader duyệt',
  'Chờ GA Leader duyệt',
  'Chờ ACA Leader duyệt',
  'Chờ TSE Leader duyệt',

  // Manager pending
  'Chờ EC Manager duyệt',
  'Chờ PRC Manager duyệt',
  'Chờ GA Manager duyệt',
  'Chờ ACA Manager duyệt',
  'Chờ Line Manager duyệt',

  // HR pending
  'Chờ HR Manager duyệt',

  // Approved
  'Đã duyệt',

  // Leader rejected
  'EC Leader từ chối',
  'PRC Leader từ chối',
  'GA Leader từ chối',
  'ACA Leader từ chối',
  'TSE Leader từ chối',

  // Manager rejected
  'EC Manager từ chối',
  'PRC Manager từ chối',
  'GA Manager từ chối',
  'ACA Manager từ chối',
  'Line Manager từ chối',

  // HR rejected
  'HR Manager từ chối',

  // Backward compatible status cũ
  'Chờ Leader duyệt',
  'Leader từ chối'
];

export const BHXH_SICK_LEAVE_NOTICE =
  'Trường hợp Người lao động nghỉ ốm đau có hưởng chế độ BHXH vui lòng đính kèm hình ảnh "GIẤY CHỨNG NHẬN NGHỈ VIỆC HƯỞNG BẢO HIỂM XÃ HỘI" của bệnh viện.';