var request   = require('request');
var cheerio   = require('cheerio');
var urlParser = require('url');

var pathToEnlightment = [];

module.exports = function(){
  return function(req, res, next){
    pathToEnlightment = [];
    // A simple req.url.replace is normally fine, but some browsers will
    // remove double slashes '//' -> '/', so we need to add it back for both
    // http and https urls.
    var url = req.url.replace(/^.*http:\//i, 'http://');
    url = url.replace(/^.*https:\//i, 'https://');
    url = url.replace(/\/\/\//, '\/\/');

    getFirstGoodLink(url, function(a){
      console.log('callback for end');
      res.end(JSON.stringify(pathToEnlightment));
    });

    //res.end(JSON.stringify(pathToEnlightment));
    //next();
  };
};

function getFirstGoodLink(url, callback){
  console.log("url:" + url);
  var currentUrl = urlParser.parse(url, false, true);

  if( url.match( /Philosophy$/i ) ){
    pathToEnlightment.push(url);
    //pathToEnlightment.push({url:url,title:'Philosophy'}); // TODO add title
    callback( pathToEnlightment );
    return pathToEnlightment;
  }

  request(url, function(err, response, html){
    var $ = cheerio.load(html);
    //console.log( currentUrl.path );
    
    var anchors = $.root().remove('.infobox', 'i').find('#mw-content-text').find('a');
    //var anchors = $('#mw-content-text').remove('.infobox', 'i').find('a');
    
    /*var anchors = $('#mw-content-text').map(function(i, el){
      console.log( $(this).find('.infobox') );
      if( $(el).hasClass('.infobox') ){
        console.log( el );
        return null;
      }
      return el;
      
    }).find('a');*/
    //console.log( anchors );

    // must not be an external link or self-referential
    for( var i=0; i < anchors.length; i++ ){
      var link = urlParser.parse(anchors[i].attribs.href, false, true);
      link.protocol = link.protocol || currentUrl.protocol;
      link.hostname = link.hostname || currentUrl.hostname;
      if( (link.hostname === currentUrl.hostname || link.hostname === null) &&
          !link.href.match(/^#/) && 
          !link.href.match(/[\(\)]/) && 
          !link.href.match(/:/) && // topics only; no Help:, File:, etc.
          link.query === null && 
          link.hash === null &&
          currentUrl.href !== link.href ){

        // Have we been here before?
        if( pathToEnlightment.indexOf(urlParser.format(link)) < 0 ){
          pathToEnlightment.push(url);
          getFirstGoodLink(urlParser.format(link), callback);
        } else {
          console.log('circular');
          callback( pathToEnlightment );
        }
        break;
      }
    }
    //callback(pathToEnlightment);
  });
};
