// ============================================================
// Prévision énergétique — Centrale PV (utilise ml-core.js + dataset-energie.js)
// ============================================================
(function(){
  const FEATURES = ['HeureMin','Ch1','Ch2','Ch3','Ch4','Ch5','Ch6'];
  const TARGET = 'Ch7';
  const COLUMNS = [...FEATURES, TARGET];
  const LABELS = {
    HeureMin:'Heure', Ch1:'Ch1 (Rayonnement)', Ch2:'Ch2 (Temp. cellule)', Ch3:'Ch3 (Temp. générateur)',
    Ch4:'Ch4 (Temp. batterie)', Ch5:'Ch5 (Temp. ambiante)', Ch6:'Ch6 (Consommation)', Ch7:'Ch7 (Puissance PV)'
  };

  let models = null; // { lr, dt, rf, gb, best }
  const charts = {};

  function minutesToHHMM(m){
    const h = Math.floor(m/60), mi = Math.round(m%60);
    return `${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`;
  }
  function hhmmToMinutes(str){
    const [h,m] = str.split(':').map(Number);
    return (h||0)*60 + (m||0);
  }

  // ---------- Tabs ----------
  document.querySelectorAll('.en-tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.en-tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('en-tab-explorer').style.display = tab==='explorer' ? '' : 'none';
      document.getElementById('en-tab-ml-tp').style.display = tab==='ml-tp' ? '' : 'none';
      if(tab === 'ml-tp' && !window.__enEdaRendered){ renderEDA(); window.__enEdaRendered = true; }
    });
  });

  // ---------- 1. Aperçu ----------
  function renderPreview(){
    const preview = ENERGIE_DATA.slice(0, 10).map(r => ({
      Heure: minutesToHHMM(r.HeureMin), Ch1:r.Ch1, Ch2:r.Ch2, Ch3:r.Ch3, Ch4:r.Ch4, Ch5:r.Ch5, Ch6:r.Ch6, Ch7:r.Ch7
    }));
    renderTable(document.getElementById('en-ml-table'), preview, ['Heure','Ch1','Ch2','Ch3','Ch4','Ch5','Ch6','Ch7']);
  }

  // ---------- 2. describe() ----------
  function renderDescribe(){
    const stats = COLUMNS.map(c => ({ col:c, ...describeColumn(ENERGIE_DATA.map(r=>r[c])) }));
    const thead = document.querySelector('#en-ml-describe thead');
    const tbody = document.querySelector('#en-ml-describe tbody');
    thead.innerHTML = '<tr><th></th>' + COLUMNS.map(c=>`<th>${LABELS[c]}</th>`).join('') + '</tr>';
    const rowsMeta = [
      ['count','count',0], ['mean','mean',2], ['std','std',2],
      ['min','min',2], ['25%','p25',2], ['50%','p50',2], ['75%','p75',2], ['max','max',2]
    ];
    tbody.innerHTML = rowsMeta.map(([label,key,dec])=>
      `<tr><th>${label}</th>` + stats.map(s=>`<td>${s[key].toFixed(dec)}</td>`).join('') + '</tr>'
    ).join('');
  }

  // ---------- 3. Corrélation ----------
  function renderCorrelation(){
    const M = correlationMatrix(ENERGIE_DATA, COLUMNS);
    const thead = document.querySelector('#en-ml-corr thead');
    const tbody = document.querySelector('#en-ml-corr tbody');
    thead.innerHTML = '<tr><th></th>' + COLUMNS.map(c=>`<th>${c}</th>`).join('') + '</tr>';
    tbody.innerHTML = COLUMNS.map(c1=>{
      const cells = COLUMNS.map(c2=>{
        const v = M[c1][c2];
        const alpha = Math.abs(v);
        const bg = v >= 0 ? `rgba(79,227,193,${0.12+alpha*0.55})` : `rgba(255,107,122,${0.12+alpha*0.55})`;
        return `<td class="corr-cell" style="background:${bg};">${v.toFixed(2)}</td>`;
      }).join('');
      return `<tr><th>${c1}</th>${cells}</tr>`;
    }).join('');
  }

  // ---------- 4. Scatter plots ----------
  function scatterChart(canvasId, feature, xLabel, color){
    // subsample for rendering performance (10k points is heavy for Chart.js)
    const step = Math.max(1, Math.floor(ENERGIE_DATA.length/1500));
    const pts = [];
    for(let i=0;i<ENERGIE_DATA.length;i+=step) pts.push({x:ENERGIE_DATA[i][feature], y:ENERGIE_DATA[i][TARGET]});
    const ctx = document.getElementById(canvasId);
    if(charts[canvasId]) charts[canvasId].destroy();
    charts[canvasId] = new Chart(ctx, {
      type:'scatter',
      data:{ datasets:[{ label:`Puissance PV vs ${xLabel}`, data: pts, backgroundColor: color, pointRadius:2 }]},
      options:{
        responsive:true, animation:false,
        scales:{ x:{ title:{display:true, text:xLabel}, grid:{color:'#1A2440'} }, y:{ title:{display:true, text:'Puissance PV (Ch7)'}, grid:{color:'#1A2440'} } },
        plugins:{ legend:{ labels:{ boxWidth:12 } } }
      }
    });
  }

  function renderEDA(){
    renderPreview();
    renderDescribe();
    renderCorrelation();
    scatterChart('en-ml-scatter-ch1', 'Ch1', 'Rayonnement (W/m²)', CL_COLORS.accent);
    scatterChart('en-ml-scatter-heure', 'HeureMin', 'Heure (minutes depuis minuit)', CL_COLORS.warm);
  }

  // ---------- 5–7. Entraînement, comparaison, actual vs predicted ----------
  function actualVsPredictedChart(canvasId, title, yTest, yPred, color){
    const step = Math.max(1, Math.floor(yTest.length/1200));
    const diag = [], pts = [];
    for(let i=0;i<yTest.length;i+=step){ diag.push({x:yTest[i],y:yTest[i]}); pts.push({x:yPred[i], y:yTest[i]}); }
    const ctx = document.getElementById(canvasId);
    if(charts[canvasId]) charts[canvasId].destroy();
    charts[canvasId] = new Chart(ctx, {
      type:'scatter',
      data:{ datasets:[
        { label:'Idéal (y = y)', data: diag, backgroundColor: CL_COLORS.dim, pointRadius:2 },
        { label:'Prédit vs réel', data: pts, backgroundColor: color, pointRadius:3 }
      ]},
      options:{
        responsive:true, animation:false,
        plugins:{ title:{display:true, text:title, color:'#EAF0FA'}, legend:{ labels:{ boxWidth:12 } } },
        scales:{ x:{ title:{display:true, text:'Prédit'}, grid:{color:'#1A2440'} }, y:{ title:{display:true, text:'Réel'}, grid:{color:'#1A2440'} } }
      }
    });
  }

  function clampSampleCap(value){
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 1200;
    return Math.min(3000, Math.max(300, parsed));
  }

  function trainAndEvaluate(){
    const statusEl = document.getElementById('en-ml-status');
    const runBtn = document.getElementById('en-ml-run');
    runBtn.disabled = true;
    statusEl.innerHTML = '<span class="v">Préparation du jeu d’entraînement…</span>';

    // defer so the UI can repaint before the heavy synchronous work starts
    setTimeout(()=>{
      try{
        const testSize = parseFloat(document.getElementById('en-ml-testsize').value);
        const seed = parseInt(document.getElementById('en-ml-seed').value) || 42;
        const cap = clampSampleCap(document.getElementById('en-ml-samplecap').value);

        const { train: fullTrain, test } = trainTestSplit(ENERGIE_DATA, testSize, seed);
        const train = fullTrain.slice(0, cap);
        const yTest = test.map(r=>r[TARGET]);

        statusEl.innerHTML = '<span class="v">Entraînement des modèles…</span>';

        const lr = fitLinearRegression(train, FEATURES, TARGET);
        const dt = fitDecisionTree(train, FEATURES, TARGET, 6, 12);
        const rf = fitRandomForest(train, FEATURES, TARGET, 8, 5, 12, 7);
        const gb = fitGradientBoosting(train, FEATURES, TARGET, 12, 3, 0.15, 12);

        const yPredLR = test.map(r=>lr.predict(r));
        const yPredDT = test.map(r=>dt.predict(r));
        const yPredRF = test.map(r=>rf.predict(r));
        const yPredGB = test.map(r=>gb.predict(r));

        const metricsFor = (yPred) => ({
          r2: r2Score(yTest,yPred), mae: maeScore(yTest,yPred),
          mse: mseScore(yTest,yPred), rmse: Math.sqrt(mseScore(yTest,yPred))
        });

        const results = {
          'Régression linéaire': metricsFor(yPredLR),
          'Arbre de décision': metricsFor(yPredDT),
          'Random Forest': metricsFor(yPredRF),
          'Gradient Boosting (≈XGBoost)': metricsFor(yPredGB)
        };

        const thead = document.querySelector('#en-ml-comparison thead');
        const tbody = document.querySelector('#en-ml-comparison tbody');
        thead.innerHTML = '<tr><th>Modèle</th><th>R²</th><th>MAE</th><th>MSE</th><th>RMSE</th></tr>';
        tbody.innerHTML = Object.entries(results).map(([name,m])=>
          `<tr><th>${name}</th><td>${m.r2.toFixed(4)}</td><td>${m.mae.toFixed(2)}</td><td>${m.mse.toFixed(2)}</td><td>${m.rmse.toFixed(2)}</td></tr>`
        ).join('');

        if(charts['en-ml-comparison-chart']) charts['en-ml-comparison-chart'].destroy();
        const names = Object.keys(results);
        charts['en-ml-comparison-chart'] = new Chart(document.getElementById('en-ml-comparison-chart'), {
          type:'bar',
          data:{ labels: names, datasets:[
            { label:'R²', data: names.map(n=>results[n].r2), backgroundColor: CL_COLORS.accent },
          ]},
          options:{ responsive:true, animation:false, scales:{ y:{ min:0, max:1, grid:{color:'#1A2440'} }, x:{ grid:{display:false} } }, plugins:{ legend:{ labels:{ boxWidth:12 } } } }
        });

        actualVsPredictedChart('en-ml-avp-lr', 'Régression linéaire', yTest, yPredLR, CL_COLORS.accent);
        actualVsPredictedChart('en-ml-avp-dt', 'Arbre de décision', yTest, yPredDT, CL_COLORS.warm);
        actualVsPredictedChart('en-ml-avp-rf', 'Random Forest', yTest, yPredRF, CL_COLORS.danger);
        actualVsPredictedChart('en-ml-avp-gb', 'Gradient Boosting', yTest, yPredGB, '#B78CF2');

        const best = names.reduce((a,b)=> results[a].r2 >= results[b].r2 ? a : b);
        const modelByName = { 'Régression linéaire':lr, 'Arbre de décision':dt, 'Random Forest':rf, 'Gradient Boosting (≈XGBoost)':gb };

        document.getElementById('en-ml-conclusion').innerHTML =
          `<span class="k">Meilleur modèle (R² le plus élevé)</span> : <span class="v">${best}</span> (R² = ${results[best].r2.toFixed(4)})\n\n` +
          `Le rayonnement (Ch1) et la température de cellule PV (Ch2) sont, de loin, les variables les plus déterminantes pour prédire la puissance PV produite — la production suit directement l'ensoleillement. ` +
          `Ce modèle peut servir de base à une prévision de production à court terme pour anticiper l'équilibre production/consommation de la centrale.`;

        models = { lr, dt, rf, gb, best: modelByName[best], bestName: best };
        document.getElementById('en-ml-pred-result').textContent = `Modèles entraînés (échantillon d'entraînement : ${train.length} lignes). Meilleur modèle : ${best}.`;
        statusEl.innerHTML = `<span class="v">Entraînement terminé sur ${train.length} lignes (test : ${test.length} lignes).</span>`;
      }catch(e){
        statusEl.innerHTML = `<span class="warn">Erreur : ${e.message}</span>`;
      }finally{
        runBtn.disabled = false;
      }
    }, 30);
  }

  function predict(){
    if(!models){ document.getElementById('en-ml-pred-result').textContent = "Entraînez d'abord les modèles."; return; }
    const row = {
      HeureMin: hhmmToMinutes(document.getElementById('en-pred-heure').value),
      Ch1: parseFloat(document.getElementById('en-pred-ch1').value) || 0,
      Ch2: parseFloat(document.getElementById('en-pred-ch2').value) || 0,
      Ch3: parseFloat(document.getElementById('en-pred-ch3').value) || 0,
      Ch4: parseFloat(document.getElementById('en-pred-ch4').value) || 0,
      Ch5: parseFloat(document.getElementById('en-pred-ch5').value) || 0,
      Ch6: parseFloat(document.getElementById('en-pred-ch6').value) || 0
    };
    const predBest = models.best.predict(row);
    const predRF = models.rf.predict(row);
    const predGB = models.gb.predict(row);
    document.getElementById('en-ml-pred-result').innerHTML =
      `<span class="k">${models.bestName} (meilleur modèle)</span> : <span class="v">${predBest.toFixed(2)} W</span>\n` +
      `<span class="k">Random Forest</span> : <span class="v">${predRF.toFixed(2)} W</span>\n` +
      `<span class="k">Gradient Boosting</span> : <span class="v">${predGB.toFixed(2)} W</span>`;
  }

  document.getElementById('en-ml-run').addEventListener('click', trainAndEvaluate);
  document.getElementById('en-ml-predict').addEventListener('click', predict);
})();
