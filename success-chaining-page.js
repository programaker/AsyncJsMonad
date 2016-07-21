//Page modules can be auto-exec or alternativelly an argument to $(document).ready()
(function SuccessChainingPage() {
    var channelsRequestData = {
        url: 'https://www.googleapis.com/youtube/v3/channels',
        dataType: 'jsonp',
        jsonp: 'callback',
        data: {
            key: 'AIzaSyDQOzdypbd04-ExD90xUVPoEG2Hfx7X3X8',
            part: 'snippet',
            id: 'UCEWHPFNilsT0IfQfutVzsag,UCsXVk37bltHxD1rDPwtNM8Q,UCvzvWfxeFWZDUH835lMAwEg,UCHCph-_jLba_9atyCZJPLQQ'
        },
        beforeSend: logRequestAboutToHappen
    };

    var async = new Async($); //<= 2nd way to get an Async instance: with new operator

    //This example is slightly different from "success-detailed.js" because I wanted to show the async.unit() function.
    //There, I started directly from async.request()
    async.unit(channelsRequestData)
        .flatMap(async.request)
        .map(chooseRandomChannel)
        .flatMap(requestVideosFromChannel)
        .map(chooseRandomVideo)
        .map(convertToSimpleVideo)
        .on({
            success: displaySimpleVideo,
            error: logError,
            complete: logCompletion
        });


    function logRequestAboutToHappen() {
        console.log('>>> will make an ajax request...');
    }

    function chooseRandomChannel(channels) {
        return channels.items[randomIntBetween(0, 3)];
    }

    function requestVideosFromChannel(chosenChannel) {
        return async.request({
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

    function displaySimpleVideo(simpleVideo) {
        console.log('>>> success => ', simpleVideo);
        $('#thumb').attr('src', simpleVideo.videoThumbnailUrl);
    }

    function logError(e) {
        console.log('>>> error => ', e);
        $('#thumb').attr('src', '');
    }

    function logCompletion() {
        console.log('>>> done');
    }
}());
