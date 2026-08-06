import json

from django.http import JsonResponse, Http404

from .models import BattleLog
from .players import PLAYERS, NAME_TO_TAG

base_lvl = {
    'common': 1,
    'rare': 3,
    'epic': 6,
    'legendary': 9,
    'champion': 11,
}

CHART_BATTLES_PER_PLAYER = 30


def build_player_payload(tag, catalog, limit=None):
    """Build a player's chart payload and merge any new cards into `catalog`."""
    qs = BattleLog.objects.filter(player_tag=tag).order_by('-battle_time')
    if limit:
        qs = qs[:limit]
    latest_logs = qs
    logs_list = list(reversed(latest_logs))

    def card_ref(card):
        cid = card['id']
        if cid not in catalog:
            catalog[cid] = {
                'name': card['name'],
                'rarity': card['rarity'],
                'elixirCost': card.get('elixirCost', 0),
                'iconUrls': card['iconUrls'],
            }
        return {
            'id': cid,
            'level': card['level'] + base_lvl[card['rarity']] - 1,
            'isEvo': bool(card.get('evolutionLevel')),
        }

    def battle_info(raw):
        p, e = raw['team'][0], raw['opponent'][0]
        return {
            'player': {'crowns': p['crowns'], 'cards': [card_ref(c) for c in p['cards']]},
            'enemy': {'nickname': e['name'], 'crowns': e['crowns'], 'cards': [card_ref(c) for c in e['cards']]},
        }

    return {
        'x': list(range(1, len(logs_list) + 1)),
        'y': [log.starting_trophies + log.trophy_change for log in logs_list],
        'custom': [
            {
                'battle_time': log.battle_time.isoformat(),
                'change': log.trophy_change,
                'enemy': log.enemy_tag,
                'battle_info': battle_info(log.raw_data),
            }
            for log in logs_list
        ],
    }

# ── JSON API ──

def players_list(request):
    """GET /api/players/ — list all tracked players."""
    data = [{"tag": tag, "name": name} for tag, name in PLAYERS.items()]
    return JsonResponse({"players": data})


def player_battles(request, name):
    """GET /api/players/<name>/battles/?limit=N — battle history for one player."""
    tag = NAME_TO_TAG.get(name)
    if not tag:
        raise Http404("unknown player")
    limit = int(request.GET.get('limit', CHART_BATTLES_PER_PLAYER))
    catalog = {}
    payload = build_player_payload(tag, catalog, limit=limit)
    return JsonResponse({"player": payload, "catalog": catalog})


def recent_battles(request):
    """GET /api/battles/recent/?limit=N — latest battles across all players."""
    limit = int(request.GET.get('limit', 10))
    logs = BattleLog.objects.order_by('-battle_time')[:limit]
    data = [
        {
            "player": PLAYERS.get(log.player_tag, log.player_tag),
            "before": log.starting_trophies,
            "change": log.trophy_change,
            "battle_time": log.battle_time.isoformat(),
        }
        for log in logs
    ]
    return JsonResponse({"battles": data})
