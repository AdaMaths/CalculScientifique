// ============================================================
// Optimisation industrielle — programmation linéaire (javascript-lp-solver)
// ============================================================
(function(){
  const varsContainer = document.getElementById('op-vars');
  const constraintsContainer = document.getElementById('op-constraints');
  const resultBox = document.getElementById('op-result');
  let varCount = 0;

  function generateVarTable(){
    varCount = Math.max(1, Math.min(10, parseInt(document.getElementById('op-varcount').value) || 2));
    let html = '<table><thead><tr><th>Variable</th><th>Coeff. objectif</th></tr></thead><tbody>';
    for(let i=0;i<varCount;i++){
      html += `<tr><td><input type="text" class="op-varname" value="x${i+1}"></td>` +
              `<td><input type="text" class="op-varcoeff" value="0"></td></tr>`;
    }
    html += '</tbody></table>';
    varsContainer.innerHTML = html;
  }

  function addConstraintRow(){
    const row = document.createElement('div');
    row.className = 'constraint-row';
    row.innerHTML =
      `<input type="text" class="op-coeffs" placeholder="Ex: 1, 2, 3">` +
      `<select class="op-sign"><option>≤</option><option>=</option><option>≥</option></select>` +
      `<input type="text" class="op-rhs" value="0" style="flex:0 0 70px;">` +
      `<button class="remove-row" type="button">✕</button>`;
    row.querySelector('.remove-row').addEventListener('click', ()=> row.remove());
    constraintsContainer.appendChild(row);
  }

  function solveProblem(){
    try{
      const varNames = Array.from(document.querySelectorAll('.op-varname')).map(el=>el.value.trim());
      const objCoeffs = Array.from(document.querySelectorAll('.op-varcoeff')).map(el=>parseFloat(el.value));
      if(!varNames.length) throw new Error('Générez d\'abord la table des variables.');

      const model = {
        optimize: 'objectif',
        opType: document.getElementById('op-objective').value === 'Maximiser' ? 'max' : 'min',
        constraints: {},
        variables: {}
      };

      varNames.forEach((name,i)=>{
        model.variables[name] = { objectif: objCoeffs[i] || 0 };
      });

      const rows = constraintsContainer.querySelectorAll('.constraint-row');
      rows.forEach((row, idx)=>{
        const coeffs = row.querySelector('.op-coeffs').value.split(',').map(s=>parseFloat(s.trim()));
        const sign = row.querySelector('.op-sign').value;
        const rhs = parseFloat(row.querySelector('.op-rhs').value);
        const cname = `c${idx+1}`;

        if(sign === '≤') model.constraints[cname] = { max: rhs };
        else if(sign === '≥') model.constraints[cname] = { min: rhs };
        else model.constraints[cname] = { equal: rhs };

        varNames.forEach((name,i)=>{
          model.variables[name][cname] = coeffs[i] || 0;
        });
      });

      const solution = solver.Solve(model);

      let out = `<span class="k">Statut</span> : <span class="v">${solution.feasible ? 'Optimal / réalisable' : 'Infaisable ou non borné'}</span>\n\n`;
      out += `<span class="k">Valeurs optimales</span>\n`;
      varNames.forEach(name=>{
        const val = solution[name] !== undefined ? solution[name] : 0;
        out += `${name} : <span class="v">${Number(val).toFixed(3)}</span>\n`;
      });
      out += `\n<span class="k">Valeur optimale de la fonction objectif</span> : <span class="v">${(solution.result ?? 0).toFixed(3)}</span>`;

      resultBox.innerHTML = out;
    }catch(e){
      resultBox.innerHTML = `<span class="warn">Erreur : ${e.message}</span>`;
    }
  }

  document.getElementById('op-genvars').addEventListener('click', generateVarTable);
  document.getElementById('op-addconstraint').addEventListener('click', addConstraintRow);
  document.getElementById('op-solve').addEventListener('click', solveProblem);

  // initial state
  generateVarTable();
  addConstraintRow();
})();
