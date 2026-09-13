// مسار نسبي مش absolute URL — في التطوير Vite بيعمل proxy لـ /api على localhost:8000
// (شوف vite.config.js)، وفي الإنتاج nginx هو اللي بيعمل proxy لنفس المسار على
// الباك اند جوه الشبكة الداخلية. بالطريقة دي المتصفح شايف origin واحد بس دايمًا
// (نفس الدومين)، فمحتاجناش CORS خالص ولا نغيّر أي حاجة بين البيئتين.
const API_BASE_URL = "/api";
const TOKEN_KEY = "finfamily_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(method, endpoint, data) {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  // بعض الـ responses ممكن تكون من غير body (زي 204)، فبنحاول نقرا JSON بس من غير ما نكسر لو مفيش
  let body = null;
  try {
    body = await response.json();
  } catch {
    // مفيش body قابل للـ parse — مش مشكلة
  }

  if (!response.ok) {
    // FastAPI بيرجع {"detail": "..."} لأخطاء عادية، لكن لأخطاء الـ validation (422)
    // بيرجع {"detail": [{"msg": "...", "loc": [...]}]} — سطر لكل حقل غلط. من غير
    // المعالجة دي، new Error(array) كان بيطلع "[object Object]" مش رسالة مفهومة.
    let message = response.statusText || "Request failed";
    if (typeof body?.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body?.detail)) {
      message = body.detail
        .map((e) => {
          const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : null;
          return field ? `${field}: ${e.msg}` : e.msg;
        })
        .join(" · ");
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = body;
    throw error;
  }

  return body;
}

export const base44 = {
  get(endpoint) {
    return request("GET", endpoint);
  },
  post(endpoint, data) {
    return request("POST", endpoint, data);
  },
  patch(endpoint, data) {
    return request("PATCH", endpoint, data);
  },
};