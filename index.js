const express = require('express');
const yts = require('yt-search')
const ytdl = require('ytdl-core')
const fs = require('fs-extra');
const app = express();
const port = 3000;

const yt = async (text) => {
    let resp = await (await yts(text)).all
    return resp
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedDuration = [];

    if (hours > 0) {
        formattedDuration.push(`${hours} hour`);
    }

    if (minutes > 0) {
        formattedDuration.push(`${minutes} minute`);
    }

    if (remainingSeconds > 0) {
        formattedDuration.push(`${remainingSeconds} second`);
    }

    return formattedDuration.join(' ');
}

function formatBytes(bytes) {
    if (bytes === 0) {
        return '0 B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function ytmp3(url) {
    try {
        const {
            videoDetails
        } = await ytdl.getInfo(url, {
            lang: "id"
        });

        const stream = ytdl(url, {
            filter: "audioonly",
            quality: 140
        });
        const chunks = [];

        stream.on("data", (chunk) => {
            chunks.push(chunk);
        });

        await new Promise((resolve, reject) => {
            stream.on("end", resolve);
            stream.on("error", reject);
        });

        const buffer = Buffer.concat(chunks);
        let fileSizeInBytes = parseInt(buffer.length);
        return {
            meta: {
                title: videoDetails.title,
                channel: videoDetails.author.name,
                seconds: videoDetails.lengthSeconds,
                description: videoDetails.description,
                image: videoDetails.thumbnails.slice(-1)[0].url,
            },
            buffer: buffer,
            size: formatBytes(fileSizeInBytes),
        };
    } catch (error) {
        throw error;
    }
};

async function ytmp4(query, quality = 134) {
    try {
        const videoInfo = await ytdl.getInfo(query, {
            lang: 'id'
        });
        const format = ytdl.chooseFormat(videoInfo.formats, {
            format: quality,
            filter: 'videoandaudio'
        })
        let response = await fetch(format.url, {
            method: 'HEAD'
        });
        let contentLength = response.headers.get('content-length');
        let fileSizeInBytes = parseInt(contentLength);
        return {
            title: videoInfo.videoDetails.title,
            thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0],
            date: videoInfo.videoDetails.publishDate,
            duration: formatDuration(videoInfo.videoDetails.lengthSeconds),
            channel: videoInfo.videoDetails.ownerChannelName,
            quality: format.qualityLabel,
            contentLength: formatBytes(fileSizeInBytes),
            description: videoInfo.videoDetails.description,
            videoUrl: format.url
        }
    } catch (error) {
        throw error
    }
}

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/ytplay', async (req, res) => {
    if (req.query.query === '') {
        res.json({
            status: 400,
            result: "Whats u need?",
        })
    } else if (!req.query.query) {
        res.redirect(`/`)
    } else {
        try {
            let ytlookup = await yt(req.query.query)
            let ytmp3_res = await ytmp3(ytlookup[0].url)
            let ytmp4_res = await ytmp4(ytlookup[0].url)
            console.log(ytmp3_res.buffer);
            res.json({
                author: "@Felice - Mods",
                status: 200,
                result: {
                    title: ytlookup[0].title,
                    thumbnail: ytlookup[0].thumbnail,
                    duration: `${ytlookup[0].seconds} (${ytlookup[0].timestamp})`,
                    channel: ytlookup[0].author,
                    views: ytlookup[0].views,
                    publish: ytlookup[0].ago,
                    videoId: ytlookup[0].videoId,
                    server: 'api.tokobuka.com',
                    video: {
                        quality: ytmp4_res.quality,
                        size: ytmp4_res.contentLength,
                        url: ytmp4_res.videoUrl
                    },
                    audio: {
                        size: ytmp3_res.size,
                        buffer: ytmp3_res.buffer
                    }
                }
            })
        } catch (error) {
            res.json({
                status: 500,
                result: "Internal Server Error",
            })
        }
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
