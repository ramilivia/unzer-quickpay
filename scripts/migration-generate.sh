#!/bin/sh
docker-compose exec -T app sh -c "cd /usr/src/app && npx typeorm-ts-node-commonjs migration:generate -d src/data-source.ts $*"

