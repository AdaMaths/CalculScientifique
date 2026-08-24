// ============================================================
// Interpolation — Lagrange et Newton
// ============================================================
(function(){
  const resultBox = document.getElementById('ip-result');
  let chart = null;

  function parseList(str){
    return str.split(',').map(s=>parseFloat(s.trim())).filter(v=>!isNaN(v));
  }

  // Evaluate Lagrange polynomial directly at a point (numerically stable, no symbolic expansion needed)
  function lagrangeEval(xVals, yVals, x){
    const n = xVals.length;
    let total = 0;
    for(let i=0;i<n;i++){
      let term = yVals[i];
      for(let j=0;j<n;j++){
        if(i!==j) term *= (x - xVals[j])/(xVals[i]-xVals[j]);
      }
      total += term;
    }
    return total;
  }

  // Newton divided differences: returns coefficients [f[x0], f[x0,x1], ...]
  function newtonCoeffs(xVals, yVals){
    const n = xVals.length;
    const coef = yVals.slice();
    for(let j=1;j<n;j++){
      for(let i=n-1;i>=j;i--){
        coef[i] = (coef[i]-coef[i-1])/(xVals[i]-xVals[i-j]);
      }
    }
    return coef;
  }

  function newtonEval(xVals, coef, x){
    const n = xVals.length;
    let result = coef[0];
    let prod = 1;
    for(let i=1;i<n;i++){
      prod *= (x - xVals[i-1]);
      result += coef[i]*prod;
    }
    return result;
  }

  function run(){
    try{
      const xVals = parseList(document.getElementById('ip-x').value);
      const yVals = parseList(document.getElementById('ip-y').value);
      const xInterp = parseFloat(document.getElementById('ip-xi').value);
      const method = document.getElementById('ip-method').value;

      if(xVals.length !== yVals.length) throw new Error('Les listes x et y doivent avoir la même longueur.');
      if(xVals.length < 2) throw new Error('Au moins deux points sont nécessaires.');
      if(new Set(xVals).size !== xVals.length) throw new Error('Les valeurs de x doivent être uniques.');

      let evalFn, coefInfo;
      if(method === 'Lagrange'){
        evalFn = (x)=>lagrangeEval(xVals, yVals, x);
        coefInfo = 'Base de Lagrange (évaluation directe, sans développement symbolique)';
      } else {
        const coef = newtonCoeffs(xVals, yVals);
        evalFn = (x)=>newtonEval(xVals, coef, x);
        coefInfo = 'Différences divisées : [' + coef.map(c=>c.toFixed(4)).join(', ') + ']';
      }

      const yInterp = evalFn(xInterp);

      resultBox.innerHTML =
        `<span class="k">Méthode</span> : <span class="v">${method}</span>\n` +
        `<span class="k">Coefficients</span> : <span class="v">${coefInfo}</span>\n` +
        `<span class="k">P(${xInterp})</span> = <span class="v">${yInterp.toFixed(6)}</span>`;

      const xMin = Math.min(...xVals)-1, xMax = Math.max(...xVals)+1;
      const M = 300;
      const curve = [];
      for(let i=0;i<M;i++){
        const x = xMin + (xMax-xMin)*i/(M-1);
        curve.push({x, y:evalFn(x)});
      }

      if(chart) chart.destroy();
      chart = makeLineChart(document.getElementById('ip-chart'), [
        { label:"Polynôme d'interpolation", data:curve, borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:0, borderWidth:2 },
        { label:'Points donnés', data:xVals.map((x,i)=>({x,y:yVals[i]})), borderColor: CL_COLORS.warm, backgroundColor: CL_COLORS.warm, pointRadius:5, showLine:false },
        { label:`P(${xInterp})`, data:[{x:xInterp,y:yInterp}], borderColor: CL_COLORS.danger, backgroundColor: CL_COLORS.danger, pointRadius:6, showLine:false }
      ], {xLabel:'x', yLabel:'P(x)'});

    }catch(e){
      resultBox.innerHTML = `<span class="warn">${e.message}</span>`;
    }
  }

  document.getElementById('ip-run').addEventListener('click', run);
})();
