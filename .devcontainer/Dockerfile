FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

RUN apt-get update \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y --no-install-recommends \
    libasound2 \
    libatk-bridge2.0-0 \
    libgbm1 \
    libgtk-3-0 \
    libinput-dev \
    libnss3 \
    libudev-dev \
    libxshmfence1 \
    xvfb \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
