import 'dotenv/config';
import client from '../config/googleClient.js'


class googleTtsService{

    async getTtsService(text, lang){
        try {
            const request = {
              input: { text },
              voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
              audioConfig: { audioEncoding: 'MP3' },
            };
        
            const [response] = await client.synthesizeSpeech(request);
            const audioContent = response.audioContent;
            const audioBase64 = audioContent.toString('base64');
            console.log(audioBase64);
            return {statusCode: 201, message: '*Get the audio successfully.', data: audioBase64};
          } catch (error) {
            console.log("R")
            console.error('TTS Error:', error.message);
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null }; 
          }

    };

}

export default new googleTtsService();