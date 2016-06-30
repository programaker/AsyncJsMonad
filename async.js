(function defAsync($) {
    'use strict';

    window.Async = {
        start: start,
        map: map,
        flatMap: flatMap
    };


    /** start :: () -> Async () */
    function start(config) {
        var async = new Async();

        $.ajax(config).done(success).fail(error);
        function success(resp) {
            complete(async, resp);
        }
        function error(jqXHR, textStatus, errorThrown) {
            //???
        }

        return async;        
    }

    /** map :: Async a -> (a -> b) -> Async b */
    function map(asyncA, fn) {
        var asyncB = new Async();
        ready(asyncA, function(a){ complete(asyncB, fn(a)) });
        return asyncB;
    }

    /** flatMap :: Async a -> (a -> Async b) -> Async b */
    function flatMap(asyncA, fn) {
        return flatten(map(asyncA, fn));
    }


    function complete(async, value) {
        async.value = value;
        async.completed = true;
        async.action(value);
    }

    function ready(async, fn) {
        if (async.completed) {
            fn(async.value);
        } else {
            async.action = fn;
        }
    }

    /** flatten :: Async Async a -> Async a */
    function flatten(nestedAsync) {
        var flatAsync = new Async();

        ready(nestedAsync, function(internalAsync) {
            ready(internalAsync, function(internalAsyncValue) {
                complete(flatAsync, internalAsyncValue);
            });
        });

        return flatAsync;
    }


    function Async() {
        this.value = null;
        this.completed = false;
        this.action = doNothing;
    }


    function doNothing(){}

}(window.jQuery));