var _ = require("lodash");
var juice = require("juice");
var path = require("path");
var cheerio = require('cheerio');
var fs = require('fs');
var htmlToText = require("html-to-text");

var SwigEmails = function(options) {
    this.options = _.defaults(options || {}, {
        root: "./",
        swig: require("swig"),
        urlRewrite: null,
        juice: {}
    });
};

SwigEmails.prototype.render = function(templateName, options, cb) {
    var that = this;
    options = _.extend({
        context: {}
    }, that.options, options || {});

    // compile file into swig template
    that.compileTemplate(templateName, function(err, template) {
        if (err) return cb(err);

        // render template with context
        that.renderTemplate(template, options.context, function(err, html) {
            if (err) return cb(err);

            var $ = cheerio.load(html);
            var fileUrl = "file://" + path.resolve(process.cwd(), path.join(that.options.root, templateName));

            if (options.urlRewrite) that.rewriteUrls($, options.urlRewrite);

            options.juice = options.juice || {};
            options.juice.url = fileUrl;

            juice.juiceContent($.html(), options.juice, function(err, htmlInlined) {
                if (err) return cb(err);

                that.generateText(options, options.context, htmlInlined, function(err, text) {
                    if (err) return cb(err);

                    cb(null, htmlInlined, text);
                });
            });
        });
    });
}

SwigEmails.prototype.rewriteUrls = function($, rewrite, cb) {
    $("a").each(function() {
        var url = $(this).attr("href");
        $(this).attr("href", rewrite(url))
    });
};

SwigEmails.prototype.generateText = function(options, context, html, cb) {
    if (options.hasOwnProperty('text') && !options.text) return cb(null, null);

    var that = this;
    var fileUrl = options.juice.url;
    var txtName = path.basename(fileUrl, path.extname(fileUrl)) + ".txt";
    var txtUrl = path.join(path.dirname(options.juice.url.slice(7)), txtName);

    fs.exists(txtUrl, function(exists) {
        if (exists) {
            that.compileTemplate(txtName, function(err, template) {
                if (err) return cb(err);

                that.renderTemplate(template, context, cb);
            });
        } else {
            cb(null, htmlToText.fromString(html));
        }
    });
};

SwigEmails.prototype.compileTemplate = function(name, cb) {
    try {
        cb(null, this.options.swig.compileFile(path.join(this.options.root, name)));
    } catch (err) {
        cb(err);
    }
};

SwigEmails.prototype.renderTemplate = function(template, context, cb) {
    try {
        cb(null, template(context));
    } catch (err) {
        cb(err);
    }
};


module.exports = SwigEmails;
