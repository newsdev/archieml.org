#!/usr/bin/env node

(function() {

  var fs = require('fs'),
      archieml = require('../archieml.js'),
      queue = require('queue-async');

  var q = queue(1),
      tests = {},
      shared_dir = 'test/1.0/',
      combined = '';

  var replacements = [
    new RegExp('^(\\s*)([A-Za-z0-9-_\.]+)([ \t\r]*:)', 'gm'),
    new RegExp('^(\\s*(?:\\[|\\{)[ \t\r]*)((?:\\.[A-Za-z0-9-_\.]+)|(?:[A-Za-z0-9-_][A-Za-z0-9-_\.]+))([ \t\r]*(?:\\]|\\}))', 'gm')
    // new RegExp('^(\\s*(?:\\[|\\{)[ \t\r]*)([A-Za-z0-9-_\.]+)([ \t\r]*(?:\\]|\\}))', 'g')
  ];

  var deferWrapper = function(dir, cb) {
    return fs.readFile(dir, function(error, data) {
      cb(error, [data, dir]);
    });
  };

  fs.readdir(shared_dir, function (err, files) {
    files.forEach(function(file) {
      q.defer(deferWrapper, shared_dir + file);
    });

    q.awaitAll(function(error, results) {
      results.forEach(function(result){
        var data = result[0];
        var match = result[1].match(/\/(\w+\.\d+).aml$/);
        if (!match) return;

        file = match[1];

        var category = file.split('.')[0];
        var idx      = parseInt(file.split('.')[1]);

        if (category.match(/all|ignore/)) return;

        tests[category] = tests[category] || {};
        tests[category][idx] = data;
      });

      var counter = 0;
      Object.keys(tests).forEach(function(slug) {
        Object.keys(tests[slug]).forEach(function(idx){
          counter++;

          var prefix = ('00000' + counter).slice(-5);
          var aml = String(tests[slug][idx]);
          aml = aml.replace(/(^|\n)(test|result):.*?($|\n)/mg, '');

          replacements.forEach(function(replacement) {
            aml = aml.replace(replacement, "$1" + prefix + "$2$3");
          });

          combined += ['=== Test ' + slug + '.' + idx, aml, '===', ':endskip', "[]\n[]\n[]\n[]\n{}\n{}\n{}\n{}\n{}", ''].join("\n");
        });
      });

      combined = combined.replace(/\n+/gm, "\n");
      console.log(combined)

      var parsed = archieml.load(combined);
      var all = "test: combined test\nresult: " + JSON.stringify(parsed) + "\n\n" + combined;
      // console.log(JSON.stringify(parsed, null, 2))

      fs.writeFile(shared_dir + '/all.0.aml', all);
    });
  });
}());
