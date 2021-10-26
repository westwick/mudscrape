#!/bin/bash
echo "Running Git Update"
/mingw64/bin/git add mudscrape-client/content/players.json
/mingw64/bin/git commit -m "update players.json [cron]"
/mingw64/bin/git push
echo "Git update complete"