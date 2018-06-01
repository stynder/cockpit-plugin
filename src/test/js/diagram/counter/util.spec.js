'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var requirejs = require('requirejs');
requirejs.config({
  baseUrl: '.'
});

var util;

before(function(done) {
  requirejs(['main/resources/plugin-webapp/centaur/app/diagram/counter/util'], function(utl) {
    util = utl;
    done();
  });
});

it('should find counter util file', function() {
  expect(util).to.not.be.undefined;
});
