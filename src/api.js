
export async function callApi(payload) {
  const response = await fetch('/api/apps-script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  if (!text) {
    throw new Error(
      'API không trả về dữ liệu. Kiểm tra api/apps-script.js, APPS_SCRIPT_URL, API_SECRET hoặc Apps Script deployment.'
    );
  }

  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error(
      'API không trả về JSON hợp lệ. Response nhận được: ' + text.slice(0, 300)
    );
  }

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra từ API.');
  }

  return data;
}

export function submitLeaveRequest(data) {
  return callApi({
    action: 'submitLeaveRequest',
    data
  });
}

export function lookupLeaveRequest(requestId, employeeEmail) {
  return callApi({
    action: 'lookupLeaveRequest',
    requestId,
    employeeEmail
  });
}

export function getLeaveRequestsForHR(password) {
  return callApi({
    action: 'getLeaveRequestsForHR',
    password
  });
}

export function handleDecision(data) {
  return callApi({
    action: 'handleDecision',
    data
  });
}

export function getLineManagers() {
  return callApi({
    action: 'getLineManagers'
  });
}
