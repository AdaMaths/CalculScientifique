// ============================================================
// Laser — pertes par cavité + profil gaussien
// ============================================================
(function(){
  const resultEl = document.getElementById('ls-result');
  const gaussResultEl = document.getElementById('ls-gauss-result');
  let chart = null;

  document.getElementById('ls-calc').addEventListener('click', ()=>{
    const R1 = parseFloat(document.getElementById('ls-r1').value);
    const R2 = parseFloat(document.getElementById('ls-r2').value);
    const Pint = parseFloat(document.getElementById('ls-int').value);
    const T1 = 1-R1, T2 = 1-R2;
    const totalLoss = T1 + T2 + 2*Pint;
    resultEl.innerHTML =
      `<span class="k">Miroir 1</span> : R₁ = <span class="v">${R1.toFixed(4)}</span> | T₁ = <span class="v">${T1.toFixed(4)}</span>\n` +
      `<span class="k">Miroir 2</span> : R₂ = <span class="v">${R2.toFixed(4)}</span> | T₂ = <span class="v">${T2.toFixed(4)}</span>\n` +
      `<span class="k">Pertes internes (par passage)</span> : <span class="v">${(Pint*100).toFixed(2)} %</span>\n` +
      `<span class="k">Pertes totales (aller-retour)</span> : ${totalLoss<0.05 ? `<span class="v">${(totalLoss*100).toFixed(2)} %</span>` : `<span class="warn">${(totalLoss*100).toFixed(2)} %</span>`}`;
  });

  document.getElementById('ls-gauss').addEventListener('click', ()=>{
    const lamNm = parseFloat(document.getElementById('ls-lambda').value);
    const w0Um = parseFloat(document.getElementById('ls-w0').value);
    const zMm = parseFloat(document.getElementById('ls-z').value);
    const powerMw = parseFloat(document.getElementById('ls-power').value);

    const lam = lamNm*1e-9, w0 = w0Um*1e-6, z = zMm*1e-3, power = powerMw*1e-3;
    const zR = Math.PI*w0*w0/lam;
    const wz = w0*Math.sqrt(1+(z/zR)**2);
    const I0 = 2*power/(Math.PI*wz*wz);

    const N = 400;
    const xs = [], ys = [];
    for(let i=0;i<N;i++){
      const x = -3*wz + (6*wz)*i/(N-1);
      const I = I0*Math.exp(-2*(x/wz)**2);
      xs.push(x*1e6);
      ys.push(I);
    }

    if(chart) chart.destroy();
    chart = makeLineChart(document.getElementById('ls-chart'), [{
      label:`Profil gaussien à z = ${zMm.toFixed(1)} mm`,
      data: xs.map((x,i)=>({x, y:ys[i]})),
      borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:0, borderWidth:2
    }], {xLabel:'x (μm)', yLabel:'Intensité (W/m²)'});

    gaussResultEl.innerHTML =
      `<span class="k">w(z)</span> : <span class="v">${(wz*1e6).toFixed(2)} μm</span>\n` +
      `<span class="k">zR</span> : <span class="v">${(zR*1e3).toFixed(2)} mm</span>\n` +
      `<span class="k">I₀</span> : <span class="v">${I0.toExponential(2)} W/m²</span>`;
  });
})();
