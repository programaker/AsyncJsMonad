(function defAsync($) {
    'use strict';

    window.Async = {
        request: request,
        map: map,
        flatMap: flatMap,
        match: match
    };


    /** request(config: JsObject): Async[A] */
    function request(config) {
        var async = new Async();
        var _config = $.extend({}, config);

        _config.success = function ajaxSuccess(resp) {
            completeSuccess(async, resp);
        };

        _config.error = function ajaxError(jqXHR, textStatus, errorThrown) {
            completeError(async, requestError(jqXHR, textStatus, errorThrown));
        }

        $.ajax(_config);
        return async;        
    }

    /** map(asyncA: Async[A], fn: A => B): Async[B] */
    function map(asyncA, fn) {
        if (asyncA.isSuccess) {
            var asyncB = new Async();

            ready(asyncA, function(a) { 
                try {
                    completeSuccess(asyncB, fn(a));    
                } catch (e) {
                    completeError(asyncB, unexpectedError(e));
                }
            });
            
            return asyncB;
        }

        return asyncA;
    }

    /** flatMap(asyncA: Async[A], fn: A => Async[B]): Async[B] */
    function flatMap(asyncA, fn) {
        if (asyncA.isSuccess) {
            return flatten(map(asyncA, fn));
        }
            
        return asyncA;
    }

    function match(async, callbacks) {
        ready(async, callbacks.success, callbacks.error);
    }


    function completeSuccess(async, response) {
        async.isSuccess = true;
        async.success.value = response;
        async.success && async.success.action(response);
    }

    function completeError(async, e) {
        async.isSuccess = false;
        async.error.value = e;
        async.error && async.error.action(e);
    }

    function ready(async, successAction, errorAction) {
        //storing actions to run lately if the Async is not completed yet
        async.success.action = successAction;
        async.error.action = async.error.action || errorAction;

        if (async.isSuccess) {
            if (async.success.value) {
                //already completed; call and remove action to avoid further calls
                async.success.action && async.success.action(async.success.value);
                async.success.action = null;
            }
        } else {
            if (async.error.value) {
                //already completed; call and remove action to avoid further calls
                async.error.action && async.error.action(async.error.value);
                async.error.action = null;
            }
        }
    }

    /** flatten(nestedAsync: Async[Async[A]]): Async[A] */
    function flatten(nestedAsync) {
        var flatAsync = new Async();

        ready(nestedAsync, function(internalAsync) {
            ready(internalAsync, function(a) {
                try {
                    completeSuccess(flatAsync, a);
                } catch (e) {
                    completeError(flatAsync, unexpectedError(e));
                }
            });
        });

        return flatAsync;
    }

    function requestError(jqXHR, textStatus, errorThrown) {
        return {status: jqXHR.status, textStatus: textStatus, errorThrown: errorThrown};
    }

    function unexpectedError(e) {
        return {status: 500, textStatus: 'Unexpected Error', errorThrown: e};
    }


    function Async() {
        this.isSuccess = true;
        this.success = {value: null, action: null};
        this.error = {value: null, action: null};
    }


    function doNothing(){}

}(window.jQuery));