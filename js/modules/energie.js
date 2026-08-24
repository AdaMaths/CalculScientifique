// ============================================================
// Gestion énergétique — consommation / production
// ============================================================
(function(){
  const fileInput = document.getElementById('en-file');
  const exampleBtn = document.getElementById('en-example');
  const plotBtn = document.getElementById('en-plot');
  const statsBox = document.getElementById('en-stats');
  const table = document.getElementById('en-table');
  let data = { rows:[], columns:[] };
  let chart = null;

  function exampleCSV(){
    return `Date,Consommation,Production
2025-05-01,150,200
2025-05-02,160,210
2025-05-03,145,205
2025-05-04,170,220`;
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
    if(!data.columns.includes('Consommation')){
      statsBox.textContent = "Aucune colonne 'Consommation' trouvée dans les données.";
      return;
    }
    const s = colStats(data.rows, 'Consommation');
    if(!s){ statsBox.textContent = 'Données insuffisantes.'; return; }
    statsBox.innerHTML =
      `<span class="k">Consommation totale</span> : <span class="v">${s.sum.toFixed(2)} kWh</span>\n` +
      `<span class="k">Consommation moyenne</span> : <span class="v">${s.mean.toFixed(2)} kWh</span>\n` +
      `<span class="k">Maximum</span> : <span class="v">${s.max.toFixed(2)}</span>  <span class="k">Minimum</span> : <span class="v">${s.min.toFixed(2)}</span>`;
  }

  function plot(){
    if(!data.columns.includes('Date') || !data.columns.includes('Consommation')){
      alert("Impossible d'afficher le graphique : données incomplètes.");
      return;
    }
    const values = data.rows.map(r=>parseFloat(r['Consommation']));
    const labels = data.rows.map(r=>r['Date']);
    if(chart) chart.destroy();
    chart = new Chart(document.getElementById('en-chart'), {
      type:'line',
      data:{ labels, datasets:[{
        label:'Consommation (kWh)', data:values,
        borderColor: CL_COLORS.warm, backgroundColor:'transparent', pointRadius:3, borderWidth:2
      }]},
      options:{
        responsive:true, animation:false,
        scales:{ x:{ title:{display:true,text:'Date'}, grid:{color:'#1A2440'} }, y:{ title:{display:true,text:'Consommation (kWh)'}, grid:{color:'#1A2440'} } },
        plugins:{ legend:{ labels:{ boxWidth:12 } } }
      }
    });
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
