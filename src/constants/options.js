export const DEPARTMENTS = [
  'GA',
  'EC',
  'ACA',
  'PRC',
  'TSE'
];

export const POSITIONS_BY_DEPARTMENT = {
  GA: [
    'Nhân viên nhân sự',
    'Nhân viên truyền thông nội bộ',
    'Nhân viên kế toán',
    'Nhân viên Admin'
  ],

  EC: [
    'Nhân viên tư vấn khóa học',
    'Teller',
    'EC Leader',
    'Senior EC'
  ],

  ACA: [
    'Giáo viên',
    'Trợ giảng',
    'Nhân viên học vụ'
  ],

  PRC: [
    'Media Executive',
    'Content Leader'
  ],

  TSE: [
    'Nhân viên IT',
    'CS Supervisor'
  ]
};

export const INITIAL_LEAVE_FORM = {
  fullName: '',
  department: '',
  position: '',
  employeeEmail: '',
  lineManagerEmail: '',
  leaveType: 'Nghỉ phép năm',
  startDate: '',
  returnDate: '',
  totalDays: '',
  startSession: 'Sáng',
  returnSession: 'Sáng',
  leaveSession: '',
  reason: '',
  handoverName: '',
  handoverEmail: '',
  handoverPhone: '',
  handoverDetails: '',
  policyAccepted: false
};

export const LEAVE_TYPES = [
  'Nghỉ phép năm',
  'Nghỉ không lương',
  'Nghỉ theo chế độ (thai sản, ốm đau, tang chế,...)',
  'Khác'
];

export const FINAL_STATUSES = [
  'Chờ Line Manager duyệt',
  'Chờ HR Manager duyệt',
  'Đã duyệt',
  'Line Manager từ chối',
  'HR Manager từ chối'
];