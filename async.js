(function defAsync($) {
    'use strict';

    //Async Module's public interface
    window.Async = {
        unit: unit,
        request: request,
        completeAsSuccess: completeAsSuccess,
        completeAsError: completeAsError
    };

    //Async object
    function Async() {
        //success case state
        this.isSuccess = false;
        this.value = null;
        this.successActions = [];

        //error case state
        this.isError = false;
        this.error = null;
        this.errorActions = [];

        //complete action that runs once after all success or all error actions
        this.completeAction = null;
    }
    Async.prototype = {
        map: map,
        flatMap: flatMap,
        on: on
    };

    var Retry = {
        DEFAULT_ATTEMPTS: 3
    };

    //unit(a: A): Async[A]
    //creates a successfully completed Async containing the value 'a'
    function unit(a) {
        var async = new Async();
        async.isSuccess = true;
        async.value = a;
        return async;
    }

    function request(config) {
        var async = new Async();

        var _config = $.extend({}, config);
        var beforeSend = _config.beforeSend;
        var timeoutConfig = _config.timeoutConfig || {};

        //add configs we want in jquery
        _config.success = function ajaxSuccess(resp) { 
            completeAsSuccess(async, resp);
        };

        //remove configs we don't want jquery to use
        delete _config.beforeSend;
        delete _config.timeoutConfig;
        delete _config.complete;

        beforeSend && beforeSend();
        runAjax(async, _config, timeoutConfig.retry, (timeoutConfig.attempts || Retry.DEFAULT_ATTEMPTS));

        return async;
    }

    function runAjax(async, ajaxConfig, retry, attempts) {
        //error function changes with the number of attemps in each retry
        ajaxConfig.error = ajaxErrorFn(async, ajaxConfig, retry, attempts);
        $.ajax(ajaxConfig);
    }

    function ajaxErrorFn(async, ajaxConfig, retry, attempts) {
        return function ajaxError(jqXHR, textStatus, errorThrown) {
            if (errorThrown === 'timeout' && retry && attempts > 0) {
                runAjax(async, ajaxConfig, retry, attempts - 1);
            }
            else {
                completeAsError(async, requestError(jqXHR, textStatus, errorThrown));
            }
        };
    }

    //Async[A].map(fn: A => B): Async[B]
    function map(fn) {
        var asyncB = new Async();
        asyncB.completeAction = this.completeAction;
        
        getSuccessValueIfReady(this, function(a) {
            try {
                completeAsSuccess(asyncB, fn(a));
            } catch (e) {
                completeAsError(asyncB, unexpectedError(e));
            }
        });

        getErrorValueIfReady(this, function(e) {
            completeAsError(asyncB, unexpectedError(e));
        });

        return asyncB;
    }

    //Async[A].flatMap(fn: A => Async[B]): Async[B]
    function flatMap(fn) {
        return flatten(this.map(fn));
    }

    function on(callbacks) {
        this.completeAction = callbacks.complete;
        getSuccessValueIfReady(this, callbacks.success);
        getErrorValueIfReady(this, callbacks.error);
    }

    function getSuccessValueIfReady(async, successAction) {
        if (async.isSuccess) {
            successAction(async.value);
        }
        else {
            async.successActions.push(successAction);
        }
    }

    function getErrorValueIfReady(async, errorAction) {
        if (async.isError) {
            errorAction(async.error);
        }
        else {
            async.errorActions.push(errorAction);
        }
    }

    function completeAsSuccess(async, value) {
        if (async.isSuccess) {
            return;
        }
        
        async.value = value;
        async.isSuccess = true;
        
        for (var i = 0, l = async.successActions.length; i < l; i++) {
            async.successActions[i](value);
        }
        
        async.successActions = [];
        done(async);
    }

    function completeAsError(async, err) {  
        if (async.isSuccess || async.isError) {
            return;
        }
        
        async.isError = true;
        async.error = err;
        
        for (var i = 0, l = async.errorActions.length; i < l; i++) {
            async.errorActions[i](err);
        }

        async.errorActions = [];
        done(async);
    }

    function done(async) {
        async.completeAction && async.completeAction();
        async.completeAction = null;
    }

    //flatten(nestedAsync: Async[Async[A]]): Async[A]
    function flatten(nestedAsync) {
        var flatAsync = new Async();
        flatAsync.completeAction = nestedAsync.completeAction;
        
        //1 - outer isError && inner isError => output isError
        //2 - outer isError && inner isSuccess => output isError
        getErrorValueIfReady(nestedAsync, function(e) { 
            completeAsError(flatAsync, e);
        });
        
        //3 - outer isSuccess && inner isError => output isError 
        getSuccessValueIfReady(nestedAsync, function(internalAsync) {
            getErrorValueIfReady(internalAsync, function(e) { 
                completeAsError(flatAsync, e);
            });           
        }); 
        
        //4 - outer isSuccess && inner isSuccess => output isSuccess
        getSuccessValueIfReady(nestedAsync, function(internalAsync) {
            getSuccessValueIfReady(internalAsync, function(value) { 
                completeAsSuccess(flatAsync, value); 
            });
        });      
        
        return flatAsync;
    }

    function requestError(jqXHR, textStatus, errorThrown) {
        return {responseCode: jqXHR.status, textStatus: textStatus, errorThrown: errorThrown};
    }

    function unexpectedError(e) {
        return {responseCode: 0, textStatus: 'Unexpected Error', errorThrown: e};
    }

}(window.jQuery));
