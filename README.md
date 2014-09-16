swig-emails
==========

Generate HTML emails using swig templates.


## Features

 * Uses [swig](https://github.com/paularmstrong/swig/), which supports [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance). You can provide yoru own swig instance.
 * Uses [juice](https://github.com/LearnBoost/juice), which takes an HTML file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * URL rewrite support - you can provide a `urlRewrite` option to rewrite your links.
 * Text emails - for a template name passed into render(), if a file exists with the same name but a .txt extension it will be rendered separately. If the .txt file does not exist, html-to-text will auto-generate a text version of the html file. This can be disabled with the option `text: false`.

## Usage

```js
var path = require('path');
var SwigEmails = require("swig-emails");

var emails = new SwigEmails({
    root: path.join(__dirname, "templates")
});

emails.render('meatball-sandwich.html', { context: { meatballCount: 9001 } }, function(err, html, text) {
    // send html/text email
});
```

