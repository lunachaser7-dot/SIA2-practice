/* report.js
   Fetches monthly analytics from /api/analytics/monthly and
   renders a simple bar chart into the reports page.
*/
(function(){
    const API = apiUrl('analytics/monthly');

    function formatCurrency(n){
        const num = Number(n) || 0;
        return '₱' + num.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2});
    }

    async function loadData(token){
        const res = await fetch(API, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location = 'login.html';
            return null;
        }
        return res.json();
    }

    function createCanvas(width, height){
        const canvas = document.createElement('canvas');
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(devicePixelRatio, devicePixelRatio);
        return { canvas, ctx };
    }

    function drawBarChart(ctx, data, labels, opts={}){
        const w = opts.width || 720;
        const h = opts.height || 240;
        const padding = 36;
        const barGap = 12;
        const max = Math.max(...data, 1);

        // background
        ctx.clearRect(0,0,w,h);

        // draw grid lines
        ctx.fillStyle = 'rgba(15,23,42,0.02)';
        ctx.fillRect(0,0,w,h);

        // draw bars
        const usableW = w - padding*2;
        const barWidth = (usableW - (data.length-1)*barGap) / data.length;
        data.forEach((v,i)=>{
            const x = padding + i*(barWidth+barGap);
            const barH = (v / max) * (h - padding*2);
            const y = h - padding - barH;

            // gradient fill
            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, '#8b5cf6');
            grad.addColorStop(1, '#2563eb');
            ctx.fillStyle = grad;
            roundRect(ctx, x, y, barWidth, barH, 6, true, false);

            // label
            ctx.fillStyle = '#475569';
            ctx.font = '12px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], x + barWidth/2, h - padding + 16);

            // value
            ctx.fillStyle = '#0f172a';
            ctx.font = '12px Inter, Arial';
            ctx.fillText(formatCurrency(v), x + barWidth/2, y - 8);
        });
    }

    function roundRect(ctx, x, y, w, h, r, fill, stroke){
        if (typeof r === 'undefined') r = 5;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    document.addEventListener('DOMContentLoaded', async ()=>{
        const token = localStorage.getItem('token');
        if (!token) return window.location = 'login.html';

        const data = await loadData(token);
        if (!data) return;

        // expecting [{month: <num>, total: <num>}, ...]
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const labels = [];
        const values = [];

        data.forEach(row=>{
            const m = Number(row.month) || 0;
            labels.push(months[(m-1 + 12) % 12]);
            values.push(Number(row.total) || 0);
        });

        const card = document.querySelector('.reports-page .card');
        if (!card) return;

        // create canvas and insert
        const container = document.createElement('div');
        container.style.marginTop = '18px';
        const { canvas, ctx } = createCanvas(720, 260);
        container.appendChild(canvas);
        card.appendChild(container);

        drawBarChart(ctx, values, labels, { width: 720, height: 260 });
    });
})();
