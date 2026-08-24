// ============================================================
// Équations différentielles — méthodes numériques
// ============================================================
(function(){
  const resultBox = document.getElementById('ed-result');
  let chart = null;

  function newtonSolve(g, x0, tol=1e-9, maxIter=50){
    let x = x0;
    let h = 1e-6;
    for(let i=0;i<maxIter;i++){
      const gx = g(x);
      const dgx = (g(x+h)-g(x-h))/(2*h);
      if(Math.abs(dgx) < 1e-14) break;
      const xNew = x - gx/dgx;
      if(Math.abs(xNew-x) < tol) return xNew;
      x = xNew;
    }
    return x;
  }

  const METHODS = {
    'Euler explicite': (f,y0,t)=>{
      const y=[y0];
      for(let i=1;i<t.length;i++){ const dt=t[i]-t[i-1]; y.push(y[i-1]+f(y[i-1],t[i-1])*dt); }
      return y;
    },
    'Euler implicite': (f,y0,t)=>{
      const y=[y0];
      for(let i=1;i<t.length;i++){
        const dt=t[i]-t[i-1];
        const g = (yn)=> yn - y[i-1] - dt*f(yn,t[i]);
        y.push(newtonSolve(g, y[i-1]));
      }
      return y;
    },
    'Heun': (f,y0,t)=>{
      const y=[y0];
      for(let i=1;i<t.length;i++){
        const dt=t[i]-t[i-1];
        const yPred = y[i-1]+dt*f(y[i-1],t[i-1]);
        y.push(y[i-1]+dt/2*(f(y[i-1],t[i-1])+f(yPred,t[i])));
      }
      return y;
    },
    'RK2': (f,y0,t)=>{
      const y=[y0];
      for(let i=1;i<t.length;i++){
        const dt=t[i]-t[i-1];
        const k1=f(y[i-1],t[i-1]);
        const k2=f(y[i-1]+dt*k1/2, t[i-1]+dt/2);
        y.push(y[i-1]+dt*k2);
      }
      return y;
    },
    'RK4': (f,y0,t)=>{
      const y=[y0];
      for(let i=1;i<t.length;i++){
        const dt=t[i]-t[i-1];
        const k1=f(y[i-1],t[i-1]);
        const k2=f(y[i-1]+dt*k1/2, t[i-1]+dt/2);
        const k3=f(y[i-1]+dt*k2/2, t[i-1]+dt/2);
        const k4=f(y[i-1]+dt*k3, t[i-1]+dt);
        y.push(y[i-1]+dt/6*(k1+2*k2+2*k3+k4));
      }
      return y;
    },
    'Crank-Nicolson': (f,y0,t)=>{
      const y=[y0];
      for(let i=1;i<t.length;i++){
        const dt=t[i]-t[i-1];
        const g = (yn)=> yn - y[i-1] - dt/2*(f(y[i-1],t[i-1]) + f(yn,t[i]));
        y.push(newtonSolve(g, y[i-1]));
      }
      return y;
    }
  };

  function run(){
    try{
      const eqn = document.getElementById('ed-eqn').value;
      const y0 = parseFloat(document.getElementById('ed-y0').value);
      const t0 = math.evaluate(document.getElementById('ed-t0').value);
      const t1 = math.evaluate(document.getElementById('ed-t1').value);
      const nPoints = parseInt(document.getElementById('ed-n').value);
      const methodName = document.getElementById('ed-method').value;

      const compiled = math.compile(eqn);
      const f = (y,t) => compiled.evaluate({y, t});

      const t = Array.from({length:nPoints}, (_,i)=> t0 + (t1-t0)*i/(nPoints-1));
      const y = METHODS[methodName](f, y0, t);

      resultBox.innerHTML =
        `<span class="k">t</span> : <span class="v">${t.slice(0,8).map(v=>v.toFixed(3)).join(', ')} …</span>\n` +
        `<span class="k">y</span> : <span class="v">${y.slice(0,8).map(v=>v.toFixed(3)).join(', ')} …</span>`;

      if(chart) chart.destroy();
      chart = makeLineChart(document.getElementById('ed-chart'), [{
        label:`Solution numérique (${methodName})`,
        data:t.map((tt,i)=>({x:tt,y:y[i]})),
        borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:0, borderWidth:2
      }], {xLabel:'t', yLabel:'y(t)'});

    }catch(e){
      resultBox.innerHTML = `<span class="warn">Erreur : ${e.message}</span>`;
    }
  }

  document.getElementById('ed-run').addEventListener('click', run);
})();
