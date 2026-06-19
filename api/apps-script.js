
const FALLBACK_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwXmbIEQ3RGpUncloZ5n2IyndtbZUdwDVuST41Hn1xEJgWZEjyAu4WOJKu9-OVy76Vq/exec';

const FALLBACK_API_SECRET = 'leave-system-secret-2026';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Vercel API route is running.',
      hasAppsScriptUrl: Boolean(process.env.APPS_SCRIPT_URL || FALLBACK_APPS_SCRIPT_URL),
      hasApiSecret: Boolean(process.env.API_SECRET || FALLBACK_API_SECRET),
      appsScriptUrlSource: process.env.APPS_SCRIPT_URL ? 'env' : 'fallback',
      apiSecretSource: process.env.API_SECRET ? 'env' : 'fallback'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Vui lòng dùng POST.'
    });
  }

  try {
    const appsScriptUrl = String(
      process.env.APPS_SCRIPT_URL || FALLBACK_APPS_SCRIPT_URL || ''
    ).trim();

    const apiSecret = String(
      process.env.API_SECRET || FALLBACK_API_SECRET || ''
    ).trim();

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

    const appsScriptResponse = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        ...requestBody,
        secret: apiSecret
      })
    });

    const text = await appsScriptResponse.text();

    if (!text) {
      return res.status(502).json({
        success: false,
        message:
          'Apps Script trả về rỗng. Kiểm tra Apps Script deployment, quyền Anyone hoặc link /exec.',
        statusFromAppsScript: appsScriptResponse.status
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (error) {
      return res.status(502).json({
        success: false,
        message:
          'Apps Script không trả về JSON. Có thể link deploy sai, chưa cấp quyền Anyone, hoặc Apps Script đang trả về trang HTML lỗi.',
        statusFromAppsScript: appsScriptResponse.status,
        raw: text.slice(0, 700)
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
