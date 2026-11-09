"""Password rule shared by registration and password change, and the guard against password guessing."""
import time
from collections import defaultdict, deque

MIN_LENGTH = 8
# Passwords that appear at the top of every leaked-password list, plus school-flavoured ones
COMMON = {
    "12345678", "123456789", "1234567890", "password", "password1", "password123", "qwerty123", "abc12345",
    "11111111", "88888888", "matkhau", "matkhau1", "matkhau123", "iloveyou1", "admin123", "hocsinh1",
    "hocsinh123", "giaovien1", "giaovien123", "enginelab1", "congnghe1", "congnghe123",
}


def password_problem(password: str, username: str = "") -> str | None:
    """Why a password is too weak, in Vietnamese; None when it is acceptable."""
    if len(password) < MIN_LENGTH:
        return f"Mật khẩu cần ít nhất {MIN_LENGTH} kí tự."
    if not any(char.isalpha() for char in password) or not any(char.isdigit() for char in password):
        return "Mật khẩu cần có cả chữ và số."
    lowered = password.lower()
    if lowered in COMMON:
        return "Mật khẩu này quá phổ biến, hãy chọn mật khẩu khác."
    name = (username or "").strip().lower()
    if len(name) >= 3 and name in lowered:
        return "Mật khẩu không được chứa tên đăng nhập."
    return None


class LoginGuard:
    """Counts failed logins per account and per address within a sliding window.

    Lives in the memory of one server process, like the class-code limiter: enough for one school server,
    not a defence shared between several processes.
    """

    def __init__(self, per_account: int = 5, per_address: int = 20, window_seconds: int = 15 * 60) -> None:
        self.per_account = per_account
        self.per_address = per_address
        self.window = window_seconds
        self._failures: dict[str, deque] = defaultdict(deque)

    def _recent(self, key: str, now: float) -> deque:
        failures = self._failures[key]
        while failures and now - failures[0] > self.window:
            failures.popleft()
        if not failures:
            self._failures.pop(key, None)
            return deque()
        return failures

    def wait_seconds(self, account: str, address: str, now: float | None = None) -> int:
        """0 when a login may be tried now, else how long to wait."""
        now = time.monotonic() if now is None else now
        waits = []
        for key, limit in ((f"account:{account.lower()}", self.per_account), (f"address:{address}", self.per_address)):
            failures = self._recent(key, now)
            if len(failures) >= limit:
                waits.append(int(self.window - (now - failures[0])) + 1)
        return max(waits, default=0)

    def failed(self, account: str, address: str, now: float | None = None) -> None:
        now = time.monotonic() if now is None else now
        self._failures[f"account:{account.lower()}"].append(now)
        self._failures[f"address:{address}"].append(now)

    def succeeded(self, account: str) -> None:
        self._failures.pop(f"account:{account.lower()}", None)

    def clear(self) -> None:
        self._failures.clear()


login_guard = LoginGuard()
