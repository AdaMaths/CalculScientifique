# CalculLAB

Laboratoire de calcul scientifique — résolution et visualisation de problèmes d'ingénierie et de sciences, directement dans le navigateur.

**Démo une fois déployé :** `https://<ton-pseudo-github>.github.io/<nom-du-repo>/`

## Stack

Ce projet est un **site statique** : HTML + CSS + JavaScript, sans build, sans serveur à maintenir.

- **Frontend** : HTML/CSS/JS vanilla
- **Graphiques** : [Chart.js](https://www.chartjs.org/) (CDN)
- **Calcul / parsing d'expressions** : [math.js](https://mathjs.org/) (CDN)
- **CSV** : [PapaParse](https://www.papaparse.com/) (CDN)
- **Programmation linéaire** : [javascript-lp-solver](https://github.com/JWally/jsLPSolver) (CDN)
- **Backend optionnel** : [Supabase](https://supabase.com/) (auth, stockage de résultats, base de données) — désactivé par défaut

Il n'y a plus de dépendance à Streamlit, PyQt5 ou Django : ces briques ont été retirées car elles nécessitaient un serveur Python et empêchaient un déploiement simple sur GitHub Pages.

## Fonctionnalités

**Outils métier**
- Automatique : pôles, zéros, stabilité, réponse indicielle, diagramme de Bode
- Data Science : explorateur CSV générique **+ TP complet de Machine Learning (régression)** sur `Advertising.csv` — statistiques descriptives, corrélations, régression linéaire multiple, arbre de décision, random forest, comparaison des modèles, prédiction interactive
- Gestion énergétique : explorateur CSV générique **+ TP de prévision énergétique** sur les données réelles d'une centrale PV (`Energie_Gap_Centrale.xlsx`, 10 368 mesures) — EDA, corrélations, 4 modèles (régression linéaire, arbre de décision, random forest, gradient boosting), comparaison, prédiction de puissance PV
- Laser : pertes de cavité, profil gaussien
- Navier–Stokes : démonstration pédagogique d'un champ de vitesse 2D
- Signal / Fourier : série de Fourier par intégration numérique

**Méthodes numériques**
- Équations différentielles (Euler explicite/implicite, Heun, RK2, RK4, Crank-Nicolson)
- Interpolation (Lagrange, Newton)
- Optimisation (programmation linéaire)

## Structure du projet

```
calculab-web/
├── index.html              # page unique, toutes les sections
├── css/
│   └── style.css
├── js/
│   ├── app.js               # navigation + helpers partagés (complexes, racines de polynômes, charts)
│   ├── supabase-client.js   # client Supabase optionnel (désactivé par défaut)
│   └── modules/
│       ├── automatique.js
│       ├── datascience.js
│       ├── dataset-advertising.js  # jeu de données Advertising.csv embarqué (JS)
│       ├── ml-core.js              # OLS, arbre CART, random forest, gradient boosting, métriques
│       ├── ml-ui.js                # UI du TP régression Advertising (EDA, entraînement, prédiction)
│       ├── energie.js
│       ├── dataset-energie.js      # jeu de données Energie_Gap_Centrale.xlsx nettoyé et embarqué (JS)
│       ├── energie-ml-ui.js        # UI du TP prévision énergétique (EDA, 4 modèles, prédiction)
│       ├── laser.js
│       ├── navierstokes.js
│       ├── signal.js
│       ├── equdiff.js
│       ├── interpolation.js
│       └── optimisation.js
├── data/
│   ├── Advertising.csv              # copie brute (référence / téléchargement)
│   └── Energie_Gap_Centrale.csv     # copie brute nettoyée (référence / téléchargement)
└── README.md
```

## Déploiement sur GitHub Pages

1. Crée un dépôt sur GitHub (ex. `calculab`) sous le compte **AdaMaths**.
2. Pousse ce dossier :
   ```bash
   git init
   git add .
   git commit -m "CalculLAB - site statique"
   git branch -M main
   git remote add origin https://github.com/AdaMaths/calculab.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Source : branche `main`, dossier `/ (root)`** → Enregistrer.
4. Le site sera accessible sous `https://adamaths.github.io/calculab/` après quelques minutes.

Aucune étape de build n'est nécessaire : `index.html` charge directement les fichiers CSS/JS et les librairies via CDN.

## Activer Supabase (optionnel)

Le site fonctionne entièrement sans Supabase. Si tu veux ajouter la sauvegarde de résultats, l'authentification ou une base de données partagée :

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans `index.html`, ajoute avant `js/app.js` :
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
3. Renseigne `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `js/supabase-client.js` (clé **anon public** uniquement — jamais la clé `service_role`).
4. Utilise `supabaseClient` dans les modules concernés pour lire/écrire des données.

## Développement local

Aucune installation requise : ouvre `index.html` dans un navigateur, ou lance un petit serveur local pour éviter les restrictions CORS sur certains navigateurs :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Limites connues

- Le module Navier–Stokes est une démonstration pédagogique (champ de vitesse initial visualisé), pas un solveur CFD complet — comme dans la version d'origine.
- Les pôles/zéros de fonctions de transfert sont calculés par une méthode numérique (Durand–Kerner) ; les résultats sont approchés au-delà de quelques décimales.
- Les coefficients de Fourier sont calculés par intégration numérique (Simpson), pas par calcul symbolique.
- Le TP de régression (module Data Science) réimplémente en JavaScript la régression linéaire (équations normales), l'arbre de décision (CART) et la forêt aléatoire (bagging) du notebook `TP_ML_regession_global_update.ipynb` — les résultats numériques sont proches mais pas strictement identiques à scikit-learn (implémentations différentes des arbres et de l'aléatoire).
- Le TP de prévision énergétique (module Gestion énergétique) réimplémente le notebook `CodePrevisionEnergetique_MSD.ipynb` sur les données réelles de `Energie_Gap_Centrale.xlsx` (10 368 lignes nettoyées : lignes sans mesure de puissance PV retirées, heure convertie en minutes). Le modèle "Gradient Boosting" est une approximation légère de XGBoost (arbres peu profonds + descente de résidus), pas une portation exacte. Pour rester réactif dans le navigateur, l'entraînement utilise par défaut un sous-échantillon de 2 500 lignes (réglable) plutôt que les 8 300 lignes d'entraînement complètes.

## Auteur

Adama Gueye — [adama.gueye.3304@gmail.com](mailto:adama.gueye.3304@gmail.com) — [@AdaMaths](https://github.com/AdaMaths)

## Licence

Non spécifiée — à définir selon tes besoins (MIT recommandé pour un usage pédagogique ouvert).
