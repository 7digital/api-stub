md2html README.md |sed 's/\r$/\n/' > docs/content.html && cd docs && cat layout-top.html content.html layout-bottom.html | sed 's/\r$/\n/' > "./index.html"
