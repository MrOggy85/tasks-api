#!/bin/bash

deno lint --unstable ./src
deno fmt --check ./src
