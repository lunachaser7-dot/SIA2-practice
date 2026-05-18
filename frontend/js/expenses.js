(function(){
    const token = localStorage.getItem('token');
    if (!token) return window.location = 'login.html';

    let all = [];
    let expenseTable, totalEl, monthEl, countEl, searchBox, perPage;

    function escapeHtml(str){
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(str || '').replace(/[&<>"']/g, s => map[s]);
    }

    function formatCurrency(n){
        const num = Number(n) || 0;
        return '₱' + num.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2});
    }

    async function load() {
        try {
            const res = await fetch(apiUrl("finance"), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                return window.location = 'login.html';
            }

            const data = await res.json();
            all = (Array.isArray(data) ? data : []).filter(r => (r.type||'').toLowerCase() === 'expense');
            renderSummary();
            renderTable();
        } catch (err) {
            console.error(err);
            alert('Unable to load expenses.');
        }
    }

    function renderSummary(){
        const total = all.reduce((s, r) => s + Number(r.amount||0), 0);
        const now = new Date();
        const thisMonthTotal = all.reduce((s,r)=>{ const d = new Date(r.transaction_date); return (d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()) ? s+Number(r.amount||0) : s; }, 0);
        if (totalEl) totalEl.textContent = formatCurrency(total);
        if (monthEl) monthEl.textContent = formatCurrency(thisMonthTotal);
        if (countEl) countEl.textContent = all.length;
    }

    function renderTable(){
        const q = (searchBox?.value||'').toLowerCase();
        const per = Number(perPage?.value || 25);
        const rows = all.filter(r=>{
            if (!q) return true;
            return `${r.category} ${r.description}`.toLowerCase().includes(q);
        }).slice(0, per);

        if (!expenseTable) return;
        expenseTable.innerHTML = rows.map(r=>`
            <tr>
                <td>${escapeHtml(r.category)}</td>
                <td>${formatCurrency(r.amount)}</td>
                <td>${escapeHtml(r.description||'')}</td>
                <td>${new Date(r.transaction_date).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    document.addEventListener('DOMContentLoaded', ()=>{
        expenseTable = document.getElementById('expenseTable');
        totalEl = document.getElementById('totalExpenses');
        monthEl = document.getElementById('thisMonth');
        countEl = document.getElementById('transactionCount');
        searchBox = document.getElementById('searchBox');
        perPage = document.getElementById('perPage');

        load();
        searchBox?.addEventListener('input', renderTable);
        perPage?.addEventListener('change', renderTable);

        const logoutLink = document.getElementById('logoutLink');
        if (logoutLink) logoutLink.addEventListener('click', (e)=>{ e.preventDefault(); localStorage.removeItem('token'); window.location='login.html'; });
    });

})();
