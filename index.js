(function defIndexPage($, Async) {
    'use strict';

    //request 4 Youtube channels by id
    // => Async[List[YoutubeChannel]]
    var asyncChannels = Async.request({
        url: 'https://www.googleapis.com/youtube/v3/channels',
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8',
            part: 'snippet',
            id: 'UCEWHPFNilsT0IfQfutVzsag,UCsXVk37bltHxD1rDPwtNM8Q,UCvzvWfxeFWZDUH835lMAwEg,UCHCph-_jLba_9atyCZJPLQQ'
        }
    });

    //choose one of the channels randomly
    //Async[List[YoutubeChannel]] => Async[YoutubeChannel]
    var asyncChosenChannel = Async.map(asyncChannels, function(channelsJson) {
        return channelsJson.items[randomIntBetween(0, 3)];
    });

    //request the last 10 videos of the chosen channel
    //Async[YoutubeChannel] => Async[List[YoutubeVideo]]
    var asyncChannelLastVideos = Async.flatMap(asyncChosenChannel, function(chosenChannel) {
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
    });

    //get one of the videos randomly
    //Async[List[YoutubeVideo]] => Async[YoutubeVideo]
    var asyncChosenVideo = Async.map(asyncChannelLastVideos, function(channelLastVideos) {
        return channelLastVideos.items[randomIntBetween(0, 9)];
    });

    //transform the video object in another with only id and high-res thumbnail url
    //Async[YoutubeVideo] => Async[SimpleVideo]
    var asyncSimpleVideo = Async.map(asyncChosenVideo, function(chosenVideo) {
        return {
            videoId: chosenVideo.id.videoId,
            videoThumbnailUrl: chosenVideo.snippet.thumbnails.high.url
        };
    });

    //finally, handle the results!
    Async.match(asyncSimpleVideo, {
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