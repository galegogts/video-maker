const readline = require('readline-sync');
const robots = {
    text: require('./robots/text.js')
}

async function Start(){
    const content ={};
    content.searchLang = askAndReturnLang();
    content.searchTerm = askAndReturnSearchTerm();
    content.prefix = askAndReturnPrefix();
    content.searchInput = {
        "articleName": content.searchTerm,
        "lang": content.searchLang
      };


    await robots.text(content);

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
    console.log(content)
}
Start();