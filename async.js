(function defAsync($) {
    'use strict';

    window.Async = {
        create: create,
        map: map,
        flatMap: flatMap
    };


    /** create :: c -> Async a */
    function create(config) {
        //v1 return new Async(config, identity);
        //v2 return new Async(config, null);
        
    }

    /** map :: Async a -> (a -> b) -> Async b */
    function map(asyncA, fn) {
        //v1 new Async(asyncA.config, function(z){ return fn(asyncA.valueFn(z)) });
        //v2 new Async(asyncA.config, fn(asyncA.value));
        new Async(function(z){ return fn(asyncA.valueFn(z)) });
    }

    /** flatMap :: Async a -> (a -> Async b) -> Async b */
    function flatMap(asyncA, fn) {
        //v2 return fn(asyncA.value);
        new Async(function(z) {
            fn(asyncA.valueFn(z)).valueFn(?)
        });
    }

    function run(config, fn) {
        var async = new Async(fn);

        $.ajax(config).done(success).fail(error);
        function success(resp) {
            async.value = async.valueFn(resp);
        }
        function error(jqXHR, textStatus, errorThrown) {
            //???
        }

        return async;
    }


    /*v2
    function Async(_config, _valueFn) {
        this.config = _config;
        this.valueFn = _valueFn;
    }*/


    function doNothing(){}
    //v1 function identity(a){ return a }

}(window.jQuery));