default: check

check:
    bun check

fmt:
    bun run fmt

fmt-check:
    bun run fmt:check

fix:
    bun run fix

run:
    bun run validate

run-ai:
    AGENT=1 bun run validate

test:
    bun run test

sdk:
    #!/usr/bin/env bash
    set -euo pipefail
    revision=f0243ea9dd9626404990a0ad6d9fb83a32448d63
    if [ ! -e .tmp/installer ]; then
        mkdir -p .tmp
        git clone git@github.com:alexgorbatchev/dotfiles.git .tmp/installer
        git -C .tmp/installer checkout --detach "$revision"
    fi
    if [ "$(git -C .tmp/installer rev-parse HEAD)" != "$revision" ] || [ -n "$(git -C .tmp/installer status --porcelain)" ]; then
        echo '.tmp/installer must be clean and at the pinned installer revision' >&2
        exit 1
    fi
    cd .tmp/installer && bun install --frozen-lockfile && go run scripts/build/main.go --assets-only

# Prepare dependencies for local development.
setup:
    bun install --frozen-lockfile
    just sdk
