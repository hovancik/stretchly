# How to Build the Development Flatpak

The instructions here describe how to build and update the Stretchly development Flatpak.

Clone the Stretchly repository if needed.

    git clone --recursive https://github.com/hovancik/stretchly.git

Install Flatpak Builder.

    sudo apt install flatpak-builder g++ git make

Change into `stretchly` directory.

    cd stretchly

Add the Flathub repository as a Flatpak remote.

    flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo

## Electron Builder

Install npm packages.

    npm i

Build the Flatpak.

    node_modules/.bin/electron-builder --x64 --linux flatpak

## Flatpak Builder

### Build

Build and install the Flatpak.

    flatpak-builder --user --install --install-deps-from=flathub --force-clean --repo=repo build-dir net.hovancik.Stretchly.Devel.yaml

Run the Flatpak.

    flatpak run net.hovancik.Stretchly.Devel

### Update

A list of package source archives and checksums are generated for *all* dependencies.
Ideally, these dependencies will be updated whenever the `package-lock.json` file changes to keep the Flatpak version using the same packages.
The Flatpak Node Generator is used to generate this list of packages from the `package-lock.json` file, which is included directly in the Flatpak manifest.
To generate an updated version of this file, `generated-sources.json`, follow the instructions here.

Make sure to install npm.

    sudo apt install python3-aiohttp npm pipx

Fetch the Flatpak Node Generator Python script.

    git clone https://github.com/flatpak/flatpak-builder-tools.git

Install the Flatpak Node Generator Python utility with `pipx`.

    pipx install flatpak-builder-tools/node

Ensure the Flatpak Node Generator Python is in your `PATH`.

    pipx ensurepath

Run the script against the `package-lock.json` file as shown here.

    flatpak-node-generator npm package-lock.json
