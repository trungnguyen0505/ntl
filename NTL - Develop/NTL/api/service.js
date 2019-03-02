const driveApi = require('./drive-api.js');
const sheetApi = require('./sheet-api.js');
const sql = require('mssql');
const connectionString = require('./db-config/connection-string.json')

const regex = /(HÀNG HÓA|\S{2})\s\S{2}-\S{2}\s(\d{2}|\d{1})\/(\d{2}|\d{1})\/\d{4}/;
var pattern = new RegExp(regex);

module.exports = {
    // GET
    getDaily: GetDailyTransaction,
    // POST
    importFileList: ImportFileList,
    importData: ImportDailyTransaction
}
/**
 * Select * from DownloadFile
 */
async function GetFiles() {
    var outPromise = new sql.ConnectionPool(connectionString).connect().then(pool => {
        return pool.request().query('select * from DownloadFile')
    })
    return outPromise
}

/**
 * Select * from DailyTransaciton
 */
function GetDailyTransaction() {
    var outPromise = new sql.ConnectionPool(connectionString).connect().then(pool => {
        return pool.request().query('select * from DailyTransaction');
    });
    return outPromise;
}

/**
 * Get file list in Google drive then import into DownloadFile
 */
async function ImportFileList() {
    var filesInDrive = await driveApi.GetFilesFromDrive();
    var result = false;
    var outPromise = new sql.ConnectionPool(connectionString).connect().then(pool => {
        var list = [];
        var query = '';
        filesInDrive.forEach(function (element) {
            if (pattern.test(element.name.trim())) {
                query += `insert into DownloadFile (FileId, FileName) values ('${element.id}','${element.name.trim()}')`;
            }
        });
        return pool.request().query(query)
    })
    return outPromise;
}


/**
 * Insert into DailyTransaction
 */
async function ImportDailyTransaction() {
    var out =GetFiles().then((res) => {
        var files = [];
        var query = ``;
        res.recordset.forEach(async (file) => {
            var sheets = await sheetApi.GetDataFromSheet(file.FileId);
            sheets.forEach(async (row) => {
                var list = mappingRow(row);
                var queryObj = list.join();
                if (queryObj) {
                    query+=`
                    insert into DailyTransaction 
                    (TransId, Sender, SenderPhone, Receiver, ReceiverPhone, MerchandiseType, Quantity, ReceiverAddress,
                    DT, CT, CN, Comment, Address, ReceivingName, ReceivingTime) 
                    values (${queryObj}) \n`;
                }
                
            })
            var outPromise = new sql.ConnectionPool(connectionString).connect().then(pool => {
                return pool.request().query(query);
            })
            return outPromise;
        })
    })
    return out;
}
  
/** Helper */
function mappingCell(cell) {
    return `N'${cell}'`;
}

function mappingRow(row){
    var list=[];
    if (row.length > 0) {
        if (row[0] && row[1]) {
            row.forEach(async (cell) => {
                list.push(mappingCell(cell))
            })
            if (list.length < 16) {
                var temp = 15 - list.length;
                for (i = 0; i < temp; i++) {
                    list.push(`' '`);
                }
            }
        }
    }
    return list;
};

