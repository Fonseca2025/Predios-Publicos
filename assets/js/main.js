/**
 * Lógica Principal do Dashboard
 */

let chartInstance = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupEventListeners();
});

function initDashboard() {
    populateDeptFilter();
    updateView(rawData);
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const deptFilter = document.getElementById('deptFilter');
    const resetBtn = document.getElementById('resetBtn');

    searchInput.addEventListener('input', debounce(handleFilter, 300));
    deptFilter.addEventListener('change', handleFilter);
    resetBtn.addEventListener('click', resetFilters);
}

// Preenche o select de secretarias dinamicamente
function populateDeptFilter() {
    const deptFilter = document.getElementById('deptFilter');
    const depts = [...new Set(rawData.map(item => item.dept))].sort();
    
    depts.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptFilter.appendChild(option);
    });
}

// Atualiza todos os componentes da tela
function updateView(data) {
    renderCards(data);
    renderTable(data);
    renderChart(data);
    document.getElementById('totalBadge').textContent = data.length;
}

// Renderiza os cards de resumo
function renderCards(data) {
    const counts = {
        Educação: data.filter(i => i.dept === "Educação").length,
        Saúde: data.filter(i => i.dept === "Saúde").length,
        Social: data.filter(i => i.dept === "Social").length,
        Outros: data.filter(i => !["Educação", "Saúde", "Social"].includes(i.dept)).length
    };

    document.getElementById('countEdu').textContent = counts.Educação;
    document.getElementById('countSaude').textContent = counts.Saúde;
    document.getElementById('countSocial').textContent = counts.Social;
    document.getElementById('countOutros').textContent = counts.Outros;
}

// Renderiza a tabela de dados
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Nenhum resultado encontrado.</td></tr>';
        return;
    }

    data.forEach(item => {
        const badgeClass = getBadgeClass(item.dept);
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.end}, Montes Claros, MG`)}`;

        const row = `
            <tr>
                <td><span class="badge badge-dept ${badgeClass}">${item.dept}</span></td>
                <td>
                    <div class="fw-bold text-dark">${item.nome}</div>
                </td>
                <td>
                    <div class="text-muted small">
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>${item.end}
                    </div>
                </td>
                <td class="text-center">
                    <a href="${mapLink}" target="_blank" class="btn btn-sm btn-light border" title="Ver no Google Maps">
                        <i class="bi bi-map text-primary"></i>
                    </a>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

// Determina a classe CSS da badge baseada no departamento
function getBadgeClass(dept) {
    const map = {
        "Educação": "badge-Educação",
        "Saúde": "badge-Saúde",
        "Social": "badge-Social",
        "Meio Ambiente": "badge-Meio-Ambiente",
        "Esporte": "badge-Esporte",
        "Cultura": "badge-Cultura",
        "Agricultura": "badge-Agricultura",
        "Planejamento": "badge-Planejamento",
        "Gabinete": "badge-Planejamento"
    };
    return map[dept] || "badge-Serviços";
}

// Renderiza o gráfico Chart.js
function renderChart(data) {
    const counts = {};
    data.forEach(d => { counts[d.dept] = (counts[d.dept] || 0) + 1; });
    
    const labels = Object.keys(counts);
    const values = Object.values(counts);

    const colorMap = {
        "Educação": "#0d6efd", "Saúde": "#198754", "Social": "#fd7e14",
        "Meio Ambiente": "#20c997", "Esporte": "#dc3545", "Cultura": "#6610f2",
        "Agricultura": "#ffc107", "Serviços": "#6c757d", "Planejamento": "#0dcaf0"
    };
    const bgColors = labels.map(l => colorMap[l] || "#334155");

    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById('deptChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades',
                data: values,
                backgroundColor: bgColors,
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: { backgroundColor: '#1e293b', padding: 12 }
            },
            scales: { 
                x: { grid: { display: false }, beginAtZero: true },
                y: { grid: { display: false } }
            }
        }
    });
}

// Lógica de Filtro
function handleFilter() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const dept = document.getElementById('deptFilter').value;

    const filtered = rawData.filter(item => {
        const matchText = item.nome.toLowerCase().includes(term) || item.end.toLowerCase().includes(term);
        const matchDept = dept === "" || item.dept === dept;
        return matchText && matchDept;
    });

    updateView(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = "";
    document.getElementById('deptFilter').value = "";
    updateView(rawData);
}

// Utilitário: Debounce para busca performática
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
