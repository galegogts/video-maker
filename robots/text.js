const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

async function robot(content){
    await fetchContentFromWikipedia(content);
    sanitizedContent(content);
    breakContentIntoSentences(content);   
    
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
}
module.exports = robot;