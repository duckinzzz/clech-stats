from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clechstats', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='battlelog',
            name='battle_time',
            field=models.DateTimeField(db_index=True),
        ),
        migrations.AlterField(
            model_name='battlelog',
            name='player_tag',
            field=models.CharField(db_index=True, max_length=255),
        ),
        migrations.RunSQL(
            sql=(
                'CREATE INDEX IF NOT EXISTS player_time_idx '
                'ON clechstats_battlelog (player_tag, battle_time DESC)'
            ),
            reverse_sql='DROP INDEX IF EXISTS player_time_idx',
            state_operations=[
                migrations.AddIndex(
                    model_name='battlelog',
                    index=models.Index(
                        fields=['player_tag', '-battle_time'],
                        name='player_time_idx',
                    ),
                ),
            ],
        ),
        migrations.RunSQL(
            sql=(
                'DO $$ BEGIN '
                'ALTER TABLE clechstats_battlelog '
                'ADD CONSTRAINT unique_player_battle '
                'UNIQUE (player_tag, battle_time); '
                'EXCEPTION WHEN duplicate_table THEN NULL; '
                'END $$'
            ),
            reverse_sql='ALTER TABLE clechstats_battlelog DROP CONSTRAINT IF EXISTS unique_player_battle',
            state_operations=[
                migrations.AddConstraint(
                    model_name='battlelog',
                    constraint=models.UniqueConstraint(
                        fields=['player_tag', 'battle_time'],
                        name='unique_player_battle',
                    ),
                ),
            ],
        ),
        migrations.AlterModelOptions(
            name='battlelog',
            options={'ordering': ['-battle_time']},
        ),
    ]