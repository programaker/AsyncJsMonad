(function defSuccessChaining($, Async) {
    'use strict';

    //Same as "success-detailed.js", but chaining the operations

    Async.request({
        url: 'https://www.googleapis.com/youtube/v3/channels',
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8',
            part: 'snippet',
            id: 'UCEWHPFNilsT0IfQfutVzsag,UCsXVk37bltHxD1rDPwtNM8Q,UCvzvWfxeFWZDUH835lMAwEg,UCHCph-_jLba_9atyCZJPLQQ'
        }
    })
    .map(function(channels) {
        return channels.items[randomIntBetween(0, 3)];
    })
    .flatMap(function(chosenChannel) {
        return Async.request({
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
            }
        });
    })
    .map(function(channelLastVideos) {
        return channelLastVideos.items[randomIntBetween(0, 9)];
    })
    .map(function(chosenVideo) {
        return {
            videoId: chosenVideo.id.videoId,
            videoThumbnailUrl: chosenVideo.snippet.thumbnails.high.url
        };
    })
    .match({
        success: function(simpleVideo) {
            console.log('>>> success => ', simpleVideo);
            $('#thumb').attr('src', simpleVideo.videoThumbnailUrl);
        },
        error: function(e) {
            console.log('>>> error => ', e);
            $('#thumb').attr('src', '');
        }
    });


    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}(window.jQuery, window.Async));
