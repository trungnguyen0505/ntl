const service = require('./service.js');
const express = require('express')

var app = express();

var port = process.env.PORT || 6969;

/**
 * Get all daily transactions 
 */
app.get('/getDaily', function (req, res) {
  service.getDaily().then(s => {
    res.json({
      status: 200,
      response: {
        size: s.recordset.length,
        data: s.recordset
      },
      message: 'Connect to server successful!',
    });
  }).catch(err => {
    res.json({
      status: 500,
      message: 'Connect to server failed!',
    });
  })
});

/**
 * Import sheet from Google into server
*/
app.post('/importFile', (req, res) => {
  service.importFileList().then(s => {
    res.json({
      status: 200,
      response: {
        success: true
      },
      message: 'Import successful!',
    });
  }).catch(err => {
    if (err.name === 'ConnectionError') {
      res.json({
        status: 500,
        response: {
          success: false
        },
        message: 'Cannot connect to server!',
      });
    }
    else if (err.name === 'RequestError') {
      res.json({
        status: 500,
        response: {
          success: false
        },
        message: 'Import failed!',
      });
    }
    else {
      res.json({
        status: 400,
        response: {
          detail: err
        },
        message: 'Uknown error!',
      });
    }
  })
});

app.post('/importData', (req, res) => {
  service.importData().then(s => {
    res.json({
      status: 200,
      response: {
        success: true
      },
      message: 'Import successful!',
    });
  }).catch(err => {
    if (err.name === 'ConnectionError') {
      res.json({
        status: 500,
        response: {
          success: false
        },
        message: 'Cannot connect to server!',
      });
    }
    else if (err.name === 'RequestError') {
      res.json({
        status: 500,
        response: {
          success: false
        },
        message: 'Import failed!',
      });
    }
    else {
      res.json({
        status: 400,
        response: {
          detail: err
        },
        message: 'Uknown error!',
      });
    }
  })
});

app.listen(port, function () {
  console.log("Running RestHub on port " + port);
});