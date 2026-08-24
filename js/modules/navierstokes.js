// ============================================================
// Navier–Stokes 2D — démonstration pédagogique (champ de vitesse)
// Reprend fidèlement la portée de la version d'origine : le pas de
// simulation ne modifie pas le champ (solveur non implémenté), on
// visualise donc le champ de vitesse initial sous forme de quiver plot.
// ============================================================
(function(){
  const canvas = document.getElementById('ns-canvas');
  const ctx = canvas.getContext('2d');

  function drawField(n){
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#0B111E';
    ctx.fillRect(0,0,W,H);

    // grid
    ctx.strokeStyle = '#1A2440';
    ctx.lineWidth = 1;
    const margin = 40;
    const cell = (W - 2*margin) / (n-1);

    // vortex-like initial condition: u=1 in central block, v=0 (matches original code)
    const lo = Math.floor(n/4), hi = Math.floor(3*n/4);

    for(let i=0;i<n;i++){
      for(let j=0;j<n;j++){
        const u = (i>=lo && i<hi && j>=lo && j<hi) ? 1 : 0;
        const v = 0;
        const x = margin + i*cell;
        const y = H - margin - j*cell;
        const len = cell*0.42;
        drawArrow(x, y, x+u*len, y-v*len, u!==0 ? CL_COLORS.accent : '#2A3654');
      }
    }
  }

  function drawArrow(x1,y1,x2,y2,color){
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    if(x1!==x2 || y1!==y2){
      const angle = Math.atan2(y2-y1, x2-x1);
      const headLen = 4;
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2 - headLen*Math.cos(angle-Math.PI/6), y2 - headLen*Math.sin(angle-Math.PI/6));
      ctx.lineTo(x2 - headLen*Math.cos(angle+Math.PI/6), y2 - headLen*Math.sin(angle+Math.PI/6));
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x1,y1,1.4,0,Math.PI*2);
      ctx.fill();
    }
  }

  document.getElementById('ns-run').addEventListener('click', ()=>{
    const n = Math.max(4, Math.min(32, parseInt(document.getElementById('ns-n').value) || 16));
    drawField(n);
  });

  drawField(16); // initial render
})();
