import 'dotenv/config';


class jisho_service{

    async searchDictionary(keyword){
        try {
            const url = `http://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw {statusCode: 404, message: '*404.', data: null};
            }

            const data = await response.json();

            if (data.data.length === 0) {
                console.log(`No results found for "${keyword}"`);
                return;
            }

            const results = data.data
                .filter(result => result.is_common)
                .map(result => ({
                    word: result.japanese[0].word || 'N/A',
                    reading: result.japanese[0].reading,
                    english_definition: result.senses[0].english_definitions.join(', '),
                    part_of_speech: result.senses[0].parts_of_speech.join(', '),
                    jlpt: result.jlpt.length > 0 ? result.jlpt.join(', ') : 'N/A'
                }));

            return {statusCode: 201, message: '*Get the result successfully.', data: results};
          } catch (error) {
            return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error', data: null }; 
          }

    };

}

export default new jisho_service();