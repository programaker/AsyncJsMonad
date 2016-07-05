(function defTimeoutRetry($, Async) {
    'use strict';

    Async.request({
        url: 'http://dadosabertos.rio.rj.gov.br/apiTransporte/apresentacao/rest/index.cfm/obterTodasPosicoes',
        beforeSend: function() {
            console.log('>>> will make an ajax request...');
        },
        //including timeout configuration
        timeout: 265,
        timeoutConfig: {
            retry: true,
            attempts: 9
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