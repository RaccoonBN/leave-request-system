export async function callApi(payload) {
  const response = await fetch('/api/apps-script', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra.');
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