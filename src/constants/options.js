export const DEPARTMENTS = [
  'HR',
  'Sales',
  'Academic',
  'Marketing'
];

export const LEAVE_TYPES = [
  'Nghỉ phép năm',
  'Nghỉ không lương',
  'Nghỉ thai sản',
  'Nghỉ theo chế độ',
  'Khác'
];

export const INITIAL_LEAVE_FORM = {
  fullName: '',
  department: '',
  position: '',
  employeeEmail: '',
  leaveType: 'Nghỉ phép năm',
  startDate: '',
  returnDate: '',
  totalDays: '',
  leaveSession: 'Cả ngày',
  reason: '',
  handoverName: '',
  handoverEmail: '',
  handoverPhone: '',
  handoverDetails: ''
};

export const FINAL_STATUSES = [
  'Chờ Line Manager duyệt',
  'Chờ HR Manager duyệt',
  'Đã duyệt',
  'Line Manager từ chối',
  'HR Manager từ chối'
];