import streamlit as st
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from pages.gaussian import gaussian_page
from pages.laser_simulation import laser_page
from pages.cavity_losses import cavity_page
from pages.optimisation import optimisation_page
from pages.automatique import automatique_page

st.set_page_config(
    page_title="Calcul Scientifique",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-header {
        font-size: 2.5em;
        color: #1f77b4;
        margin-bottom: 0.5em;
    }
    .section-header {
        font-size: 1.8em;
        color: #2ca02c;
        margin-top: 1em;
    }
</style>
""", unsafe_allow_html=True)

def main():
    st.markdown('<h1 class="main-header">🔬 Application de Calcul Scientifique</h1>',
                unsafe_allow_html=True)

    st.sidebar.markdown("## Menu")
    page = st.sidebar.radio(
        "Sélectionnez une page",
        ["Accueil", "Profil Gaussien", "Simulation Laser", "Pertes de Cavité",
         "Optimisation", "Automatique"],
        index=0
    )

    if page == "Accueil":
        show_home()
    elif page == "Profil Gaussien":
        gaussian_page()
    elif page == "Simulation Laser":
        laser_page()
    elif page == "Pertes de Cavité":
        cavity_page()
    elif page == "Optimisation":
        optimisation_page()
    elif page == "Automatique":
        automatique_page()

def show_home():
    col1, col2 = st.columns([3, 1])

    with col1:
        st.markdown("""
        ## Bienvenue dans l'Application de Calcul Scientifique

        Cette application permet d'effectuer des simulations et calculs scientifiques dans les domaines suivants:

        ### 📊 Fonctionnalités disponibles:

        **1. Profil Gaussien**
        - Génération de profils gaussiens personnalisés
        - Visualisation interactive des distributions
        - Export des données

        **2. Simulation Laser**
        - Modélisation de la décroissance laser
        - Analyse de l'intensité en fonction du temps
        - Paramètres configurables

        **3. Pertes de Cavité**
        - Calcul des pertes optiques
        - Impact de la distance et du coefficient de perte
        - Représentation graphique

        **4. Optimisation**
        - Minimisation et maximisation de fonctions
        - Algorithmes scientifiques
        - Analyse des résultats

        **5. Automatique**
        - Fonctions de transfert
        - Contrôleurs PID
        - Analyse de stabilité

        ---

        ### 🚀 Pour commencer:
        Sélectionnez une section dans le menu de gauche et commencez vos calculs!
        """)

    with col2:
        st.info("""
        **Informations:**
        - Version: 1.0
        - Framework: Streamlit
        - Librairies: NumPy, SciPy, Plotly
        """)

if __name__ == "__main__":
    main()
