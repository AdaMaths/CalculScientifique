from django.contrib import admin
from .models import Calculation, Project


@admin.register(Calculation)
class CalculationAdmin(admin.ModelAdmin):
    list_display = ('calculation_type', 'user', 'created_at', 'updated_at')
    list_filter = ('calculation_type', 'created_at')
    search_fields = ('calculation_type', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
