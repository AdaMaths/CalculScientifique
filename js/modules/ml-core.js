// ============================================================
// TP Machine Learning — Régression (Advertising.csv)
// Réimplémentation JS : régression linéaire multiple (OLS),
// arbre de décision (CART), forêt aléatoire (bagging), métriques.
// ============================================================

// ---------- PRNG déterministe (mulberry32) pour un split reproductible ----------
function mulberry32(seed){
  return function(){
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffleIndices(n, seed){
  const rand = mulberry32(seed);
  const idx = Array.from({length:n}, (_,i)=>i);
  for(let i=n-1;i>0;i--){
    const j = Math.floor(rand()*(i+1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function trainTestSplit(rows, testSize=0.25, seed=42){
  const idx = seededShuffleIndices(rows.length, seed);
  const nTest = Math.round(rows.length*testSize);
  const testIdx = idx.slice(0, nTest);
  const trainIdx = idx.slice(nTest);
  return {
    train: trainIdx.map(i=>rows[i]),
    test: testIdx.map(i=>rows[i])
  };
}

// ---------- Statistiques descriptives (équivalent df.describe()) ----------
function percentile(sortedVals, p){
  const n = sortedVals.length;
  if(n === 1) return sortedVals[0];
  const pos = p*(n-1);
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  if(lo===hi) return sortedVals[lo];
  return sortedVals[lo] + (sortedVals[hi]-sortedVals[lo])*(pos-lo);
}

function describeColumn(vals){
  const sorted = vals.slice().sort((a,b)=>a-b);
  const n = vals.length;
  const mean = vals.reduce((a,b)=>a+b,0)/n;
  const variance = n>1 ? vals.reduce((a,b)=>a+(b-mean)**2,0)/(n-1) : 0;
  const std = Math.sqrt(variance);
  return {
    count:n, mean, std,
    min: sorted[0], max: sorted[n-1],
    p25: percentile(sorted,0.25), p50: percentile(sorted,0.5), p75: percentile(sorted,0.75)
  };
}

function pearsonCorr(a, b){
  const n = a.length;
  const ma = a.reduce((s,v)=>s+v,0)/n, mb = b.reduce((s,v)=>s+v,0)/n;
  let num=0, da=0, db=0;
  for(let i=0;i<n;i++){ num += (a[i]-ma)*(b[i]-mb); da += (a[i]-ma)**2; db += (b[i]-mb)**2; }
  return num/Math.sqrt(da*db);
}

function correlationMatrix(rows, columns){
  const series = {}; columns.forEach(c => series[c] = rows.map(r=>r[c]));
  const M = {};
  columns.forEach(c1=>{
    M[c1] = {};
    columns.forEach(c2=>{ M[c1][c2] = c1===c2 ? 1 : pearsonCorr(series[c1], series[c2]); });
  });
  return M;
}

// ---------- Régression linéaire multiple (moindres carrés ordinaires) ----------
function fitLinearRegression(rows, features, target){
  const n = rows.length, p = features.length;
  // X augmentée d'une colonne de 1 (intercept), résolution via équations normales
  const X = rows.map(r => [1, ...features.map(f=>r[f])]);
  const y = rows.map(r => r[target]);
  const Xt = math.transpose(X);
  const XtX = math.multiply(Xt, X);
  const XtY = math.multiply(Xt, y);
  const beta = math.lusolve(XtX, XtY).map(v=>v[0]);
  return {
    intercept: beta[0],
    coeffs: features.reduce((acc,f,i)=>{ acc[f]=beta[i+1]; return acc; }, {}),
    predict: (row) => beta[0] + features.reduce((s,f,i)=> s + beta[i+1]*row[f], 0)
  };
}

// ---------- Arbre de décision de régression (CART) ----------
function meanOf(arr){ return arr.reduce((a,b)=>a+b,0)/arr.length; }
function sse(arr){ if(!arr.length) return 0; const m=meanOf(arr); return arr.reduce((s,v)=>s+(v-m)**2,0); }

function buildTree(rows, features, target, depth, maxDepth, minSamplesSplit){
  const yVals = rows.map(r=>r[target]);
  if(depth >= maxDepth || rows.length < minSamplesSplit || new Set(yVals).size === 1){
    return { leaf:true, value: meanOf(yVals) };
  }
  let best = null;
  for(const feat of features){
    const sortedRows = rows.slice().sort((a,b)=>a[feat]-b[feat]);
    const vals = sortedRows.map(r=>r[feat]);
    for(let i=1;i<sortedRows.length;i++){
      if(vals[i] === vals[i-1]) continue;
      const threshold = (vals[i]+vals[i-1])/2;
      const left = sortedRows.slice(0,i).map(r=>r[target]);
      const right = sortedRows.slice(i).map(r=>r[target]);
      const cost = sse(left) + sse(right);
      if(!best || cost < best.cost){
        best = { cost, feat, threshold };
      }
    }
  }
  if(!best) return { leaf:true, value: meanOf(yVals) };

  const leftRows = rows.filter(r=>r[best.feat] <= best.threshold);
  const rightRows = rows.filter(r=>r[best.feat] > best.threshold);
  if(!leftRows.length || !rightRows.length) return { leaf:true, value: meanOf(yVals) };

  return {
    leaf:false, feat:best.feat, threshold:best.threshold,
    left: buildTree(leftRows, features, target, depth+1, maxDepth, minSamplesSplit),
    right: buildTree(rightRows, features, target, depth+1, maxDepth, minSamplesSplit)
  };
}

function predictTree(node, row){
  if(node.leaf) return node.value;
  return row[node.feat] <= node.threshold ? predictTree(node.left,row) : predictTree(node.right,row);
}

function fitDecisionTree(rows, features, target, maxDepth=5, minSamplesSplit=4){
  const tree = buildTree(rows, features, target, 0, maxDepth, minSamplesSplit);
  return { tree, predict: (row) => predictTree(tree, row) };
}

// ---------- Forêt aléatoire (bagging de CART + sous-échantillonnage de variables) ----------
function fitRandomForest(rows, features, target, nTrees=25, maxDepth=6, minSamplesSplit=4, seed=7){
  const rand = mulberry32(seed);
  const trees = [];
  for(let t=0;t<nTrees;t++){
    // bootstrap sample
    const sample = [];
    for(let i=0;i<rows.length;i++) sample.push(rows[Math.floor(rand()*rows.length)]);
    // random feature subset (sqrt-ish, but with only 3 features we take 2)
    const shuffled = features.slice().sort(()=>rand()-0.5);
    const featSubset = shuffled.slice(0, Math.max(1, Math.round(features.length*0.7)));
    trees.push(buildTree(sample, featSubset, target, 0, maxDepth, minSamplesSplit));
  }
  return {
    trees,
    predict: (row) => meanOf(trees.map(t=>predictTree(t,row)))
  };
}

// ---------- Gradient Boosting (approximation légère de XGBoost) ----------
function fitGradientBoosting(rows, features, target, nEstimators=50, maxDepth=3, learningRate=0.1, minSamplesSplit=10){
  const yVals = rows.map(r=>r[target]);
  const base = meanOf(yVals);
  const working = rows.map((r,i)=>({ ...r, __resid: yVals[i]-base }));
  const trees = [];
  for(let t=0;t<nEstimators;t++){
    const tree = buildTree(working, features, '__resid', 0, maxDepth, minSamplesSplit);
    trees.push(tree);
    for(let i=0;i<working.length;i++){
      working[i].__resid -= learningRate*predictTree(tree, working[i]);
    }
  }
  return {
    base, trees, learningRate,
    predict: (row) => base + trees.reduce((s,t)=> s + learningRate*predictTree(t,row), 0)
  };
}

// ---------- Métriques ----------
function r2Score(yTrue, yPred){
  const mean = meanOf(yTrue);
  const ssTot = yTrue.reduce((s,v)=>s+(v-mean)**2,0);
  const ssRes = yTrue.reduce((s,v,i)=>s+(v-yPred[i])**2,0);
  return 1 - ssRes/ssTot;
}
function maeScore(yTrue, yPred){ return meanOf(yTrue.map((v,i)=>Math.abs(v-yPred[i]))); }
function mseScore(yTrue, yPred){ return meanOf(yTrue.map((v,i)=>(v-yPred[i])**2)); }
