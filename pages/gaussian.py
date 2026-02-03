import streamlit as st
import numpy as np
import plotly.graph_objects as go

def gaussian_page():
    st.markdown("## 📊 Profil Gaussien")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Paramètres")

        amplitude = st.slider(
            "Amplitude",
            min_value=0.1,
            max_value=10.0,
            value=1.0,
            step=0.1
        )

        sigma = st.slider(
            "Sigma (écart-type)",
            min_value=0.1,
            max_value=5.0,
            value=1.0,
            step=0.1
        )

        x_range = st.slider(
            "Plage d'affichage",
            min_value=5.0,
            max_value=20.0,
            value=10.0,
            step=1.0
        )

    with col2:
        st.subheader("Graphique")

        x = np.linspace(-x_range, x_range, 1000)
        y = amplitude * np.exp(-(x ** 2) / (2 * sigma ** 2))

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=x, y=y,
            mode='lines',
            name='Gaussienne',
            line=dict(color='#1f77b4', width=3),
            fill='tozeroy',
            fillcolor='rgba(31, 119, 180, 0.2)'
        ))

        fig.update_layout(
            title="Profil Gaussien",
            xaxis_title="Position",
            yaxis_title="Amplitude",
            hovermode='x unified',
            template='plotly_white',
            height=500
        )

        st.plotly_chart(fig, use_container_width=True)

    st.subheader("Statistiques")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Amplitude max", f"{amplitude:.3f}")

    with col2:
        st.metric("Sigma", f"{sigma:.3f}")

    with col3:
        fwhm = 2 * np.sqrt(2 * np.log(2)) * sigma
        st.metric("FWHM", f"{fwhm:.3f}")

    with col4:
        area = amplitude * sigma * np.sqrt(2 * np.pi)
        st.metric("Aire", f"{area:.3f}")

    st.divider()

    if st.button("Télécharger les données"):
        import pandas as pd

        data = pd.DataFrame({
            'x': x,
            'y': y
        })

        csv = data.to_csv(index=False)
        st.download_button(
            label="Télécharger CSV",
            data=csv,
            file_name="gaussian_profile.csv",
            mime="text/csv"
        )
