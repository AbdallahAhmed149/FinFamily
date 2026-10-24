from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.security import decode_access_token

# Rate limiting بيعتمد على IP الطلب (get_remote_address).
# لو السيرفر بتاعكم شغال ورا Load Balancer/Reverse Proxy (Nginx, ALB, إلخ)
# لازم uvicorn يتشغل بـ --proxy-headers (اتضافت في الـ Dockerfile) وإلا كل الطلبات
# هتظهر جاية من نفس IP (IP بتاع الـ Proxy) وده هيبوظ الحساب.
limiter = Limiter(key_func=get_remote_address)


def user_or_ip_key(request: Request) -> str:
    """مفتاح الـ rate limit للـ endpoints المحمية بتوكن: اليوزر نفسه (من الـ JWT)، فكل طفل
    له حدّه الخاص حتى لو كل الأجهزة ورا نفس الـ IP/الـ proxy. لو مفيش توكن صالح بنرجع للـ IP.
    التوكن بيتفحص صح بعدين في get_current_user، هنا للـ key بس."""
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        try:
            sub = decode_access_token(auth[7:].strip()).get("sub")
            if sub:
                return f"user:{sub}"
        except Exception:
            pass
    return get_remote_address(request)