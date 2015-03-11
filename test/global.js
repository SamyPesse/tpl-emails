var path = require("path");
var TplEmails = require("../lib");
var cheerio = require('cheerio');

var options = {
    root: path.join(__dirname, "templates")
};
global.tplEmails = new TplEmails(options);


global.testTemplate = function(tpl, opts, done) {
    tplEmails.render(tpl, opts, function(err, html, text) {
        if (err) return done(err);

        done(null, cheerio.load(html), text);
    });
};