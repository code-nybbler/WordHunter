let s=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];let t={1:{Name:'Snare Trap',Instructions:`<b>Narrowing Down the Wordlist:</b> Begin by making a series of guesses. Each accepted guess will filter down the list.<br>
    <b>Letter Grouping Restriction:</b> No subsequent guesses can contain two or more letters that appear together in a previous guess.<br>
    <ul><li><i>Example:</i> If your first guess is "Water", you cannot guess "Peach" since the letters "E" and "A" are in "Water".</li></ul>
    <b>Word Selection:</b> Once the word list has been narrowed down to 500 words or fewer, the final word will be chosen.<br>
    <b>Guess Feedback:</b> After the word is chosen:<br>
    <ul>
        <li><b>Green tiles</b> indicate the correct letter in the correct position.</li>
        <li><b>Yellow tiles</b> indicate the correct letter in the wrong position.</li>
        <li><b>Grey tiles</b> indicate the letter is not in the word.</li>
    </ul>`},2:{Name:'Elusive Goose',Instructions:`<b>Guess:</b> Start by guessing a 5-letter word.<br>
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
    <i>Note:</i> Letters can be used more than once in the same guess.`}};let n,l,a,i,d,c,h,u,f,r,m;$(document).ready(function(){$('#mode-menu').addClass('show');e(2)});$(document).on('click','#mode-menu .mode-btn',function(){e($(this).data('mode'));$('#mode-menu').removeClass('show')});$(document).on('click','.active-tile',function(){if(!$(this).hasClass('starter-tile')){$('.selected-tile').removeClass('selected-tile');$(this).addClass('selected-tile')}});$(document).on('click','.editable-tile',function(){$('.selected-tile').removeClass('selected-tile');$(this).addClass('selected-tile')});$(document).on('click','.menu .close-btn',function(){$(this).closest('.menu').removeClass('show')});$(document).on('click','#mode-btn',function(){$('.menu').removeClass('show');$('#mode-menu').addClass('show')});$(document).on('click','#reset-dialog .reset-cancel-btn',function(){$('#reset-dialog').removeClass('show')});$(document).on('click','#reset-dialog .reset-confirm-btn',function(){$('#reset-dialog').removeClass('show');o()});$(document).on('click','#lose-dialog .giveup-cancel-btn',function(){$('#lose-dialog').removeClass('show')});$(document).on('click','#lose-dialog .giveup-confirm-btn',function(){if(m===0){m=-1;$('#lose-dialog').removeClass('show');b()}});$(document).on('click','#player-dialog .player-submit-btn',async function(){let t=$('#player-input').val();if(t!==''){$('#player-dialog').removeClass('show');let e={Name:t.toString(),Mode:[1,1.5].includes(f)?1:2,Word:c!==undefined&&c!==null?c.word.toUpperCase():'',WordsGuesses:u.length};await v(e);$('.menu').removeClass('show');$('#scoreboard').addClass('show');w()}else{}b()});$(document).on('click','#player-dialog .player-skip-btn',function(){$('#player-dialog').removeClass('show');b(1)});$(document).on('click','#scoreboard-btn',async function(){$('.menu').removeClass('show');$('#scoreboard').addClass('show');w()});$(document).on('click','.fa-question-circle',function(){$('.menu').removeClass('show');$('#instructions-dialog').addClass('show')});$(document).on('click','.keyboard-key',function(){let t=$(this).data('key');switch(t){case'↵':if($('.filled-tile').length>0&&$('.filled-tile').length%5===0&&m===0)x($('.filled-tile').last().closest('.group').find('.tile'));break;case'←':if(m===0){let e=$('.selected-tile').length>0?$('.selected-tile').first():$('.editable-tile').last();e.data('letter','').text('').removeClass('editable-tile').removeClass('selected-tile').addClass('empty-tile')}break;case'reset':$('.menu').removeClass('show');$('#reset-dialog').addClass('show');break;case'giveup':if(m===0){$('.menu').removeClass('show');$('#lose-dialog').addClass('show')}break;default:if(($('.editable-tile').length===0||$('.empty-tile').length%5!==0)&&m===0){let e=$('.selected-tile').length>0?$('.selected-tile').first():$('.empty-tile').first();e.data('letter',t).text(t).removeClass('empty-tile').removeClass('selected-tile').addClass('filled-tile').addClass('editable-tile')}break}});$(document).on('keyup',function(e){let t=e.keyCode||e.which;if(t===8||t===13||t>=65&&t<=90){switch(t){case 13:$('.keyboard-key[data-key="↵"]').click();break;case 8:$('.keyboard-key[data-key="←"]').click();break;default:$(`.keyboard-key[data-key="${s[t-65]}"]`).click();break}}});async function o(){$('.board').remove();$('.keyboard-key').removeClass('incorrect-key').removeClass('present-key').removeClass('correct-key');d=[];h=[];u=[];m=0;await g();n=f===1?a:l;r=n.length;switch(f){case 1:$('.bar').css('width','100%');$('.bar-marker').css('left',`${500/r*100}%`).css('opacity',1);$('.progress-msg').text(`${r} / ${r} words`);break;case 2:c=W();d.push(c);$('.bar').css('width','0');$('.bar-marker').css('opacity',0);$('.progress-msg').text('');break;default:break}y()}async function e(e){f=e;await o();n=f===1?a:l;r=n.length;$('#mode-btn').text(t[f].Name).css('opacity',1);$('#instructions-dialog h3').html(t[f].Name);$('#instructions-dialog p').html(t[f].Instructions)}function b(){if(d.length>0&&u.length>0){$('.answer-group').each(function(e){let t=d[e].word.split('');$(this).find('.tile').each(function(e){$(this).data('letter',t[e]).text(t[e])})});$('.answer-group').css('display','grid')}}async function g(){l=await p('./wordlist.txt');a=await p('./wordlist-all.txt')}async function p(e){return fetch(e).then(e=>{return e.text()}).then(e=>{return e.split('\r\n').map(e=>({word:e,stringMap:S(e),score:0}))})["catch"](e=>{console.error("Error reading file:",e)})}function y(){$('.board-container').append('<div class="board"></div>');k($('.board').last());let e=document.querySelectorAll('.board');e[e.length-1].scrollIntoView({behavior:'smooth'})}function k(e){let t=f===2?3:1;for(let s=0;s<t;s++){let t=$(`<div class="group"></div>`);for(let e=0;e<5;e++)t.append(`<div class="tile empty-tile ${s===0?'active-tile':''}" data-index="${e+1}"></div>`);e.append(t)}if(f===1&&u.length===0){let e=s[Math.floor(Math.random()*25)];$('.active-tile').first().data('letter',e).text(e).removeClass('empty-tile').addClass('filled-tile').addClass('starter-tile')}else{let t=$(`<div class="group answer-group"></div>`);for(let e=0;e<5;e++)t.append(`<div class="tile" data-index="${e+1}"></div>`);e.append(t)}}function w(){$.ajax({type:"GET",url:"https://prod-56.westus.logic.azure.com:443/workflows/7534300353cb48ad892f6741046aeab8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JS-U_mvyGe_-PXwesvCPE7DA0oASww0h6h7D1RXM47Q",success:function(e){i=e;C()}})}function C(){$('#st-scoreboard table tbody').empty();for(let l in i.ST_Top10){let e=i.ST_Top10[l];let t=e.Player;let s=e.WordsGuesses;$('#st-scoreboard table tbody').append(`<tr><td>${t.Name}</td><td style="text-align:center;">${s}</td></tr>`)}$('#eg-scoreboard table tbody').empty();for(let a in i.EG_Top10){let e=i.EG_Top10[a];let t=e.Player;let s=e.Word;let l=e.WordsGuesses;$('#eg-scoreboard table tbody').append(`<tr><td>${t.Name}</td><td>${s}</td><td style="text-align:center;">${l}</td></tr>`)}$('.scoreboard-loading-wheel').hide()}function v(l){return new Promise(t=>{let e='https://prod-95.westus.logic.azure.com:443/workflows/9cca4ec3bb254d5bb2dac2f3a3dc8e63/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uFrW_vZRf0yHWf-fQP5Dt_CWj8PSnO1woGxfLCK-5cI';let s=new XMLHttpRequest;s.open("POST",e,true);s.setRequestHeader("Content-Type","application/json");s.onreadystatechange=function(){if(this.readyState===4){s.onreadystatechange=null;if(this.status===200){let e=JSON.parse(this.response);t(e)}}};s.send(JSON.stringify(l))})}function x(e){let t=[];e.each(function(){t.push($(this).data('letter'))});let s=t.join('');if(h.includes(s)){M('Word was already guessed!');e.each(function(){$(this).addClass('editable-tile')})}else if(f!==1&&a.find(e=>e.word===s)===undefined){M('Word is not in the wordlist!');e.each(function(){$(this).addClass('editable-tile')})}else if(f===1&&n.find(e=>e.word===s)===undefined){M('Word is not in the wordlist!');e.each(function(){if(!$(this).hasClass('starter-tile'))$(this).addClass('editable-tile')})}else{e.each(function(){$(this).removeClass('editable-tile').addClass('submitted-tile')});j(e,s);$('.active-tile').removeClass('active-tile');$('.empty-tile').slice(0,5).each(function(){$(this).addClass('active-tile')})}}function j(e,t){h.push(t);u.push(t);switch(f){case 1:O(t);break;case 1.5:case 2:G(e,t);break;default:break}}function O(t){n=n.map(e=>({...e,score:T(e,t)})).filter(e=>e.score<2);$('.progress-msg').text(`${n.length} / ${r} words`);if(n.length<=500){c=W();d.push(c);M(`A word has been chosen!`);f=1.5;$('.bar-marker').css('opacity',0);$('.progress-msg').text('')}else $('.bar').css('width',`${n.length/r*100}%`);if($('.empty-tile').length===0)y()}function G(l,e){let a=c.word.split('').map(e=>({letter:e,marked:false}));let i=e.split('').map((e,t)=>({index:t,letter:e,marked:false}));for(let s=0;s<a.length;s++){let t=i.find((e,t)=>e.letter===a[s].letter&&!e.marked&&t===s);if(t!==undefined){let e=$(`.keyboard-key[data-key="${t.letter}"]`);l.eq(t.index).addClass('correct-tile');e.removeClass('present-key').addClass('correct-key');t.marked=true;a[s].marked=true}}let r=a.filter(e=>!e.marked);for(let s=0;s<r.length;s++){let t=i.find(e=>e.letter===r[s].letter&&!e.marked);if(t!==undefined){let e=$(`.keyboard-key[data-key="${t.letter}"]`);l.eq(t.index).addClass('present-tile');if(!e.hasClass('correct-key'))e.addClass('present-key');t.marked=true}}let s=i.filter(e=>!e.marked);for(let t=0;t<s.length;t++){let e=$(`.keyboard-key[data-key="${s[t].letter}"]`);l.eq(s[t].index).addClass('incorrect-tile');if(!e.hasClass('correct-key')&&!e.hasClass('present-key'))e.addClass('incorrect-key')}let t={};$('.submitted-tile').last().closest('.group').find('.correct-tile').each(function(){t[$(this).data('index')]=$(this).data('letter')});let o={};$('.submitted-tile').last().closest('.group').find('.present-tile').each(function(){o[$(this).data('index')]=$(this).data('letter')});if(e===c.word){m=1;M(`You won after ${u.length} guesses!`);$('#player-dialog').addClass('show');$('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}else if($('.empty-tile').length<30&&$('.empty-tile').length%15===0&&f===2){n=n.map(e=>({...e,score:T(e,Object.values(t).join(''))})).filter(e=>e.score>=Object.keys(t).length&&e!==c.word);c=W();d.push(c);h=[];M(`The answer changed!`);$('.keyboard-key').removeClass('incorrect-key').removeClass('present-key');$('.correct-key').removeClass('correct-key').addClass('present-key');if($('.empty-tile').length===0){$('.bar').css('width',`${Object.keys(t).length>0?Object.keys(t).length/10*100:0}%`);y()}else $('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}else if(f===1.5&&$('.empty-tile').length===0){y();$('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}else $('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}function W(){let e=Math.floor(Math.random()*n.length);return n[e]}function S(t){const s=new Map;for(let e of t){if(s.has(e))s.set(e,s.get(e)+1);else s.set(e,1)}return s}function T(e,t){const s=e.stringMap;const l=S(t);let a=0;for(let e of s.keys()){if(l.has(e))a+=Math.min(s.get(e),l.get(e))}return a}function M(e){$('#toast-msg').text(e).addClass('show');setTimeout(function(){$('#toast-msg').removeClass('show')},3e3)}