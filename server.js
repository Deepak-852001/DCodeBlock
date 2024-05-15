const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const compileCode = (language, code, callback) => {
    let command;
    switch (language) {
        case 'solidity':
            command = `echo "${code}" | solc --standard-json`;
            break;
        case 'rust':
            command = `echo "${code}" | rustc -o output && ./output`;
            break;
        case 'motoko':
            command = `echo "${code}" | moc -r`;
            break;
        default:
            return callback('The Language You Selected Is Not Supported');
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            callback(stderr);
        } else {
            callback(stdout);
        }
    });
};
app.post('/compile', (req, res) => {
    const { language, difficulty, code } = req.body;
    if (!language || !code) return res.status(400).send('Language and code are required');

    const snippets = {
        solidity: {
            easy: 'pragma solidity ^0.8.0; contract HelloWorld { function sayHello() public pure returns (string memory) { return "Hello, World!"; } }',
            medium: 'pragma solidity ^0.8.0; contract Counter { uint256 count; function increment() public { count += 1; } function getCount() public view returns (uint256) { return count; } }',
            hard: 'pragma solidity ^0.8.0; contract Voting { struct Voter { bool voted; uint8 vote; uint weight; } struct Proposal { uint voteCount; } address chairperson; mapping(address => Voter) voters; Proposal[] proposals; }'
        },
        rust: {
            easy: 'fn main() { println!("Hello, World!"); }',
            medium: 'fn main() { let mut count = 0; count += 1; println!("Counter: {}", count); }',
            hard: 'use std::collections::HashMap; fn main() { let mut map = HashMap::new(); map.insert("key", "value"); println!("{:?}", map); }'
        },
        motoko: {
            easy: 'actor HelloWorld { public func sayHello() : async Text { return "Hello, World!"; } }',
            medium: 'actor Counter { var count : Nat = 0; public func increment() : async () { count += 1; }; public func getCount() : async Nat { return count; }; }',
            hard: 'actor Voting { type Voter = { voted : Bool; vote : Int; weight : Nat; }; type Proposal = { voteCount : Nat; }; var proposals : [Proposal] = []; var voters : { [Text] : Voter }; }'
        }
    };

    const codeSnippet = snippets[language][difficulty];
    compileCode(language, codeSnippet, (output) => {
        res.send(output);
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
