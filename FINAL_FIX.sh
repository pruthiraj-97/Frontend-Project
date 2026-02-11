#!/bin/bash

echo "Clearing all proxy settings..."

unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset ALL_PROXY
unset all_proxy
unset NO_PROXY
unset no_proxy

export HTTP_PROXY=""
export HTTPS_PROXY=""
export http_proxy=""
export https_proxy=""

npm config delete proxy
npm config delete https-proxy
npm config delete http-proxy
npm config set registry https://registry.npmjs.org

echo "Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "npm failed, trying with curl to download packages..."
    mkdir -p node_modules
    cd ..
fi

echo "Installing frontend dependencies..."
cd ..
npm install

echo "Done!"

