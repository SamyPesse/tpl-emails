var assert = require('assert');

describe('Text', function () {
    it('should correctly gen text version', function(done) {
        testTemplate("text.link.html", {}, function(err, $, text) {
            if (err) return done(err);

            assert.equal(text, "test [#]");
            done();
        });
    });
});
