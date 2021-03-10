const readline = require('readline-sync');
const state = require('./state.js');

function robot(){
    const content ={};
    content.maximumSentences = 7;
    content.lang = askAndReturnLang();
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    
    state.save(content);

    function askAndReturnSearchTerm(){
        return readline.question('Type a Wikipedia search Term: ');
    }
    function askAndReturnPrefix(){
        const prefixes = ['Who is','What is','The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one Option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];
    
        return selectedPrefixText;
    }
    function askAndReturnLang(){
        const langs = ['en','pt'];
        const selectedLangsIndex = readline.keyInSelect(langs, 'Choose one Option: ');
        const selectedLangText = langs[selectedLangsIndex];
    
        return selectedLangText;
    }
}

module.exports = robot;
