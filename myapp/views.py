from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import numpy as np
from scipy import optimize, signal
from .models import Calculation, Project
from .forms import GaussianForm, LaserSimulationForm, CavityLossesForm


def home(request):
    return render(request, 'myapp/home.html')


def numerisation_options(request):
    return render(request, 'myapp/numerisation_options.html')


def gaussian_profile(request):
    form = GaussianForm()
    result = None

    if request.method == 'POST':
        form = GaussianForm(request.POST)
        if form.is_valid():
            amplitude = form.cleaned_data['amplitude']
            sigma = form.cleaned_data['sigma']

            x = np.linspace(-10, 10, 1000)
            y = amplitude * np.exp(-(x ** 2) / (2 * sigma ** 2))

            result = {
                'x': x.tolist(),
                'y': y.tolist()
            }

            if request.user.is_authenticated:
                Calculation.objects.create(
                    user=request.user,
                    calculation_type='gaussian',
                    parameters={'amplitude': amplitude, 'sigma': sigma},
                    results=result
                )

    return render(request, 'myapp/gaussian.html', {'form': form, 'result': result})


def laser_simulation(request):
    form = LaserSimulationForm()
    result = None

    if request.method == 'POST':
        form = LaserSimulationForm(request.POST)
        if form.is_valid():
            I0 = form.cleaned_data['I0']
            gamma = form.cleaned_data['gamma']

            t = np.linspace(0, 10, 1000)
            I = I0 * np.exp(-gamma * t)

            result = {
                't': t.tolist(),
                'I': I.tolist()
            }

            if request.user.is_authenticated:
                Calculation.objects.create(
                    user=request.user,
                    calculation_type='laser',
                    parameters={'I0': I0, 'gamma': gamma},
                    results=result
                )

    return render(request, 'myapp/laser.html', {'form': form, 'result': result})


def cavity_losses(request):
    form = CavityLossesForm()
    result = None

    if request.method == 'POST':
        form = CavityLossesForm(request.POST)
        if form.is_valid():
            perte = form.cleaned_data['perte']
            distance = form.cleaned_data['distance']
            intensite = form.cleaned_data['intensite']

            t = np.linspace(0, distance, 1000)
            I = intensite * np.exp(-perte * t)

            result = {
                't': t.tolist(),
                'I': I.tolist()
            }

            if request.user.is_authenticated:
                Calculation.objects.create(
                    user=request.user,
                    calculation_type='cavity',
                    parameters={'perte': perte, 'distance': distance, 'intensite': intensite},
                    results=result
                )

    return render(request, 'myapp/cavity.html', {'form': form, 'result': result})


@login_required
def calculation_history(request):
    calculations = Calculation.objects.filter(user=request.user)
    return render(request, 'myapp/history.html', {'calculations': calculations})


def data_science(request):
    return render(request, 'myapp/data_science.html')


def energy(request):
    return render(request, 'myapp/energy.html')


def navier_stokes(request):
    return render(request, 'myapp/navier_stokes.html')
