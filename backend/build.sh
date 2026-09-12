#!/usr/bin/env bash
# Render build step. Point the service's "Build Command" at this file:
#
#     ./build.sh
#
# with Root Directory set to `backend`.
#
# Running migrate here rather than by hand means a deploy that adds a table
# can never reach production without it — which is exactly how the contact
# form would have 500'd.
set -o errexit

pip install -r requirements.txt

# Whitenoise serves from STATIC_ROOT, so it has to be populated at build time.
python manage.py collectstatic --no-input

python manage.py migrate
