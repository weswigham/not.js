'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    notjs: {
      options: {
        scope: {
          title: 'Not.js - Template DSL',
          scripts: [],
          stylesheets: [],
          navpages: [
            {name: 'Documentation', link: 'docs.html'},
            {name: 'Source', link: 'https://github.com/weswigham/not.js'}
          ]
        }
      },
      files: {
        expand: true,
        cwd: './_templates',
        src: ['**/*.not.js'],
        dest: '.',
        ext: '.html',
        extDot: 'first',
        filter: function(filepath) {
          return (grunt.file.isFile(filepath) && (!grunt.file.isMatch('**/_templates/_*/**/*.not.js', filepath))); //Ignore the partials subdir
        }
      }
    },
    watch: {
      templates: {
        files: ['./_templates/**/*.not.js'],
        tasks: ['build']
      }
    }
  });

  grunt.loadNpmTasks('grunt-notjs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['notjs']);

  // By default, lint and run all tests.
  grunt.registerTask('harmonize', function() {
    //Re-emit the grunt-cli bin files with a --harmony flag
    
    var binpath = './node_modules/.bin/'
    
    grunt.file.write(binpath+'grunt', [
      '#!/bin/sh',
      'basedir=`dirname "$0"`',
      '',
      'case `uname` in',
      '    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;',
      'esac',
      '',
      'if [ -x "$basedir/node" ]; then',
      '  "$basedir/node" --harmony --harmony_proxies "$basedir/../grunt-cli/bin/grunt" "$@"',
      '  ret=$?',
      'else ',
      '  node --harmony --harmony_proxies "$basedir/../grunt-cli/bin/grunt" "$@"',
      '  ret=$?',
      'fi',
      'exit $ret    '
      ].join(grunt.util.linefeed)
    );
    
    grunt.file.write(binpath+'grunt.cmd',[
      '@IF EXIST "%~dp0\\node.exe" (',
      '  "%~dp0\\node.exe" --harmony --harmony_proxies "%~dp0\\..\\grunt-cli\\bin\\grunt" %*',
      ') ELSE (',
      '  node --harmony --harmony_proxies "%~dp0\\..\\grunt-cli\\bin\\grunt" %*',
      ')'
      ].join(grunt.util.linefeed)
    );
  });
};
