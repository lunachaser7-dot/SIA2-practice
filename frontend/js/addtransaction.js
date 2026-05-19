// ✅ DEFINE YOUR API BASE URL FIRST — VERY IMPORTANT
const BASE_URL = "http://localhost:3001/api"; 

// Helper function (replace your apiUrl)
function apiUrl(endpoint) {
    return `${BASE_URL}/${endpoint}`;
}

const form = document.getElementById("transactionForm");
if (form) {
    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        // ✅ CHECK LOGIN — we use currentUser, NOT token
        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser) {
            alert("Please login first.");
            window.location = "login.html";
            return;
        }
        const userData = JSON.parse(currentUser);

        // ✅ GET VALUES + FIX AMOUNT TO NUMBER
        const data = {
            type: document.getElementById("type").value.trim(),
            category: document.getElementById("category").value.trim(),
            amount: Number(document.getElementById("amount").value), // convert to number
            description: document.getElementById("description").value.trim(),
            created_by: userData.id // optional: track who added
        };

        // ✅ VALIDATE BEFORE SEND
        if (!data.type || !data.category || !data.amount || data.amount <= 0) {
            alert("Please fill all fields correctly (amount must be greater than 0).");
            return;
        }

        try {
            const response = await fetch(apiUrl("finance"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                    // ❌ NO Authorization header — we don't use tokens
                },
                body: JSON.stringify(data)
            });

            const resData = await response.json();

            if (!response.ok) {
                console.error("Server error:", resData);
                alert(resData?.message || "Unable to add transaction.");
                return;
            }

            alert(resData?.message || "Transaction added successfully!");
            form.reset();
            window.location = "index.html"; // go back to dashboard

        } catch (err) {
            console.error("Connection error:", err);
            alert("Unable to connect to server. Please check if backend is running.");
        }
    });
}