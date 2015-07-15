# slackhooks-deals

Hacked together really quickly.

Bot.js polls the "Available Prime-Exclusive Lightning Deals" applet.

Bot2.js polls the "Prime Exclusive Deals of the Day and Kindle Deals"

* Polls every 60 seconds. That can be altered in line 107
* Change line 101 to the slack channel you want it sent to. 
* Be sure to set SLACK_WEBHOOKS_URL environmental variable.

To run:
```
node bot.js
```
