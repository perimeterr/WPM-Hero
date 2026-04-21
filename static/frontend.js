
const chartCanvas = document.getElementById('progressChart');

if (chartCanvas) {
    const labels = JSON.parse(document.getElementById('progress-data-dates').textContent);
    const wpmData = JSON.parse(document.getElementById('progress-data-wpm').textContent);

    new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'WPM Over Time',
                data: wpmData,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'WPM'
                    },
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `WPM: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

function updateTime(id, v) {
    const base = 11520;
    const val = v==='hours' ? (base/3600).toFixed(1) : v==='minutes' ? Math.round(base/60) : base;
    const suffix = v==='hours' ? 'hrs' : v==='minutes' ? 'min' : 's';
    document.getElementById(id).innerHTML = val + '<span class="stat-suffix">' + suffix + '</span>';
}