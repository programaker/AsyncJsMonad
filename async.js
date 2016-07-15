//Async module factory function
//It is not an auto-exec function, so that we can execute it just when it's really needed
//Module external dependencies are still explicit as arguments
//
//Async module can be created like "var async = Async(jQuery)" or "var async = new Async(jQuery)";
//both generate the sabe result
function Async($) {
    //Module's public interface - the Async module itself
    //
    //It could be an anonymous object defined directly at 'return', but this way
    //we can see the module's setup top-down, what I think is more readable
    var AsyncModule = {
        unit: unit,
        request: request,
        completeAsSuccess: completeAsSuccess,
        completeAsError: completeAsError
    };

    //AsyncData object, which carries the result of the async operation
    //and allows monadic chaining of operations
    function AsyncData() {
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
    AsyncData.prototype = {
        //AsyncData[A].map(fn: A => B): AsyncData[B]
        map: function(fn) { 
            var asyncB = new AsyncData();
            asyncB.completeAction = this.completeAction;
            
            getSuccessValueIfReady(this, function(a) {
                completeAsSuccess(asyncB, fn(a));
            });

            getErrorValueIfReady(this, function(e) {
                completeAsError(asyncB, unexpectedError(e));
            });

            return asyncB; 
        },

        //AsyncData[A].flatMap(fn: A => AsyncData[B): AsyncData[B]
        flatMap: function(fn) { 
            return flatten(this.map(fn));
        },

        on: function(callbacks) { 
            this.completeAction = callbacks.complete;
            getSuccessValueIfReady(this, callbacks.success);
            getErrorValueIfReady(this, callbacks.error);
        }
    };

    var Retry = {
        DEFAULT_ATTEMPTS: 3
    };

    //unit(a: A): AsyncData[A]
    //creates a successfully completed AsyncData containing the value 'a'
    function unit(a) {
        var async = new AsyncData();
        async.isSuccess = true;
        async.value = a;
        return async;
    }

    function request(config) {
        var async = new AsyncData();

        var _config = $.extend({}, config);
        var beforeSend = _config.beforeSend;
        var timeoutConfig = _config.timeoutConfig || {};

        //add configs we want in jquery
        //success function is set here because it does not change when retrying
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
            } else {
                completeAsError(async, requestError(jqXHR, textStatus, errorThrown));
            }
        };
    }

    function getSuccessValueIfReady(async, successAction) {
        if (async.isSuccess) {
            successAction(async.value);
        } else {
            async.successActions.push(successAction);
        }
    }

    function getErrorValueIfReady(async, errorAction) {
        if (async.isError) {
            errorAction(async.error);
        } else {
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

    //flatten(nestedAsync: AsyncData[AsyncData[A]]): AsyncData[A]
    function flatten(nestedAsync) {
        var flatAsync = new AsyncData();
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

    //Finally, returns module public interface defined on the top
    return AsyncModule;
}
