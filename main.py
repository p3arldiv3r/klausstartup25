import uvicorn
from fastapi import FastAPI, Security, Header, Depends, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import AnyHttpUrl, computed_field, BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi_azure_auth import B2CMultiTenantAuthorizationCodeBearer

from fastapi import Request, HTTPException
import requests
from fastapi.responses import JSONResponse
import os
from fastapi.staticfiles import StaticFiles

class Settings(BaseSettings):
    BACKEND_CORS_ORIGINS: list[str | AnyHttpUrl] = ['http://localhost:8000', 'http://localhost:8080']
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
        'usePkceWithAuthorizationCodeGrant': True,
        'clientId': settings.OPENAPI_CLIENT_ID,
        'scopes': settings.SCOPE_NAME,
    },
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        # allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_origins=["http://localhost:8080", '*'],
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

# @app.get("/", dependencies=[Security(azure_scheme)])
# async def root():
#     return {"message": "Hello World"}

@app.get("/", dependencies=[Depends(azure_scheme)])
async def root(token_data: dict = Depends(azure_scheme)):  
    token_dict = token_data.dict() 
    user_email = token_dict.get("claims", {}).get("emails", ["User"])[0]
    html_content = f"""
    <html>
      <head>
        <title>Custom Page</title>
      </head>
      <body>
        <h1>Welcome, {user_email}!</h1>
        <p>Your token has been validated successfully.</p>
      </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)

@app.post("/")
async def root(token_data: dict = Security(azure_scheme)):
    print(token_data)
    user_email = token_data.claims.get("emails", ["User"])[0] 
    html_content = f"""
    <html>
      <head>
        <title>Custom Page</title>
      </head>
      <body>
        <h1>Welcome, {user_email}!</h1>
        <p>Your token has been validated successfully.</p>
      </body>
    </html>
    """
    return HTMLResponse(content=html_content, status_code=200)



if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)