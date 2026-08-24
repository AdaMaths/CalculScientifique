// ============================================================
// Analyseur de séries de Fourier — intégration numérique (Simpson)
// ============================================================
(function(){
  const resultBox = document.getElementById('sg-result');
  let chart = null;

  function simpson(f, a, b, n){
    if(n % 2 === 1) n++;
    const h = (b-a)/n;
    let sum = f(a) + f(b);
    for(let i=1;i<n;i++){
      const x = a + i*h;
      sum += (i%2===0 ? 2 : 4) * f(x);
    }
    return sum*h/3;
  }

  function run(){
    try{
      const funcStr = document.getElementById('sg-func').value;
      const LExpr = document.getElementById('sg-L').value;
      const N = parseInt(document.getElementById('sg-N').value) || 5;

      const compiledF = math.compile(funcStr);
      const L = math.evaluate(LExpr);
      const f = (x) => compiledF.evaluate({x});

      const NPTS = 800;
      const a0 = simpson(f, -L, L, NPTS) / (2*L);
      const an = [], bn = [];
      for(let n=1;n<=N;n++){
        an.push(simpson(x => f(x)*Math.cos(n*Math.PI*x/L), -L, L, NPTS) / L);
        bn.push(simpson(x => f(x)*Math.sin(n*Math.PI*x/L), -L, L, NPTS) / L);
      }

      let out = `<span class="k">a₀</span> = <span class="v">${a0.toFixed(5)}</span>\n\n`;
      for(let n=1;n<=N;n++) out += `<span class="k">a_${n}</span> = <span class="v">${an[n-1].toFixed(5)}</span>\n`;
      out += '\n';
      for(let n=1;n<=N;n++) out += `<span class="k">b_${n}</span> = <span class="v">${bn[n-1].toFixed(5)}</span>\n`;
      resultBox.innerHTML = out;

      const series = (x) => {
        let s = a0;
        for(let n=1;n<=N;n++) s += an[n-1]*Math.cos(n*Math.PI*x/L) + bn[n-1]*Math.sin(n*Math.PI*x/L);
        return s;
      };

      const M = 400;
      const orig = [], approx = [];
      for(let i=0;i<M;i++){
        const x = -L + (2*L)*i/(M-1);
        orig.push({x, y:f(x)});
        approx.push({x, y:series(x)});
      }

      if(chart) chart.destroy();
      chart = makeLineChart(document.getElementById('sg-chart'), [
        { label:`f(x) = ${funcStr}`, data:orig, borderColor: CL_COLORS.dim, backgroundColor:'transparent', pointRadius:0, borderWidth:2 },
        { label:`Approximation (N=${N})`, data:approx, borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:0, borderWidth:2, borderDash:[5,3] }
      ], {xLabel:'x', yLabel:'Valeur'});

    }catch(e){
      resultBox.innerHTML = `<span class="warn">Erreur de calcul : ${e.message}</span>`;
    }
  }

  document.getElementById('sg-run').addEventListener('click', run);
})();
