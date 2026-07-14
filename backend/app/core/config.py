from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB: str = "quran_hub"
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:5173"
    # Comma-separated list of additional allowed CORS origins (e.g., for production)
    ALLOWED_ORIGINS: str = ""

    @property
    def cors_origins(self) -> List[str]:
        origins = {self.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"}
        if self.ALLOWED_ORIGINS:
            for origin in self.ALLOWED_ORIGINS.split(","):
                stripped = origin.strip()
                if stripped:
                    origins.add(stripped)
        return list(origins)

    class Config:
        env_file = ".env"


settings = Settings()
