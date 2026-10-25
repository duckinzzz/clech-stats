from django.http import JsonResponse, Http404

from .models import BattleLog
from .players import PLAYERS, NAME_TO_TAG

# The API reports a card level relative to the level its rarity unlocks at.
# Add the unlock level back to get the level players see in game.
RARITY_UNLOCK_LEVEL = {
    'common': 1,
    'rare': 3,
    'epic': 6,
    'legendary': 9,
    'champion': 11,
}

MAX_BATTLES = 200
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
        rarity = card.get('rarity', 'common')
        icons = card.get('iconUrls') or {}
        is_evo = bool(card.get('evolutionLevel'))
        if cid not in catalog:
            catalog[cid] = {
                'name': card.get('name', ''),
                'rarity': rarity,
                'elixirCost': card.get('elixirCost', 0),
                'iconUrls': icons,
            }
        # Evolved cards have their own artwork; fall back to the base card
        # for the few evolutions the API ships without it.
        icon = icons.get('evolutionMedium') if is_evo else None
        return {
            'id': cid,
            'level': card.get('level', 1) + RARITY_UNLOCK_LEVEL.get(rarity, 1) - 1,
            'maxLevel': card.get('maxLevel'),
            'isEvo': is_evo,
            'evoLevel': card.get('evolutionLevel') or 0,
            'iconUrl': icon or icons.get('medium') or '',
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

def parse_limit(request, default):
    """Read ?limit=N, clamped to something a chart can actually render."""
    try:
        value = int(request.GET.get('limit', default))
    except (TypeError, ValueError):
        return default
    return max(1, min(value, MAX_BATTLES))


def players_list(request):
    """GET /api/players/ — list all tracked players."""
    data = [{"tag": tag, "name": name} for tag, name in PLAYERS.items()]
    return JsonResponse({"players": data})


def players_summary(request):
    """GET /api/players/summary/ — scoreboard strip for the roster rail."""
    window = 10
    data = []
    for tag, name in PLAYERS.items():
        logs = list(
            BattleLog.objects.filter(player_tag=tag)
            .order_by('-battle_time')
            .values('starting_trophies', 'trophy_change', 'battle_time')[:window]
        )
        if not logs:
            data.append({'name': name, 'tag': tag, 'trophies': None,
                         'delta': 0, 'battles': 0, 'last_battle': None})
            continue

        latest = logs[0]
        current = latest['starting_trophies'] + latest['trophy_change']
        base = logs[-1]['starting_trophies']
        data.append({
            'name': name,
            'tag': tag,
            'trophies': current,
            'delta': current - base,
            'battles': len(logs),
            'last_battle': latest['battle_time'].isoformat(),
        })
    return JsonResponse({"players": data})


def player_battles(request, name):
    """GET /api/players/<name>/battles/?limit=N — battle history for one player."""
    tag = NAME_TO_TAG.get(name)
    if not tag:
        raise Http404("unknown player")
    limit = parse_limit(request, CHART_BATTLES_PER_PLAYER)
    catalog = {}
    payload = build_player_payload(tag, catalog, limit=limit)
    return JsonResponse({"player": payload, "catalog": catalog})


def recent_battles(request):
    """GET /api/battles/recent/?limit=N — latest battles across all players."""
    limit = parse_limit(request, 10)
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
