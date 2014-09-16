var _ = require("lodash");
var juiceDocument = require("juice2").juiceDocument;
var path = require("path");
var jsdom = require("jsdom");
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

            // create the dom instance
            that.createJsDomInstance(html, function(err, document) {
                if (err) return cb(err);
                if (options.urlRewrite) that.rewriteUrls(document, options.urlRewrite);

                var fileUrl = "file://" + path.resolve(process.cwd(), path.join(that.options.root, templateName));

                options.juice = options.juice || {};
                options.juice.url = fileUrl;

                juiceDocument(document, options.juice, function(err) {
                    var tryCleanup = function () {
                        try {
                            document.parentWindow.close();
                        } catch (cleanupErr) {}
                        try {
                            document.close();
                        } catch (cleanupErr) {}
                    };

                    if (err) {
                        // free the associated memory
                        // with lazily created parentWindow
                        tryCleanup();
                        cb(err);
                    } else {
                        var inner = document.innerHTML;
                        tryCleanup();

                        that.generateText(options, options.context, inner, function(err, text) {
                            if (err) return cb(err);

                            cb(null, inner, text);
                        });
                    }
                });
            });
        });
    });
}

SwigEmails.prototype.rewriteUrls = function(document, rewrite, cb) {
    var anchorList = document.getElementsByTagName("a");
    for (var i = 0; i < anchorList.length; ++i) {
        var anchor = anchorList[i];
        for (var j = 0; j < anchor.attributes.length; ++j) {
            var attr = anchor.attributes[j];
            if (attr.name.toLowerCase() === 'href') {
                anchor.setAttribute(attr.name, rewrite(attr.value));
                break;
            }
        }
    }
};

SwigEmails.prototype.createJsDomInstance = function(content, cb) {
    // hack to force jsdom to see this argument as html content, not a url
    // or a filename. https://github.com/tmpvar/jsdom/issues/554
    var html = content + "\n";
    var options = {
        features: {
            QuerySelector: ['1.0'],
            FetchExternalResources: false,
            ProcessExternalResources: false,
            MutationEvents: false
        }
    };

    try {
        cb(null, jsdom.html(html, null, options));
    } catch (err) {
        cb(err);
    }
};

SwigEmails.prototype.generateText = function(options, context, html, cb) {
    if (options.hasOwnProperty('text') && !options.text) return cb(null, null);

    var fileUrl = options.juice.url;
    var txtName = path.basename(fileUrl, path.extname(fileUrl)) + ".txt";
    var txtUrl = path.join(path.dirname(options.juice.url.slice(7)), txtName);

    fs.exists(txtUrl, function(exists) {
        if (exists) {
            compileTemplate(txtName, function(err, template) {
                renderTemplate(template, context, cb);
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
