var assert = require('assert');

describe('Inline CSS', function () {
    it('should correctly inline it', function(done) {
        testTemplate("css.style.html", {}, function(err, $, text) {
            if (err) return done(err);

            assert.equal($("a").css("color"), "red")
            done();
        });
    });

    it('should correctly inline it from external file', function(done) {
        testTemplate("css.external.html", {}, function(err, $, text) {
            if (err) return done(err);

            assert.equal($("a").css("color"), "red")
            done();
        });
    });
});
