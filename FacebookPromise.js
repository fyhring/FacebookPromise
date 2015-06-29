
var FacebookPromise = function(app_id, api_version) {

    if (typeof app_id == typeof undefined) {
        throw new Error('No APP ID was sat.');
    }

    if (typeof api_version == typeof undefined) {
        api_version = '2.3';
    }

    this.app_id = app_id;
    this.api_version = api_version;

    this.status = null;
    this.accessToken = null;
    this.initialized = false;

    this.readyEventCallback = function(){};


    this.init();
};


FacebookPromise.prototype.init = function()
{
    window.fbAsyncInit = jQuery.proxy(this.asyncInit, this);
};


FacebookPromise.prototype.asyncInit = function()
{
    this.initialized = true;

    FB.init({
        appId      : this.app_id,
        xfbml      : true,
        version    : 'v'+ this.api_version
    });

    FB.Event.subscribe('auth.authResponseChange', jQuery.proxy(this.setAuthData, this));
    FB.Event.subscribe('auth.statusChange', jQuery.proxy(this.setStatus, this));

    FB.getLoginStatus(jQuery.proxy(function(resp)
    {
        this.setStatus(resp);
        this.readyEventCallback();
    }, this));
};


FacebookPromise.prototype.ready = function(callback)
{
    this.readyEventCallback = callback;
};


FacebookPromise.prototype.setStatus = function(resp)
{
    if (typeof resp.status == typeof undefined) return;
    this.status = resp.status;
};

FacebookPromise.prototype.setAuthData = function(resp)
{
    this.authData = resp.authResponse;
    this.accessToken = resp.authResponse.accessToken;
};


FacebookPromise.prototype.login = function(options)
{
    options = options || { scope: 'public_profile,email' };
    var def = jQuery.Deferred();

    FB.login(function(resp)
    {
        if (!resp || resp.error || !resp.status) {
            return def.reject(resp.error);
        }
        def.resolve(resp);
    }, options);

    return def;
};


FacebookPromise.prototype.getLoginStatus = function()
{
    return this.status;
};


FacebookPromise.prototype.me = function(props, method)
{
    if (typeof method != typeof undefined) {
        method = '/'+ method;
    }

    if (typeof props == typeof undefined) {
        props = {};
    }

    var def = jQuery.Deferred();

    FB.api('/me', props, function(resp)
    {
        if (!resp || resp.error) {
            return def.reject(resp.error);
        }
        def.resolve(resp);
    });

    return def;
};


var FacebookStatus = {
    CONNECTED : 'connected',
    NOT_CONNECTED : 'not_authorized',
    UNKNOWN : 'unknown'
};
