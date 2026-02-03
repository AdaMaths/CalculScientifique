import streamlit as st
import numpy as np
import plotly.graph_objects as go

def laser_page():
    st.markdown("## 🔴 Simulation Laser")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Paramètres")

        I0 = st.number_input(
            "Intensité Initiale (I₀)",
            min_value=0.1,
            max_value=100.0,
            value=10.0,
            step=0.5
        )

        gamma = st.number_input(
            "Coefficient d'amortissement (γ)",
            min_value=0.01,
            max_value=1.0,
            value=0.1,
            step=0.01
        )

        time_max = st.slider(
            "Temps maximum",
            min_value=1.0,
            max_value=100.0,
            value=10.0,
            step=1.0
        )

    with col2:
        st.subheader("Graphique")

        t = np.linspace(0, time_max, 1000)
        I = I0 * np.exp(-gamma * t)

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=t, y=I,
            mode='lines',
            name='Intensité',
            line=dict(color='#d62728', width=3)
        ))

        fig.add_hline(y=I0/np.e, line_dash="dash", line_color="gray",
                      annotation_text=f"I₀/e = {I0/np.e:.2f}")

        fig.update_layout(
            title="Décroissance Laser (I = I₀ × e⁻ᵞᵗ)",
            xaxis_title="Temps",
            yaxis_title="Intensité",
            hovermode='x unified',
            template='plotly_white',
            height=500
        )

        st.plotly_chart(fig, use_container_width=True)

    st.subheader("Analyse")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Intensité initiale", f"{I0:.3f}")

    with col2:
        half_life = np.log(2) / gamma if gamma > 0 else 0
        st.metric("Demi-vie", f"{half_life:.3f}")

    with col3:
        intensity_final = I0 * np.exp(-gamma * time_max)
        st.metric(f"Intensité à t={time_max}", f"{intensity_final:.3f}")

    st.divider()

    st.subheader("Equation")
    st.latex(r"I(t) = I_0 \cdot e^{-\gamma t}")

    st.write("""
    **Paramètres:**
    - **I₀**: Intensité initiale du laser
    - **γ**: Coefficient d'amortissement (détermine la vitesse de décroissance)
    - **t**: Temps
    """)

    if st.button("Télécharger les données"):
        import pandas as pd

        data = pd.DataFrame({
            'temps': t,
            'intensite': I
        })

        csv = data.to_csv(index=False)
        st.download_button(
            label="Télécharger CSV",
            data=csv,
            file_name="laser_simulation.csv",
            mime="text/csv"
        )
