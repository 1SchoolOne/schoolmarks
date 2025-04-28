FROM mcr.microsoft.com/devcontainers/base:jammy
USER vscode

# Replace shell with bash so we can source files
RUN sudo rm /bin/sh && sudo ln -s /bin/bash /bin/sh

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN sudo apt update
RUN sudo apt install default-jre -y