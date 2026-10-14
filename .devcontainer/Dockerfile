FROM mcr.microsoft.com/devcontainers/base:ubuntu24.04

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        python3 \
        python3-setuptools \
        pkg-config \
        libinput-dev \
        libudev-dev \
        tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/sudoers.d/vscode

RUN mkdir -p /home/vscode/stretchly/node_modules \
    && chown -R vscode:vscode /home/vscode/stretchly
