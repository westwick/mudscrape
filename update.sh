#!/bin/bash
echo "Running Git Update"
git add mudscrape-client/content/players.json mudscrape-client/content/players2.json
git commit -m "update players.json [cron]"
git push
echo "Git update complete"
