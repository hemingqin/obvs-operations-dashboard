import os


class Settings:
    def __init__(self):
        self.jwt_secret = os.getenv(
            "JWT_SECRET",
            os.getenv("JWT_SECRET_KEY", "dev-only-secret-change-me"),
        )
        self.token_expire_minutes = int(os.getenv("TOKEN_EXPIRE_MINUTES", "60"))
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg2://postgres:postgres@postgres:5432/donations",
        )
        self.app_env = os.getenv("APP_ENV", "development")
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.donations_cache_ttl_seconds = int(
            os.getenv("DONATIONS_CACHE_TTL_SECONDS", "30")
        )
        self.login_rate_limit_max_attempts = int(
            os.getenv("LOGIN_RATE_LIMIT_MAX_ATTEMPTS", "5")
        )
        self.login_rate_limit_window_seconds = int(
            os.getenv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", "60")
        )


settings = Settings()
