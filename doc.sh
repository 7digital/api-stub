#! /bin/bash

md2html README.html > docs/content.html
cd docs
cat layout-top.html content.html layout-bottom.html > index.html