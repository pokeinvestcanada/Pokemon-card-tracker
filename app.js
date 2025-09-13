// Pokemon Card Import Business Dashboard JavaScript

class PokemonCardDashboard {
    constructor() {
        // Constants
        this.exchangeRate = 0.0092;
        this.dutyRate = 0.10;
        this.hstRate = 0.13;
        
        // Sample data from provided JSON
        this.inventory = [
            {
                id: 1,
                item_name: "Charizard ex SAR - Scarlet Violet",
                category: "Single Card",
                cost_jpy: 12000,
                cost_cad: 110.40,
                shipping_cad: 12.50,
                duty_cad: 12.29,
                hst_cad: 17.58,
                total_cost_cad: 152.77,
                market_price_cad: 185.00,
                quantity: 2,
                profit_margin: 17.4,
                status: "Active"
            },
            {
                id: 2,
                item_name: "Pokemon TCG Booster Box - Scarlet Violet",
                category: "Sealed Product",
                cost_jpy: 8500,
                cost_cad: 78.20,
                shipping_cad: 15.00,
                duty_cad: 9.32,
                hst_cad: 13.33,
                total_cost_cad: 115.85,
                market_price_cad: 145.00,
                quantity: 4,
                profit_margin: 20.1,
                status: "Active"
            },
            {
                id: 3,
                item_name: "Pikachu VMAX Rainbow Rare",
                category: "Single Card",
                cost_jpy: 8000,
                cost_cad: 73.60,
                shipping_cad: 10.00,
                duty_cad: 8.36,
                hst_cad: 11.95,
                total_cost_cad: 103.91,
                market_price_cad: 125.00,
                quantity: 1,
                profit_margin: 16.9,
                status: "Low Stock"
            },
            {
                id: 4,
                item_name: "Japanese Starter Deck - Miraidon",
                category: "Sealed Product",
                cost_jpy: 2800,
                cost_cad: 25.76,
                shipping_cad: 6.00,
                duty_cad: 3.18,
                hst_cad: 4.54,
                total_cost_cad: 39.48,
                market_price_cad: 48.00,
                quantity: 6,
                profit_margin: 17.8,
                status: "Active"
            },
            {
                id: 5,
                item_name: "Eevee Heroes Booster Box",
                category: "Sealed Product",
                cost_jpy: 9200,
                cost_cad: 84.64,
                shipping_cad: 18.00,
                duty_cad: 10.26,
                hst_cad: 14.68,
                total_cost_cad: 127.58,
                market_price_cad: 165.00,
                quantity: 2,
                profit_margin: 22.7,
                status: "Active"
            }
        ];

        this.kpis = {
            total_investment: 2455.80,
            total_revenue: 1847.50,
            total_profit: 892.35,
            avg_profit_margin: 32.8,
            items_in_stock: 42,
            items_sold: 28,
            inventory_turnover: 66.7,
            target_investment: 5000.00,
            target_revenue: 4000.00,
            target_profit: 1500.00
        };

        this.charts = {};
        this.filteredInventory = [...this.inventory];
        this.sortDirection = {};
        this.nextId = 6;

        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.initEventListeners();
        this.updateKPIs();
        this.renderInventoryTable();
        this.initCharts();
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }

    initEventListeners() {
        // Tab navigation - Fixed with proper binding
        document.querySelectorAll('.nav__tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Form handling
        const addItemForm = document.getElementById('addItemForm');
        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => this.handleAddItem(e));
        }
        
        const resetButton = document.getElementById('resetForm');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetForm());
        }

        // Auto-calculation on form input
        const costJpyInput = document.getElementById('costJpy');
        const marketPriceInput = document.getElementById('marketPrice');
        const shippingCostInput = document.getElementById('shippingCost');
        
        if (costJpyInput) costJpyInput.addEventListener('input', () => this.calculateCosts());
        if (marketPriceInput) marketPriceInput.addEventListener('input', () => this.calculateCosts());
        if (shippingCostInput) shippingCostInput.addEventListener('input', () => this.calculateCosts());

        // Inventory search
        const searchInput = document.getElementById('searchInventory');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchInventory(e.target.value));
        }

        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(th => {
            th.addEventListener('click', (e) => this.sortTable(e.target.getAttribute('data-sort')));
        });

        // Export CSV
        const exportButton = document.getElementById('exportCsv');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportToCSV());
        }

        // Edit modal
        const editForm = document.getElementById('editItemForm');
        const closeModalButton = document.getElementById('closeEditModal');
        const cancelButton = document.getElementById('cancelEdit');
        
        if (editForm) editForm.addEventListener('submit', (e) => this.handleEditItem(e));
        if (closeModalButton) closeModalButton.addEventListener('click', () => this.closeEditModal());
        if (cancelButton) cancelButton.addEventListener('click', () => this.closeEditModal());
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName); // Debug log
        
        // Update tab buttons
        document.querySelectorAll('.nav__tab').forEach(tab => {
            tab.classList.remove('nav__tab--active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('nav__tab--active');
        }

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('section--active');
        });
        
        const activeSection = document.getElementById(tabName);
        if (activeSection) {
            activeSection.classList.add('section--active');
        }
    }

    calculateCosts() {
        const costJpyInput = document.getElementById('costJpy');
        const marketPriceInput = document.getElementById('marketPrice');
        const shippingCostInput = document.getElementById('shippingCost');
        
        if (!costJpyInput || !marketPriceInput || !shippingCostInput) return;

        const costJpy = parseFloat(costJpyInput.value) || 0;
        const marketPrice = parseFloat(marketPriceInput.value) || 0;
        const shippingCost = parseFloat(shippingCostInput.value) || 0;

        const costCad = costJpy * this.exchangeRate;
        const dutyCad = costCad * this.dutyRate;
        const hstCad = (costCad + dutyCad + shippingCost) * this.hstRate;
        const totalCostCad = costCad + dutyCad + hstCad + shippingCost;
        const profitMargin = marketPrice > 0 ? ((marketPrice - totalCostCad) / marketPrice * 100) : 0;

        const costCadInput = document.getElementById('costCad');
        const dutyCadInput = document.getElementById('dutyCad');
        const hstCadInput = document.getElementById('hstCad');
        const totalCostCadInput = document.getElementById('totalCostCad');
        const profitMarginCalcInput = document.getElementById('profitMarginCalc');

        if (costCadInput) costCadInput.value = `$${costCad.toFixed(2)}`;
        if (dutyCadInput) dutyCadInput.value = `$${dutyCad.toFixed(2)}`;
        if (hstCadInput) hstCadInput.value = `$${hstCad.toFixed(2)}`;
        if (totalCostCadInput) totalCostCadInput.value = `$${totalCostCad.toFixed(2)}`;
        if (profitMarginCalcInput) profitMarginCalcInput.value = `${profitMargin.toFixed(1)}%`;
    }

    handleAddItem(e) {
        e.preventDefault();
        
        const itemNameInput = document.getElementById('itemName');
        const categoryInput = document.getElementById('category');
        const costJpyInput = document.getElementById('costJpy');
        const marketPriceInput = document.getElementById('marketPrice');
        const shippingCostInput = document.getElementById('shippingCost');
        const quantityInput = document.getElementById('quantity');

        if (!itemNameInput || !categoryInput || !costJpyInput || !marketPriceInput || !shippingCostInput || !quantityInput) {
            alert('Form fields not found');
            return;
        }

        const costJpy = parseFloat(costJpyInput.value);
        const marketPrice = parseFloat(marketPriceInput.value);
        const shippingCost = parseFloat(shippingCostInput.value);
        const quantity = parseInt(quantityInput.value);

        const costCad = costJpy * this.exchangeRate;
        const dutyCad = costCad * this.dutyRate;
        const hstCad = (costCad + dutyCad + shippingCost) * this.hstRate;
        const totalCostCad = costCad + dutyCad + hstCad + shippingCost;
        const profitMargin = ((marketPrice - totalCostCad) / marketPrice * 100);

        const newItem = {
            id: this.nextId++,
            item_name: itemNameInput.value,
            category: categoryInput.value,
            cost_jpy: costJpy,
            cost_cad: costCad,
            shipping_cad: shippingCost,
            duty_cad: dutyCad,
            hst_cad: hstCad,
            total_cost_cad: totalCostCad,
            market_price_cad: marketPrice,
            quantity: quantity,
            profit_margin: profitMargin,
            status: quantity > 5 ? "Active" : quantity > 0 ? "Low Stock" : "Out of Stock"
        };

        this.inventory.push(newItem);
        this.filteredInventory = [...this.inventory];
        this.updateKPIs();
        this.renderInventoryTable();
        this.updateCharts();
        this.resetForm();
        
        // Show success and switch to inventory tab
        this.switchTab('inventory');
    }

    resetForm() {
        const form = document.getElementById('addItemForm');
        if (form) {
            form.reset();
            const shippingInput = document.getElementById('shippingCost');
            if (shippingInput) shippingInput.value = '10.00';
            this.calculateCosts();
        }
    }

    updateKPIs() {
        // Calculate totals from inventory
        const totalInvestment = this.inventory.reduce((sum, item) => sum + (item.total_cost_cad * item.quantity), 0);
        const totalRevenue = this.inventory.reduce((sum, item) => {
            const soldQuantity = Math.floor(item.quantity * 0.6); // Assume 60% sold
            return sum + (item.market_price_cad * soldQuantity);
        }, 0);
        const totalProfit = totalRevenue - (totalInvestment * 0.6);
        const avgProfitMargin = this.inventory.length > 0 ? 
            this.inventory.reduce((sum, item) => sum + item.profit_margin, 0) / this.inventory.length : 0;
        const itemsInStock = this.inventory.reduce((sum, item) => sum + item.quantity, 0);

        // Update KPI displays
        const totalInvestmentEl = document.getElementById('totalInvestment');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalProfitEl = document.getElementById('totalProfit');
        const profitMarginEl = document.getElementById('profitMargin');
        const itemsInStockEl = document.getElementById('itemsInStock');

        if (totalInvestmentEl) totalInvestmentEl.textContent = `$${totalInvestment.toFixed(0)}`;
        if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toFixed(0)}`;
        if (totalProfitEl) totalProfitEl.textContent = `$${totalProfit.toFixed(0)}`;
        if (profitMarginEl) profitMarginEl.textContent = `${avgProfitMargin.toFixed(1)}%`;
        if (itemsInStockEl) itemsInStockEl.textContent = itemsInStock;

        // Update progress bars
        this.updateProgressBar('investmentProgress', totalInvestment, this.kpis.target_investment);
        this.updateProgressBar('revenueProgress', totalRevenue, this.kpis.target_revenue);
        this.updateProgressBar('profitProgress', totalProfit, this.kpis.target_profit);

        // Update profit margin status
        const marginStatus = document.getElementById('marginStatus');
        if (marginStatus) {
            if (avgProfitMargin >= 20) {
                marginStatus.innerHTML = '<span class="status status--success">Excellent</span>';
            } else if (avgProfitMargin >= 15) {
                marginStatus.innerHTML = '<span class="status status--warning">Good</span>';
            } else {
                marginStatus.innerHTML = '<span class="status status--error">Needs Improvement</span>';
            }
        }
    }

    updateProgressBar(elementId, current, target) {
        const percentage = Math.min((current / target) * 100, 100);
        const progressBar = document.getElementById(elementId);
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            // Update color based on progress
            progressBar.className = 'progress-bar__fill';
            if (percentage >= 90) {
                progressBar.classList.add('progress-bar__fill--success');
            } else if (percentage >= 70) {
                progressBar.classList.add('progress-bar__fill--warning');
            } else {
                progressBar.classList.add('progress-bar__fill--error');
            }
        }
    }

    renderInventoryTable() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        this.filteredInventory.forEach(item => {
            const row = document.createElement('tr');
            
            // Add profit margin class
            if (item.profit_margin >= 20) {
                row.classList.add('profit-high');
            } else if (item.profit_margin >= 15) {
                row.classList.add('profit-medium');
            } else {
                row.classList.add('profit-low');
            }

            row.innerHTML = `
                <td>${item.item_name}</td>
                <td>${item.category}</td>
                <td>$${item.total_cost_cad.toFixed(2)}</td>
                <td>$${item.market_price_cad.toFixed(2)}</td>
                <td>${item.profit_margin.toFixed(1)}%</td>
                <td>${item.quantity}</td>
                <td><span class="status ${item.status === 'Active' ? 'status--success' : item.status === 'Low Stock' ? 'status--warning' : 'status--error'}">${item.status}</span></td>
                <td>
                    <button class="btn btn--sm action-btn action-btn--edit" onclick="dashboard.editItem(${item.id})">Edit</button>
                    <button class="btn btn--sm action-btn action-btn--delete" onclick="dashboard.deleteItem(${item.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    searchInventory(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredInventory = this.inventory.filter(item => 
            item.item_name.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery) ||
            item.status.toLowerCase().includes(lowerQuery)
        );
        this.renderInventoryTable();
    }

    sortTable(column) {
        const currentDirection = this.sortDirection[column] || 'asc';
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        this.sortDirection = {}; // Reset all directions
        this.sortDirection[column] = newDirection;

        // Update header classes
        document.querySelectorAll('[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        const sortHeader = document.querySelector(`[data-sort="${column}"]`);
        if (sortHeader) {
            sortHeader.classList.add(`sort-${newDirection}`);
        }

        this.filteredInventory.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (newDirection === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        this.renderInventoryTable();
    }

    editItem(id) {
        const item = this.inventory.find(i => i.id === id);
        if (item) {
            const editItemId = document.getElementById('editItemId');
            const editMarketPrice = document.getElementById('editMarketPrice');
            const editQuantity = document.getElementById('editQuantity');
            const editModal = document.getElementById('editModal');
            
            if (editItemId) editItemId.value = id;
            if (editMarketPrice) editMarketPrice.value = item.market_price_cad;
            if (editQuantity) editQuantity.value = item.quantity;
            if (editModal) editModal.classList.remove('hidden');
        }
    }

    handleEditItem(e) {
        e.preventDefault();
        const editItemId = document.getElementById('editItemId');
        const editMarketPrice = document.getElementById('editMarketPrice');
        const editQuantity = document.getElementById('editQuantity');
        
        if (!editItemId || !editMarketPrice || !editQuantity) return;
        
        const id = parseInt(editItemId.value);
        const newPrice = parseFloat(editMarketPrice.value);
        const newQuantity = parseInt(editQuantity.value);

        const item = this.inventory.find(i => i.id === id);
        if (item) {
            item.market_price_cad = newPrice;
            item.quantity = newQuantity;
            item.profit_margin = ((newPrice - item.total_cost_cad) / newPrice * 100);
            item.status = newQuantity > 5 ? "Active" : newQuantity > 0 ? "Low Stock" : "Out of Stock";
        }

        this.filteredInventory = [...this.inventory];
        this.updateKPIs();
        this.renderInventoryTable();
        this.updateCharts();
        this.closeEditModal();
    }

    closeEditModal() {
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.classList.add('hidden');
        }
    }

    deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.inventory = this.inventory.filter(item => item.id !== id);
            this.filteredInventory = [...this.inventory];
            this.updateKPIs();
            this.renderInventoryTable();
            this.updateCharts();
        }
    }

    exportToCSV() {
        const headers = ['Item Name', 'Category', 'Cost (JPY)', 'Cost (CAD)', 'Market Price', 'Profit Margin', 'Quantity', 'Status'];
        const csvContent = [headers.join(',')];
        
        this.inventory.forEach(item => {
            const row = [
                `"${item.item_name}"`,
                item.category,
                item.cost_jpy,
                item.total_cost_cad.toFixed(2),
                item.market_price_cad.toFixed(2),
                item.profit_margin.toFixed(1) + '%',
                item.quantity,
                item.status
            ];
            csvContent.push(row.join(','));
        });

        const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pokemon_inventory.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    initCharts() {
        this.createProfitMarginChart();
        this.createSalesTrendChart();
        this.createCostBreakdownChart();
    }

    createProfitMarginChart() {
        const ctx = document.getElementById('profitMarginChart');
        if (!ctx) return;
        
        const categoryData = {};
        this.inventory.forEach(item => {
            if (!categoryData[item.category]) {
                categoryData[item.category] = [];
            }
            categoryData[item.category].push(item.profit_margin);
        });

        const labels = Object.keys(categoryData);
        const data = labels.map(category => {
            const margins = categoryData[category];
            return margins.reduce((sum, margin) => sum + margin, 0) / margins.length;
        });

        this.charts.profitMargin = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Profit Margin (%)',
                    data: data,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Profit Margin by Category'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    createSalesTrendChart() {
        const ctx = document.getElementById('salesTrendChart');
        if (!ctx) return;
        
        // Sample trend data
        const months = ['Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024'];
        const revenueData = [1200, 1450, 1650, 1847];
        const profitData = [480, 580, 660, 892];

        this.charts.salesTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenue ($)',
                        data: revenueData,
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Profit ($)',
                        data: profitData,
                        borderColor: '#FFC185',
                        backgroundColor: 'rgba(255, 193, 133, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Sales Trends Over Time'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    createCostBreakdownChart() {
        const ctx = document.getElementById('costBreakdownChart');
        if (!ctx) return;
        
        // Calculate average cost breakdown
        const totalItems = this.inventory.length;
        const avgCostCad = this.inventory.reduce((sum, item) => sum + item.cost_cad, 0) / totalItems;
        const avgShipping = this.inventory.reduce((sum, item) => sum + item.shipping_cad, 0) / totalItems;
        const avgDuty = this.inventory.reduce((sum, item) => sum + item.duty_cad, 0) / totalItems;
        const avgHst = this.inventory.reduce((sum, item) => sum + item.hst_cad, 0) / totalItems;

        this.charts.costBreakdown = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Base Cost', 'Shipping', 'Duty (10%)', 'HST (13%)'],
                datasets: [{
                    data: [avgCostCad, avgShipping, avgDuty, avgHst],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Cost Breakdown per Item'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.charts.profitMargin) {
            this.charts.profitMargin.destroy();
            this.createProfitMarginChart();
        }
        if (this.charts.costBreakdown) {
            this.charts.costBreakdown.destroy();
            this.createCostBreakdownChart();
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new PokemonCardDashboard();
});