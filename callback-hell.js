(function defCallbackHell($) {
    'use strict';

    //Classic way of doing ajax in jQuery, with nested success callbacks.
    //
    //OK, I know $.ajax() returns a jqXHR object that acts like a Promise, avoiding callback hell,
    //but most jQuery ajax code I see look like this.
    //
    //Moreover, jQuery ajax is not the worst problem; domain code that needs ajax internally frequently 
    //adopt this design
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/channels',
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8',
            part: 'snippet',
            id: 'UCEWHPFNilsT0IfQfutVzsag,UCsXVk37bltHxD1rDPwtNM8Q,UCvzvWfxeFWZDUH835lMAwEg,UCHCph-_jLba_9atyCZJPLQQ'
        },
        success: function(channels) {
            var chosenChannel = channels.items[randomIntBetween(0, 3)];

            $.ajax({
                url: 'https://www.googleapis.com/youtube/v3/search',
                dataType: 'jsonp',
                jsonp: 'callback',
                data: {
                    key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8',
                    part: 'snippet',
                    type: 'video',
                    order: 'date',
                    maxResults: 10,
                    channelId: chosenChannel.id
                },
                success: function(channelLastVideos) {
                    var chosenVideo = channelLastVideos.items[randomIntBetween(0, 9)];
                    
                    var simpleVideo = {
                        videoId: chosenVideo.id.videoId,
                        videoThumbnailUrl: chosenVideo.snippet.thumbnails.high.url
                    };

                    console.log('>>> success => ', simpleVideo);
                    $('#thumb').attr('src', simpleVideo.videoThumbnailUrl);
                },
                error: error
            });
        },
        error: error
    });

    function error(jqXHR, textStatus, errorThrown) {
        console.log('>>> error => ', {responseCode: jqXHR.status, textStatus: textStatus, errorThrown: errorThrown});
        $('#thumb').attr('src', '');
    }

    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}(window.jQuery));
