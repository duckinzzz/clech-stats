from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clechstats', '0004_remove_battlelog_enemy_tower_and_more'),
    ]

    operations = [
        # Drop the empty table created by 0001 (data lives in crstats_battlelog).
        migrations.RunSQL(
            sql='DROP TABLE IF EXISTS clechstats_battlelog',
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
