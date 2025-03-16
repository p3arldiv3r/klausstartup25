const msalConfig = {
    auth: {
        clientId: "663ae9cf-c069-42e2-b4c4-53d70d6491ae",
        authority: "https://testmedigality.b2clogin.com/testmedigality.onmicrosoft.com/B2C_1_sign_up_sign_in",
        redirectUri: "http://localhost:8000/signin-oidc",
        knownAuthorities: ["testmedigality.b2clogin.com"]
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

function signIn() {
    msalInstance.loginPopup({
        scopes: ["https://testmedigality.onmicrosoft.com/663ae9cf-c069-42e2-b4c4-53d70d6491ae/user_impersonation"]
    }).then(response => {
        console.log("Logged in successfully:", response);
    }).catch(error => {
        console.error("Login failed:", error);
    });
}

