function errColor(pct) {
  if (pct === undefined || pct === 0) return 'rgba(255,255,255,0.07)';
  const capped = Math.min(pct / 50, 1);
  if (capped < 0.25) {
    const t = capped / 0.25;
    return `rgba(${Math.round(188*t+255*(1-t)*0.18)},${Math.round(152*t+255*(1-t)*0.18)},${Math.round(33*t+255*(1-t)*0.18)},${0.25+t*0.35})`;
  } else if (capped < 0.6) {
    const t = (capped-0.25)/0.35;
    return `rgba(${Math.round(188+64*t)},${Math.round(152-100*t)},${Math.round(33-20*t)},${0.6+t*0.2})`;
  } else {
    const t = (capped-0.6)/0.4;
    return `rgba(${Math.round(226+t*6)},${Math.round(75-55*t)},${Math.round(13+t*5)},${0.8+t*0.2})`;
  }
}

function textColor(pct) {
  if (!pct || pct < 8) return 'rgba(255,255,255,0.65)';
  if (pct < 20) return '#fff';
  return '#fff';
}

const rows = [
  [{k:'`',l:'`'},{k:'1',l:'1'},{k:'2',l:'2'},{k:'3',l:'3'},{k:'4',l:'4'},{k:'5',l:'5'},{k:'6',l:'6'},{k:'7',l:'7'},{k:'8',l:'8'},{k:'9',l:'9'},{k:'0',l:'0'},{k:'-',l:'-'},{k:'=',l:'='},{k:'backspace',l:'⌫',w:'wide-22'}],
  [{k:'tab',l:'tab',w:'wide-15'},{k:'q',l:'Q'},{k:'w',l:'W'},{k:'e',l:'E'},{k:'r',l:'R'},{k:'t',l:'T'},{k:'y',l:'Y'},{k:'u',l:'U'},{k:'i',l:'I'},{k:'o',l:'O'},{k:'p',l:'P'},{k:'[',l:'['},{k:']',l:']'},{k:'\\',l:'\\',w:'wide-15'}],
  [{k:'caps',l:'caps',w:'wide-18'},{k:'a',l:'A'},{k:'s',l:'S'},{k:'d',l:'D'},{k:'f',l:'F'},{k:'g',l:'G'},{k:'h',l:'H'},{k:'j',l:'J'},{k:'k',l:'K'},{k:'l',l:'L'},{k:';',l:';'},{k:"'",l:"'"},{k:'enter',l:'↵',w:'wide-22'}],
  [{k:'shift',l:'shift',w:'wide-28'},{k:'z',l:'Z'},{k:'x',l:'X'},{k:'c',l:'C'},{k:'v',l:'V'},{k:'b',l:'B'},{k:'n',l:'N'},{k:'m',l:'M'},{k:',',l:','},{k:'.',l:'.'},{k:'/',l:'/'},{k:'shift',l:'shift',w:'wide-28'}],
  [{k:'space',l:'space',w:'wide-65'}]
];

const kbd = document.getElementById('keyboard');

rows.forEach(row => {
  const rowEl = document.createElement('div');
  rowEl.className = 'kbd-row';
  row.forEach(({k,l,w}) => {
    const pct = errorData[k];
    const keyEl = document.createElement('div');
    keyEl.className = 'key' + (w ? ' '+w : '');
    keyEl.style.background = errColor(pct);
    keyEl.style.color = textColor(pct);

    const label = document.createElement('span');
    label.className = 'key-label';
    label.textContent = l;
    keyEl.appendChild(label);

    if (pct !== undefined) {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      const isAlpha = l.length === 1 && l.match(/[A-Z]/);
      tip.innerHTML = `<div class="tt-key">${isAlpha ? l : l}</div><div class="tt-err" style="color:${errColor(Math.min(pct*1.2,50))}">${pct}% error rate</div><div class="tt-sub">${pct < 10 ? 'Good' : pct < 20 ? 'Needs practice' : pct < 35 ? 'Weak key' : 'Critical weakness'}</div>`;
      keyEl.appendChild(tip);

      keyEl.addEventListener('mouseenter', () => tip.classList.add('visible'));
      keyEl.addEventListener('mouseleave', () => tip.classList.remove('visible'));
    }

    rowEl.appendChild(keyEl);
  });
  kbd.appendChild(rowEl);
});

const legendBar = document.getElementById('legend-bar');
const stops = [0,10,20,30,40,50];
stops.forEach((s,i) => {
  if(i===stops.length-1) return;
  const seg = document.createElement('div');
  seg.className='legend-seg';
  seg.style.background = errColor((stops[i]+stops[i+1])/2);
  legendBar.appendChild(seg);
});

const sorted = Object.entries(errorData)
  .filter(([k,v]) => k.length===1 || ['backspace','enter','shift','space','tab','caps'].indexOf(k)===-1)
  .filter(([k]) => k.length===1)
  .sort((a,b)=>b[1]-a[1]).slice(0,6);