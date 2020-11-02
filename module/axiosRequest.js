const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const axiosRequest = async filePath => {
    var newFile = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append('image', newFile, newFile.name);
    try {
        console.log('TRY');
        console.log("FORMDATA = ", formData);
        // flask API와의 통신인듯.
        var response = await axios
            .create({ headers: formData.getHeaders() })
            //.post('http://localhost:5000/predict', formData);      // Local
            // .post('https://theraphy-flask-heroku2.herokuapp.com/predict', formData);   // Server
            //.post('https://e3kss2gr7l.execute-api.ap-northeast-2.amazonaws.com/dev/lambda_efs', formData); // REST
            .post('https://3pvwvh59mk.execute-api.ap-northeast-2.amazonaws.com/lambda_efs',formData); // HTP
        // predict는 flask폴더 내 rest.py의 predict()와 연관이 있는 듯.
        // .post('http://joyuriz-api:5000/predict', formData);
        return response.data;
    } catch (e) {
        console.log('[ERROR|axiosRequest] ', e);
        return e;
    }
};
module.exports = axiosRequest;
