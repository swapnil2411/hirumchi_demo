/**
 * Cookie Notice JS
 * @author Alessandro Benoit
 */
(function () {

    "use strict";

    /**
     * Store current instance
     */
    var instance,
        originPaddingTop;

    /**
     * Defaults values
     * @type object
     */
    var defaults = {
        messageLocales: {

            en: '<b>We use cookies to make our website work more efficiently, to provide you with more personalised services or advertising to you, and to analyse traffic on our website.</b><br/> For more information on how we use cookies and how to manage cookies on your device, please read our Cookies Policy. Please click below to accept the use of our cookies.<br/><br/>',
        },

        cookieNoticePosition: 'bottom',

        learnMoreLinkEnabled: true,

        learnMoreLinkHref: '/cookie-banner-information.html',

        learnMoreLinkText: {
            en: 'Cookie Policy',

        },

        buttonLocales: {
            en: 'Accept Cookies'
        },

        expiresIn: 30,

        fontFamily: 'Arial, sans-serif',

        buttonBgColor: '#00aeef',
        buttonTextColor: '#fff',
        noticeBgColor: '#000',
        noticeTextColor: '#fff',
        linkColor: '#009fdd',
        linkBgColor: '#000',
        linkTarget: '_blank',
        debug: false
    };

    /**
     * Initialize cookie notice on DOMContentLoaded
     * if not already initialized with alt params
     */
    document.addEventListener('DOMContentLoaded', function () {
        if (!instance) {
            new cookieNoticeJS();
        }
    });

    /**
     * Constructor
     * @constructor
     */
    window.cookieNoticeJS = function () {

        // If an instance is already set stop here
        if (instance !== undefined) {
            return;
        }

        // Set current instance
        instance = this;

        // If cookies are not supported or notice cookie is already set
        if (getNoticeCookie()) {
            return;
        }

        // 'data-' attribute - data-cookie-notice='{ "key": "value", ... }'
        var elemCfg = document.querySelector('script[ data-cookie-notice ]');
        var config;

        try {
            config = elemCfg ? JSON.parse(elemCfg.getAttribute('data-cookie-notice')) : {};
            // TODO apply settings coming from data attribute and keep defaults if not overwritten -> 1.2.x
        } catch (ex) {
            console.error('data-cookie-notice JSON error:', elemCfg, ex);
            config = {};
        }

        // Extend default params
        var params = extendDefaults(defaults, arguments[0] || config || {});

        if (params.debug) {
            console.warn('cookie-notice:', params);
        }

        // Get current locale for notice text
        var noticeText = getStringForCurrentLocale(params.messageLocales);

        // Create notice
        var notice = createNotice(noticeText, params.noticeBgColor, params.noticeTextColor, params.fontFamily, params.cookieNoticePosition);

        var learnMoreLink;

        if (params.learnMoreLinkEnabled) {
            var learnMoreLinkText = getStringForCurrentLocale(params.learnMoreLinkText);

            learnMoreLink = createLearnMoreLink(learnMoreLinkText, params.learnMoreLinkHref, params.linkTarget, params.linkColor, params.linkBgColor);
        }

        // Get current locale for button text
        var buttonText = getStringForCurrentLocale(params.buttonLocales);

        // Create dismiss button
        var dismissButton = createDismissButton(buttonText, params.buttonBgColor, params.buttonTextColor, params.fontFamily);

        // Dismiss button click event
        dismissButton.addEventListener('click', function (e) {
            e.preventDefault();
            setDismissNoticeCookie(parseInt(params.expiresIn + "", 10) * 60 * 1000 * 60 * 24);
            fadeElementOut(notice);
        });

        // Append notice to the DOM
        var noticeDomElement = document.body.appendChild(notice);

        if (!!learnMoreLink) {
            noticeDomElement.appendChild(learnMoreLink);
        }

        noticeDomElement.appendChild(dismissButton);

    };

    /**
     * Get the string for the current locale
     * and fallback to "en" if none provided
     * @param locales
     * @returns {*}
     */
    function getStringForCurrentLocale(locales) {
        var locale = (navigator.userLanguage || navigator.language).substr(0, 2);
        return (locales[locale]) ? locales[locale] : locales['en'];
    }

    /**
     * Test if notice cookie is there
     * @returns {boolean}
     */
    function getNoticeCookie() {
        return document.cookie.indexOf('cookie_notice') != -1;
    }

    /**
     * Create notice
     * @param message
     * @param bgColor
     * @param textColor
     * @param position
     * @param fontFamily
     * @returns {HTMLElement}
     */
    function createNotice(message, bgColor, textColor, fontFamily, position) {
        var notice = document.createElement('div'),
            noticeStyle = notice.style,
            lineHeight = 28,
            paddingBottomTop = 10,
            fontSize = 12,
            noticeHeight = lineHeight + paddingBottomTop * 2;

        notice.innerHTML = message + '&nbsp;';
        notice.setAttribute('id', 'cookieNotice');
        notice.setAttribute('data-test-section', 'cookie-notice');
        notice.setAttribute('data-test-transitioning', 'false');


        noticeStyle.position = 'fixed';

        if (position === 'top') {
            var bodyDOMElement = document.querySelector('body');

            originPaddingTop = bodyDOMElement.style.paddingTop;

            noticeStyle.top = '0';
            bodyDOMElement.style.paddingTop = noticeHeight + 'px';
        } else {
            noticeStyle.bottom = '0';
        }


        noticeStyle.left = '0';
        noticeStyle.right = '0';
        noticeStyle.background = bgColor;
        noticeStyle.color = textColor;
        noticeStyle["z-index"] = '999';
        noticeStyle.padding = paddingBottomTop + 'px 5px';
        noticeStyle["text-align"] = 'center';
        noticeStyle["font-size"] = '14px';
        noticeStyle["line-height"] = '20px';

        if (!!fontFamily) {
            noticeStyle['fontFamily'] = fontFamily;
        }

        return notice;
    }

    /**
     * Create dismiss button
     * @param message
     * @param buttonColor
     * @param buttonTextColor
     * @returns {HTMLElement}
     */
    function createDismissButton(message, buttonColor, buttonTextColor, buttonTextFontFamily) {

        var dismissButton = document.createElement('span'),
            dismissButtonStyle = dismissButton.style;

        // Dismiss button
        dismissButton.href = '#';
        dismissButton.innerHTML = message;

        dismissButton.setAttribute('role', 'button');
        dismissButton.className = 'confirm';

        dismissButton.setAttribute('data-test-action', 'dismiss-cookie-notice');


        // Dismiss button style
        dismissButtonStyle.background = buttonColor;
        dismissButtonStyle.color = buttonTextColor;
        dismissButtonStyle['text-decoration'] = 'none';
        dismissButtonStyle['cursor'] = 'pointer';
        dismissButtonStyle.display = 'inline-block';
        dismissButtonStyle.padding = '5px 15px';
        dismissButtonStyle.margin = '0 0 10px 10px';

        if (!!buttonTextFontFamily) {
            dismissButtonStyle.fontFamily = buttonTextFontFamily;

        }

        return dismissButton;

    }

    /**
     * Create the learn more link
     *
     * @param learnMoreLinkText
     * @param learnMoreLinkHref
     * @param linkColor
     * @returns {HTMLElement}
     */
    function createLearnMoreLink(learnMoreLinkText, learnMoreLinkHref, linkTarget, linkColor, linkBgColor) {

        var learnMoreLink = document.createElement('a'),
            learnMoreLinkStyle = learnMoreLink.style;

        learnMoreLink.href = learnMoreLinkHref;
        learnMoreLink.textContent = learnMoreLinkText;
        learnMoreLink.title = learnMoreLinkText;
        learnMoreLink.target = linkTarget;
        learnMoreLink.className = 'learn-more';
        learnMoreLink.setAttribute('data-test-action', 'learn-more-link');

        learnMoreLinkStyle.color = linkColor;
        learnMoreLinkStyle.backgroundColor = 'transparent';
        learnMoreLinkStyle['text-decoration'] = 'underline';
        learnMoreLinkStyle.display = 'inline';

        return learnMoreLink;

    }

    /**
     * Set sismiss notice cookie
     * @param expireIn
     */
    function setDismissNoticeCookie(expireIn) {
        var now = new Date(),
            cookieExpire = new Date();

        cookieExpire.setTime(now.getTime() + expireIn);
        document.cookie = "cookie_notice=1; expires=" + cookieExpire.toUTCString() + "; path=/;";
    }

    /**
     * Fade a given element out
     * @param element
     */
    function fadeElementOut(element) {
        element.style.opacity = 1;

        element.setAttribute('data-test-transitioning', 'true');

        (function fade() {
            if ((element.style.opacity -= .1) < 0.01) {

                if (originPaddingTop !== undefined) {
                    var bodyDOMElement = document.querySelector('body');
                    bodyDOMElement.style.paddingTop = originPaddingTop;
                }

                document.body.removeChild(element);
            } else {
                setTimeout(fade, 40);
            }
        })();
    }

    /**
     * Utility method to extend defaults with user options
     * @param source
     * @param properties
     * @returns {*}
     */
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                if (typeof source[property] === 'object') {
                    source[property] = extendDefaults(source[property], properties[property]);
                } else {
                    source[property] = properties[property];
                }
            }
        }
        return source;
    }

    /* test-code */
    cookieNoticeJS.extendDefaults = extendDefaults;
    cookieNoticeJS.clearInstance = function () {
        instance = undefined;
    };
    /* end-test-code */

}());
