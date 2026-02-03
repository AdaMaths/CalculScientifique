import streamlit as st
import numpy as np
import plotly.graph_objects as go
from scipy.optimize import minimize, differential_evolution

def optimisation_page():
    st.markdown("## 🎯 Optimisation")

    st.subheader("Sélectionnez une fonction")

    function_type = st.radio(
        "Type de fonction",
        ["Fonction quadratique", "Fonction sinus", "Fonction personnalisée"],
        horizontal=True
    )

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Paramètres")

        if function_type == "Fonction quadratique":
            a = st.slider("Coefficient a", -10.0, 10.0, 1.0, step=0.1)
            b = st.slider("Coefficient b", -10.0, 10.0, 0.0, step=0.1)
            c = st.slider("Coefficient c", -10.0, 10.0, 0.0, step=0.1)

            func = lambda x: a * x**2 + b * x + c
            func_display = f"f(x) = {a}x² + {b}x + {c}"

        elif function_type == "Fonction sinus":
            amp = st.slider("Amplitude", 0.1, 10.0, 1.0, step=0.1)
            freq = st.slider("Fréquence", 0.1, 5.0, 1.0, step=0.1)
            phase = st.slider("Phase", 0.0, 2*np.pi, 0.0, step=0.1)

            func = lambda x: amp * np.sin(freq * x + phase)
            func_display = f"f(x) = {amp}sin({freq}x + {phase:.2f})"

        else:
            func_expr = st.text_input("Entrez une fonction (utiliser 'x')",
                                     value="x**2 - 4*x + 3")

            try:
                func = lambda x: eval(func_expr.replace('^', '**'))
                func_display = func_expr
            except:
                st.error("Expression invalide")
                return

        x_min = st.number_input("x minimum pour l'affichage", value=-10.0)
        x_max = st.number_input("x maximum pour l'affichage", value=10.0)

    with col2:
        st.subheader("Graphique")

        x = np.linspace(x_min, x_max, 1000)
        y = func(x)

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=x, y=y,
            mode='lines',
            name='Fonction',
            line=dict(color='#1f77b4', width=3)
        ))

        try:
            result = minimize(func, x0=(x_min + x_max) / 2, method='Nelder-Mead')
            x_opt = result.x[0]
            y_opt = func(x_opt)

            fig.add_trace(go.Scatter(
                x=[x_opt], y=[y_opt],
                mode='markers',
                name='Minimum',
                marker=dict(size=15, color='#d62728', symbol='star')
            ))

            fig.add_vline(x=x_opt, line_dash="dash", line_color="red", opacity=0.5)
            fig.add_hline(y=y_opt, line_dash="dash", line_color="red", opacity=0.5)

        except:
            pass

        fig.update_layout(
            title="Fonction et optimum",
            xaxis_title="x",
            yaxis_title="f(x)",
            template='plotly_white',
            height=500
        )

        st.plotly_chart(fig, use_container_width=True)

    st.subheader("Résultats de l'optimisation")

    col1, col2, col3 = st.columns(3)

    try:
        result = minimize(func, x0=(x_min + x_max) / 2, method='Nelder-Mead')
        x_opt = result.x[0]
        y_opt = func(x_opt)

        with col1:
            st.metric("x optimal", f"{x_opt:.4f}")

        with col2:
            st.metric("f(x) minimum", f"{y_opt:.4f}")

        with col3:
            st.metric("Itérations", result.nit)

        st.success(f"✓ Optimisation réussie: {func_display}")

    except Exception as e:
        st.error(f"Erreur lors de l'optimisation: {e}")

    st.divider()

    st.subheader("Algorithmes disponibles")
    st.write("""
    - **Nelder-Mead**: Algorithme du simplex, robuste mais plus lent
    - **BFGS**: Quasi-Newton, rapide pour fonctions lisses
    - **Powell**: Efficace pour optimisation sans dérivées
    """)
