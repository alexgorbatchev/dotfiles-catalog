default: check

check:
    bun check

run:
    bun run validate

run-ai:
    AGENT=1 bun run validate

test:
    bun run test

sdk:
    git clone https://github.com/alexgorbatchev/dotfiles .tmp/installer
    git -C .tmp/installer checkout f0243ea9dd9626404990a0ad6d9fb83a32448d63
    cd .tmp/installer && bun install --frozen-lockfile && go run scripts/build/main.go --assets-only
