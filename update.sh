#!/bin/bash
echo "Running Git Update"
/mingw64/bin/git add .
/mingw64/bin/git commit -m "hourly update"
/mingw64/bin/git push
echo "Git update complete"