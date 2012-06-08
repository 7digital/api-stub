![7digital](http://developer.7digital.net/db/Gallery/Groups/Top_Navigation/Thumbnails/CustomSize_9/logo_276x0.png)

About 7digital
==============

7digital.com is an online music store operating in over 16 countries and
offering more than 11 million high quality DRM free MP3s (320kbps) from all
major labels and wide range of idependent labels and distributors. 7digital API
will give you access to the full catalogue including high quality album art,
30s preview clips for all tracks, commissions on sales, integrated purchasing
and full length streaming. 

More details at [developer.7digital.net](http://developer.7digital.net/)

WHAT IS THIS?
=============

This is a stub API which can be used for testing integrations with 7digital.

INSTALLATION
============

The easiest way to install the stub is to clone it.

    git clone git://github.com/7digital/node-7digital-api-stub.git

Then you can install the dependencies via npm as usual (for npm >=1.0)

    npm install

USAGE
=====

    node server

This will start the stub listening on port 3000 by default.  You can configure
this by setting a PORT environment variable.  E.g.

    PORT=8080 node server

It will respond with canned XML responses, which are located in the responses
folder. The reponse which is returned is decided based on some simple 
conventions.  New conventions can be added in lib/conventions.js
