const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/ytmp4', async (req, res) => {
    if (req.query.url === '') {
        res.json({
            status: 400,
            result: "Please input URL",
        })
    } else if (!req.query.url) {
        res.redirect(`/`)
    } else {
        const url = req.query.url
        try {
            // console.log(url);
            if (ytdl.validateURL(url)) {
                await ytdl.getBasicInfo(url)
                    .then(async (metadata) => {
                        function secondsToHMS(seconds) {
                            // Mendapatkan nilai jam, menit, dan detik dari nilai detik yang diberikan
                            const hours = Math.floor(seconds / 3600);
                            const minutes = Math.floor((seconds % 3600) / 60);
                            const remainingSeconds = seconds % 60;

                            // Format nilai jam, menit, dan detik menjadi dua digit jika perlu
                            const formattedHours = String(hours).padStart(2, '0');
                            const formattedMinutes = String(minutes).padStart(2, '0');
                            const formattedSeconds = String(remainingSeconds).padStart(2, '0');

                            // Menggabungkan nilai jam, menit, dan detik menjadi format HH:MM:SS
                            const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

                            return formattedTime;
                        }

                        function findHighestHeightObject(responseArray) {
                            // Inisialisasi nilai awal untuk tinggi tertinggi dan objek terkait
                            let highestHeight = -Infinity;
                            let highestHeightObject = null;

                            // Iterasi melalui setiap objek dalam array resp
                            for (const obj of responseArray) {
                                // Memeriksa apakah tinggi objek saat ini lebih tinggi dari tinggi tertinggi yang ditemukan sebelumnya
                                if (obj.height > highestHeight) {
                                    highestHeight = obj.height;
                                    highestHeightObject = obj;
                                }
                            }

                            return highestHeightObject;
                        }


                        // const videoOnly = metadata.formats.filter(video => video.mimeType.startsWith('video'))
                        // const videoOnlyAudio = videoOnly.filter(video => video.audioChannels)
                        let info = await ytdl.getInfo(metadata.videoDetails.videoId)
                        let videoTok = ytdl.filterFormats(info.formats, 'videoonly')
                        console.log(videoTok);

                        res.json({
                            status: 200,
                            result: {
                                title: metadata.videoDetails.title,
                                author: metadata.videoDetails.author.name,
                                duration: secondsToHMS(parseInt(metadata.videoDetails.lengthSeconds)),
                                thumbnail: (findHighestHeightObject(metadata.videoDetails.thumbnails).url.includes("?") ? findHighestHeightObject(metadata.videoDetails.thumbnails).url.split("?")[0] : findHighestHeightObject(metadata.videoDetails.thumbnails).url),
                                // url: videoOnlyAudio[0].url
                                // video: metadata.formats[0].url
                            }
                        })
                    })
            } else {
                res.json({
                    status: 500,
                    result: "Link Invalid",
                })
            }
        } catch (error) {
            res.json({
                status: 500,
                result: "Internal Server Error",
            })
        }
    }
});

app.get('/ytmp3', async (req, res) => {
    if (req.query.url === '') {
        res.json({
            status: 400,
            result: "Please input URL",
        })
    } else if (!req.query.url) {
        res.redirect(`/`)
    } else {
        const url = req.query.url
        try {
            // console.log(url);
            if (ytdl.validateURL(url)) {
                await ytdl.getBasicInfo(url)
                    .then(async (metadata) => {
                        let info = await ytdl.getInfo(metadata.videoDetails.videoId)
                        let audoFormat = ytdl.filterFormats(info.formats, 'audioonly')
                        // console.log(metadata.player_response.streamingData.formats[0].url);
                        function secondsToHMS(seconds) {
                            // Mendapatkan nilai jam, menit, dan detik dari nilai detik yang diberikan
                            const hours = Math.floor(seconds / 3600);
                            const minutes = Math.floor((seconds % 3600) / 60);
                            const remainingSeconds = seconds % 60;

                            // Format nilai jam, menit, dan detik menjadi dua digit jika perlu
                            const formattedHours = String(hours).padStart(2, '0');
                            const formattedMinutes = String(minutes).padStart(2, '0');
                            const formattedSeconds = String(remainingSeconds).padStart(2, '0');

                            // Menggabungkan nilai jam, menit, dan detik menjadi format HH:MM:SS
                            const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

                            return formattedTime;
                        }

                        function findHighestHeightObject(responseArray) {
                            // Inisialisasi nilai awal untuk tinggi tertinggi dan objek terkait
                            let highestHeight = -Infinity;
                            let highestHeightObject = null;

                            // Iterasi melalui setiap objek dalam array resp
                            for (const obj of responseArray) {
                                // Memeriksa apakah tinggi objek saat ini lebih tinggi dari tinggi tertinggi yang ditemukan sebelumnya
                                if (obj.height > highestHeight) {
                                    highestHeight = obj.height;
                                    highestHeightObject = obj;
                                }
                            }

                            return highestHeightObject;
                        }


                        // console.log(audoFormat);

                        res.json({
                            status: 200,
                            result: {
                                title: metadata.videoDetails.title,
                                author: metadata.videoDetails.author.name,
                                duration: secondsToHMS(parseInt(metadata.videoDetails.lengthSeconds)),
                                thumbnail: (findHighestHeightObject(metadata.videoDetails.thumbnails).url.includes("?") ? findHighestHeightObject(metadata.videoDetails.thumbnails).url.split("?")[0] : findHighestHeightObject(metadata.videoDetails.thumbnails).url),
                                url: audoFormat[0].url
                                // video: metadata.formats[0].url
                            }
                        })
                    })
            } else {
                res.json({
                    status: 500,
                    result: "Link Invalid",
                })
            }
            // res.json({
            //     status: 200,
            //     result: "Success",
            // })
        } catch (error) {
            res.json({
                status: 500,
                result: "Internal Server Error",
            })
        }
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})