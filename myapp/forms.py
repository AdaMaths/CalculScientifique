from django import forms


class GaussianForm(forms.Form):
    amplitude = forms.FloatField(
        label='Amplitude',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez l\'amplitude'
        })
    )
    sigma = forms.FloatField(
        label='Sigma',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez sigma'
        })
    )


class LaserSimulationForm(forms.Form):
    I0 = forms.FloatField(
        label='Intensité Initiale (I0)',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez l\'intensité initiale'
        })
    )
    gamma = forms.FloatField(
        label='Gamma',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez gamma'
        })
    )


class CavityLossesForm(forms.Form):
    perte = forms.FloatField(
        label='Coefficient de perte',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez le coefficient de perte'
        })
    )
    distance = forms.FloatField(
        label='Distance',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez la distance'
        })
    )
    intensite = forms.FloatField(
        label='Intensité Initiale',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez l\'intensité initiale'
        })
    )
