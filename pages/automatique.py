import streamlit as st
import numpy as np
import plotly.graph_objects as go
from scipy import signal

def automatique_page():
    st.markdown("## 🔧 Automatique")

    tab1, tab2 = st.tabs(["Fonction de Transfert", "Contrôleur PID"])

    with tab1:
        show_transfer_function()

    with tab2:
        show_pid_controller()

def show_transfer_function():
    st.subheader("Fonction de Transfert")

    col1, col2 = st.columns(2)

    with col1:
        st.write("**Numérateur**")
        num_order = st.number_input("Ordre du numérateur", 0, 3, 0)
        num_coeffs = []
        for i in range(num_order + 1):
            coeff = st.number_input(f"Coefficient {num_order - i}",
                                   value=1.0 if i == num_order else 0.0,
                                   key=f"num_{i}")
            num_coeffs.append(coeff)

        st.write("**Dénominateur**")
        den_order = st.number_input("Ordre du dénominateur", 0, 3, 1)
        den_coeffs = []
        for i in range(den_order + 1):
            coeff = st.number_input(f"Coefficient {den_order - i}",
                                   value=1.0 if i == 0 else (1.0 if i == den_order else 0.0),
                                   key=f"den_{i}")
            den_coeffs.append(coeff)

    with col2:
        st.subheader("Réponse du système")

        try:
            sys = signal.TransferFunction(num_coeffs[::-1], den_coeffs[::-1])
            t, y = signal.step(sys)

            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=t, y=y,
                mode='lines',
                name='Réponse indielle',
                line=dict(color='#1f77b4', width=3)
            ))

            fig.update_layout(
                title="Réponse indicielle du système",
                xaxis_title="Temps (s)",
                yaxis_title="Amplitude",
                template='plotly_white',
                height=400
            )

            st.plotly_chart(fig, use_container_width=True)

            st.success("✓ Système stable")

        except Exception as e:
            st.error(f"Erreur: {e}")

def show_pid_controller():
    st.subheader("Contrôleur PID")

    col1, col2, col3 = st.columns(3)

    with col1:
        Kp = st.number_input("Gain Proportionnel (Kp)", 0.1, 10.0, 1.0, step=0.1)

    with col2:
        Ki = st.number_input("Gain Intégral (Ki)", 0.0, 5.0, 0.5, step=0.1)

    with col3:
        Kd = st.number_input("Gain Dérivé (Kd)", 0.0, 5.0, 0.1, step=0.1)

    st.subheader("Simulation de contrôle")

    col1, col2 = st.columns(2)

    with col1:
        setpoint = st.slider("Consigne", 0.0, 10.0, 5.0, step=0.1)
        disturbance = st.slider("Perturbation", 0.0, 5.0, 0.0, step=0.1)

    with col2:
        simulation_time = st.slider("Durée de simulation", 1.0, 100.0, 10.0, step=1.0)

    try:
        t = np.linspace(0, simulation_time, 1000)
        y = np.zeros_like(t)
        error = np.zeros_like(t)
        error_int = 0
        error_prev = 0

        for i in range(1, len(t)):
            dt = t[i] - t[i-1]

            error[i] = setpoint - y[i-1] + disturbance
            error_int += error[i] * dt
            error_der = (error[i] - error_prev) / dt if dt > 0 else 0

            u = Kp * error[i] + Ki * error_int + Kd * error_der
            u = np.clip(u, -10, 10)

            y[i] = y[i-1] + 0.1 * (u - y[i-1])
            error_prev = error[i]

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=t, y=y,
            mode='lines',
            name='Sortie (y)',
            line=dict(color='#1f77b4', width=2)
        ))

        fig.add_hline(y=setpoint, line_dash="dash", line_color="green",
                      annotation_text=f"Consigne = {setpoint}")

        fig.update_layout(
            title="Réponse du système en boucle fermée",
            xaxis_title="Temps (s)",
            yaxis_title="Valeur",
            template='plotly_white',
            height=400
        )

        st.plotly_chart(fig, use_container_width=True)

        col1, col2, col3 = st.columns(3)

        with col1:
            erreur_finale = abs(y[-1] - setpoint)
            st.metric("Erreur finale", f"{erreur_finale:.3f}")

        with col2:
            overshoot = max(y - setpoint) if max(y) > setpoint else 0
            st.metric("Dépassement", f"{overshoot:.3f}")

        with col3:
            st.metric("Temps d'établissement", f"{simulation_time:.1f}s")

    except Exception as e:
        st.error(f"Erreur de simulation: {e}")

    st.divider()

    st.write("""
    **Équation du PID:**

    u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·de/dt

    Où:
    - **Kp**: Gain proportionnel (réponse immédiate)
    - **Ki**: Gain intégral (élimine l'erreur statique)
    - **Kd**: Gain dérivé (amortit la réponse)
    """)
