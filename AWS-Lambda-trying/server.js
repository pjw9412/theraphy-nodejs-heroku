var express = require('express');
var app = express();
const md5File = require('md5-file');
const cors = require('cors');
const axiosRequest = require('./module/axiosRequest.js');
const multerOption = require('./module/multerOption.js'); // 파일 업로드 관련 모듈
const fs = require('fs');
const AWS = require('aws-sdk');
const BUCKET_NAME ='theraphy-nodejs-awslambd-serverlessdeploymentbuck-na2ptslfmsyq';
const port = process.env.PORT || 3001;

app.use(cors()); // use cors middleware

const download =  (accessKeyId, secretAccessKey, region, bucketName, baseImage) => {
    console.log("Starting Download... ")
    let hash;
    const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: region
    });
    const params = {
        Bucket: bucketName,
        Key: `base/${baseImage}`
    };

    s3.getObject(params, (err, data) => {
        if(err) console.error(err);
        console.log(this.config.baseFolder + baseImage);
        fs.writeFileSync(this.config.baseFolder + baseImage, data.Body);
        console.log("Image Downloaded.");
        hash = md5File.sync(fileName);
    });
    return hash;
}

// post(url, data, config?)
app.post('/', multerOption.single('image'),  (request, response) => {
    console.log("REQ ==== ", request);
    const fileName = request.file['originalname'];

    let hash = download('AKIAIQKI5Y3K56FRLH2A','X8I6f3S5c0PQ7AHy8B+KyEq5YyuXldn/KFh98Q8d','ap-northeast-2',BUCKET_NAME);
    console.log("HASH == ", hash);
    try {
        // axiosRequest => flask API와의 통신
        // const axiosResponse = await axiosRequest('userUpload/' + fileName);
        const axiosResponse = axiosRequest(fileName);
        
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
// app.listen(port, () => console.log(`listening on port ${port}!`)); //local
module.exports = app;

