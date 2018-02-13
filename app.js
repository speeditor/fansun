// ==UserScript==
// @name         FANSUN powered by Darkness
// @namespace    http://community.wikia.com/Special:MyPage
// @version      0.9b
// @description  Dark theme for official FANDOM wikis.
// @author       http://dev.wikia.com/wiki/User:Speedit
// @run-at       document-start
// @license      CC BY-SA 3.0; http://creativecommons.org/licenses/by-sa/3.0/
// @include      /.*(community|portability|vstf|dev|api|communitycouncil)\.wikia\.com\/wiki\/.*/
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
        patterns: [
            'amd',
            'mw,nirvana'
        ],
        util: function(M) {
            var N = [].slice.call(M.addedNodes),
                toScripts = function(m) {
                    if (m.nodeName.toLowerCase() !== 'script') {
                        return false;
                    } else {
                        var r = m.getAttribute('src') || '',
                            matchScript = function(s) {
                                return (r.indexOf(s) > -1);
                            },
                            isScript = function() {
                                return FANSUN.mw.patterns.some(matchScript);
                            };
                        return isScript();
                    }
                },
                S = N.filter(toScripts);
            FANSUN.mw.init(S);
        },
        init: function(S) {
            if (S.length === 0) { return; }
            mw.loader.using('mediawiki.util', function() {
                mw.config.set('wgSassParams', FANSUN.sass.params);
            });
            $.when(mw.loader.using('user'), $.ready).then(function() {
                FANSUN.util.unboot('ext');
                var styles = {
                    'mode': 'articles',
                    'articles': 'u:speedit:mediawiki:fansun.css',
                    'only': 'styles',
                    'debug': true,
                };
                importStylesheetURI('/load.php' + FANSUN.util.param(styles));
            });
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
        string: '',
        patterns: [
            '/sasses/background-dynamic',
            '/sass/background-dynamic'
        ],
        init: function(n) {
            if (n.nodeName.toLowerCase() !== 'link') { return; }
            var h = n.getAttribute('href') || '',
                matchSass = function(s) {
                    return (h.indexOf(s) > -1);
                },
                isSass = function(n) {
                    return FANSUN.sass.patterns.some(matchSass);
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
                                return FANSUN.sass.patterns.some(matchSass);
                            };
                        return isSass();
                    }
                },
                S = N.filter(toStyles);
            S.forEach(FANSUN.sass.style);
        },
        style: function(s) {
            var sassUrlString = FANSUN.sass.string.length > 0 ?
                    FANSUN.sass.string :
                    s.getAttribute('href').split('/')[6],
                FANSUNSassString = FANSUN.util.param(FANSUN.sass.params);
            // window.wgSassParams = FANSUNSassParams;
            FANSUN.sass.string = FANSUN.sass.string.length > 0 ? FANSUN.sass.string : sassUrlString;
            var url = s.getAttribute('href'),
                FANSUNURLArray = s.getAttribute('href').split('/');
            FANSUNURLArray.splice(6, 1, FANSUNSassString);
            var FANSUNURL = FANSUNURLArray.join('/');
            s.setAttribute('href', FANSUNURL);
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
                M.forEach(FANSUN.mw.util);
            }
        }
    }
};
// Script initialiser
FANSUN.util.boot('doc', document.documentElement);
