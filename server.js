var express = require('express');
var app = express();
// const fs = require('fs');
const md5File = require('md5-file');
const axiosRequest = require('./module/axiosRequest.js');
const cors = require('cors');
const multerOption = require('./module/multerOption.js'); // 파일 업로드 관련 모듈
const port = process.env.PORT || 3001;

app.use(cors()); // use cors middleware

// post(url, data, config?)
app.post('/', multerOption.single('image'), async (request, response) => {
    const fileName = request.file['filename'];
    const hash = md5File.sync('userUpload/' + fileName);
    console.log('FILE NAME = ', fileName);
    console.log('(server.js) REQUEST = ', request);

    try {
        // axiosRequest => flask API와의 통신
        const axiosResponse = await axiosRequest('userUpload/' + fileName);
        
        if (axiosResponse['success'] === true) {
            console.log("axiosRequest SUCCESS");
            let imageInfo=[];
            for(let i = 0; i < axiosResponse.label.length; i++){
                if(i == 0){ // 첫 번째 배열에는 모든 항목을 set
                    imageInfo[i] = [
                        {
                            success: true,
                            hash: hash,
                            coordinate:{
                                // LTRB = x1,y1 x2,y2
                                x: axiosResponse['x1'][i],
                                y:  axiosResponse['y1'][i],
                                width: axiosResponse['x2'][i]-axiosResponse['x1'][i],
                                height: axiosResponse['y2'][i]-axiosResponse['y1'][i],
                            },
                            label : axiosResponse['label'][i],
                            score : axiosResponse['score'][i],
                            path: fileName,
                            voteChaewon: 0,
                            voteYuri: 0,
                            voteYena: 0,
                            request: 1,
                            // house: [4, 5, 7, 8, 9, 12, 18, 19, 22, 23, 24, 27, 31]
                            house: axiosResponse['house']
                        }
                    ];
                }else{  // 이후 배열에는 일부만 set
                    imageInfo[i] = [
                        {
                            coordinate:{
                                x: axiosResponse['x1'][i],
                                y:  axiosResponse['y1'][i],
                                width: axiosResponse['x2'][i]-axiosResponse['x1'][i],
                                height: axiosResponse['y2'][i]-axiosResponse['y1'][i],
                            },
                            label : axiosResponse['label'][i],
                            score : axiosResponse['score'][i]
                        }
                    ];
                }
            }
            response.json(imageInfo);
        } else {
            response.json({
                success: false,
                path: fileName,
                hash: hash
            });
        }
    } catch (e) {
        console.log('[ERROR|axiosResponse] : ', e);
    }
});

// 3001번 포트넘버를 가진 서버 생성
app.listen(port, () => console.log(`listening on port ${port}!`));
