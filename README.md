swig-emails
==========

[![Build Status](https://travis-ci.org/SamyPesse/tpl-emails.png?branch=master)](https://travis-ci.org/SamyPesse/tpl-emails)
[![NPM version](https://badge.fury.io/js/tpl-emails.svg)](http://badge.fury.io/js/tpl-emails)


Generate HTML emails using swig templates. Inspired by [andrewrk/swig-email-templates](https://github.com/andrewrk/swig-email-templates).


## Features

 * Uses [nunjucks](http://mozilla.github.io/nunjucks/), which supports [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance). You can provide your render method.
 * Uses [juice](https://github.com/LearnBoost/juice), which takes an HTML file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * URL rewrite support - you can provide a `urlRewrite` option to rewrite your links.
 * Text emails - for a template name passed into render(), if a file exists with the same name but a .txt extension it will be rendered separately. If the .txt file does not exist, html-to-text will auto-generate a text version of the html file. This can be disabled with the option `text: false`.

## Usage

```js
var path = require('path');
var TplEmails = require("tpl-emails");

var emails = new TplEmails({
    root: path.join(__dirname, "templates")
});

emails.render('meatball-sandwich.html', { context: { meatballCount: 9001 } }, function(err, html, text) {
    // send html/text email
});
```

## Use your own templating engine

For example to use underscore/lodash templating engine:

```js
var fs = require("fs");
var _ = require("lodash");
var TplEmails = require("tpl-emails");

var emails = new TplEmails({
    render: function(tplname, context, callback) {
        var content = fs.readFileSync("templates/"+tplname);
        callback(null, _.template(content, context));
    }
});

emails.render('meatball-sandwich.html', { context: { meatballCount: 9001 } }, function(err, html, text) {
    // send html/text email
});
```
