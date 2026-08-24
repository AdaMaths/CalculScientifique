// ============================================================
// Data Science — chargement CSV, statistiques, graphique
// ============================================================
(function(){
  const fileInput = document.getElementById('ds-file');
  const exampleBtn = document.getElementById('ds-example');
  const plotBtn = document.getElementById('ds-plot');
  const statsBox = document.getElementById('ds-stats');
  const table = document.getElementById('ds-table');
  let data = { rows:[], columns:[] };
  let chart = null;

  function exampleCSV(){
    return `Nom,Age,Sexe,Note_Maths,Note_Physique
Alice,22,F,15,14
Bob,23,M,12,16
Claire,21,F,17,13
David,24,M,10,15
Eva,22,F,16,18`;
  }

  function loadCSV(text){
    const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
    data.rows = parsed.data;
    data.columns = parsed.meta.fields || [];
    renderTable(table, data.rows, data.columns);
    showStats();
    if(chart){ chart.destroy(); chart = null; }
  }

  function showStats(){
    const numCols = numericColumns(data.rows, data.columns);
    if(!numCols.length){ statsBox.textContent = 'Aucune colonne numérique trouvée.'; return; }
    let html = '<span class="k">Statistiques descriptives</span>\n';
    numCols.forEach(col=>{
      const s = colStats(data.rows, col);
      if(!s) return;
      html += `<span class="v">${col}</span> : Moyenne = ${s.mean.toFixed(2)}, Min = ${s.min.toFixed(2)}, Max = ${s.max.toFixed(2)}\n`;
    });
    statsBox.innerHTML = html;
  }

  function plot(){
    const numCols = numericColumns(data.rows, data.columns);
    if(!numCols.length){ alert('Aucune colonne numérique à tracer.'); return; }
    const yCol = numCols[0];
    const xCol = data.columns[0];
    const points = data.rows.map((r,i)=>({x: isNaN(parseFloat(r[xCol])) ? i : parseFloat(r[xCol]), y: parseFloat(r[yCol])}));
    if(chart) chart.destroy();
    chart = makeLineChart(document.getElementById('ds-chart'), [{
      label:`${yCol} en fonction de ${xCol}`, data:points,
      borderColor: CL_COLORS.accent, backgroundColor:'transparent', pointRadius:3, borderWidth:2
    }], {xLabel:xCol, yLabel:yCol});
  }

  fileInput.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => loadCSV(ev.target.result);
    reader.readAsText(file);
  });
  exampleBtn.addEventListener('click', ()=> loadCSV(exampleCSV()));
  plotBtn.addEventListener('click', plot);
})();
