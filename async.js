(function defAsync($) {
    'use strict';

    //Export module's public interface
    window.Async = {
        request: request,
        unit: unit
    };


    //The Async object
    function Async() {
        //success case state
        this.isSuccess = false;
        this.value = null;
        this.successActions = [];

        //error case state
        this.isError = false;
        this.error = null;
        this.errorActions = [];
    }
    Async.prototype = {
        map: map,
        flatMap: flatMap,
        match: match
    };


    function request(config) {
        var async = new Async();
        
        $.ajax(config)
            .done(function ajaxSuccess(resp) {
                completeSuccess(async, resp);
            })
            .fail(function ajaxError(jqXHR, textStatus, errorThrown) {
                completeError(async, requestError(jqXHR, textStatus, errorThrown));
            });

        return async;    
    }

    //unit(a: A): Async[A]
    //creates a successfully completed Async containing the value 'a'
    function unit(a) {
        var async = new Async();
        async.value = a;
        async.isSuccess = true;
        return async;
    }

    //Async[A].map(fn: A => B): Async[B]
    function map(fn) {
        var asyncB = new Async();
        
        readSuccessIfReady(this, function(a) {
            try {
                completeSuccess(asyncB, fn(a));
            } catch (e) {
                completeError(asyncB, unexpectedError(e));
            }
        });

        readErrorIfReady(this, function(e) {
            completeError(asyncB, unexpectedError(e));
        });

        return asyncB;
    }

    //Async[A].flatMap(fn: A => Async[B]): Async[B]
    function flatMap(fn) {
        return flatten(this.map(fn));
    }

    function match(callbacks) {
        readSuccessIfReady(this, callbacks.success);
        readErrorIfReady(this, callbacks.error);
    }

    function readSuccessIfReady(async, successAction) {
        if (async.isSuccess) {
            successAction(async.value);
        }
        else {
            async.successActions.push(successAction);
        }
    }

    function readErrorIfReady(async, errorAction) {
        if (async.isError) {
            errorAction(async.error);
        }
        else {
            async.errorActions.push(errorAction);
        }
    }

    function completeSuccess(async, value) {
        if (async.isSuccess) {
            return;
        }
        
        async.value = value;
        async.isSuccess = true;
        
        for (var i = 0, l = async.successActions.length; i < l; i++) {
            async.successActions[i](value);
        }
        
        async.successActions = null;
    }

    function completeError(async, err) {  
        if (async.isSuccess || async.isError) {
            return;
        }
        
        async.isError = true;
        async.error = err;
        
        for (var i = 0, l = async.errorActions.length; i < l; i++) {
            async.errorActions[i](err);
        }

        async.errorActions = null;
    }

    //flatten(nestedAsync: Async[Async[A]]): Async[A]
    function flatten(nestedAsync) {
        var flatAsync = new Async();
        
        //1 - outer isError && inner isError => output isError
        //2 - outer isError && inner isSuccess => output isError
        readErrorIfReady(nestedAsync, function(e) { 
            completeError(flatAsync, e);
        });
        
        //3 - outer isSuccess && inner isError => output isError 
        readSuccessIfReady(nestedAsync, function(internalAsync) {
            readErrorIfReady(internalAsync, function(e) { 
                completeError(flatAsync, e);
            });           
        }); 
        
        //4 - outer isSuccess && inner isSuccess => output isSuccess
        readSuccessIfReady(nestedAsync, function(internalAsync) {
            readSuccessIfReady(internalAsync, function(value) { 
                completeSuccess(flatAsync, value); 
            });
        });      
        
        return flatAsync;
    }

    function requestError(jqXHR, textStatus, errorThrown) {
        return {responseCode: jqXHR.status, textStatus: textStatus, errorThrown: errorThrown};
    }

    function unexpectedError(e) {
        return {responseCode: undefined, textStatus: 'Unexpected Error', errorThrown: e};
    }

}(window.jQuery));
