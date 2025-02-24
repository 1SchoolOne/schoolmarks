#!/bin/bash

# ------- CONFIGURE 0H-MY-ZSH -------

# Install zsh-syntax-highlighting plugin
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# Add zsh-syntax-highlighting to the list of plugins in ~/.zshrc
sed -i 's/plugins=(git)/plugins=(git zsh-syntax-highlighting)/' ~/.zshrc

# Set oh-my-zsh theme
sed -i 's/ZSH_THEME="devcontainers"/ZSH_THEME="gnzh"/' ~/.zshrc

# Set zsh as the default shell
chsh -s /bin/zsh

# ------- INSTALL UV -------

# Download the latest uv installer
curl -LsSf https://astral.sh/uv/install.sh | sh

# ------- INSTALL NVM -------

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Install node 20.17.0
. ~/.nvm/nvm.sh && source ~/.bashrc && nvm install 20.17.0

# Install yarn
npm install -g yarn