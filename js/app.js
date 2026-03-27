// 链家风控稽查规则引擎 - 静态版本
let allAlerts = [];
let storeRisks = [];

// 页面加载时获取数据
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 加载所有数据
async function loadData() {
    try {
        // 并行加载所有JSON文件
        const [alertsRes, storeRisksRes] = await Promise.all([
            fetch('data/alerts.json'),
            fetch('data/store_risks.json')
        ]);

        allAlerts = await alertsRes.json();
        storeRisks = await storeRisksRes.json();

        updateStats();
        renderTable();
        renderStoreRisks();
        populateFilters();

    } catch (error) {
        console.error('加载数据失败:', error);
        document.getElementById('alertTable').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger py-4">数据加载失败</td></tr>';
    }
}

// 更新统计
function updateStats() {
    const high = allAlerts.filter(a => a.alert_level === '高危').length;
    const attention = allAlerts.filter(a => a.alert_level === '需关注').length;
    const stores = new Set(allAlerts.map(a => a.store_name).filter(s => s));

    document.getElementById('highCount').textContent = high;
    document.getElementById('mediumCount').textContent = attention;
    document.getElementById('totalCount').textContent = allAlerts.length;
    document.getElementById('storeCount').textContent = stores.size;
}

// 填充筛选器
function populateFilters() {
    const categories = [...new Set(allAlerts.map(a => a.category).filter(c => c))];
    const categorySelect = document.getElementById('categoryFilter');

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

// 渲染表格
function renderTable() {
    const category = document.getElementById('categoryFilter').value;
    const level = document.getElementById('levelFilter').value;

    let filtered = allAlerts;

    if (category) {
        filtered = filtered.filter(a => a.category === category);
    }
    if (level) {
        filtered = filtered.filter(a => a.alert_level === level);
    }

    document.getElementById('filteredCount').textContent = filtered.length;

    const tbody = document.getElementById('alertTable');

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(alert => `
        <tr>
            <td><span class="badge category-badge">${alert.category || '-'}</span></td>
            <td>${alert.sub_category || '-'}</td>
            <td><small>${alert.rule_name || '-'}</small></td>
            <td><span class="badge ${alert.alert_level === '高危' ? 'risk-high' : 'risk-attention'}">${alert.alert_level || '-'}</span></td>
            <td><small class="detail-text" title="${alert.detail}">${alert.detail || '-'}</small></td>
            <td><small>${alert.store_name || '-'}</small></td>
            <td><small>${alert.broker_name || '-'}</small></td>
            <td><small>${alert.alert_time || '-'}</small></td>
        </tr>
    `).join('');
}

// 渲染门店风险
function renderStoreRisks() {
    const container = document.getElementById('storeRiskList');

    if (storeRisks.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">暂无数据</div>';
        return;
    }

    container.innerHTML = storeRisks.map(store => `
        <div class="store-card">
            <div class="store-name">🏢 ${store.store_name}</div>
            <div class="store-stats">
                <span class="stat-tag high">高危 ${store.high_count}条</span>
                <span class="stat-tag attention">需关注 ${store.attention_count}条</span>
                <span>共 ${store.total_count}条</span>
            </div>
        </div>
    `).join('');
}

// 绑定筛选事件
document.getElementById('categoryFilter').addEventListener('change', renderTable);
document.getElementById('levelFilter').addEventListener('change', renderTable);
