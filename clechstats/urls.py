from django.urls import path

from . import views

app_name = 'clechstats'

urlpatterns = [
    # JSON API
    path('api/players/', views.players_list, name='players_list'),
    path('api/players/<str:name>/battles/', views.player_battles, name='player_battles'),
    path('api/battles/recent/', views.recent_battles, name='recent_battles'),
]
