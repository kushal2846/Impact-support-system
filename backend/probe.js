const axios = require('axios');

const url = 'https://raw.githubusercontent.com/AkshayDusad/ITSM-Incident-Management/master/ITSM_data.csv';

axios({
  method: 'get',
  url: url,
  responseType: 'stream'
}).then(response => {
  const stream = response.data;
  let data = '';
  stream.on('data', chunk => {
    data += chunk.toString();
    const lines = data.split('\n');
    if (lines.length > 5) {
      console.log('HEADERS:', lines[0]);
      console.log('SAMPLE_ROW:', lines[1]);
      stream.destroy(); // Stop downloading
    }
  });
}).catch(err => {
  console.error('Error downloading:', err.message);
});
