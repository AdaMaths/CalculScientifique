# Application de Calcul Scientifique Streamlit

Application web Streamlit pour effectuer des calculs scientifiques et des simulations en physique et mathématiques.

## Installation

1. Créer un environnement virtuel:
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

2. Installer les dépendances:
```bash
pip install -r requirements.txt
```

3. Lancer l'application:
```bash
streamlit run app.py
```

L'application s'ouvrira automatiquement dans votre navigateur à `http://localhost:8501/`

## Fonctionnalités

- **Profil Gaussien**: Génération et visualisation de courbes gaussiennes personnalisées
- **Simulation Laser**: Modélisation de la décroissance laser (I = I₀ × e⁻ᵞᵗ)
- **Pertes de Cavité**: Analyse des pertes optiques en fonction de la distance
- **Optimisation**: Minimisation de fonctions avec algorithmes scientifiques
- **Automatique**: Analyse de fonctions de transfert et contrôleurs PID
- **Export de données**: Téléchargement des résultats en CSV

## Structure

```
project/
├── app.py                    # Application principale
├── pages/
│   ├── __init__.py
│   ├── gaussian.py          # Profil gaussien
│   ├── laser_simulation.py  # Simulation laser
│   ├── cavity_losses.py     # Pertes de cavité
│   ├── optimisation.py      # Optimisation
│   └── automatique.py       # Analyse automatique
├── .streamlit/
│   └── config.toml          # Configuration Streamlit
├── static/                  # Fichiers statiques
├── requirements.txt         # Dépendances Python
└── README.md               # Documentation
```

## Technologies

- **Streamlit 1.28**: Framework web interactif
- **Plotly 5.17**: Visualisations interactives
- **NumPy 1.26**: Calculs numériques
- **SciPy 1.11**: Algorithmes scientifiques
- **Pandas 2.1**: Manipulation de données
- **Matplotlib 3.8**: Graphiques

## Commandes utiles

```bash
# Lancer en mode développement
streamlit run app.py

# Spécifier le port
streamlit run app.py --server.port=8502

# Mode headless (sans navigateur)
streamlit run app.py --logger.level=debug
```

## Notes

- L'application est entièrement interactive
- Les calculs sont effectués en temps réel
- Les graphiques sont générés avec Plotly pour une meilleure interactivité
- Chaque page est modulaire et indépendante
