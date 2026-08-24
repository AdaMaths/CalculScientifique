// ============================================================
// TP ML Régression — UI (utilise ml-core.js + dataset-advertising.js)
// ============================================================
(function(){
  const FEATURES = ['TV','Radio','Newspaper'];
  const TARGET = 'Sales';
  const COLUMNS = [...FEATURES, TARGET];

  let models = null; // { lr, dt, rf }
  const charts = {};

  // ---------- Tabs ----------
  document.querySelectorAll('.ds-tab-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.ds-tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('ds-tab-explorer').style.display = tab==='explorer' ? '' : 'none';
      document.getElementById('ds-tab-ml-tp').style.display = tab==='ml-tp' ? '' : 'none';
      if(tab === 'ml-tp' && !window.__mlEdaRendered){ renderEDA(); window.__mlEdaRendered = true; }
    });
  });

  // ---------- 1. Aperçu du tableau ----------
  function renderPreview(){
    const preview = ADVERTISING_DATA.slice(0, 10);
    renderTable(document.getElementById('ml-table'), preview, COLUMNS);
  }

  // ---------- 2. describe() ----------
  function renderDescribe(){
    const stats = COLUMNS.map(c => ({ col:c, ...describeColumn(ADVERTISING_DATA.map(r=>r[c])) }));
    const thead = document.querySelector('#ml-describe thead');
    const tbody = document.querySelector('#ml-describe tbody');
    thead.innerHTML = '<tr><th></th>' + COLUMNS.map(c=>`<th>${c}</th>`).join('') + '</tr>';
    const rowsMeta = [
      ['count','count',0], ['mean','mean',3], ['std','std',3],
      ['min','min',3], ['25%','p25',3], ['50%','p50',3], ['75%','p75',3], ['max','max',3]
    ];
    tbody.innerHTML = rowsMeta.map(([label,key,dec])=>
      `<tr><th>${label}</th>` + stats.map(s=>`<td>${s[key].toFixed(dec)}</td>`).join('') + '</tr>'
    ).join('');
  }

  // ---------- 3. Corrélation ----------
  function renderCorrelation(){
    const M = correlationMatrix(ADVERTISING_DATA, COLUMNS);
    const thead = document.querySelector('#ml-corr thead');
    const tbody = document.querySelector('#ml-corr tbody');
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

  // ---------- 4. Scatter plots Sales vs predictors ----------
  function scatterChart(canvasId, feature, color){
    const ctx = document.getElementById(canvasId);
    if(charts[canvasId]) charts[canvasId].destroy();
    charts[canvasId] = new Chart(ctx, {
      type:'scatter',
      data:{ datasets:[{
        label:`Sales vs ${feature}`,
        data: ADVERTISING_DATA.map(r=>({x:r[feature], y:r[TARGET]})),
        backgroundColor: color, pointRadius:3
      }]},
      options:{
        responsive:true, animation:false,
        scales:{
          x:{ title:{display:true, text:feature}, grid:{color:'#1A2440'} },
          y:{ title:{display:true, text:'Sales'}, grid:{color:'#1A2440'} }
        },
        plugins:{ legend:{ labels:{ boxWidth:12 } } }
      }
    });
  }

  function renderEDA(){
    renderPreview();
    renderDescribe();
    renderCorrelation();
    scatterChart('ml-scatter-tv', 'TV', CL_COLORS.accent);
    scatterChart('ml-scatter-radio', 'Radio', CL_COLORS.warm);
    scatterChart('ml-scatter-news', 'Newspaper', CL_COLORS.danger);
  }

  // ---------- 5–7. Entraînement, comparaison, actual vs predicted ----------
  function actualVsPredictedChart(canvasId, title, yTest, yPred, color){
    const ctx = document.getElementById(canvasId);
    if(charts[canvasId]) charts[canvasId].destroy();
    const diag = yTest.map(v=>({x:v,y:v}));
    charts[canvasId] = new Chart(ctx, {
      type:'scatter',
      data:{ datasets:[
        { label:'Idéal (y = y)', data: diag, backgroundColor: CL_COLORS.dim, pointRadius:2 },
        { label:'Prédit vs réel', data: yTest.map((v,i)=>({x:yPred[i], y:v})), backgroundColor: color, pointRadius:4 }
      ]},
      options:{
        responsive:true, animation:false,
        plugins:{ title:{display:true, text:title, color:'#EAF0FA'}, legend:{ labels:{ boxWidth:12 } } },
        scales:{
          x:{ title:{display:true, text:'Prédit'}, grid:{color:'#1A2440'} },
          y:{ title:{display:true, text:'Réel'}, grid:{color:'#1A2440'} }
        }
      }
    });
  }

  function trainAndEvaluate(){
    const testSize = parseFloat(document.getElementById('ml-testsize').value);
    const seed = parseInt(document.getElementById('ml-seed').value) || 42;

    const { train, test } = trainTestSplit(ADVERTISING_DATA, testSize, seed);
    const yTest = test.map(r=>r[TARGET]);

    const lr = fitLinearRegression(train, FEATURES, TARGET);
    const dt = fitDecisionTree(train, FEATURES, TARGET, 5, 4);
    const rf = fitRandomForest(train, FEATURES, TARGET, 25, 6, 4, 7);

    const yPredLR = test.map(r=>lr.predict(r));
    const yPredDT = test.map(r=>dt.predict(r));
    const yPredRF = test.map(r=>rf.predict(r));

    const metricsFor = (yPred) => ({
      r2: r2Score(yTest,yPred), mae: maeScore(yTest,yPred),
      mse: mseScore(yTest,yPred), rmse: Math.sqrt(mseScore(yTest,yPred))
    });

    const results = {
      'Régression linéaire': metricsFor(yPredLR),
      'Arbre de décision': metricsFor(yPredDT),
      'Random Forest': metricsFor(yPredRF)
    };

    // 6. Comparison table
    const thead = document.querySelector('#ml-comparison thead');
    const tbody = document.querySelector('#ml-comparison tbody');
    thead.innerHTML = '<tr><th>Modèle</th><th>R²</th><th>MAE</th><th>MSE</th><th>RMSE</th></tr>';
    tbody.innerHTML = Object.entries(results).map(([name,m])=>
      `<tr><th>${name}</th><td>${m.r2.toFixed(4)}</td><td>${m.mae.toFixed(4)}</td><td>${m.mse.toFixed(4)}</td><td>${m.rmse.toFixed(4)}</td></tr>`
    ).join('');

    // Comparison bar chart
    if(charts['ml-comparison-chart']) charts['ml-comparison-chart'].destroy();
    const names = Object.keys(results);
    charts['ml-comparison-chart'] = new Chart(document.getElementById('ml-comparison-chart'), {
      type:'bar',
      data:{
        labels: names,
        datasets:[
          { label:'R²', data: names.map(n=>results[n].r2), backgroundColor: CL_COLORS.accent },
          { label:'MAE', data: names.map(n=>results[n].mae), backgroundColor: CL_COLORS.warm },
          { label:'RMSE', data: names.map(n=>results[n].rmse), backgroundColor: CL_COLORS.danger }
        ]
      },
      options:{ responsive:true, animation:false, scales:{ y:{ grid:{color:'#1A2440'} }, x:{ grid:{display:false} } }, plugins:{ legend:{ labels:{ boxWidth:12 } } } }
    });

    // 7. Actual vs predicted
    actualVsPredictedChart('ml-avp-lr', 'Régression linéaire', yTest, yPredLR, CL_COLORS.accent);
    actualVsPredictedChart('ml-avp-dt', 'Arbre de décision', yTest, yPredDT, CL_COLORS.warm);
    actualVsPredictedChart('ml-avp-rf', 'Random Forest', yTest, yPredRF, CL_COLORS.danger);

    // 8. Conclusion
    const best = names.reduce((a,b)=> results[a].r2 >= results[b].r2 ? a : b);
    document.getElementById('ml-conclusion').innerHTML =
      `<span class="k">Meilleur modèle (R² le plus élevé)</span> : <span class="v">${best}</span> (R² = ${results[best].r2.toFixed(4)})\n\n` +
      `TV présente la corrélation la plus forte avec Sales et la relation la plus linéaire. ` +
      `Sur la base de ces résultats, il est recommandé d'allouer davantage de budget aux publicités <strong>TV</strong> et <strong>Radio</strong> plutôt qu'aux <strong>Journaux</strong>, dont la contribution au modèle est marginale.`;

    models = { lr, dt, rf };
    document.getElementById('ml-pred-result').textContent = 'Modèles entraînés — vous pouvez prédire.';
  }

  function predict(){
    if(!models){ document.getElementById('ml-pred-result').textContent = "Entraînez d'abord les modèles."; return; }
    const row = {
      TV: parseFloat(document.getElementById('ml-pred-tv').value) || 0,
      Radio: parseFloat(document.getElementById('ml-pred-radio').value) || 0,
      Newspaper: parseFloat(document.getElementById('ml-pred-news').value) || 0
    };
    const predRF = models.rf.predict(row);
    const predLR = models.lr.predict(row);
    const predDT = models.dt.predict(row);
    document.getElementById('ml-pred-result').innerHTML =
      `<span class="k">Random Forest</span> : <span class="v">${predRF.toFixed(2)}</span>\n` +
      `<span class="k">Régression linéaire</span> : <span class="v">${predLR.toFixed(2)}</span>\n` +
      `<span class="k">Arbre de décision</span> : <span class="v">${predDT.toFixed(2)}</span>`;
  }

  document.getElementById('ml-run').addEventListener('click', trainAndEvaluate);
  document.getElementById('ml-predict').addEventListener('click', predict);
})();
