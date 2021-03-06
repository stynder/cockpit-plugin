describe('Common overlay tests', function() {
    var util;

    before(function(done) {
        requirejs(['main/resources/plugin-webapp/centaur/app/common/overlays'], function(utl) {
            util = utl;
            done();
        });
    });

    it('should not have util undefined', function() {
        expect(util).to.exist;
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

    describe('getOffset tests', function() {
        var html, procDefId = "test", localStorage;
        var stub;

        beforeEach(function() {
            stub = sinon.stub();
            html = document.createElement('DIV');
            localStorage = {getItem: stub};
        });

        it('should set offset of html correctly', function() {
            stub.withArgs(procDefId).returns('{"a": {"b": {"top": "5px"}}}');
            stub.onSecondCall(procDefId).returns(null);
            util.getOffset(html, localStorage, procDefId, "a", "b");

            expect(html.style.top).to.eql('5px');
            expect(html.style.left).to.eql('');
        });
        it('should not set offset in case of wrong input', function() {
            util.getOffset(html, localStorage, procDefId, "a", "b");
            expect(html.style.top).to.eql('');
            stub.withArgs(procDefId).returns("{}");
            util.getOffset(html, localStorage, procDefId, "a", "b");
            expect(html.style.top).to.eql('');
            stub.withArgs(procDefId).returns('{"a": {}}');
            util.getOffset(html, localStorage, procDefId, "a", "b");
            expect(html.style.top).to.eql('');
        });
    });

    describe('setOffset tests', function() {
        var procDefId = "test", localStorage;
        var stub, spy;

        beforeEach(function() {
            stub = sinon.stub();
            spy = sinon.spy();
            localStorage = {getItem: stub, setItem: spy};
            stub.withArgs(procDefId).returns('{"a": {"b": {"top": "1px", "left": "2px"}}}');
            util.setOffset(localStorage, procDefId, "a", "b", "100px", "-20px");
        });

        it('should call setItem once with procDefId', function() {
            expect(spy.callCount).to.eql(1);
            expect(spy.args[0][0]).to.eql(procDefId);
        });
        it('should set correct offset for activity a and overlay b', function() {
            var out = JSON.parse(spy.args[0][1]);
            expect(out['a']['b']).to.exist;
            expect(out['a']['b']['top']).to.eql("100px");
            expect(out['a']['b']['left']).to.eql("-20px");
        });
        it('should handle when localStorage is uninitialized', function() {
            stub.withArgs(procDefId).returns(undefined);
            util.setOffset(localStorage, procDefId, "a", "b", "100px", "-20px");
            expect(JSON.parse(spy.args[1][1])['a']['b']).to.exist;
            stub.withArgs(procDefId).returns('{}');
            util.setOffset(localStorage, procDefId, "a", "b", "100px", "-20px");
            expect(JSON.parse(spy.args[1][1])['a']['b']).to.exist;
        })
    });

    describe('addDraggableFunctionality tests', function() {
        var html, g = document.createElement('G');
        g.setAttribute('data-element-id', '1');
        document.body.appendChild(g);
        var spy1, spy2;

        beforeEach(function() {
            spy1 = sinon.spy();
            spy2 = sinon.spy();
            html = document.createElement('DIV');

            jQuery.fn.extend({draggable: spy1});
        });
        afterEach(function() {
            spy1.args[0][0].stop();
        });

        it('should make parent draggable', function() {
            util.addDraggableFunctionality(1, html, {zoom: sinon.spy()}, true, spy2);
            spy1.args[0][0].start({clientX: 1, clientY: 2});
            expect(html.classList.contains("djs-draggable"));
            expect(spy1.called).to.eql(true);
        });
        it('should highlight the activity', function() {
            util.addDraggableFunctionality(1, html, {zoom: sinon.spy()}, true, spy2);
            spy1.args[0][0].start({clientX: 1, clientY: 2});
            spy1.args[0][0].drag({clientX: 10, clientY: 20}, {originalPosition: {left: 1, top: 2}});
            expect(g.className).to.contain("highlight");
        });
        it('should no longer', function() {
            util.addDraggableFunctionality(1, html, undefined, false, spy2);
            spy1.args[0][0].start({clientX: 1, clientY: 2});
            spy1.args[0][0].drag({clientX: 10, clientY: 20}, {originalPosition: {left: 1, top: 2}});
            expect(g.className).to.not.contain("highlight");
        });
    });

    describe('clearOverlays tests', function() {
        var spy, overlays;
        var overlayIds = {'a': [1], 'b': [-2], 'c': [3]};

        beforeEach(function() {
            spy = sinon.spy();
            overlays = {remove: spy};

            util.clearOverlays(overlays, overlayIds['a']);
            util.clearOverlays(overlays, overlayIds['b']);
        });

        it('should call remove for all ids', function() {
            expect(spy.calledWith(1)).to.eql(true);
            expect(spy.calledWith(-2)).to.eql(true);
        });
        it('should not call remove if overlayIds is empty', function() {
            var prevCalls = spy.callCount;
            util.clearOverlays(overlays, undefined);
            expect(spy.callCount).to.eql(prevCalls);
        });
        it('should return overlayIds empty', function() {
            expect(overlayIds['a']).to.be.empty;
            expect(overlayIds['b']).to.be.empty;
            expect(overlayIds['c']).to.be.not.empty;
        });
    });
});