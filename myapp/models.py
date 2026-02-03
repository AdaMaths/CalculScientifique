from django.db import models
from django.contrib.auth.models import User


class Calculation(models.Model):
    CALCULATION_TYPES = [
        ('gaussian', 'Profil Gaussien'),
        ('laser', 'Simulation Laser'),
        ('cavity', 'Pertes par Cavité'),
        ('optimization', 'Optimisation'),
        ('integration', 'Intégration'),
        ('interpolation', 'Interpolation'),
        ('diff_eq', 'Équations Différentielles'),
        ('signal', 'Traitement du Signal'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    calculation_type = models.CharField(max_length=50, choices=CALCULATION_TYPES)
    parameters = models.JSONField()
    results = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Calcul'
        verbose_name_plural = 'Calculs'

    def __str__(self):
        return f"{self.get_calculation_type_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'

    def __str__(self):
        return self.name
