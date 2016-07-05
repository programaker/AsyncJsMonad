(function defTimeoutRetry($, Async) {
    'use strict';

    Async.request({
        url: 'http://dadosabertos.rio.rj.gov.br/apiTransporte/apresentacao/rest/index.cfm/obterTodasPosicoes',
        beforeSend: function() {
            console.log('>>> will make an ajax request...');
        },
        //including timeout configuration
        timeout: 300, //<= with this timeout, sometimes it will work; sometimes will need to retry
        timeoutConfig: {
            retry: true,
            attempts: 10
        }
    }).on({
        success: function(busPositions) {
            console.log('>>> success => ', busPositions);
            $('#bus').text(busPositions['COLUMNS'][1] + ' = ' + busPositions['DATA'][0][1]);
            $('#error').text('');
        },
        error: function(e) {
            console.log('>>> error => ', e);
            $('#bus').text('');
            $('#error').text(e.textStatus);
        },
        complete: function() {
            console.log('>>> done');
        }
    });

}(window.jQuery, window.Async));