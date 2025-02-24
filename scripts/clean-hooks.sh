#!/bin/sh
HOOKS_DIR=".git/hooks"

if [ -d "$HOOKS_DIR" ]; then
  rm -f "$HOOKS_DIR"/*
else
  exit 1
fi