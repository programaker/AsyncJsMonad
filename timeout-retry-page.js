//Page modules can be auto-exec, or else no one will execute them
(function TimeoutRetryPage($, Async) {
    Async($).request({
        url: 'http://dadosabertos.rio.rj.gov.br/apiTransporte/apresentacao/rest/index.cfm/obterTodasPosicoes',
        beforeSend: function logRequestAboutToHappen() {
            console.log('>>> will make an ajax request...');
        },
        //including timeout configuration
        timeout: 265,
        timeoutConfig: {
            retry: true,
            attempts: 9
        }
    }).on({
        success: function displaySampleBusPosition(busPositions) {
            console.log('>>> success => ', busPositions);
            $('#bus').text(busPositions['COLUMNS'][1] + ' = ' + busPositions['DATA'][0][1]);
            $('#error').text('');
        },
        error: function displayError(e) {
            console.log('>>> error => ', e);
            $('#bus').text('');
            $('#error').text(e.textStatus);
        },
        complete: function logCompletion() {
            console.log('>>> done');
        }
    });

}(window.jQuery, window.Async));