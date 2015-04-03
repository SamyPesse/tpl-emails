var _ = require("lodash");
var juice = require("juice");
var path = require("path");
var cheerio = require('cheerio');
var fs = require('fs');
var htmlToText = require("html-to-text");

var TplEmails = function(options) {
    var that = this;

    this.options = _.defaults(options || {}, {
        root: "./",
        render: function(tplpath, context, callback) {
            var nunjucks = require("nunjucks");
            var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(that.options.root));

            env.render(tplpath, context, callback);
        },
        urlRewrite: null,
        juice: {}
    });
};

TplEmails.prototype.render = function(templateName, options, cb) {
    var that = this;
    options = _.extend({
        context: {}
    }, that.options, options || {});

    // render template with context
    that.renderTemplate(templateName, options.context, function(err, html) {
        if (err) return cb(err);

        var $ = cheerio.load(html);
        var fileUrl = "file://" + path.resolve(process.cwd(), path.join(that.options.root, templateName));

        if (options.urlRewrite) that.rewriteUrls($, options.urlRewrite);

        options.url = fileUrl;
        options.juice = options.juice || {};
        options.juice.webResources = options.juice.webResources || {};
        options.juice.webResources.relativeTo = options.juice.webResources.relativeTo || path.dirname(path.relative(process.cwd(), fileUrl));

        juice.juiceResources($.html(), options.juice, function(err, htmlInlined) {
            if (err) return cb(err);

            that.generateText(options, options.context, htmlInlined, function(err, text) {
                if (err) return cb(err);

                cb(null, htmlInlined, text);
            });
        });
    });
}

TplEmails.prototype.rewriteUrls = function($, rewrite, cb) {
    $("a").each(function() {
        var url = $(this).attr("href");
        $(this).attr("href", rewrite(url))
    });
};

TplEmails.prototype.generateText = function(options, context, html, cb) {
    if (options.hasOwnProperty('text') && !options.text) return cb(null, null);

    var that = this;
    var fileUrl = options.url;
    var txtName = path.basename(fileUrl, path.extname(fileUrl)) + ".txt";
    var txtUrl = path.join(path.dirname(fileUrl.slice(7)), txtName);

    fs.exists(txtUrl, function(exists) {
        if (exists) {
            that.renderTemplate(txtName, context, cb);
        } else {
            cb(null, htmlToText.fromString(html));
        }
    });
};

TplEmails.prototype.renderTemplate = function(template, context, cb) {
    try {
        this.options.render(template, context, cb);
    } catch (err) {
        cb(err);
    }
};


module.exports = TplEmails;
