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
  };
};

function getFirstGoodLink(url, callback){
  console.log("url:" + url);
  var currentUrl = urlParser.parse(url, false, true);

  if( url.match( /\/Philosophy$/ ) ){
    pathToEnlightment.push(url);
    //pathToEnlightment.push({url:url,title:'Philosophy'}); // TODO add title
    callback( pathToEnlightment );
    return pathToEnlightment;
  }

  request(url, function(err, response, html){
    var $ = cheerio.load(html);
    
    // TODO use this when cheerio bug is fixed
    //var anchors=$.root().remove($('.infobox','i')).find('#mw-content-text a');
    var anchors = $('#mw-content-text a');

    // must not be an external link or self-referential
    for( var i=0; i < anchors.length; i++ ){
      var link = urlParser.parse(anchors[i].attribs.href, false, true);
      link.protocol = link.protocol || currentUrl.protocol;
      link.hostname = link.hostname || currentUrl.hostname;
      if( (link.hostname === currentUrl.hostname || link.hostname === null) &&
          !link.href.match(/^#/) && 
          !link.href.match(/:/) && // topics only; no Help:, File:, etc.
          link.query === null && 
          link.hash === null &&
          // sidebar classes
          !parentHasClass(anchors[i], 'infobox') &&
          !parentHasClass(anchors[i], 'hatnote') &&
          !parentHasClass(anchors[i], 'thumb') &&
          !parentHasClass(anchors[i], 'floatright') &&
          !parentIs(      anchors[i], 'i') &&
          !inParentheses( anchors[i]) &&
          currentUrl.href !== link.href ){

        // Have we been here before?
        if( pathToEnlightment.indexOf(urlParser.format(link)) < 0 ){
          pathToEnlightment.push(url);
          getFirstGoodLink(urlParser.format(link), callback);
        } else {
          console.log('circular'); // TODO return this info
          callback( pathToEnlightment );
        }
        break;
      }
    }
  });
};

// NOTE: These should not be necessary but the cheerio library appears to have 
//       a bug in its 'remove' features.

//Recursively travel up the tree looking for parent classes that contain _class
function parentHasClass(el, _class){
  if( el.attribs && el.attribs.class && 
      el.attribs.class.search(_class) >= 0 )
    return true;
  if( !!el.parentNode )
    return parentHasClass(el.parentNode, _class);

  return false;
}

//Recursively travel up the tree looking for parent tag named 'tag'.
function parentIs(el, tag){
  if( el.tagName === tag )
    return true;
  if( !!el.parentNode )
    return parentIs(el.parentNode, tag);

  return false;
}

// If the previous element has a ( and not a ) we're in parens
function inParentheses(el){
  if( !!el && !!el.prev && el.prev.type === 'text' && 
      el.prev.data.search('\\(') >= 0 && !el.prev.data.search('\\)') >= 0 
      )
    return true;

  return false;
}

