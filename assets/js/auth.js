const msalConfig = {
    auth: {
        clientId: "663ae9cf-c069-42e2-b4c4-53d70d6491ae",
        authority: "https://testmedigality.b2clogin.com/testmedigality.onmicrosoft.com/B2C_1_sign_up_sign_in",
        knownAuthorities: ["testmedigality.b2clogin.com"],
    }
};

window.msalInstance = new msal.PublicClientApplication(msalConfig);

async function processRedirectResponse() {
    console.log("Checking for redirect response...");

    try {
        const response = await msalInstance.handleRedirectPromise();
        console.dir(response);
        if (response) {
            console.log("Redirect response received:", response);
            msalInstance.setActiveAccount(response.account);  
            acquireTokenSilent();
        } else {
            console.log("No redirect response. Checking existing accounts...");
        }
    } catch (error) {
        console.error("Error handling redirect response:", error);
    }
}   

function acquireTokenSilent() {
    const activeAccount = msalInstance.getActiveAccount();
    const tokenRequest = {
        scopes: ["https://testmedigality.onmicrosoft.com/663ae9cf-c069-42e2-b4c4-53d70d6491ae/user_impersonation"],
        account: activeAccount
    };

    msalInstance.acquireTokenSilent(tokenRequest)
    .then((tokenResponse) => {
        console.log("Access Token:", tokenResponse.accessToken);
        callApi(tokenResponse.accessToken); 
    })
    .catch((error) => {
        console.error("Silent token acquisition failed:", error);
    });
}

function signIn() {
    console.log("Sign-in button clicked! Initiating login...");
    msalInstance.loginRedirect({
        redirectUri: "http://localhost:8080/index.html",
        scopes: ["https://testmedigality.onmicrosoft.com/663ae9cf-c069-42e2-b4c4-53d70d6491ae/user_impersonation"]
    });
}

function callApi(accessToken) {
    console.log("Calling API with Access Token...");

    fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ message: "Requesting access" })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();  // Response is HTML
    })
    .then(data => {
        console.log("API Response:", data);
        document.open();  
        document.write(data);  // Replace current page with new HTML
        document.close();  
    })
    .catch(error => console.error("Error calling API:", error));
}



processRedirectResponse();

document.addEventListener("DOMContentLoaded", () => {
    const signInButton = document.getElementById('signInButton');
    if (signInButton) {
        signInButton.addEventListener('click', signIn);
    }
});