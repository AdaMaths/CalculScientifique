from django.urls import path
from . import views

app_name = 'myapp'

urlpatterns = [
    path('', views.home, name='home'),
    path('numerisation/', views.numerisation_options, name='numerisation'),
    path('gaussian/', views.gaussian_profile, name='gaussian'),
    path('laser/', views.laser_simulation, name='laser'),
    path('cavity/', views.cavity_losses, name='cavity'),
    path('history/', views.calculation_history, name='history'),
    path('data-science/', views.data_science, name='data_science'),
    path('energy/', views.energy, name='energy'),
    path('navier-stokes/', views.navier_stokes, name='navier_stokes'),
]
