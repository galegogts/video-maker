const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

const watsonApiKey = require('../credentials/watson-nlu.json').apikey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
 
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const state = require('./state.js');

async function robot(){
    const content = state.load();

    await fetchContentFromWikipedia(content);
    sanitizedContent(content);
    breakContentIntoSentences(content); 
    limiteMaximumSentences(content); 
    await fetchKeywordsOfAllSentences(content);

    state.save(content);

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const WikipediaAlgorithmia = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await WikipediaAlgorithmia.pipe({
            "articleName": content.searchTerm,
            "lang": content.lang
        });
        const wikipediaContent = wikipediaResponse.get();

        content.sourceContentOriginal = wikipediaContent.content;
    }

    function sanitizedContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankAndMarkdown(content.sourceContentOriginal);
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

        content.sourceContentSanitized = withoutDatesInParentheses;

        function removeBlankAndMarkdown(text){
            const allLines = text.split('\n');
            const withoutBlankAndMarkdown = allLines.filter((line => {
                if(line.trim().lenght === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true;
            }))
            return withoutBlankAndMarkdown.join(' ');
        }
    }
    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ');
    }
    function breakContentIntoSentences(content){
        content.sentences = [];
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
        sentences.forEach((sentences) => {
            content.sentences.push({
                text: sentences,
                keywords: [],
                images: []
            })
        })
    }
    function limiteMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences);
    }
    
    async function fetchKeywordsOfAllSentences(content){
        for (const sentence of content.sentences){
            sentence.keywords = await  fetchWatsonAndReturnKeywords(sentence.text);
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject) =>{
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
        },(error, response) => {
            if(error){
                throw error;
            }
            const keywords = response.keywords.map((keyword) => {
                return keyword.text;
            })
            resolve(keywords);
            })
        })
    }
}
module.exports = robot;