const registerForm = document.getElementById("registerForm");
const registerError = document.getElementById("registerError");
const registerSuccess = document.getElementById("registerSuccess");
const serverStatus = document.getElementById("serverStatus");

function setServerStatus(message, status) {
    if (!serverStatus) return;
    serverStatus.textContent = message;
    serverStatus.className = `status-banner visible ${status}`;
}

registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    if (registerError) registerError.textContent = "";
    if (registerSuccess) registerSuccess.textContent = "";

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        if (registerError) registerError.textContent = "Passwords do not match.";
        return;
    }

    try {
        setServerStatus('Checking server connection…', 'checking');
        const response = await fetch(apiUrl("register"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fullname, email, password, role: 'user' })
        });

        const data = await response.json();

        if (!response.ok) {
            setServerStatus('Server reachable, but registration failed.', 'ok');
            if (registerError) registerError.textContent = data?.message || "Unable to create account.";
            return;
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        if (data.user) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
        }

        setServerStatus('Connected to backend.', 'ok');
        if (registerSuccess) {
            registerSuccess.textContent = "Account created successfully. Redirecting to dashboard...";
        }

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1400);
    } catch (error) {
        if (registerError) {
            registerError.textContent = "Cannot reach the server. Please try again later.";
        }
        setServerStatus('Backend unavailable. Check server and try again.', 'offline');
        console.error(error);
    }
});