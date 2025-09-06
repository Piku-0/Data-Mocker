from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_API_KEY: str

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()