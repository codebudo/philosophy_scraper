//var hippie  = require('hippie');
var should = require('should');
var request = require('supertest');

var assert = require('assert'),
    blanket = require('blanket')({
      pattern: function (filename) {
        return !/node_modules/.test(filename);
      }
    }),
    server  = require('../lib/index.js');



describe('Server', function () {
  describe('/philosophy endpoint', function () {
    it('returns a path to Philosophy from the given URL', function (done) {
      request('http://localhost:9001')
      .get("/philosophy/http://en.wikipedia.org/wiki/Recursion")
      //.get("/philosophy/http://en.wikipedia.org/wiki/Philosophy")
      .end(function(err, res){
        assert( res.status == 200 );
        assert( res.body.indexOf('http://en.wikipedia.org/wiki/Philosophy') >= 0);
        done();
      });
    });
  });
});
