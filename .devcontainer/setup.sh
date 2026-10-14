set -eu

. "$NVM_DIR/nvm.sh" --no-use
nvm install
nvm alias default "$(nvm current)"
npm i -g npm
npm ci
npx install-electron
npm rebuild node-desktop-idle-v2
