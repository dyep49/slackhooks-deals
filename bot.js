const Slack = require('node-slack');
const request = require('request');
const cheerio = require('cheerio');

const webhooksUrl = process.env['SLACK_WEBHOOKS_URL'];

var slack = new Slack(webhooksUrl);

slack.send({
    text: 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2014/10/3/1412342672839/Just-cos-Im-small---Pluto-014.jpg',
    channel: '#slackbot-testing',
    username: 'dealbot'
});