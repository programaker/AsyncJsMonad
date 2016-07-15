//Page modules can be auto-exec, or else no one will execute them
(function FailPage($, Async) {
    var async = Async($);

    //request 4 Youtube channels by id
    // => Async[List[YoutubeChannel]]
    var asyncChannels = async.request({
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
    var asyncChosenChannel = asyncChannels.map(function(channels) {
        return channels.items[randomIntBetween(0, 3)];
    });

    //request the last 10 videos of the chosen channel
    //Async[YoutubeChannel] => Async[List[YoutubeVideo]]
    var asyncChannelLastVideos = asyncChosenChannel.flatMap(function(chosenChannel) {
        return async.request({
            url: 'https://www.googleapis.com/youtube/v3/search',
            dataType: 'jsonp',
            jsonp: 'callback',
            data: {
                key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8__ERROR', //<= cause error
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
    var asyncChosenVideo = asyncChannelLastVideos.map(function(channelLastVideos) {
        return channelLastVideos.items[randomIntBetween(0, 9)];
    });

    //transform the video object in another with only id and high-res thumbnail url
    //Async[YoutubeVideo] => Async[SimpleVideo]
    var asyncSimpleVideo = asyncChosenVideo.map(function(chosenVideo) {
        return {
            videoId: chosenVideo.id.videoId,
            videoThumbnailUrl: chosenVideo.snippet.thumbnails.high.url
        };
    });

    //finally, handle the results!
    asyncSimpleVideo.on({
        success: function(simpleVideo) {
            console.log('>>> success => ', simpleVideo);
            $('#error').text('');
        },
        error: function(e) {
            console.log('>>> error => ', e);
            $('#error').text(e.textStatus);
        },
        complete: function() {
            console.log('>>> done');
        }
    });

    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}(window.jQuery, window.Async));
