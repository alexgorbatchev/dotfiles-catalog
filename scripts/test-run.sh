#!/usr/bin/env bash
set -euo pipefail

scratch=$(mktemp -d "${TMPDIR:-$PWD/.tmp}/catalog-test.XXXXXX")
scratch=$(cd "$scratch" && pwd -P)
child=
cleanup() {
    local status=$?
    trap - EXIT HUP INT TERM
    if [[ -n "$child" ]]; then
        kill -TERM -- "-$child" 2>/dev/null || true
        for ((attempt=0; attempt<50; attempt++)); do
            kill -0 -- "-$child" 2>/dev/null || break
            sleep 0.1
        done
        kill -KILL -- "-$child" 2>/dev/null || true
        wait "$child" 2>/dev/null || true
    fi
    rm -rf -- "$scratch"
    exit "$status"
}
trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
export TMPDIR="$scratch"
set -m
"$@" &
child=$!
wait "$child"
