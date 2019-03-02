const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'sheet-token.json';

module.exports = {
    GetDataFromSheet: async (sheetId) => {
      return new Promise((rs, rj) => {
        fs.readFile("sheet-credentials.json", (err, content) => {
          if (err) {
            console.log("Error loading client secret file:", err);
            rj(err);
          } else {
            
            const { client_secret, client_id, redirect_uris } = JSON.parse(
              content
            ).installed;
            var credentials = { client_secret, client_id, redirect_uris };
            GOOGLE_OAUTH2 = GetOAuth2(credentials);
            var newOAuth = new google.auth.OAuth2();
            authorize(GOOGLE_OAUTH2).then(newAuth =>
              listMajors(newAuth,sheetId).then(temp => {
                let outputData = temp;
                rs(outputData)
              })
            );
          }
        });
      });
    }
  };
  
  function GetOAuth2(credentials) {
    return new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );
  }
  
  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   */
  var authorize = function authorize(oAuth2) {
    return new Promise((rs, rj) => {
      fs.readFile(TOKEN_PATH, (err, token) => {
        var newAuth = new google.auth.OAuth2();
        newAuth = oAuth2;
        if (err) {
          rs(getAccessToken(oAuth2));
        } else {
          newAuth.setCredentials(JSON.parse(token));
          rs(newAuth);
        }
      });
    });
  };
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   */
  function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
      });
    });
  }

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth,sheetId) {
    const sheets = google.sheets({ version: 'v4', auth });
    return new Promise((rs, rj) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: "1!A5:P",
        },
          (err, res) => {
            if (err) {
              console.log("The API returned an error: " + err);
              rj(err);
            } else {
              let temp = res.data.values;
              rs(temp);
            }
          }
        );
      }); 
   
}

