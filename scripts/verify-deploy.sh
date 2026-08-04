#!/bin/bash
if [ ! -f dist/index.html ] || [ ! -f dist/404.html ] || [ ! -f public/experiences/index.html ]; then echo "FAIL: deploy artifacts missing"; exit 1; fi
echo "PASS: deploy artifacts ready"
