"""
Interface pour les calculs laser
"""
import numpy as np
from scipy import constants
import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QLabel,
                             QLineEdit, QPushButton, QTabWidget, QGridLayout, QMessageBox)
from PyQt5.QtCore import Qt
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

class LaserWindow(QMainWindow):
    """Classe gérant le simulateur de laser et cavité avec PyQt5."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Simulateur Laser et Cavité")
        self.setGeometry(100, 100, 800, 600)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f8ff; /* Light background */
            }
            QTabWidget::pane {
                border: 1px solid #c6c6c6;
                background: white;
                border-radius: 5px;
            }
            QTabBar::tab {
                background: #e0e8f0;
                color: #333;
                padding: 8px 20px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                border: none;
            }
            QTabBar::tab:selected {
                background: #4682B4; /* Steel Blue */
                color: white;
            }
        """)
        self.initUI()

    def initUI(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        layout = QVBoxLayout()

        # Configuration des onglets
        self.notebook = QTabWidget()
        layout.addWidget(self.notebook)

        # Zone d'affichage des erreurs
        self.error_label = QLabel()
        self.error_label.setStyleSheet("color: red; font: italic 10px;")
        self.error_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.error_label)

        # Configuration de la zone de graphique
        self.figure = plt.Figure(figsize=(6, 4), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        layout.addWidget(self.canvas)

        central_widget.setLayout(layout)

        # Création des onglets
        self.create_gaussian_tab()
        self.create_laser_simulation_tab()
        self.create_cavity_losses_tab()

    def create_gaussian_tab(self):
        """Onglet pour le profil gaussien."""
        tab = QWidget()
        self.notebook.addTab(tab, "Profil Gaussien")

        layout = QGridLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(10)

        # Style pour les labels
        label_style = """
            QLabel {
                font: 14px 'Segoe UI';
                color: #333;
            }
        """

        # Style pour les inputs
        input_style = """
            QLineEdit {
                font: 12px 'Arial';
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #fff;
            }
        """

        # Widgets
        amplitude_label = QLabel("Amplitude:")
        amplitude_label.setStyleSheet(label_style)
        layout.addWidget(amplitude_label, 0, 0)
        self.amplitude_input = QLineEdit()
        self.amplitude_input.setStyleSheet(input_style)
        layout.addWidget(self.amplitude_input, 0, 1)

        sigma_label = QLabel("Sigma:")
        sigma_label.setStyleSheet(label_style)
        layout.addWidget(sigma_label, 1, 0)
        self.sigma_input = QLineEdit()
        self.sigma_input.setStyleSheet(input_style)
        layout.addWidget(self.sigma_input, 1, 1)

        generate_button = QPushButton("Générer")
        generate_button.setStyleSheet("""
            QPushButton {
                background-color: #5DADE2; /* Blue */
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
                margin: 4px 2px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #2E86C1;
            }
        """)
        generate_button.clicked.connect(self.generate_gaussian)
        layout.addWidget(generate_button, 2, 0, 1, 2)

        tab.setLayout(layout)

    def create_laser_simulation_tab(self):
        """Onglet pour la simulation laser."""
        tab = QWidget()
        self.notebook.addTab(tab, "Simulation Laser")

        layout = QGridLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(10)

        # Style pour les labels
        label_style = """
            QLabel {
                font: 14px 'Segoe UI';
                color: #333;
            }
        """

        # Style pour les inputs
        input_style = """
            QLineEdit {
                font: 12px 'Arial';
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #fff;
            }
        """

        # Widgets
        I0_label = QLabel("Intensité Initiale (I0):")
        I0_label.setStyleSheet(label_style)
        layout.addWidget(I0_label, 0, 0)
        self.I0_input = QLineEdit()
        self.I0_input.setStyleSheet(input_style)
        layout.addWidget(self.I0_input, 0, 1)

        gamma_label = QLabel("Gamma:")
        gamma_label.setStyleSheet(label_style)
        layout.addWidget(gamma_label, 1, 0)
        self.gamma_input = QLineEdit()
        self.gamma_input.setStyleSheet(input_style)
        layout.addWidget(self.gamma_input, 1, 1)

        simulate_button = QPushButton("Simuler")
        simulate_button.setStyleSheet("""
            QPushButton {
                background-color: #5DADE2; /* Blue */
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
                margin: 4px 2px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #2E86C1;
            }
        """)
        simulate_button.clicked.connect(self.simulate_laser)
        layout.addWidget(simulate_button, 2, 0, 1, 2)

        tab.setLayout(layout)

    def create_cavity_losses_tab(self):
        """Onglet pour les pertes de cavité."""
        tab = QWidget()
        self.notebook.addTab(tab, "Pertes par Cavité")

        layout = QGridLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(10)

        # Style pour les labels
        label_style = """
            QLabel {
                font: 14px 'Segoe UI';
                color: #333;
            }
        """

        # Style pour les inputs
        input_style = """
            QLineEdit {
                font: 12px 'Arial';
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: #fff;
            }
        """

        # Widgets
        perte_label = QLabel("Coefficient de perte:")
        perte_label.setStyleSheet(label_style)
        layout.addWidget(perte_label, 0, 0)
        self.perte_input = QLineEdit()
        self.perte_input.setStyleSheet(input_style)
        layout.addWidget(self.perte_input, 0, 1)

        distance_label = QLabel("Distance:")
        distance_label.setStyleSheet(label_style)
        layout.addWidget(distance_label, 1, 0)
        self.distance_input = QLineEdit()
        self.distance_input.setStyleSheet(input_style)
        layout.addWidget(self.distance_input, 1, 1)

        intensite_label = QLabel("Intensité Initiale:")
        intensite_label.setStyleSheet(label_style)
        layout.addWidget(intensite_label, 2, 0)
        self.intensite_input = QLineEdit()
        self.intensite_input.setStyleSheet(input_style)
        layout.addWidget(self.intensite_input, 2, 1)

        model_button = QPushButton("Modéliser")
        model_button.setStyleSheet("""
            QPushButton {
                background-color: #5DADE2; /* Blue */
                border: none;
                color: white;
                padding: 10px 20px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
                margin: 4px 2px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #2E86C1;
            }
        """)
        model_button.clicked.connect(self.model_losses)
        layout.addWidget(model_button, 3, 0, 1, 2)

        tab.setLayout(layout)

    def clear_plot(self):
        """Réinitialise le graphique."""
        self.figure.clf()
        self.canvas.draw()

    def generate_gaussian(self):
        """Génère le profil gaussien."""
        try:
            amplitude = float(self.amplitude_input.text())
            sigma = float(self.sigma_input.text())

            self.clear_plot()
            ax = self.figure.add_subplot(111)
            x = np.linspace(-10, 10, 1000)
            y = amplitude * np.exp(-(x ** 2) / (2 * sigma ** 2))

            ax.plot(x, y, color="#3498db")
            ax.set_title("Profil Gaussien", fontsize=14)
            ax.set_xlabel("Position", fontsize=12)
            ax.set_ylabel("Amplitude", fontsize=12)
            ax.grid(True, linestyle="--", alpha=0.5)

            # Amélioration de l'apparence du graphique
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.tick_params(axis='both', which='major', labelsize=10)

            self.canvas.draw()
            self.error_label.setText("")

        except ValueError:
            self.error_label.setText("Erreur: Valeurs numériques requises !")

    def simulate_laser(self):
        """Simule l'équation du laser."""
        try:
            I0 = float(self.I0_input.text())
            gamma = float(self.gamma_input.text())

            self.clear_plot()
            ax = self.figure.add_subplot(111)
            t = np.linspace(0, 10, 1000)
            I = I0 * np.exp(-gamma * t)

            ax.plot(t, I, color="#e74c3c")
            ax.set_title("Décroissance Laser", fontsize=14)
            ax.set_xlabel("Temps", fontsize=12)
            ax.set_ylabel("Intensité", fontsize=12)
            ax.grid(True, linestyle="--", alpha=0.5)

            # Amélioration de l'apparence du graphique
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.tick_params(axis='both', which='major', labelsize=10)

            self.canvas.draw()
            self.error_label.setText("")

        except ValueError:
            self.error_label.setText("Erreur: Valeurs numériques requises !")

    def model_losses(self):
        """Modélise les pertes par cavité."""
        try:
            perte = float(self.perte_input.text())
            distance = float(self.distance_input.text())
            intensite = float(self.intensite_input.text())

            self.clear_plot()
            ax = self.figure.add_subplot(111)
            t = np.linspace(0, distance, 1000)
            I = intensite * np.exp(-perte * t)

            ax.plot(t, I, color="#2ecc71")
            ax.set_title("Pertes de Cavité", fontsize=14)
            ax.set_xlabel("Distance", fontsize=12)
            ax.set_ylabel("Intensité", fontsize=12)
            ax.grid(True, linestyle="--", alpha=0.5)

            # Amélioration de l'apparence du graphique
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.tick_params(axis='both', which='major', labelsize=10)

            self.canvas.draw()
            self.error_label.setText("")

        except ValueError:
            self.error_label.setText("Erreur: Valeurs numériques requises !")


if __name__ == '__main__':
    app = QApplication(sys.argv)
    laser_window = LaserWindow()
    laser_window.show()
    sys.exit(app.exec_())
