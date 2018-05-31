'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
var requirejs  = require('requirejs');
requirejs.config({
    baseUrl: '.'
});

var util;

describe('VariableUtil tests', function() {
    before(function(done) {
        requirejs(['main/resources/plugin-webapp/centaur/app/common/variableUtil'], function(utl) {
            util = utl;
            done();
        });
    });

    it('should not have util undefined', function() {
        expect(util).to.exist;
    });

    describe('createVariableList tests', function() {
        var out;
        beforeEach(function() {
            out = util.createVariableList();
        });

        it('should be a div item', function() {
            expect(out.nodeName).to.eql("DIV");
        });

        it('should return a variableTextSmall', function() {
            expect(out.className).to.eql("variableTextSmall");
        });
    });

    describe('isSelectedVariable tests', function() {
        var data = {'a': 'tmp', 'b': 5}, out;
        var localStorage, prefix = "var_", stub;

        beforeEach(function() {
            stub = sinon.stub();
            stub.withArgs(prefix + 'a').returns('true');
            stub.withArgs(prefix + 'b').returns('false');
            localStorage = {getItem: stub};
            out = util.filterVariables(localStorage, data, prefix);
        });

        it('should return out with only a', function() {
            expect(out).to.have.property('a');
            expect(out).to.not.have.property('b');
        });

        it('should call getItem twice', function() {
            expect(stub.calledTwice).to.eql(true);
        });
    });

    describe('addDots tests', function() {
        var html;

        beforeEach(function() {
            html = document.createElement('div');
            var child1 = document.createElement('ul');
            var child2 = document.createElement('ul');
            for(var i = 0; i < 3; i++) {
                var li = document.createElement('li');
                li.innerHTML = i;
                child1.appendChild(li);
            }
            html.append(child1);
            html.append(child2);
            util.variableNum = 2;
            util.addDots(html, util);
        });

        it('should have added one li to child 0', function() {
            expect(html.children[0].childElementCount).to.eql(4);
            expect(html.children[1].childElementCount).to.eql(0);
        });

        it('should have third item dots', function() {
            expect(html.children[0].children[2].className).to.eql("dots");
        });
    });

    describe('createDots tests', function() {
        var out, number = 4;

        beforeEach(function() {
            out = util.createDots(number);
        });

        it('should be a list item', function() {
            expect(out).to.be.an.instanceOf(window.Element);
            expect(out.nodeName).to.eql('LI');
        });

        it('should return (number) spa', function() {
            expect(out.children).to.have.length(number);
            expect(out.children[0].className).to.eql('dot');
        });
    });


    describe('addTextElement tests', function() {
        var stub, overlays;
        var elementId = 1;
        var html = document.createElement('ul');
        var out;

        beforeEach(function() {
            stub = sinon.stub().returns(2);
            overlays = {add: stub};

            out = util.addTextElement(overlays, elementId, html);
        });

        it('should add element with corresponding id and object', function() {
            expect(stub.calledWith(elementId)).to.eql(true);
            expect(stub.firstCall.args[1]).to.be.an('object');
            expect(stub.firstCall.args[1].html).to.eql(html);
        });

        it('should return id of 2', function() {
            expect(out).to.eql(2);
        });
    });

    describe('clearOverlays tests', function() {
        var spy, overlays;
        var overlayIds = {'a': [1], 'b': [-2], 'c': [3]};

        beforeEach(function() {
            spy = sinon.spy();
            overlays = {remove: spy};

            util.clearOverlays(overlays, overlayIds, 'a');
            util.clearOverlays(overlays, overlayIds, 'b');
        });

        it('should call remove for all ids', function() {
            expect(spy.calledWith(1)).to.eql(true);
            expect(spy.calledWith(-2)).to.eql(true);
        });

        it('should return overlayIds empty', function() {
            expect(overlayIds['a']).to.be.empty;
            expect(overlayIds['b']).to.be.empty;
            expect(overlayIds['c']).to.be.not.empty;
        });
    });

    describe('getVariableNum tests', function() {
        var stub, localStorage, id = 2, out;

        describe('not in localStorage', function() {
            var spy;

            beforeEach(function() {
                stub = sinon.stub();
                stub.returns(null);
                spy = sinon.spy();
                localStorage = {getItem: stub, setItem: spy};
                out = util.getVariableNum(localStorage, id);
            });

            it('should call getItem at least once', function() {
                expect(stub.calledOnce).to.eql(true);
            });

            it('should return default value 5', function() {
                expect(out).to.eql(5);
            });

            it('should setItem in localStorage with value and default 5', function() {
                expect(spy.calledWith(id, 5)).to.eql(true);
            });
        });

        describe('in localStorage', function() {
            var stored = 2;

            beforeEach(function() {
                stub = sinon.stub();
                stub.returns(stored);
                localStorage = {getItem: stub};
                out = util.getVariableNum(localStorage, id);
            });

            it('should return stored', function() {
                expect(out).to.eql(stored);
            });

            it('should call getItem at least once', function() {
                expect(stub.calledOnce).to.eql(true);
            });
        });
    });
});