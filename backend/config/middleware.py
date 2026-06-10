import logging
import re

from django.conf import settings
from django.http import HttpResponse, JsonResponse

logger = logging.getLogger(__name__)

PRIVATE_NETWORK_ORIGIN = re.compile(
    r"^http://(?:127\.0\.0\.1|localhost|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}):\d+$"
)


class SimpleCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse()
        else:
            response = self.get_response(request)

        origin = request.headers.get("Origin")
        allowed_origins = getattr(settings, "FRONTEND_ALLOWED_ORIGINS", [])
        is_allowed_origin = origin in allowed_origins or (
            settings.DEBUG
            and origin
            and PRIVATE_NETWORK_ORIGIN.match(origin)
        )
        if is_allowed_origin:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Headers"] = "content-type, x-csrftoken"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"

        return response


class CorsExceptionMiddleware:
    """Ensure CORS headers are present even when the app raises an error."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
        except Exception:
            logger.exception("Unhandled server error")
            response = JsonResponse(
                {"error": "Server error while processing request"},
                status=500,
            )
        return self._apply_cors(request, response)

    def _origin_allowed(self, origin):
        normalized = origin.rstrip("/")
        allowed = {value.rstrip("/") for value in getattr(settings, "CORS_ALLOWED_ORIGINS", [])}
        if normalized in allowed:
            return True
        for pattern in getattr(settings, "CORS_ALLOWED_ORIGIN_REGEXES", []):
            if re.match(pattern, origin):
                return True
        return False

    def _apply_cors(self, request, response):
        origin = request.headers.get("Origin")
        if origin and self._origin_allowed(origin):
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Allow-Headers"] = (
                "accept, accept-encoding, authorization, content-type, origin, "
                "user-agent, x-csrftoken, x-requested-with"
            )
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Vary"] = "Origin"
        return response
