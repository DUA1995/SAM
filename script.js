document.getElementById('analyzeBtn').addEventListener('click', analyzeData);
document.getElementById('copyTableBtn').addEventListener('click', copyTable);
document.getElementById('copyBarChartBtn').addEventListener('click', copyBarChart);
document.getElementById('copyPieChartBtn').addEventListener('click', copyPieChart);

let barChart, pieChart;

function analyzeData() {
    const input = document.getElementById('dataInput').value.trim();
    const categoriesInput = document.getElementById('categories').value.trim();

    if (!input || !categoriesInput) {
        alert('Please provide data and categories.');
        return;
    }

    const data = input.split(/[\s,]+/).map(item => item.trim());
    const categories = categoriesInput.split(',').map(item => item.trim());

    const results = categories.map(category => analyzeCategory(data, category));

    const totalFrequency = results.reduce((sum, row) => sum + row.frequency, 0);
    results.push({
        category: 'Total',
        frequency: totalFrequency,
        percentage: '100%'
    });

    displayAnalysis(results);
    createCharts(results);
}

function analyzeCategory(data, category) {
    let frequency = 0;

    if (!isNaN(category) || category.includes('-') || category.startsWith('<') || category.startsWith('>') || category.startsWith('≤') || category.startsWith('≥')) {
        frequency = analyzeNumericalCategory(data, category);
    } else {
        frequency = data.filter(item => item.toLowerCase() === category.toLowerCase()).length;
    }

    const percentage = ((frequency / data.length) * 100).toFixed(2);
    return { category, frequency, percentage: percentage + '%' };
}

function analyzeNumericalCategory(data, category) {
    const numericalData = data.filter(item => !isNaN(item)).map(Number);

    if (category.includes('-')) {
        const [start, end] = category.split('-').map(Number);
        return numericalData.filter(item => item >= start && item <= end).length;
    } else if (category.startsWith('<')) {
        const limit = Number(category.slice(1).trim());
        return numericalData.filter(item => item < limit).length;
    } else if (category.startsWith('>')) {
        const limit = Number(category.slice(1).trim());
        return numericalData.filter(item => item > limit).length;
    } else if (category.startsWith('≤')) {
        const limit = Number(category.slice(1).trim());
        return numericalData.filter(item => item <= limit).length;
    } else if (category.startsWith('≥')) {
        const limit = Number(category.slice(1).trim());
        return numericalData.filter(item => item >= limit).length;
    } else {
        const target = Number(category);
        return numericalData.filter(item => item === target).length;
    }
}

function displayAnalysis(results) {
    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Category</th>
            <th>Frequency</th>
            <th>Percentage</th>
        </tr>
        ${results.map(row => `
        <tr>
            <td>${row.category}</td>
            <td>${row.frequency}</td>
            <td>${row.percentage}</td>
        </tr>`).join('')}
    `;

    const tableContainer = document.getElementById('analysisTable');
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

function createCharts(results) {
    const labels = results.slice(0, -1).map(row => row.category); // Exclude 'Total'
    const frequencies = results.slice(0, -1).map(row => row.frequency); // Exclude 'Total'
    const percentages = results.slice(0, -1).map(row => parseFloat(row.percentage)); // Exclude 'Total'

    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: frequencies,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage',
                data: percentages,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800']
            }]
        }
    });
}

function copyTable() {
    const table = document.getElementById('analysisTable').innerHTML;
    navigator.clipboard.writeText(table).then(() => alert('Table copied!'));
}

function copyBarChart() {
    html2canvas(document.getElementById('barChart')).then(canvas => {
        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]));
        alert('Bar chart copied!');
    });
}

function copyPieChart() {
    html2canvas(document.getElementById('pieChart')).then(canvas => {
        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]));
        alert('Pie chart copied!');
    });
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(() => {
        console.log('Service Worker Registered');
    }).catch(err => {
        console.error('Service Worker Registration Failed:', err);
    });
}