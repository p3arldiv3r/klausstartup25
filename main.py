import uvicorn
from fastapi import FastAPI, Security, Header
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AnyHttpUrl, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi_azure_auth import B2CMultiTenantAuthorizationCodeBearer

from fastapi import Request

class Settings(BaseSettings):
    BACKEND_CORS_ORIGINS: list[str | AnyHttpUrl] = ['http://localhost:8000']
    TENANT_NAME: str = ""
    APP_CLIENT_ID: str = ""
    OPENAPI_CLIENT_ID: str = ""
    AUTH_POLICY_NAME: str = ""
    SCOPE_DESCRIPTION: str = "user_impersonation"

    @computed_field
    @property
    def SCOPE_NAME(self) -> str:
        return f'https://{self.TENANT_NAME}.onmicrosoft.com/{self.APP_CLIENT_ID}/{self.SCOPE_DESCRIPTION}'

    @computed_field
    @property
    def SCOPES(self) -> dict:
        return {
            self.SCOPE_NAME: self.SCOPE_DESCRIPTION
        }

    @computed_field
    @property
    def OPENID_CONFIG_URL(self) -> str:
        return f'https://{self.TENANT_NAME}.b2clogin.com/{self.TENANT_NAME}.onmicrosoft.com/{self.AUTH_POLICY_NAME}/v2.0/.well-known/openid-configuration'

    @computed_field
    @property
    def OPENAPI_AUTHORIZATION_URL(self) -> str:
        return f'https://{self.TENANT_NAME}.b2clogin.com/{self.TENANT_NAME}.onmicrosoft.com/{self.AUTH_POLICY_NAME}/oauth2/v2.0/authorize'

    @computed_field
    @property
    def OPENAPI_TOKEN_URL(self) -> str:
        return f'https://{self.TENANT_NAME}.b2clogin.com/{self.TENANT_NAME}.onmicrosoft.com/{self.AUTH_POLICY_NAME}/oauth2/v2.0/token'

    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        case_sensitive=True
    )

settings = Settings()

app = FastAPI(
    swagger_ui_oauth2_redirect_url='/oauth2-redirect',
    swagger_ui_init_oauth={
        'usePkceWithAuthorizationCodeGrant': False,
        'clientId': settings.OPENAPI_CLIENT_ID,
        'scopes': settings.SCOPE_NAME,
    },
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )

azure_scheme = B2CMultiTenantAuthorizationCodeBearer(
    app_client_id=settings.APP_CLIENT_ID,
    openid_config_url=settings.OPENID_CONFIG_URL,
    openapi_authorization_url=settings.OPENAPI_AUTHORIZATION_URL,
    openapi_token_url=settings.OPENAPI_TOKEN_URL,
    scopes=settings.SCOPES,
    validate_iss=False,
)

@app.get("/", dependencies=[Security(azure_scheme)])
async def root():
    return {"message": "Hello World"}

@app.get("/signin-oidc")
async def auth_callback(request: Request):
    return RedirectResponse(url="http://localhost:8000/docs")

if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)