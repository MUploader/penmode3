# penmode3
When pentest hits the "cloud"

## What is Penmode?
Penmode was designed to make everyone's favourite pentest tools portable and compliant with every os you might like to use.

It has been wrote in node.js and runs through a web browser interface to let all tasks be more easy also if you want to run it on a phone.

All plugins are customizable and every user can write his own tool set adding new features easily.

### You can't use the name "penmode" in your project!!
Why? Is it your trademark? I don't think so.

I've started to develop penmode since its first line.<br/>
The Team split up, but I think that continuing the project with its true name is not a shame.

Thanks.

TheZero, ex-PH#0S Team Member

## Installation

#### From NPM
`npm install -g penmode3`

if you use ubuntu or debian must be use `sudo` intead of `npm install -g`

#### From git
```
$ cd /opt
$ git clone https://github.com/TheZ3ro/penmode3
$ cd /opt/penmode3
$ npm install
$ npm link
```
and then start penmode3 with a simple
```
$ penmode3
```

## Download Penmode3 Plugins

Penmode3 comes by default with no plugins. <br/>
In various states (like Romania) is illegal to scan for open ports in another Computer/Server. <br/>
All the code/content in Penmode3 is totally legal. <br/>
You can download verified plugin from the official repository if they are legal in your State based on it's legislation. <br/>

[Penmode3-plugin Repo](http://github.com/TheZ3ro/penmode3-plugin)

## A Note on Tor Status
The Tor Status refer only on the port 80!<br/>
Some plugins use other ports, if you want use Tor make sure you are proxying all the ports!<br/>
For that you can use the **"tor_tunnel.sh"** script in this repo :eyes:

## Hacking/Improving penmode3
If you are interested in Improving penmode3, or you only want to have
some more information on how it works, read the [wiki](https://github.com/TheZ3ro/penmode3/wiki/)

**Send Issues or Pull Requests!**
Read the wiki page on [Contribute](https://github.com/TheZ3ro/penmode3/wiki/Contribute)

## Web Service Used

 * [Tor Check](https://check.torproject.org/)
 * [IPInfo.io](http://ipinfo.io/)

## TODO

* Write more Plugins
* Wiki: Guide on RaspberryPi/Droplet/VPS Installation
* Wiki: Guide on installing Plugin dependency
* Wiki: Guide on Setting a Tor proxy
* Add a description

### Note
I'm a *Pirate* and *Anacleto* is my personal parrot.
