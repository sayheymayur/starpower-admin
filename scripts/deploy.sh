#!/usr/bin/env bash
# Build the StarPower admin locally from a clean git checkout and publish the
# static files to the server. nginx serves them directly — no Node process runs
# for the admin on the server. NEVER run `vite` / `npm run dev` on the server:
# the Vite dev server allows remote code execution and was used to hack it.
#
# Usage: SSH_KEY=~/path/to/key.pem scripts/deploy.sh [git-ref]   (default: origin/main)
set -euo pipefail

REF="${1:-origin/main}"
HOST="${DEPLOY_HOST:-ubuntu@65.0.107.18}"
SSH_KEY="${SSH_KEY:?set SSH_KEY to the server .pem path}"
WEBROOT=/var/www/starpower-admin

REPO="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
BUILD="$(mktemp -d)"
trap 'git -C "$REPO" worktree remove --force "$BUILD" >/dev/null 2>&1 || true; rm -rf "$BUILD"' EXIT

git -C "$REPO" fetch -q origin
git -C "$REPO" worktree add --detach "$BUILD" "$REF" >/dev/null
echo "Building $(git -C "$BUILD" log --oneline -1)"

cd "$BUILD"
npm install --no-audit --no-fund --loglevel=error
npx vite build
COPYFILE_DISABLE=1 tar czf "$BUILD/dist.tgz" -C dist .

scp -q -i "$SSH_KEY" "$BUILD/dist.tgz" "$HOST:/tmp/admin-dist.tgz"
ssh -i "$SSH_KEY" "$HOST" "set -e
  sudo rm -rf $WEBROOT.new && sudo mkdir -p $WEBROOT.new
  sudo tar xzf /tmp/admin-dist.tgz -C $WEBROOT.new --no-same-owner 2>/dev/null
  sudo chown -R root:root $WEBROOT.new
  sudo find $WEBROOT.new -type d -exec chmod 755 {} + && sudo find $WEBROOT.new -type f -exec chmod 644 {} +
  sudo rm -rf $WEBROOT.prev && sudo mv $WEBROOT $WEBROOT.prev && sudo mv $WEBROOT.new $WEBROOT
  rm -f /tmp/admin-dist.tgz"

echo "Deployed. Previous version kept at $WEBROOT.prev on the server."
