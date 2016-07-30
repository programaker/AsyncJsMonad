(function success_detailed_page_js() {

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
    var asyncChosenChannel = asyncChannels.map(function chooseRandomChannel(channels) {
        return channels.items[randomIntBetween(0, 3)];
    });

    //request the last 10 videos of the chosen channel
    //Async[YoutubeChannel] => Async[List[YoutubeVideo]]
    var asyncChannelLastVideos = asyncChosenChannel.flatMap(function requestVideosFromChannel(chosenChannel) {
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
    var asyncChosenVideo = asyncChannelLastVideos.map(function chooseRandomVideo(channelLastVideos) {
        return channelLastVideos.items[randomIntBetween(0, 9)];
    });

    //transform the video object in another with only id and high-res thumbnail url
    //Async[YoutubeVideo] => Async[SimpleVideo]
    var asyncSimpleVideo = asyncChosenVideo.map(function convertToSimpleVideo(chosenVideo) {
        return {
            videoId: chosenVideo.id.videoId,
            videoThumbnailUrl: chosenVideo.snippet.thumbnails.high.url
        };
    });

    //finally, handle the results!
    asyncSimpleVideo.on({
        success: function displaySimpleVideo(simpleVideo) {
            console.log('>>> success => ', simpleVideo);
            $('#thumb').attr('src', simpleVideo.videoThumbnailUrl);
        },
        error: function logError(e) {
            console.log('>>> error => ', e);
            $('#thumb').attr('src', '');
        },
        complete: function logCompletion() {
            console.log('>>> done');
        }
    });

    function randomIntBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

}());
