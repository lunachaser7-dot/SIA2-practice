// frontend/js/login.js
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("loginError");
const successMessage = document.getElementById("loginSuccess");
const loginDetails = document.getElementById("loginDetails");
const serverStatus = document.getElementById("serverStatus");

function setServerStatus(message, status) {
    if (!serverStatus) return;
    serverStatus.textContent = message;
    serverStatus.className = `status-banner visible ${status}`;
}

loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (errorMessage) errorMessage.textContent = "";
    if (successMessage) successMessage.textContent = "";
    if (loginDetails) loginDetails.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        setServerStatus('Checking server connection…', 'checking');
        const response = await fetch(apiUrl("login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            setServerStatus('Server reachable, but login failed.', 'ok');
            const msg = data?.message || "Login failed. Please check your credentials.";
            if (errorMessage) errorMessage.textContent = msg;
            return;
        }

        const displayName = data.user.name || data.user.fullname || data.user.email || 'User';

        if (successMessage) {
            successMessage.textContent = `Login successful — welcome, ${displayName}!`;
        }

        if (loginDetails) {
            const details = {
                Name: displayName,
                Email: data.user.email || '',
                Role: data.user.role || '',
                Status: data.user.status || 'active'
            };
            loginDetails.textContent = JSON.stringify(details, null, 2);
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
        }

        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setServerStatus('Connected to backend.', 'ok');

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);

    } catch (error) {
        if (errorMessage) {
            errorMessage.textContent = "Unable to connect to the server. Please try again later.";
        }
        setServerStatus('Backend unavailable. Check server and try again.', 'offline');
        console.error("Connection error:", error);
    }
});