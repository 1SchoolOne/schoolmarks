FROM mcr.microsoft.com/devcontainers/base:jammy
USER vscode

# Replace shell with bash so we can source files
RUN sudo rm /bin/sh && sudo ln -s /bin/bash /bin/sh

RUN sudo apt update && sudo apt install tmux -y

# Install overmind
COPY install-overmind.sh /tmp/install-overmind.sh
RUN sudo chmod +x /tmp/install-overmind.sh
RUN /tmp/install-overmind.sh

COPY setup.sh /tmp/setup.sh
RUN sudo chmod +x /tmp/setup.sh
RUN /tmp/setup.sh