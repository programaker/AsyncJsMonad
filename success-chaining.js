(function defSuccessChaining($, Async) {
    'use strict';

    var channelsRequestData = {
        url: 'https://www.googleapis.com/youtube/v3/channels',
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8',
            part: 'snippet',
            id: 'UCEWHPFNilsT0IfQfutVzsag,UCsXVk37bltHxD1rDPwtNM8Q,UCvzvWfxeFWZDUH835lMAwEg,UCHCph-_jLba_9atyCZJPLQQ'
        }
    };

    //This example is slightly different from "success-detailed.js" because I wanted to show the Async.unit() function.
    //There, I started directly from Async.request()
    Async.unit(channelsRequestData)
        .flatMap(Async.request)
        .map(chooseRandomChannel)
        .flatMap(requestVideosFromChannel)
        .map(chooseRandomVideo)
        .map(convertToSimpleVideo)
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


    function chooseRandomChannel(channels) {
        return channels.items[randomIntBetween(0, 3)];
    }

    function requestVideosFromChannel(chosenChannel) {
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
    }

    function chooseRandomVideo(channelLastVideos) {
        return channelLastVideos.items[randomIntBetween(0, 9)];
    }

    function convertToSimpleVideo(chosenVideo) {
        return {
            videoId: chosenVideo.id.videoId,
            videoThumbnailUrl: chosenVideo.snippet.thumbnails.high.url
        };
    }

    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}(window.jQuery, window.Async));
