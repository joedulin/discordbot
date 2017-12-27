#!/bin/bash

cd /opt/discord-bot
forever start -l /var/log/discord.log --append --minUptime 0 --spinSleepTime 1000 index.js

# warn:    --minUptime not set. Defaulting to: 1000ms
# warn:    --spinSleepTime not set. Your script will exit if it does not stay up for at least 1000ms

