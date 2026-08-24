// ============================================================
// Automatique — analyse de fonction de transfert G(s) = N(s)/D(s)
// ============================================================
(function(){
  const numInput = document.getElementById('at-num');
  const denInput = document.getElementById('at-den');
  const resultBox = document.getElementById('at-result');
  const charts = { step:null, mag:null, phase:null };

  function parseList(str){
    return str.split(',').map(s=>parseFloat(s.trim())).filter(v=>!isNaN(v));
  }

  // Controllable canonical state-space realization from num/den (den monic-normalized)
  function toStateSpace(num, den){
    const n = den.length - 1;
    const a = den.slice(1).map(v => v/den[0]); // a1..an
    const numPadded = new Array(n+1 - num.length).fill(0).concat(num).map(v=>v/den[0]);
    const b0 = numPadded[0];
    const bRest = numPadded.slice(1); // b1..bn

    const A = Array.from({length:n}, ()=>new Array(n).fill(0));
    for(let i=0;i<n-1;i++) A[i][i+1] = 1;
    for(let j=0;j<n;j++) A[n-1][j] = -a[n-1-j];

    const B = new Array(n).fill(0); B[n-1] = 1;
    const Cvec = new Array(n);
    for(let j=0;j<n;j++){
      const k = n-1-j; // bRest index for coefficient matching a[k]
      Cvec[j] = bRest[k] - a[k]*b0;
    }
    return { A, B, C:Cvec, D:b0, n };
  }

  function simulateStep(ss, tArr){
    const {A,B,C,D,n} = ss;
    let x = new Array(n).fill(0);
    const y = [];
    function deriv(xs, u){
      const dx = new Array(n).fill(0);
      for(let i=0;i<n;i++){
        let s = B[i]*u;
        for(let j=0;j<n;j++) s += A[i][j]*xs[j];
        dx[i] = s;
      }
      return dx;
    }
    function output(xs, u){
      let s = D*u;
      for(let i=0;i<n;i++) s += C[i]*xs[i];
      return s;
    }
    y.push(output(x,1));
    for(let k=1;k<tArr.length;k++){
      const dt = tArr[k]-tArr[k-1];
      const k1 = deriv(x,1);
      const x2 = x.map((v,i)=>v+dt/2*k1[i]);
      const k2 = deriv(x2,1);
      const x3 = x.map((v,i)=>v+dt/2*k2[i]);
      const k3 = deriv(x3,1);
      const x4 = x.map((v,i)=>v+dt*k3[i]);
      const k4 = deriv(x4,1);
      x = x.map((v,i)=>v + dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));
      y.push(output(x,1));
    }
    return y;
  }

  function evalPolyComplex(coeffs, jw){
    // coeffs highest degree first (real), jw = {re:0, im:w}
    let acc = C.of(coeffs[0],0);
    for(let i=1;i<coeffs.length;i++) acc = C.add(C.mul(acc,jw), C.of(coeffs[i],0));
    return acc;
  }

  function bodeData(num, den){
    const ws = [];
    for(let e=-2; e<=3; e+=0.04) ws.push(Math.pow(10,e));
    const mag = [], phase = [];
    ws.forEach(w=>{
      const jw = C.of(0,w);
      const Hn = evalPolyComplex(num, jw);
      const Hd = evalPolyComplex(den, jw);
      const H = C.div(Hn, Hd);
      const m = 20*Math.log10(C.abs(H) || 1e-12);
      let ph = Math.atan2(H.im, H.re) * 180/Math.PI;
      mag.push({x:w, y:m});
      phase.push({x:w, y:ph});
    });
    return {ws, mag, phase};
  }

  function drawStep(t, y){
    const ctx = document.getElementById('at-step-chart');
    if(charts.step) charts.step.destroy();
    charts.step = makeLineChart(ctx, [{
      label:'Réponse indicielle', data:t.map((tt,i)=>({x:tt,y:y[i]})),
      borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:0, borderWidth:2
    }], {xLabel:'Temps (s)', yLabel:'Réponse'});
  }

  function drawBode(mag, phase){
    const ctxM = document.getElementById('at-bode-mag-chart');
    const ctxP = document.getElementById('at-bode-phase-chart');
    if(charts.mag) charts.mag.destroy();
    if(charts.phase) charts.phase.destroy();
    charts.mag = makeLineChart(ctxM, [{
      label:'Gain (dB)', data:mag, borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:0, borderWidth:2
    }], {xLabel:'ω (rad/s) — échelle log', yLabel:'Gain (dB)', chartOptions:{ scales:{ x:{type:'logarithmic'} } }});
    charts.phase = makeLineChart(ctxP, [{
      label:'Phase (°)', data:phase, borderColor: CL_COLORS.warm, backgroundColor:'transparent', pointRadius:0, borderWidth:2
    }], {xLabel:'ω (rad/s) — échelle log', yLabel:'Phase (°)', chartOptions:{ scales:{ x:{type:'logarithmic'} } }});
  }

  function analyze(){
    const num = parseList(numInput.value);
    const den = parseList(denInput.value);
    if(!num.length || den.length < 2){
      resultBox.innerHTML = '<span class="warn">Veuillez entrer des coefficients valides (dénominateur ≥ 2 termes).</span>';
      return;
    }
    const order = den.length - 1;
    const poles = polyRoots(den);
    const zeros = num.length > 1 ? polyRoots(num) : [];
    const stable = poles.every(p => p.re < 0);

    let out = '';
    out += `<span class="k">Ordre du système</span> : <span class="v">${order}</span>\n`;
    out += `<span class="k">Pôles</span> : <span class="v">${poles.map(p=>formatComplex(p)).join(' ; ')}</span>\n`;
    out += `<span class="k">Zéros</span> : <span class="v">${zeros.length ? zeros.map(z=>formatComplex(z)).join(' ; ') : '—'}</span>\n`;
    out += `<span class="k">Stabilité</span> : ${stable ? '<span class="v">Stable</span>' : '<span class="warn">Instable</span>'}\n`;

    if(order === 1){
      const p0 = poles[0].re;
      if(p0 !== 0){
        const tau = -1/p0;
        out += `<span class="k">Constante de temps τ</span> : <span class="v">${tau.toFixed(3)} s</span>\n`;
        out += `<span class="k">Temps de réponse ≈ 4τ</span> : <span class="v">${(4*tau).toFixed(3)} s</span>\n`;
        out += `<span class="k">Temps de montée ≈ 2.2τ</span> : <span class="v">${(2.2*tau).toFixed(3)} s</span>\n`;
      }
    } else if(order === 2){
      const p0 = poles[0];
      const wn = C.abs(p0);
      const zeta = wn !== 0 ? -p0.re/wn : 0;
      const gainStatique = den[den.length-1] !== 0 ? num[num.length-1]/den[den.length-1] : 0;
      out += `<span class="k">Gain statique</span> : <span class="v">${gainStatique.toFixed(3)}</span>\n`;
      out += `<span class="k">Amortissement ζ</span> : <span class="v">${zeta.toFixed(4)}</span>\n`;
      out += `<span class="k">Pulsation propre ω₀</span> : <span class="v">${wn.toFixed(3)} rad/s</span>\n`;
      if(zeta < 1 && zeta > 0){
        const Mp = Math.exp(-Math.PI*zeta/Math.sqrt(1-zeta*zeta))*100;
        const tr = 1.8/wn;
        const fc = wn*Math.sqrt(1-zeta*zeta);
        const ts = 4/(zeta*wn);
        out += `<span class="k">Dépassement Mp</span> : <span class="v">${Mp.toFixed(2)} %</span>\n`;
        out += `<span class="k">Temps de montée ≈</span> : <span class="v">${tr.toFixed(3)} s</span>\n`;
        out += `<span class="k">Fréquence de coupure ≈</span> : <span class="v">${fc.toFixed(3)} rad/s</span>\n`;
        out += `<span class="k">Temps de stabilisation ≈</span> : <span class="v">${ts.toFixed(3)} s</span>\n`;
      } else if(zeta >= 1){
        out += `Système sur-amorti (ζ ≥ 1).\n`;
      }
    } else {
      out += `Analyse détaillée limitée au premier et deuxième ordre (pôles/zéros/stabilité restent valables).\n`;
    }
    resultBox.innerHTML = out;

    // Step response via state-space simulation
    try{
      const ss = toStateSpace(num, den);
      const T = Math.max(10, order===2 && poles[0].re!==0 ? 8/Math.abs(poles[0].re) : 10);
      const N = 300;
      const t = Array.from({length:N}, (_,i)=> i*T/(N-1));
      const y = simulateStep(ss, t);
      drawStep(t, y);
    }catch(e){ /* leave chart as-is if realization fails */ }

    const {mag, phase} = bodeData(num, den);
    drawBode(mag, phase);
  }

  document.getElementById('at-run').addEventListener('click', analyze);
  document.getElementById('at-reset').addEventListener('click', ()=>{
    numInput.value = '1'; denInput.value = '1, 3, 2';
    resultBox.textContent = 'En attente d\'analyse…';
    Object.values(charts).forEach(c=>c && c.destroy());
  });
})();
