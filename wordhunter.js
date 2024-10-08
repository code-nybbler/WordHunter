let words, words_all, scoreboard,
answers, answer, guesses, guesses_all,
gameMode, wordCount, gameStatus;

let modes = {
    '1': 'Snare Trap',
    '2': 'Elusive Goose'
};

$(document).ready(function() {
    readScoreboard();
    $('.bar-marker').css('left', `${100/wordCount*100}%`).css('opacity', 1);
    $('.progress-msg').text(`${wordCount}/${wordCount} words`);
    $('#mode-menu').addClass('show');
    setGameMode(1);
});

function readWordlist(filePath) {
    return fetch(filePath)
    .then(response => response.text())
    .then(text => {
        return text.split('\r\n').map(word => ({ 'word': word, 'stringMap': getStringMap(word), 'score': 0 }));;
    })
    .catch(error => {
        console.error("Error reading file:", error);
    });
}

async function retrieveWordLists() {
    wordlist = await readWordlist('./wordlist.txt');
    words = wordlist;
    words_all = await readWordlist('./wordlist-all.txt');
    wordCount = words.length;
}

function populateScoreboard() {
    for (let place in scoreboard.ST_Top10) {
        let placement = scoreboard.ST_Top10[place];
        let player = placement.Player;
        let words = placement.Words;
        $('#st-scoreboard table tbody').append(`<tr><td>${player.Name}</td><td style="text-align:center;">${words}</td></tr>`);
    }
    for (let place in scoreboard.EG_Top10) {
        let placement = scoreboard.EG_Top10[place];
        let player = placement.Player;
        let words = placement.Words;
        $('#eg-scoreboard table tbody').append(`<tr><td>${player.Name}</td><td style="text-align:center;">${words}</td></tr>`);
    }
}

function readScoreboard() {
    $.ajax({
        type: "GET",
        url: "https://prod-56.westus.logic.azure.com:443/workflows/7534300353cb48ad892f6741046aeab8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JS-U_mvyGe_-PXwesvCPE7DA0oASww0h6h7D1RXM47Q",
        success: function(data) {
            scoreboard = data;            
        }
    });
}

function initializeNewBoard() {
    $('.board-container').append('<div class="board"></div>');
    populateBoard($('.board').last());
    let boards = document.querySelectorAll('.board');
    boards[boards.length - 1].scrollIntoView({behavior: 'smooth'});
}

function populateBoard($board) {
    let rows = gameMode === 2 ? 3 : 6;
    for (let g = 0; g < rows; g++) {
        let $group = $(`<div class="group"></div>`);
        for (let t = 0; t < 5; t++) $group.append(`<div class="tile empty-tile" data-index="${t+1}"></div>`);
        $board.append($group);
    }

    if (gameMode === 1) {
        let rand_char = characters[Math.floor(Math.random() * 25)];
        $('.empty-tile').first().data('letter', rand_char).text(rand_char).removeClass('empty-tile').addClass('filled-tile').addClass('starter-tile');
    } else {
        let $group = $(`<div class="group answer-group"></div>`);
        for (let t = 0; t < 5; t++) $group.append(`<div class="tile" data-index="${t+1}"></div>`);
        $board.append($group);
    }
}

async function initialize() {
    $('.board').remove();
    $('.keyboard-key').removeClass('incorrect-key').removeClass('present-key').removeClass('correct-key');
    answers = [];
    guesses = [];
    guesses_all = [];
    gameStatus = 0;
    
    await retrieveWordLists();

    switch(gameMode) {
        case 1: // snare trap
            $('.bar').css('width', '100%');
            $('.bar-marker').css('left', `${100/wordCount*100}%`).css('opacity', 1);
            $('.progress-msg').text(`${wordCount}/${wordCount} words`);
            break;
        case 2: // elusive goose
            answer = getWord();
            answers.push(answer);
            console.log(answer);
            $('.bar').css('width', '0');
            $('.bar-marker').css('opacity', 0);
            $('.progress-msg').text('');
            break;
        default: break;
    }
    initializeNewBoard();
}

function endGame() {
    if (answers.length > 0 && guesses.length > 0) {
        $('.answer-group').each(function(index) {
            let answerArr = answers[index].word.split('');            
            $(this).find('.tile').each(function(idx) {
                $(this).data('letter', answerArr[idx]).text(answerArr[idx]);
            });
        });
        $('.answer-group').css('display', 'grid');
    }
}

function setGameMode(mode) {
    gameMode = mode;
    initialize();
    $('#mode-btn').text(modes[gameMode]).css('opacity', 1);
}

$(document).on('click', '#mode-menu .mode-btn', function() {
    setGameMode($(this).data('mode'));
    $('#mode-menu').removeClass('show');
});

$(document).on('click', '.menu .close-btn', function() {
    $(this).closest('.menu').removeClass('show');
});

$(document).on('click', '#mode-btn', function() {
    $('#mode-menu').addClass('show');
});

$(document).on('click', '#reset-dialog .reset-cancel-btn', function() {
    $('#reset-dialog').removeClass('show');
});

$(document).on('click', '#reset-dialog .reset-confirm-btn', function() {
    $('#reset-dialog').removeClass('show');
    initialize();
});

$(document).on('click', '#player-dialog .player-submit-btn', function() {
    let playerName = $('#player-input').val();
    if (playerName !== '') {
        $('#player-dialog').removeClass('show');
        // add player details to scoreboard JSON
        let existingPlayer = scoreboard.Players.find(player => player.Name === playerName);
        if (existingPlayer !== undefined) {
            // update stats
            if ([1, 1.5].includes(gameMode)) {
                existingPlayer.ST_Stats.TimesPlayed++;
                existingPlayer.ST_Stats.Words = guesses_all.length;
            } else {
                existingPlayer.EG_Stats.TimesPlayed++;
                existingPlayer.EG_Stats.Words = guesses_all.length;
            }
        } else {
            // add player
            scoreboard.Players.push({
                "Player": {
                    "ID": scoreboard.Players.length,
                    "Name": playerName.toString()
                },
                "ST_Stats": {
                    "TimesPlayed": [1, 1.5].includes(gameMode) ? 1 : 0,
                    "Words": [1, 1.5].includes(gameMode) ? guesses_all.length : 0
                },
                "EG_Stats": {
                    "TimesPlayed": gameMode === 2 ? 1 : 0,
                    "Words": gameMode === 2 ? guesses_all.length : 0
                }
            });
        }
        populateScoreboard();
        // send request to update scoreboard
        let flowURL = 'https://prod-175.westus.logic.azure.com:443/workflows/da7be3f7e0374a6aa1c200d4ae6730f7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dmIrVanj-WdaSVYRRrJnyqBIXafgN1aBxQUrMCU2Lag';
        let req = new XMLHttpRequest();
        req.open("POST", flowURL, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    let result = JSON.parse(this.response);                    
                    showToast('Scoreboard updated!');
                } else {
                    console.log(this.statusText);
                }
            }
        };
        req.send(JSON.stringify(scoreboard));
    } else {
        // handle empty input
    }
    endGame();
});

$(document).on('click', '#player-dialog .player-skip-btn', function() {
    $('#player-dialog').removeClass('show');
    endGame();
});

$(document).on('click', '#scoreboard-btn', function() {
    $('#scoreboard').addClass('show');
});

$(document).on('click', '.keyboard-key', function() {
    if (gameStatus === 0) {
        let key = $(this).data('key');
        switch (key) {
            case '↵': // enter
                if ($('.filled-tile').length > 0 && $('.filled-tile').length % 5 === 0) submitGuess($('.filled-tile').last().closest('.group').find('.tile'));
                break;
            case '←': // backspace
                $('.editable-tile').last().data('letter', '').text('').removeClass('editable-tile').addClass('empty-tile');
                break;
            case 'reset': // reset
                $('#reset-dialog').addClass('show');
                break;
            default: // character
                if ($('.editable-tile').length === 0 || $('.empty-tile').length % 5 !== 0) $('.empty-tile').first().data('letter', key).text(key).removeClass('empty-tile').addClass('filled-tile').addClass('editable-tile');
                break;
        }
    }
});

let characters = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
$(document).on('keyup', function(e) {
    let code = e.keyCode || e.which;
    if (code === 8 || code === 13 || (code >= 65 && code <= 90)) {
        switch (code) {
            case 13: // enter
                $('.keyboard-key[data-key="↵"]').click();
                break;
            case 8: // backspace
                $('.keyboard-key[data-key="←"]').click();
                break;
            default: // character
                $(`.keyboard-key[data-key="${characters[code-65]}"]`).click();
                break;
        }
    }
});

function getStringMap(str) {
    const map = new Map();
    for (let char of str) {
        if (map.has(char)) map.set(char, map.get(char) + 1);
        else map.set(char, 1);
    }
    return map;
};

function getCommonCount(word1, guessedWord) {
    const map1 = word1.stringMap;
    const map2 = getStringMap(guessedWord);
    let commonCount = 0;

    for (let k of map1.keys()) {
        if (map2.has(k)) commonCount += Math.min(map1.get(k), map2.get(k));
    }

    return commonCount;
};

function processGuess($tiles, guessedWord) {
    // add guess to arrays
    guesses.push(guessedWord);
    guesses_all.push(guessedWord);

    switch(gameMode) {
        case 1: // snare trap
            processGuessST(guessedWord);
            break;
        case 1.5: // snare trap w/ answer chosen
        case 2: // elusive goose
            processGuessEG($tiles, guessedWord);
            break;
        default: break;
    }
}

function processGuessST(guessedWord) {
    // filter and sort wordlist
    words = words.map(word => ({ ...word, score: getCommonCount(word, guessedWord) })).filter(word => word.score < 2);
    $('.progress-msg').text(`${words.length}/${wordCount} words`);
    console.log(words);

    if (words.length <= 100) {
        // choose new word
        answer = getWord();        
        answers.push(answer);
        console.log(answer);
        // send toast
        showToast(`A word has been chosen!`);
        gameMode = 1.5;
        $('.bar-marker').css('opacity', 0);
        $('.progress-msg').text('');
    } else $('.bar').css('width', `${words.length/3100*100}%`);
    
    // if board is filled, initialize a new one
    if ($('.empty-tile').length === 0) initializeNewBoard();
}

function processGuessEG($tiles, guessedWord) {
    // split answer characters into an array
    let answerArr = answer.word.split('');
    let letters = guessedWord.split('').map((l, idx) => ({ 'index': idx, 'letter': l, 'marked': false }));

    for (let c = 0; c < answerArr.length; c++) {
        let match = letters.find((l, idx) => l.letter === answerArr[c] && !l.marked && idx === c); // find in guess at same index
        if (match === undefined) match = letters.find(l => l.letter === answerArr[c] && !l.marked); // find anywhere in guess

        if (match !== undefined) {
            let $key = $(`.keyboard-key[data-key="${match.letter}"]`);
            if (match.index === c) { // correct
                $tiles.eq(match.index).addClass('correct-tile');
                $key.removeClass('present-key').addClass('correct-key');
            } else { // present
                $tiles.eq(match.index).addClass('present-tile');
                if (!$key.hasClass('correct-key')) $key.addClass('present-key');
            }            
            match.marked = true;
        }
    }

    // mark absent letters
    let absentLetters = letters.filter(l => !l.marked);
    for (let l = 0; l < absentLetters.length; l++) {
        let $key = $(`.keyboard-key[data-key="${absentLetters[l].letter}"]`);
        $tiles.eq(absentLetters[l].index).addClass('incorrect-tile');
        if (!$key.hasClass('correct-key') && !$key.hasClass('present-key')) $key.addClass('incorrect-key');
    }

    // check guess
    let correctLetters = {};
    $('.submitted-tile').last().closest('.group').find('.correct-tile').each(function() {
        correctLetters[$(this).data('index')] = $(this).data('letter');
    });
    let presentLetters = {};
    $('.submitted-tile').last().closest('.group').find('.present-tile').each(function() {
        presentLetters[$(this).data('index')] = $(this).data('letter');
    });
    
    if (guessedWord === answer.word) {
        gameStatus = 1;
        // send toast
        showToast(`You won after ${guesses_all.length} guesses!`);
        $('#player-dialog').addClass('show');
        $('.bar').css('width', `${(Object.keys(presentLetters).length + Object.keys(correctLetters).length*2)/10*100}%`);
    } else if ($('.empty-tile').length < 30 && $('.empty-tile').length % 15 === 0 && gameMode === 2) { // true every 3 guesses        
        // filter wordlist
        words = words.map(word => ({ ...word, score: getCommonCount(word, Object.values(correctLetters).join('')) })).filter(word => word.score >= Object.keys(correctLetters).length && word !== answer.word); // choose new word with same 'correct' letters, but not necessarily with the same 'present' letters
        // choose new word
        answer = getWord();
        answers.push(answer);
        // clear guesses
        guesses = [];
        console.log(answer);
        // send toast
        showToast(`The answer changed!`);
        // re-color keyboard
        $('.keyboard-key').removeClass('incorrect-key').removeClass('present-key');
        $('.correct-key').removeClass('correct-key').addClass('present-key');
        // if board is filled, initialize a new one
        if ($('.empty-tile').length === 0) {
            $('.bar').css('width', `${Object.keys(correctLetters).length > 0 ? Object.keys(correctLetters).length/10*100 : 0}%`);
            initializeNewBoard();
        } else $('.bar').css('width', `${(Object.keys(presentLetters).length + Object.keys(correctLetters).length*2)/10*100}%`);
    } else if (gameMode === 1.5 && $('.empty-tile').length === 0) { // final stage of Snare Trap and board is full
        initializeNewBoard();
        $('.bar').css('width', `${(Object.keys(presentLetters).length + Object.keys(correctLetters).length*2)/10*100}%`);
    } else $('.bar').css('width', `${(Object.keys(presentLetters).length + Object.keys(correctLetters).length*2)/10*100}%`);
}

function submitGuess($tiles) {
    let letters = [];
    $tiles.each(function() { letters.push($(this).data('letter')); });
    let guessedWord = letters.join('');

    if (guesses.includes(guessedWord)) {
        showToast('Word was already guessed!');
        $tiles.each(function() { $(this).addClass('editable-tile'); });
    } else if (gameMode !== 1 && words_all.find(word => word.word === guessedWord) === undefined) {
        showToast('Word is not in the wordlist!');
        $tiles.each(function() { $(this).addClass('editable-tile'); });        
    } else if (gameMode === 1 && words.find(word => word.word === guessedWord) === undefined) {
        showToast('Word is not in the wordlist!');
        $tiles.each(function() { if (!$(this).hasClass('starter-tile')) $(this).addClass('editable-tile'); });
    } else {
        $tiles.each(function() { $(this).removeClass('editable-tile').addClass('submitted-tile'); });
        processGuess($tiles, guessedWord);
    }
}

function getWord() {
    let index = Math.floor(Math.random() * words.length);
    return words[index];
}

function showToast(text) {
    $('#toast-msg').text(text).addClass('show');
    setTimeout(function(){ $('#toast-msg').removeClass('show'); }, 3000);
}