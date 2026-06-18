export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Vui lòng dùng POST.'
    });
  }

  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    const apiSecret = process.env.API_SECRET;

    if (!appsScriptUrl) {
      return res.status(500).json({
        success: false,
        message: 'Thiếu APPS_SCRIPT_URL trong .env.local hoặc Vercel Environment Variables.'
      });
    }

    if (!apiSecret) {
      return res.status(500).json({
        success: false,
        message: 'Thiếu API_SECRET trong .env.local hoặc Vercel Environment Variables.'
      });
    }

    const requestBody =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : req.body || {};

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        // Dùng text/plain để hạn chế lỗi CORS/preflight khi gọi Apps Script
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        ...requestBody,
        secret: apiSecret
      })
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message:
          'Apps Script không trả về JSON. Có thể link deploy sai, chưa cấp quyền Anyone, hoặc Apps Script đang trả về trang HTML lỗi.',
        statusFromAppsScript: response.status,
        raw: text.slice(0, 500)
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server trong api/apps-script.js'
    });
  }
}