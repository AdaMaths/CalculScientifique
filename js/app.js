// ============================================================
// CalculLAB — app.js
// Navigation + shared numerical helpers used across modules.
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Navigation ----------
function goTo(target){
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const sec = document.getElementById('sec-' + target);
  if(sec) sec.classList.add('active');
  document.querySelectorAll(`.nav-item[data-target="${target}"]`).forEach(n => n.classList.add('active'));
  window.scrollTo({top:0, behavior:'smooth'});
}

document.querySelectorAll('.nav-item, .module-card').forEach(el => {
  el.addEventListener('click', () => goTo(el.dataset.target));
});

// ---------- Chart.js defaults (theme) ----------
if(window.Chart){
  Chart.defaults.color = '#8FA0C2';
  Chart.defaults.borderColor = '#223055';
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 11;
}
const CL_COLORS = { accent:'#4FE3C1', warm:'#F2A73B', danger:'#FF6B7A', dim:'#8FA0C2' };

function makeLineChart(ctx, datasets, opts={}){
  return new Chart(ctx, {
    type:'line',
    data:{ datasets },
    options:Object.assign({
      responsive:true,
      animation:false,
      interaction:{ mode:'nearest', intersect:false },
      scales:{
        x:{ type:'linear', grid:{color:'#1A2440'}, title:{display:!!opts.xLabel, text:opts.xLabel||''} },
        y:{ grid:{color:'#1A2440'}, title:{display:!!opts.yLabel, text:opts.yLabel||''} }
      },
      plugins:{ legend:{ labels:{ boxWidth:12 } } }
    }, opts.chartOptions||{})
  });
}

function destroyChart(chartRef){
  if(chartRef && chartRef.current){ chartRef.current.destroy(); chartRef.current = null; }
}

// ---------- Complex number helpers (for polynomial roots) ----------
const C = {
  add:(a,b)=>({re:a.re+b.re, im:a.im+b.im}),
  sub:(a,b)=>({re:a.re-b.re, im:a.im-b.im}),
  mul:(a,b)=>({re:a.re*b.re - a.im*b.im, im:a.re*b.im + a.im*b.re}),
  div:(a,b)=>{ const d=b.re*b.re+b.im*b.im; return {re:(a.re*b.re+a.im*b.im)/d, im:(a.im*b.re-a.re*b.im)/d}; },
  abs:(a)=>Math.hypot(a.re,a.im),
  of:(re,im=0)=>({re,im})
};

// Durand–Kerner method: roots of a real polynomial given as coefficients
// [c_n, c_{n-1}, ..., c_0] (highest degree first), normalized internally.
function polyRoots(coeffsIn){
  const coeffs = coeffsIn.slice();
  while(coeffs.length > 1 && Math.abs(coeffs[0]) < 1e-14) coeffs.shift();
  const n = coeffs.length - 1;
  if(n <= 0) return [];
  const lead = coeffs[0];
  const a = coeffs.map(c => c/lead); // monic, a[0]=1

  function evalPoly(x){
    let r = C.of(1,0);
    let acc = C.of(0,0);
    // Horner
    acc = C.of(a[0],0);
    for(let i=1;i<a.length;i++){
      acc = C.add(C.mul(acc,x), C.of(a[i],0));
    }
    return acc;
  }

  // initial guesses spread on a circle
  let roots = [];
  const base = C.of(0.4, 0.9);
  let p = C.of(1,0);
  for(let i=0;i<n;i++){
    p = i===0 ? base : C.mul(p, base);
    roots.push(p);
  }

  for(let iter=0; iter<200; iter++){
    let maxDelta = 0;
    const newRoots = roots.slice();
    for(let i=0;i<n;i++){
      let denom = C.of(1,0);
      for(let j=0;j<n;j++){
        if(j!==i) denom = C.mul(denom, C.sub(roots[i], roots[j]));
      }
      const delta = C.div(evalPoly(roots[i]), denom);
      newRoots[i] = C.sub(roots[i], delta);
      maxDelta = Math.max(maxDelta, C.abs(delta));
    }
    roots = newRoots;
    if(maxDelta < 1e-12) break;
  }
  // clean tiny imaginary parts
  return roots.map(r => ({
    re: Math.abs(r.re) < 1e-9 ? 0 : r.re,
    im: Math.abs(r.im) < 1e-9 ? 0 : r.im
  }));
}

function formatComplex(z, digits=4){
  if(Math.abs(z.im) < 1e-9) return z.re.toFixed(digits);
  const sign = z.im >= 0 ? '+' : '-';
  return `${z.re.toFixed(digits)} ${sign} ${Math.abs(z.im).toFixed(digits)}i`;
}

// ---------- CSV helpers ----------
function renderTable(tableEl, rows, columns){
  const thead = tableEl.querySelector('thead');
  const tbody = tableEl.querySelector('tbody');
  thead.innerHTML = '<tr>' + columns.map(c=>`<th>${c}</th>`).join('') + '</tr>';
  tbody.innerHTML = rows.map(r => '<tr>' + columns.map(c=>`<td>${r[c] ?? ''}</td>`).join('') + '</tr>').join('');
}

function numericColumns(rows, columns){
  return columns.filter(c => rows.length && rows.every(r => r[c]==='' || r[c]==null || !isNaN(parseFloat(r[c]))));
}

function colStats(rows, col){
  const vals = rows.map(r=>parseFloat(r[col])).filter(v=>!isNaN(v));
  if(!vals.length) return null;
  const sum = vals.reduce((a,b)=>a+b,0);
  return { mean: sum/vals.length, min: Math.min(...vals), max: Math.max(...vals), sum };
}
