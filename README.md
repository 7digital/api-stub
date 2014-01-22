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

You obviously need nodejs to run the stub and then you can install the dependencies via 
npm as usual:

    npm install

To be able to deploy the API to IIS you will need to install:

Visual C++ 2010 Redistributable package (exact version depends on whether you
are running 32 or 64 bit windows)
[iisnode](https://github.com/tjanczuk/iisnode/blob/master/README.md) and the
[URL rewrite module](http://www.iis.net/learn/extensions/url-rewrite-module/using-the-url-rewrite-module)

Then you can deploy to iis with the following commands:

    bundle install
    rake deploy

 Finally, you will need to add a hosts file entry for the stub url to localhost
 which is in the output of the last command.
	
USAGE
=====

    node server

This will start the stub listening on port 3000 by default.  You can configure
this by setting a PORT environment variable.  E.g.

    PORT=8080 node server

It will respond with canned XML responses, which are located in the responses
folder. The reponse which is returned is decided based on some simple 
conventions.  New conventions can be added in lib/conventions.js
