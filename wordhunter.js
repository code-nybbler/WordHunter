let characters = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
let modes = {
                '1': {
                    'Name': 'Snare Trap',
                    'Instructions': `<b>Narrowing Down the Wordlist:</b> Begin by making a series of guesses. Each accepted guess will filter down the list.<br>
                                    <b>Letter Grouping Restriction:</b> No subsequent guesses can contain two or more letters that appear together in a previous guess.<br>
                                    <ul><li><i>Example:</i> If your first guess is "Water", you cannot guess "Peach" since the letters "E" and "A" are in "Water".</li></ul>
                                    <b>Word Selection:</b> Once the word list has been narrowed down to 100 words or fewer, the final word will be chosen.<br>
                                    <b>Guess Feedback:</b> After the word is chosen:<br>
                                    <ul>
                                        <li><b>Green tiles</b> indicate the correct letter in the correct position.</li>
                                        <li><b>Yellow tiles</b> indicate the correct letter in the wrong position.</li>
                                        <li><b>Grey tiles</b> indicate the letter is not in the word.</li>
                                    </ul>`
                },
                '2': {
                    'Name': 'Elusive Goose',
                    'Instructions': `<b>Guess:</b> Start by guessing a 5-letter word.<br>
                                    After each guess:<br>
                                    <ul>
                                        <li><b>Green tiles</b> indicate the correct letter in the correct position.</li>
                                        <li><b>Yellow tiles</b> indicate the correct letter in the wrong position.</li>
                                        <li><b>Grey tiles</b> indicate the letter is not in the word.</li>
                                    </ul>
                                    <b>Mystery Word Changes:</b><br>
                                    <ul>
                                        <li>Every three guesses, the mystery word will change.</li>
                                        <li>The new word will always include any green letters that have been guessed correctly so far.</li>
                                    </ul>
                                    <i>Note:</i> Letters can be used more than once in the same guess.`
                }
            };
let words, wordlist, words_all, scoreboard,
answers, answer, guesses, guesses_all,
gameMode, wordCount, gameStatus;

$(document).ready(function() {
    $('#mode-menu').addClass('show');
    setGameMode(2);
});

$(document).on('click', '#mode-menu .mode-btn', function() {
    setGameMode($(this).data('mode'));
    $('#mode-menu').removeClass('show');
});

$(document).on('click', '.active-tile', function() {
    if (!$(this).hasClass('starter-tile')) {
        $('.selected-tile').removeClass('selected-tile');
        $(this).addClass('selected-tile');
    }
});

$(document).on('click', '.editable-tile', function() {
    $('.selected-tile').removeClass('selected-tile');
    $(this).addClass('selected-tile');
});

$(document).on('click', '.menu .close-btn', function() {
    $(this).closest('.menu').removeClass('show');
});

$(document).on('click', '#mode-btn', function() {
    $('.menu').removeClass('show');
    $('#mode-menu').addClass('show');
});

$(document).on('click', '#reset-dialog .reset-cancel-btn', function() {
    $('#reset-dialog').removeClass('show');
});

$(document).on('click', '#reset-dialog .reset-confirm-btn', function() {
    $('#reset-dialog').removeClass('show');
    initialize();
});

$(document).on('click', '#lose-dialog .giveup-cancel-btn', function() {
    $('#lose-dialog').removeClass('show');
});

$(document).on('click', '#lose-dialog .giveup-confirm-btn', function() {
    if (gameStatus === 0) {
        gameStatus = -1;
        $('#lose-dialog').removeClass('show');
        endGame();
    }
});

$(document).on('click', '#player-dialog .player-submit-btn', async function() {
    let playerName = $('#player-input').val();
    if (playerName !== '') {
        $('#player-dialog').removeClass('show');
        
        let gamePlay = {
            "Name": playerName.toString(),
            "Mode": [1, 1.5].includes(gameMode) ? 1 : 2,
            "Word": answer !== undefined && answer !== null ? answer.word.toUpperCase() : '',
            "WordsGuesses": guesses_all.length
        }

        await submitGamePlay(gamePlay);
        $('.menu').removeClass('show');
        $('#scoreboard').addClass('show');
        readScoreboard();
    } else {
        // handle empty input
    }
    endGame();
});

$(document).on('click', '#player-dialog .player-skip-btn', function() {
    $('#player-dialog').removeClass('show');
    endGame(1);
});

$(document).on('click', '#scoreboard-btn', async function() {
    $('.menu').removeClass('show');
    $('#scoreboard').addClass('show');
    readScoreboard();
});

$(document).on('click', '.view-instructions', function() {
    $('.menu').removeClass('show');
    $('#instructions-dialog').addClass('show');
});

$(document).on('click', '.view-definition', async function() {
    let term = '';
    $(this).siblings('.answer-group').find('.tile').each(function() {
        term += $(this).data('letter');
    });

    $('#definition-dialog h4').text('');
    $('#definition-dialog p').text('');
    $('#definition-dialog ol').empty();

    $('#definition-dialog').addClass('show');    
    $('.definition-loading-wheel').show();
    let result = await getDefinition(term);
    $('.definition-loading-wheel').hide();
    
    $('#definition-dialog h4').text(term.toLowerCase());
    $('#definition-dialog p').text(result.stems.join(', '));
    for (let d = 0; d < result.definitions.length; d++) {
        $('#definition-dialog ol').append(`<li>${result.definitions[d]}</li>`)
    }
});

$(document).on('click', '.keyboard-key', function() {
    let key = $(this).data('key');
    switch (key) {
        case '↵': // enter
            if ($('.filled-tile').length > 0 && $('.filled-tile').length % 5 === 0 && gameStatus === 0) submitGuess($('.filled-tile').last().closest('.group').find('.tile'));
            break;
        case '←': // backspace
            if (gameStatus === 0) {
                let $selectedTile = $('.selected-tile').length > 0 ? $('.selected-tile').first() : $('.editable-tile').last();
                $selectedTile.data('letter', '').text('').removeClass('editable-tile').removeClass('selected-tile').addClass('empty-tile');
            }
            break;
        case 'reset': // reset
            $('.menu').removeClass('show');
            $('#reset-dialog').addClass('show');
            break;
        case 'giveup': // give up
            if (gameStatus === 0) {
                $('.menu').removeClass('show');
                $('#lose-dialog').addClass('show');
            }
            break;
        default: // character
            if (($('.editable-tile').length === 0 || $('.empty-tile').length % 5 !== 0) && gameStatus === 0) {
                let $selectedTile = $('.selected-tile').length > 0 ? $('.selected-tile').first() : $('.empty-tile').first();
                $selectedTile.data('letter', key).text(key).removeClass('empty-tile').removeClass('selected-tile').addClass('filled-tile').addClass('editable-tile');
            }
            break;
    }
});

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

async function initialize() {
    $('.board').remove();
    $('.keyboard-key').removeClass('incorrect-key').removeClass('present-key').removeClass('correct-key');
    answers = [];
    guesses = [];
    guesses_all = [];
    gameStatus = 0;
    
    await retrieveWordLists();
    words = wordlist;
    wordCount = words.length;

    switch(gameMode) {
        case 1: // snare trap
            $('.bar').css('width', '100%');
            $('.bar-marker').css('left', `${100/wordCount*100}%`).css('opacity', 1);
            $('.progress-msg').text(`${wordCount} / ${wordCount} words`);
            break;
        case 2: // elusive goose
            answer = getWord();
            answers.push(answer);
            $('.bar').css('width', '0');
            $('.bar-marker').css('opacity', 0);
            $('.progress-msg').text('');
            break;
        default: break;
    }
    
    $('#mode-btn').text(modes[gameMode].Name).css('opacity', 1);
    $('#instructions-dialog h3').html(modes[gameMode].Name);
    $('#instructions-dialog p').html(modes[gameMode].Instructions);
    initializeNewBoard();
}

async function setGameMode(mode) {
    gameMode = mode;
    await initialize();
}

function endGame() {
    if (answers.length > 0 && guesses_all.length > 0) {
        $('.answer-group').each(function(index) {
            let answerArr = answers[index].word.split('');            
            $(this).find('.tile').each(function(idx) {
                $(this).data('letter', answerArr[idx]).text(answerArr[idx]);
            });
        });
        $('.answer-group').css('display', 'grid');
        $('.view-definition').css('display', 'block');
    }
}

async function retrieveWordLists() {
    wordlist = await readWordlist('./wordlist.txt');
    words_all = await readWordlist('./wordlist-all.txt');
}

async function readWordlist(filePath) {
    return fetch(filePath)
    .then(response => {
        return response.text();
    })
    .then(data => {
        return data.split('\r\n').map(word => ({ 'word': word, 'stringMap': getStringMap(word), 'score': 0 }));;
    })
    .catch(error => {
        console.error("Error reading file:", error);
    });
}

function initializeNewBoard() {
    $('.board-container').append('<div class="board"></div>');
    populateBoard($('.board').last());
    let boards = document.querySelectorAll('.board');
    boards[boards.length - 1].scrollIntoView({behavior: 'smooth'});
}

function populateBoard($board) {
    let rows = gameMode === 2 ? 3 : 1;
    for (let g = 0; g < rows; g++) {
        let $group = $(`<div class="group"></div>`);
        for (let t = 0; t < 5; t++) $group.append(`<div class="tile empty-tile ${g === 0 ? 'active-tile' : ''}" data-index="${t+1}"></div>`);
        $board.append($group);
    }
    if (gameMode === 1 && guesses_all.length === 0) {
        let rand_char = characters[Math.floor(Math.random() * 25)];
        $('.active-tile').first().data('letter', rand_char).text(rand_char).removeClass('empty-tile').addClass('filled-tile').addClass('starter-tile');
    } else {
        let $group = $(`<div class="group answer-group"></div>`);
        for (let t = 0; t < 5; t++) $group.append(`<div class="tile" data-index="${t+1}"></div>`);
        $board.append($group).append('<i class="fa fa-question-circle view-definition"></i>');
    }
}

function readScoreboard() {
    $.ajax({
        type: "GET",
        url: "https://prod-56.westus.logic.azure.com:443/workflows/7534300353cb48ad892f6741046aeab8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JS-U_mvyGe_-PXwesvCPE7DA0oASww0h6h7D1RXM47Q",
        success: function(data) {
            scoreboard = data;
            populateScoreboard();
        }
    });
}

function populateScoreboard() {
    $('#st-scoreboard table tbody').empty();
    for (let place in scoreboard.ST_Top10) {
        let placement = scoreboard.ST_Top10[place];
        let player = placement.Player;
        let words = placement.WordsGuesses;
        $('#st-scoreboard table tbody').append(`<tr><td>${player.Name}</td><td style="text-align:center;">${words}</td></tr>`);
    }
    $('#eg-scoreboard table tbody').empty();
    for (let place in scoreboard.EG_Top10) {
        let placement = scoreboard.EG_Top10[place];
        let player = placement.Player;
        let word = placement.Word;
        let guesses = placement.WordsGuesses;
        $('#eg-scoreboard table tbody').append(`<tr><td>${player.Name}</td><td>${word}</td><td style="text-align:center;">${guesses}</td></tr>`);
    }
    $('.scoreboard-loading-wheel').hide();
}

function submitGamePlay(player) {
    return new Promise(resolve => {
        let flowURL = 'https://prod-95.westus.logic.azure.com:443/workflows/9cca4ec3bb254d5bb2dac2f3a3dc8e63/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uFrW_vZRf0yHWf-fQP5Dt_CWj8PSnO1woGxfLCK-5cI';
        let req = new XMLHttpRequest();
        req.open("POST", flowURL, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    let result = JSON.parse(this.response);
                    resolve(result);
                }
            }
        };
        req.send(JSON.stringify(player));
    });
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
        $('.active-tile').removeClass('active-tile');
        $('.empty-tile').slice(0, 5).each(function() {
            $(this).addClass('active-tile');
        });
    }
}

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
    $('.progress-msg').text(`${words.length} / ${wordCount} words`);

    if (words.length <= 500) {
        // choose new word
        answer = getWord();        
        answers.push(answer);
        // send toast
        showToast(`A word has been chosen!`);
        gameMode = 1.5;
        $('.bar-marker').css('opacity', 0);
        $('.progress-msg').text('');
    } else $('.bar').css('width', `${words.length/wordCount*100}%`);
    
    // if board is filled, initialize a new one
    if ($('.empty-tile').length === 0) initializeNewBoard();
}

function processGuessEG($tiles, guessedWord) {
    // split answer characters into an array
    let answerArr = answer.word.split('').map(c => ({ 'letter': c, 'marked': false }));
    let letters = guessedWord.split('').map((l, idx) => ({ 'index': idx, 'letter': l, 'marked': false }));

    for (let c = 0; c < answerArr.length; c++) {
        let match = letters.find((l, idx) => l.letter === answerArr[c].letter && !l.marked && idx === c); // find in guess at same index

        if (match !== undefined) {
            let $key = $(`.keyboard-key[data-key="${match.letter}"]`);
            $tiles.eq(match.index).addClass('correct-tile');
            $key.removeClass('present-key').addClass('correct-key');
            match.marked = true;
            answerArr[c].marked = true;
        }
    }

    let unmarked = answerArr.filter(c => !c.marked);
    for (let c = 0; c < unmarked.length; c++) {
        let match = letters.find(l => l.letter === unmarked[c].letter && !l.marked); // find anywhere in guess

        if (match !== undefined) {
            let $key = $(`.keyboard-key[data-key="${match.letter}"]`);
            $tiles.eq(match.index).addClass('present-tile');
            if (!$key.hasClass('correct-key')) $key.addClass('present-key');
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

function getWord() {
    let index = Math.floor(Math.random() * words.length);
    return words[index];
}

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

function showToast(text) {
    $('#toast-msg').text(text).addClass('show');
    setTimeout(function(){ $('#toast-msg').removeClass('show'); }, 3000);
}

function getDefinition(term) {
    return new Promise(resolve => {
        let flowURL = 'https://prod-36.westus.logic.azure.com:443/workflows/1b3523c694f3450bbedc70d5a6a0017b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mFxXtjnlu0AQ2-BZ66dNgFkoQTRTEEte36VvS7pEsxE';
        let req = new XMLHttpRequest();
        req.open("POST", flowURL, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    let result = JSON.parse(this.response);
                    resolve(result);
                }
            }
        };
        req.send(JSON.stringify({ 'term': term }));
    });
}