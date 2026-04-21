
import { renderKeyboard, renderLegend } from "./weakness_analysis.js";

const rows = [
[{k:'`',l:'`'},{k:'1',l:'1'},{k:'2',l:'2'},{k:'3',l:'3'},{k:'4',l:'4'},{k:'5',l:'5'},{k:'6',l:'6'},{k:'7',l:'7'},{k:'8',l:'8'},{k:'9',l:'9'},{k:'0',l:'0'},{k:'-',l:'-'},{k:'=',l:'='},{k:'backspace',l:'⌫',w:'wide-22'}],
[{k:'tab',l:'tab',w:'wide-15'},{k:'q',l:'Q'},{k:'w',l:'W'},{k:'e',l:'E'},{k:'r',l:'R'},{k:'t',l:'T'},{k:'y',l:'Y'},{k:'u',l:'U'},{k:'i',l:'I'},{k:'o',l:'O'},{k:'p',l:'P'},{k:'[',l:'['},{k:']',l:']'},{k:'\\',l:'\\',w:'wide-15'}],
[{k:'caps',l:'caps',w:'wide-18'},{k:'a',l:'A'},{k:'s',l:'S'},{k:'d',l:'D'},{k:'f',l:'F'},{k:'g',l:'G'},{k:'h',l:'H'},{k:'j',l:'J'},{k:'k',l:'K'},{k:'l',l:'L'},{k:';',l:';'},{k:"'",l:"'"},{k:'enter',l:'↵',w:'wide-22'}],
[{k:'shift',l:'shift',w:'wide-28'},{k:'z',l:'Z'},{k:'x',l:'X'},{k:'c',l:'C'},{k:'v',l:'V'},{k:'b',l:'B'},{k:'n',l:'N'},{k:'m',l:'M'},{k:',',l:','},{k:'.',l:'.'},{k:'/',l:'/'},{k:'shift',l:'shift',w:'wide-28'}],
[{k:'space',l:'space',w:'wide-65'}]];

document.addEventListener('DOMContentLoaded', () => {
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
    console.log('1. DOMContentLoaded fired');
    console.log('2. window.errorData:', window.errorData);
    console.log('3. keyboard el:', document.getElementById('keyboard'));
    console.log('4. rows:', rows);
    console.log('5. renderKeyboard type:', typeof renderKeyboard);
    renderKeyboard(rows, window.errorData, document.getElementById('keyboard'));
    renderLegend('legend-bar');
});

// export function updateTime(id, v) {
//     const base = 11520;
//     const val = v==='hours' ? (base/3600).toFixed(1) : v==='minutes' ? Math.round(base/60) : base;
//     const suffix = v==='hours' ? 'hrs' : v==='minutes' ? 'min' : 's';
//     document.getElementById(id).innerHTML = val + '<span class="stat-suffix">' + suffix + '</span>';
// }


