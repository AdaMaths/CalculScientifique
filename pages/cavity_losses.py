import streamlit as st
import numpy as np
import plotly.graph_objects as go

def cavity_page():
    st.markdown("## 🔲 Pertes de Cavité")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Paramètres")

        intensite_init = st.number_input(
            "Intensité Initiale",
            min_value=0.1,
            max_value=100.0,
            value=10.0,
            step=0.5
        )

        coeff_perte = st.number_input(
            "Coefficient de perte (α)",
            min_value=0.001,
            max_value=0.5,
            value=0.1,
            step=0.01
        )

        distance_max = st.slider(
            "Distance maximale",
            min_value=1.0,
            max_value=100.0,
            value=10.0,
            step=1.0
        )

    with col2:
        st.subheader("Graphique")

        distance = np.linspace(0, distance_max, 1000)
        intensite = intensite_init * np.exp(-coeff_perte * distance)

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=distance, y=intensite,
            mode='lines',
            name='Intensité',
            line=dict(color='#2ca02c', width=3),
            fill='tozeroy',
            fillcolor='rgba(44, 160, 44, 0.2)'
        ))

        fig.update_layout(
            title="Pertes de Cavité (I = I₀ × e⁻ᵅˣ)",
            xaxis_title="Distance",
            yaxis_title="Intensité",
            hovermode='x unified',
            template='plotly_white',
            height=500
        )

        st.plotly_chart(fig, use_container_width=True)

    st.subheader("Analyse")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Intensité initiale", f"{intensite_init:.3f}")

    with col2:
        st.metric("Coefficient de perte", f"{coeff_perte:.3f}")

    with col3:
        if coeff_perte > 0:
            distance_half = np.log(2) / coeff_perte
            st.metric("Distance 1/2 intensité", f"{distance_half:.3f}")
        else:
            st.metric("Distance 1/2 intensité", "N/A")

    with col4:
        intensite_final = intensite_init * np.exp(-coeff_perte * distance_max)
        perte_percent = (1 - intensite_final / intensite_init) * 100
        st.metric("Perte totale", f"{perte_percent:.1f}%")

    st.divider()

    st.subheader("Comparaison de coefficients")

    coefficients = st.multiselect(
        "Sélectionnez les coefficients à comparer",
        options=[0.05, 0.1, 0.15, 0.2, 0.3],
        default=[0.1]
    )

    if coefficients:
        fig_compare = go.Figure()

        for alpha in sorted(coefficients):
            I = intensite_init * np.exp(-alpha * distance)
            fig_compare.add_trace(go.Scatter(
                x=distance, y=I,
                mode='lines',
                name=f'α = {alpha}',
                line=dict(width=2)
            ))

        fig_compare.update_layout(
            title="Comparaison des pertes pour différents coefficients",
            xaxis_title="Distance",
            yaxis_title="Intensité",
            template='plotly_white',
            height=400
        )

        st.plotly_chart(fig_compare, use_container_width=True)

    st.divider()

    st.subheader("Formule")
    st.latex(r"I(x) = I_0 \cdot e^{-\alpha x}")

    st.write("""
    **Paramètres:**
    - **I₀**: Intensité initiale
    - **α**: Coefficient d'absorption
    - **x**: Distance parcourue
    """)

    if st.button("Télécharger les données"):
        import pandas as pd

        data = pd.DataFrame({
            'distance': distance,
            'intensite': intensite
        })

        csv = data.to_csv(index=False)
        st.download_button(
            label="Télécharger CSV",
            data=csv,
            file_name="cavity_losses.csv",
            mime="text/csv"
        )
