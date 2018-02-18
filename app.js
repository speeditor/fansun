// ==UserScript==
// @name         FANSUN powered by Darkness
// @namespace    http://community.wikia.com/Special:MyPage
// @version      1.0b
// @description  Dark theme for official FANDOM wikis.
// @author       http://dev.wikia.com/wiki/User:Speedit
// @run-at       document-start
// @license      CC BY-SA 3.0; http://creativecommons.org/licenses/by-sa/3.0/
// @include      /.*(community|portability|vstf|dev|api|communitycouncil|connect)\.wikia\.com\/(index.php|wiki\/).*/
// @grant        none
// ==/UserScript==
var FANSUN = {
    util: {
        param: function(o) {
            var s = '';
            Object.keys(o).forEach(function(k, i) {
                var p = '';
                if (i !== 0) {
                    p += '&';
                }
                s += k + '=' + o[k];
                s += p;
            });
            return encodeURIComponent(s);
        },
        boot: function(m, target) {
            if (FANSUN.modules[m].state) { return; }
            FANSUN.modules[m].observer = new MutationObserver(FANSUN.modules[m].fn);
            FANSUN.modules[m].observer.observe(target, FANSUN.modules[m].config);
            FANSUN.modules[m].state = true;
        },
        unboot: function(m) {
            if (!FANSUN.modules[m].state) { return; }
            FANSUN.modules[m].observer.disconnect();
            FANSUN.modules[m].state = false;
        }
    },
    mw: {
        pattern: 'ResourceLoaderDynamicStyles',
        util: function(M) {
            var N = [].slice.call(M.addedNodes),
                toMarker = function(m) {
                    if (m.nodeName.toLowerCase() !== 'meta') {
                        return false;
                    } else {
                        var r = m.getAttribute('name') || '',
                            matchMarker = function(s) {
                                return (r === s);
                            },
                            isMarker = function() {
                                return matchMarker(FANSUN.mw.pattern);
                            };
                        return isMarker();
                    }
                },
                S = N.filter(toMarker);
            FANSUN.mw.init(S);
        },
        init: function(S) {
            if (S.length === 0) { return; }
            var modules = {
                    'config': {
                        fn: function() {
                            window.wgSassParams = FANSUN.sass.params;
                            $.extend(sassParams, FANSUN.sass.params);
                            if (window.wgIsEditPage) {
                                window.wgIsDarkTheme = true;
                            }
                        },
                        d: mw.loader.using(['jquery'])
                    },
                    'import': {
                        fn: function() {
                            var styles = {
                                'mode': 'articles',
                                'articles': 'u:speedit:MediaWiki:Fansun.css',
                                'only': 'styles',
                                'debug': true,
                            };
                            importStylesheetURI('/load.php?' + $.param(styles));
                        },
                        d: mw.loader.using(['mediawiki.legacy.wikibits', 'jquery'])
                    },
                    'unboot': {
                        fn: function() {
                            FANSUN.util.unboot('ext');
                        },
                        d: $.ready
                    }
                },
                bootloader = function(moduleName, m) {
                     $.when(modules[moduleName].d).then(modules[moduleName].fn);
                };
            $.each(modules, bootloader);
        }
    },
    sass: {
        params: {
            "background-dynamic": "false",
            "background-image": "",
            "background-image-height": "801",
            "background-image-width": "1700",
            "color-body": "#2b323b",
            "color-body-middle": "#2b323b",
            "color-buttons": "#00b7e0",
            "color-community-header": "#404a57",
            "color-header": "#404a57",
            "color-links": "#00c8e0",
            "color-page": "#39424d",
            "oasisTypography": 1,
            "page-opacity": "100",
            "widthType": 0
        },
        string: {
            '/sass': '',
            '/__load': ''
        },
        pattern: 'sass',
        init: function(n) {
            if (n.nodeName.toLowerCase() !== 'link') { return; }
            var h = n.getAttribute('href') || '',
                matchSass = function(s) {
                    return (h.indexOf(s) > -1 && h.indexOf('background-dynamic') > -1);
                },
                isSass = function(n) {
                    return matchSass(FANSUN.sass.pattern);
                };
            if (isSass()) {
                FANSUN.sass.style(n);
            }
        },
        util: function(M) {
            var N = [].slice.call(M.addedNodes),
                toStyles = function(m) {
                    if (m.nodeName.toLowerCase() !== 'link') {
                        return false;
                    } else {
                        var h = m.getAttribute('href') || '',
                            matchSass = function(s) {
                                return (h.indexOf(s) > -1);
                            },
                            isSass = function() {
                                return matchSass(FANSUN.sass.patterns);
                            };
                        return isSass();
                    }
                },
                S = N.filter(toStyles);
            S.forEach(FANSUN.sass.style);
        },
        style: function(s) {
            var url = s.getAttribute('href'),
                modeFn = {
                    '/sass': function(mode) {
                        if (url.indexOf(mode) === -1) { return; }
                        var FANSUNURLArray = url.split('/'),
                            sassUrlString = FANSUN.sass.string[mode].length > 0 ?
                                FANSUN.sass.string[mode] :
                                FANSUNURLArray[6],
                            FANSUNSassString = FANSUN.util.param(FANSUN.sass.params);
                        FANSUN.sass.string[mode] = FANSUN.sass.string.length > 0 ?
                            FANSUN.sass.string[mode] :
                            sassUrlString;
                        FANSUNURLArray.splice(6, 1, FANSUNSassString);
                        var FANSUNURL = FANSUNURLArray.join('/');
                        s.setAttribute('href', FANSUNURL);
                    },
                    '/__load': function(mode) {
                        if (url.indexOf(mode) === -1) { return; }
                        var FANSUNURLArray = url.split('/'),
                            sassWrapper = ['only%3Dstyles%26', '%26sass_wordmark-font'],
                            mwSassParams = {};
                        for (var k in FANSUN.sass.params) {
                            mwSassParams['sass_' + k] = FANSUN.sass.params[k];
                        }
                        var sassUrlRegExp = new RegExp(sassWrapper.join('|')),
                            sassUrlString = FANSUN.sass.string[mode].length > 0 ?
                                FANSUN.sass.string[mode] :
                                FANSUNURLArray[5],
                            FANSUNSassString = FANSUN.util.param(mwSassParams);
                        FANSUN.sass.string[mode] = FANSUN.sass.string.length > 0 ?
                            FANSUN.sass.string[mode] :
                            sassUrlString;
                        var sassUrlArray = sassUrlString.split(sassUrlRegExp);
                        sassUrlArray.splice(1, 1, sassWrapper[0], FANSUNSassString, sassWrapper[1]);
                        var FANSUNSassUrlString = sassUrlArray.join('');
                        FANSUNURLArray.splice(5, 1, FANSUNSassUrlString);
                        var FANSUNURL = FANSUNURLArray.join('/');
                        console.log(sassUrlArray);
                        s.setAttribute('href', FANSUNURL);
                    }
                },
                call = function(mode) {
                    modeFn[mode](mode);
                };
            Object.keys(modeFn).forEach(call);
        }
    },
    modules: {
        doc: {
            config: { childList: true },
            styles: [],
            fn: function() {
                if (document.head === null) { return; }
                FANSUN.util.unboot('doc');
                // document.head available
                // Default styling
                var style = {
                    el: document.createElement('style'),
                    attr: {
                        'type': 'text/css',
                        'media': 'all'
                    },
                    map: function(k) {
                        style.el.setAttribute(k, style.attr[k]);
                    }
                };
                Object.keys(style.attr).forEach(style.map);
                style.el.textContent = 'body { background: #2b323b; color: #d5d4d4; } a { color: #00c8e0 }';
                document.head.append(style.el);
                // Head styling iterator
                [].forEach.call(document.head.childNodes, FANSUN.sass.init);
                // Head bootloader
                FANSUN.util.boot('head', document.head);
            }
        },
        // Document head modification
        head: {
            config: { childList: true },
            fn: function(M) {
                M.forEach(FANSUN.mw.util);
                M.forEach(FANSUN.sass.util);
                FANSUN.util.boot('body', document.documentElement);
            }
        },
        // Document body availability
        body: {
            config: { childList: true },
            fn: function() {
                if (document.body === null) { return; }
                // Body styling iterator
                [].forEach.call(document.body.childNodes, FANSUN.sass.init);
                FANSUN.util.unboot('body');
                FANSUN.util.boot('ext', document.body);
                document.body.classList.add('oasis-dark-theme');
            }
        },
        // Extension functions
        ext: {
            config: { childList: true },
            fn: function(M) {
                M.forEach(FANSUN.sass.util);
            }
        }
    }
};
// Script initialiser
FANSUN.util.boot('doc', document.documentElement);
