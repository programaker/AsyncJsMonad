(function fail_page_js() {

    Async.request({
        url: 'http://dadosabertos.rio.rj.gov.br/apiTransporte/apresentacao/rest/index.cfm/obterTodasPosicoes__ERROR',
        beforeSend: function logRequestAboutToHappen() {
            console.log('>>> will make an ajax request...');
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

}());
