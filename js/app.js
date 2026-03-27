// 链家风控稽查规则引擎 - 静态版本
let allAlerts = [];
let storeRisks = [];
let employeeRisks = [];
let categories = {};
let currentPage = 1;
const pageSize = 20;
let currentView = 'store';
let currentStore = '';
let currentEmployee = '';

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
});

// 加载所有数据
async function loadAllData() {
    try {
        const [alertsRes, storeRes, empRes, catRes] = await Promise.all([
            fetch('data/alerts.json'),
            fetch('data/store_risks.json'),
            fetch('data/employee_risks.json'),
            fetch('data/categories.json')
        ]);

        allAlerts = await alertsRes.json();
        storeRisks = await storeRes.json();
        employeeRisks = await empRes.json();
        categories = await catRes.json();

        updateStats();
        renderTable();
        renderRiskOverview(storeRisks, 'store');
        populateFilters();

    } catch (error) {
        console.error('加载数据失败:', error);
        document.getElementById('alertTable').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger py-4">数据加载失败</td></tr>';
    }
}

// 填充筛选器
function populateFilters() {
    const catSelect = document.getElementById('categoryFilter');
    categories.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
    });

    const subSelect = document.getElementById('subCategoryFilter');
    categories.sub_categories.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subSelect.appendChild(opt);
    });
}

// 更新统计
function updateStats(filtered = allAlerts) {
    document.getElementById('highCount').textContent = filtered.filter(a => a.alert_level === '高危').length;
    document.getElementById('mediumCount').textContent = filtered.filter(a => a.alert_level === '需关注').length;
    document.getElementById('totalCount').textContent = filtered.length;
    document.getElementById('storeCount').textContent = new Set(filtered.filter(a => a.store_name).map(a => a.store_name)).size;
}

// 筛选数据
function getFilteredAlerts() {
    const category = document.getElementById('categoryFilter').value;
    const subCategory = document.getElementById('subCategoryFilter').value;
    const level = document.getElementById('levelFilter').value;
    const timeRange = document.getElementById('timeFilter').value;

    return allAlerts.filter(alert => {
        if (category && alert.category !== category) return false;
        if (subCategory && alert.sub_category !== subCategory) return false;
        if (level && alert.alert_level !== level) return false;
        if (timeRange) {
            const alertDate = new Date(alert.alert_time);
            const now = new Date();
            const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 180;
            if ((now - alertDate) > days * 24 * 60 * 60 * 1000) return false;
        }
        return true;
    });
}

// 渲染表格
function renderTable() {
    const filtered = getFilteredAlerts();
    document.getElementById('filteredCount').textContent = filtered.length;
    updateStats(filtered);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);

    const tbody = document.getElementById('alertTable');
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = pageData.map(alert => `
        <tr>
            <td><span class="badge category-badge">${alert.category || '-'}</span></td>
            <td>${alert.sub_category || '-'}</td>
            <td><small>${alert.rule_name || '-'}</small></td>
            <td><small class="detail-text" title="${alert.detail}">${alert.detail || '-'}</small></td>
            <td><span class="badge ${alert.alert_level === '高危' ? 'risk-high' : 'risk-attention'}">${alert.alert_level || '-'}</span></td>
            <td><small>${alert.broker_name || '-'}</small></td>
            <td><small>${alert.customer_name || alert.house_id || '-'}</small></td>
            <td><small>${alert.alert_time || '-'}</small></td>
        </tr>
    `).join('');

    const hint = document.getElementById('scrollHint');
    hint.textContent = totalPages > 1 ? `第 ${currentPage}/${totalPages} 页，共 ${filtered.length} 条` : '';
}

// 渲染风险概览
function renderRiskOverview(data, viewType) {
    const container = document.getElementById('riskOverviewList');

    if (viewType === 'store') {
        container.innerHTML = data.map(store => `
            <div class="overview-item store-level ${store.high_count > 0 ? 'high-risk' : ''}" onclick="showEmployees('${store.store_name}')">
                <div class="overview-title">🏪 ${store.store_name}</div>
                <div class="overview-stats">
                    <span class="stat-tag high">高危 ${store.high_count}条</span>
                    <span class="stat-tag attention">需关注 ${store.medium_count}条</span>
                    <span style="color:#999">共 ${store.total_count}条</span>
                </div>
            </div>
        `).join('') || '<div class="text-center text-muted py-4">暂无数据</div>';

    } else if (viewType === 'employee') {
        container.innerHTML = `
            <div class="back-btn" onclick="showStores()">← 返回门店列表</div>
            ${data.map(emp => `
                <div class="overview-item employee-level ${emp.high_count > 0 ? 'high-risk' : ''}" onclick="showEmployeeDetails('${emp.broker_name}')">
                    <div class="overview-title">👤 ${emp.broker_name}</div>
                    <div class="overview-stats">
                        <span class="stat-tag high">高危 ${emp.high_count}条</span>
                        <span class="stat-tag attention">需关注 ${emp.medium_count}条</span>
                        <span style="color:#999">共 ${emp.total_count}条</span>
                    </div>
                </div>
            `).join('')}
        `;

    } else if (viewType === 'detail') {
        container.innerHTML = `
            <div class="back-btn" onclick="showEmployees('${currentStore}')">← 返回员工列表</div>
            <div style="padding:8px 12px;font-weight:600;">👤 ${currentEmployee}</div>
            ${data.map(alert => `
                <div class="overview-item ${alert.alert_level === '高危' ? 'high-risk' : 'attention-risk'}" style="cursor:default">
                    <div style="font-size:0.85rem;color:#666">${alert.category} / ${alert.sub_category}</div>
                    <div style="font-size:0.9rem;margin:4px 0">${alert.rule_name}</div>
                    <div class="detail-rules">
                        <div style="color:#333">${alert.detail}</div>
                        <div style="color:#999;margin-top:4px;font-size:0.8rem">${alert.alert_time}</div>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

// 显示员工列表
function showEmployees(storeName) {
    currentStore = storeName;
    currentView = 'employee';
    const storeEmployees = employeeRisks.filter(e => e.store_name === storeName);
    renderRiskOverview(storeEmployees, 'employee');
}

// 显示员工详情
function showEmployeeDetails(brokerName) {
    currentEmployee = brokerName;
    currentView = 'detail';
    const employeeAlerts = allAlerts.filter(a => a.broker_name === brokerName);
    renderRiskOverview(employeeAlerts, 'detail');
}

// 返回门店列表
function showStores() {
    currentView = 'store';
    renderRiskOverview(storeRisks, 'store');
}

// 滚动翻页
document.getElementById('alertTableWrapper').addEventListener('wheel', function(e) {
    const filtered = getFilteredAlerts();
    const totalPages = Math.ceil(filtered.length / pageSize);
    if (totalPages <= 1) return;

    if (e.deltaY > 0 && currentPage < totalPages) {
        currentPage++;
        renderTable();
        this.scrollTop = 0;
    } else if (e.deltaY < 0 && currentPage > 1) {
        currentPage--;
        renderTable();
        this.scrollTop = this.scrollHeight;
    }
});

// 筛选事件
['categoryFilter', 'subCategoryFilter', 'levelFilter', 'timeFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
        currentPage = 1;
        renderTable();
    });
});
