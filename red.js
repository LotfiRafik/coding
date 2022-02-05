const content = {
}

const words = Object.keys(content).reduce((words, key) => {
    return words.concat(content[key].trim().split(/\s+|^$/));
}, []);

console.log(words);