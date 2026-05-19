(function(){
    const token = localStorage.getItem("token");
    if (!token) {
        window.location = "login.html";
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
    const welcomeElement = document.getElementById("dashboardWelcome");
    const dashboardUser = document.getElementById("dashboardUser");
    if (currentUser && currentUser.name) {
        if (welcomeElement) welcomeElement.textContent = `Welcome back, ${currentUser.name}`;
        if (dashboardUser) dashboardUser.textContent = `Signed in as ${currentUser.name}`;
    }

    fetch(apiUrl("finance"), {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            window.location = "login.html";
            throw new Error("Unauthorized");
        }
        return response.json();
    })
    .then(data => {
        if (!Array.isArray(data)) return;

        let output = "";

        data.forEach(item => {
            output += `
                <tr>
                    <td>${item.category}</td>
                    <td>₱${item.amount}</td>
                    <td>${item.description}</td>
                    <td>${item.transaction_date}</td>
                </tr>
            `;
        });

        const table = document.getElementById("financeTable");
        if (table) table.innerHTML = output;
    })
    .catch(err => {
        console.error(err);
    });

    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location = "login.html";
        });
    }
})();