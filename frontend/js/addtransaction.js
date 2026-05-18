const form = document.getElementById("transactionForm");
if (form) {
    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            window.location = "login.html";
            return;
        }

        const data = {
            type: document.getElementById("type").value,
            category: document.getElementById("category").value,
            amount: document.getElementById("amount").value,
            description: document.getElementById("description").value
        };

        try {
            const response = await fetch(apiUrl("finance"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                window.location = "login.html";
                return;
            }

            const resData = await response.json();

            if (!response.ok) {
                const msg = resData?.message || 'Failed to add transaction';
                alert(msg);
                return;
            }

            alert(resData?.message || 'Transaction added');
            form.reset();
            // Optionally redirect back to dashboard
            window.location = 'index.html';
        } catch (err) {
            console.error(err);
            alert('Unable to connect to server.');
        }
    });
}