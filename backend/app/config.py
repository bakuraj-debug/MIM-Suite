from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    enable_real_integrations: bool = False

    servicenow_base_url: str = "https://pepsico.service-now.com"
    servicenow_username: str = ""
    servicenow_password: str = ""
    servicenow_auth_mode: str = "basic"

    pepgenx_base_url: str = ""
    pepgenx_api_key: str = ""
    pepgenx_model: str = ""

    traversal_base_url: str = ""
    traversal_api_key: str = ""

    blast_radius_base_url: str = ""
    blast_radius_api_key: str = ""


settings = Settings()
