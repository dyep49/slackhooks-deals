const Slack = require('node-slack');
const request = require('request');

const webhooksUrl = process.env['SLACK_WEBHOOKS_URL'];
const slack = new Slack(webhooksUrl);

var dealHistory = {}


const metadataForm = {
  "requestMetadata": {
    "marketplaceID": "ATVPDKIKX0DER",
    "clientID": "goldbox"
  },
  "widgetContext": {
    "pageType": "Landing",
    "subPageType": "hybrid-batch-btf",
    "refRID": "1CFMVD11E82FT7XFTGVS",
    "widgetID": "2130252862",
    "slotName": "merchandised-search-4"
  },
  "page": 1,
  "dealsPerPage": 8,
  "itemResponseSize": "NONE",
  "queryProfile": {
    "featuredOnly": false,
    "dealTypes": [
      "LIGHTNING_DEAL"
    ],
    "inclusiveTargetValues": [
      {
        "name": "MARKETING_ID",
        "value": "kindledotd715"
      },
      {
        "name": "MARKETING_ID",
        "value": "PRIME_ONLY_DOTD"
      }
    ],
    "excludedExtendedFilters": {
      "MARKETING_ID": [
        "bfexclude",
        "restrictedcontent"
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
      return {"dealID": id}
    })

    var dealForm = {
      "requestMetadata":{
        "marketplaceID":"ATVPDKIKX0DER",
        "clientID":"goldbox"
      },
      "dealTargets": dealTargets,
      "responseSize":"ALL",
      "itemResponseSize":"NONE"
    }

    request.post({url: url, form: JSON.stringify(dealForm)}, function(err, httpResponse, body) {
      var deals = JSON.parse(body).dealDetails;
      var parsedDeals = [];
      
      for(deal in deals) {
        if(!dealHistory[deal]) {
          var parsedDeal = {
            title: deals[deal].title,
            price: deals[deal].minDealPrice,
            image: deals[deal].primaryImage,
            url: deals[deal].egressUrl
          }

          dealHistory[deal] = parsedDeal
          parsedDeals.push(parsedDeal);        
        }
      }

      postDeals(parsedDeals);
    })
  } catch(err) {
    console.log(err)
  }

}

function postDeals(deals) {
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

setInterval(requestMetaData, 60000)
