const Slack = require('node-slack');
const request = require('request');

const webhooksUrl = process.env['SLACK_WEBHOOKS_URL'];
const slack = new Slack(webhooksUrl);

var dealHistory = {}


const metadataForm = {
  "requestMetadata": {
    "marketplaceID": "ATVPDKIKX0DER",
    "customerID": "A2JK557SLQNPYZ",
    "sessionID": "179-2337983-2433660",
    "clientID": "goldbox"
  },
  "widgetContext": {
    "pageType": "Landing",
    "subPageType": "hybrid-batch-btf",
    "deviceType": "pc",
    "refRID": "14GKY7BRYV4TTG158DWQ",
    "widgetID": "2136336222",
    "slotName": "merchandised-search-6"
  },
  "page": 1,
  "dealsPerPage": 16,
  "itemResponseSize": "NONE",
  "queryProfile": {
    "featuredOnly": false,
    "dealStates": [
      "AVAILABLE"
    ],
    "dealTypes": [
      "LIGHTNING_DEAL"
    ],
    "inclusiveTargetValues": [
      {
        "name": "MARKETING_ID",
        "value": "PRIME_ONLY_LD"
      }
    ],
    "excludedExtendedFilters": {
      "MARKETING_ID": [
        "bfexclude",
        "restrictedcontent",
        "kindledotd715"
      ]
    }
  }
}


function requestMetaData() {
  var url = 'http://www.amazon.com/xa/dealcontent/v2/GetDealMetadata?nocache=' + Date.now();

  request.post({url: url, form: JSON.stringify(metadataForm)}, function(err, httpResponse, body) {
    var availableDeals = JSON.parse(body).dealsByState.AVAILABLE
    requestDeals(availableDeals)
  })
}

function requestDeals(idArray) {
  try {
    var url = 'http://www.amazon.com/xa/dealcontent/v2/GetDeals?nocache=' + Date.now();

    var dealTargets = idArray.map(function(id) {
        if(dealHistory[id]) { return }
        return {"dealID": id}      
    })

    console.log(dealTargets.length);

    while(dealTargets.length > 0) {
      var dealForm = {
        "requestMetadata":{
          "marketplaceID":"ATVPDKIKX0DER",
          "clientID":"goldbox"
        },
        "dealTargets": dealTargets.slice(0, 200),
        "responseSize":"ALL",
        "itemResponseSize":"NONE"
      }

      dealTargets.splice(0, 200)

      request.post({url: url, form: JSON.stringify(dealForm)}, function(err, httpResponse, body) {
        var deals = JSON.parse(body).dealDetails;
        var parsedDeals = [];
        
        for(deal in deals) {
          var parsedDeal = {
            title: deals[deal].title,
            price: deals[deal].minDealPrice,
            image: deals[deal].primaryImage,
            url: deals[deal].egressUrl
          }

          dealHistory[deal] = parsedDeal
          parsedDeals.push(parsedDeal);        
        }

        postDeals(parsedDeals);
      })
    }
  } catch(err) {
    console.log(err)
  }

}

function postDeals(deals) {
  console.log(deals.length);
  if(postFlag === true) {
    deals.forEach(function(deal) {
      slack.send({
          attachments: [
            {
              title: '$' + deal.price + ' <' + deal.url + '|' + deal.title + '>'   
            }
          ],
          text: deal.image,
          channel: '#amazon-deals',
          username: 'dealbot'
      });
    })    
  }
}

var postFlag = false;
requestMetaData();

setInterval(function() {
  postFlag = true;
  requestMetaData()
}, 60000)

