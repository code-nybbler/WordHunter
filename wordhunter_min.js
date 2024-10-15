let s=['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];let e={1:{Name:'Snare Trap',Instructions:`<b>Narrowing Down the Wordlist:</b> Begin by making a series of guesses. Each accepted guess will filter down the list.<br>
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
    <i>Note:</i> Letters can be used more than once in the same guess.`}};let r,t,i,a,d,c,u,h,f,l,p;$(document).ready(function(){$('#mode-menu').addClass('show');o(2)});$(document).on('click','#mode-menu .mode-btn',function(){o($(this).data('mode'));$('#mode-menu').removeClass('show')});$(document).on('click','.active-tile',function(){if(!$(this).hasClass('starter-tile')){$('.selected-tile').removeClass('selected-tile');$(this).addClass('selected-tile')}});$(document).on('click','.editable-tile',function(){$('.selected-tile').removeClass('selected-tile');$(this).addClass('selected-tile')});$(document).on('click','.menu .close-btn',function(){$(this).closest('.menu').removeClass('show')});$(document).on('click','#mode-btn',function(){$('.menu').removeClass('show');$('#mode-menu').addClass('show')});$(document).on('click','#reset-dialog .reset-cancel-btn',function(){$('#reset-dialog').removeClass('show')});$(document).on('click','#reset-dialog .reset-confirm-btn',function(){$('#reset-dialog').removeClass('show');n()});$(document).on('click','#lose-dialog .giveup-cancel-btn',function(){$('#lose-dialog').removeClass('show')});$(document).on('click','#lose-dialog .giveup-confirm-btn',function(){if(p===0){p=-1;$('#lose-dialog').removeClass('show');m()}});$(document).on('click','#player-dialog .player-submit-btn',async function(){let t=$('#player-input').val();if(t!==''){$('#player-dialog').removeClass('show');let e={Name:t.toString(),Mode:[1,1.5].includes(f)?1:2,Word:c!==undefined&&c!==null?c.word.toUpperCase():'',WordsGuesses:h.length};await x(e);C()}m()});$(document).on('click','#player-dialog .player-skip-btn',function(){$('#player-dialog').removeClass('show');m(1)});$(document).on('click','#scoreboard-btn',async function(){C()});$(document).on('click','.view-instructions',function(){$('.menu').removeClass('show');$('#instructions-dialog').addClass('show')});$(document).on('click','.view-definition',async function(){let e='';$(this).siblings('.answer-group').find('.tile').each(function(){e+=$(this).data('letter')});$('.definition-container').empty();$('#definition-dialog').addClass('show');$('.definition-loading-wheel').show();let l=await F(e);$('.definition-loading-wheel').hide();$('.definition-container').append(`<h4>${e.toLowerCase()}</h4>`);for(let i=0;i<l.length;i++){let e=l[i];let t=e.stems;let s=e.definitions;$('.definition-container').append(`<span style="font-weight:600">${e.id} (${e.fl})</span><br>`);$('.definition-container').append(`<span><i>${t.join(', ')}</i></span>`);$('.definition-container').append(`<ol><li>${s.join('</li>')}</li></ol>`)}});$(document).on('click','.keyboard-key',function(){let t=$(this).data('key');switch(t){case'↵':if($('.filled-tile').length>0&&$('.filled-tile').length%5===0&&p===0)j($('.filled-tile').last().closest('.group').find('.tile'));break;case'←':if(p===0){let e=$('.selected-tile').length>0?$('.selected-tile').first():$('.editable-tile').last();e.data('letter','').text('').removeClass('editable-tile').removeClass('selected-tile').addClass('empty-tile')}break;case'reset':$('.menu').removeClass('show');$('#reset-dialog').addClass('show');break;case'giveup':if(p===0){$('.menu').removeClass('show');$('#lose-dialog').addClass('show')}break;default:if(($('.editable-tile').length===0||$('.empty-tile').length%5!==0)&&p===0){let e=$('.selected-tile').length>0?$('.selected-tile').first():$('.empty-tile').first();e.data('letter',t).text(t).removeClass('empty-tile').removeClass('selected-tile').addClass('filled-tile').addClass('editable-tile')}break}});$(document).on('keyup',function(e){let t=e.keyCode||e.which;if(t===8||t===13||t>=65&&t<=90){switch(t){case 13:$('.keyboard-key[data-key="↵"]').click();break;case 8:$('.keyboard-key[data-key="←"]').click();break;default:$(`.keyboard-key[data-key="${s[t-65]}"]`).click();break}}});async function n(){$('.board').remove();$('.keyboard-key').removeClass('incorrect-key').removeClass('present-key').removeClass('correct-key');d=[];u=[];h=[];p=0;await g();r=t;l=r.length;switch(f){case 1:$('.bar').css('width','100%');$('.bar-marker').css('left',`${500/l*100}%`).css('opacity',1);$('.progress-msg').text(`${l} / ${l} words`);break;case 2:c=G();d.push(c);$('.bar').css('width','0');$('.bar-marker').css('opacity',0);$('.progress-msg').text('');break;default:break}$('#mode-btn').text(e[f].Name).css('opacity',1);$('#instructions-dialog h3').html(e[f].Name);$('#instructions-dialog p').html(e[f].Instructions);y()}async function o(e){f=e;await n()}function m(){if(d.length>0&&h.length>0){$('.answer-group').each(function(e){let t=d[e].word.split('');$(this).find('.tile').each(function(e){$(this).data('letter',t[e]).text(t[e])})});$('.answer-group').css('display','grid');$('.view-definition').css('display','block')}}async function g(){t=await b('./wordlist.txt');i=await b('./wordlist-all.txt')}async function b(e){return fetch(e).then(e=>{return e.text()}).then(e=>{return e.split('\r\n').map(e=>({word:e,stringMap:W(e),score:0}))})["catch"](e=>{console.error("Error reading file:",e)})}function y(){$('.board-container').append('<div class="board"></div>');w($('.board').last());let e=document.querySelectorAll('.board');e[e.length-1].scrollIntoView({behavior:'smooth'})}function w(e){let t=f===2?3:1;for(let s=0;s<t;s++){let t=$(`<div class="group"></div>`);for(let e=0;e<5;e++)t.append(`<div class="tile empty-tile ${s===0?'active-tile':''}" data-index="${e+1}"></div>`);e.append(t)}if(f===1&&h.length===0){let e=s[Math.floor(Math.random()*25)];$('.active-tile').first().data('letter',e).text(e).removeClass('empty-tile').addClass('filled-tile').addClass('starter-tile')}else{let t=$(`<div class="group answer-group"></div>`);for(let e=0;e<5;e++)t.append(`<div class="tile" data-index="${e+1}"></div>`);e.append(t).append('<i class="fa fa-question-circle view-definition"></i>')}}function k(){$.ajax({type:"GET",url:"https://prod-56.westus.logic.azure.com:443/workflows/7534300353cb48ad892f6741046aeab8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=JS-U_mvyGe_-PXwesvCPE7DA0oASww0h6h7D1RXM47Q",success:function(e){a=e;v()}})}function v(){$('#st-scoreboard table tbody').empty();for(let i in a.ST_Top10){let e=a.ST_Top10[i];let t=e.Player;let s=e.WordsGuesses;$('#st-scoreboard table tbody').append(`<tr><td>${t.Name}</td><td style="text-align:center;">${s}</td></tr>`)}$('#eg-scoreboard table tbody').empty();for(let l in a.EG_Top10){let e=a.EG_Top10[l];let t=e.Player;let s=e.Word;let i=e.WordsGuesses;$('#eg-scoreboard table tbody').append(`<tr><td>${t.Name}</td><td>${s}</td><td style="text-align:center;">${i}</td></tr>`)}$('.scoreboard-loading-wheel').hide()}function C(){$('.menu').removeClass('show');$('#scoreboard').addClass('show');$('.scoreboard-loading-wheel').show();k()}function x(i){return new Promise(t=>{let e='https://prod-95.westus.logic.azure.com:443/workflows/9cca4ec3bb254d5bb2dac2f3a3dc8e63/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=uFrW_vZRf0yHWf-fQP5Dt_CWj8PSnO1woGxfLCK-5cI';let s=new XMLHttpRequest;s.open("POST",e,true);s.setRequestHeader("Content-Type","application/json");s.onreadystatechange=function(){if(this.readyState===4){s.onreadystatechange=null;if(this.status===200){let e=JSON.parse(this.response);t(e)}}};s.send(JSON.stringify(i))})}function j(e){let t=[];e.each(function(){t.push($(this).data('letter'))});let s=t.join('');if(u.includes(s)){E('Word was already guessed!');e.each(function(){$(this).addClass('editable-tile')})}else if(f!==1&&i.find(e=>e.word===s)===undefined){E('Word is not in the wordlist!');e.each(function(){$(this).addClass('editable-tile')})}else if(f===1&&r.find(e=>e.word===s)===undefined){E('Word is not in the wordlist!');e.each(function(){if(!$(this).hasClass('starter-tile'))$(this).addClass('editable-tile')})}else{e.each(function(){$(this).removeClass('editable-tile').addClass('submitted-tile')});O(e,s);$('.active-tile').removeClass('active-tile');$('.empty-tile').slice(0,5).each(function(){$(this).addClass('active-tile')})}}function O(e,t){u.push(t);h.push(t);switch(f){case 1:S(t);break;case 1.5:case 2:T(e,t);break;default:break}}function S(t){r=r.map(e=>({...e,score:N(e,t)})).filter(e=>e.score<2);$('.progress-msg').text(`${r.length} / ${l} words`);if(r.length<=500){c=G();d.push(c);E(`A word has been chosen!`);f=1.5;$('.bar-marker').css('opacity',0);$('.progress-msg').text('')}else $('.bar').css('width',`${r.length/l*100}%`);if($('.empty-tile').length===0)y()}function T(i,e){let l=c.word.split('').map(e=>({letter:e,marked:false}));let a=e.split('').map((e,t)=>({index:t,letter:e,marked:false}));for(let s=0;s<l.length;s++){let t=a.find((e,t)=>e.letter===l[s].letter&&!e.marked&&t===s);if(t!==undefined){let e=$(`.keyboard-key[data-key="${t.letter}"]`);i.eq(t.index).addClass('correct-tile');e.removeClass('present-key').addClass('correct-key');t.marked=true;l[s].marked=true}}let n=l.filter(e=>!e.marked);for(let s=0;s<n.length;s++){let t=a.find(e=>e.letter===n[s].letter&&!e.marked);if(t!==undefined){let e=$(`.keyboard-key[data-key="${t.letter}"]`);i.eq(t.index).addClass('present-tile');if(!e.hasClass('correct-key'))e.addClass('present-key');t.marked=true}}let s=a.filter(e=>!e.marked);for(let t=0;t<s.length;t++){let e=$(`.keyboard-key[data-key="${s[t].letter}"]`);i.eq(s[t].index).addClass('incorrect-tile');if(!e.hasClass('correct-key')&&!e.hasClass('present-key'))e.addClass('incorrect-key')}let t={};$('.submitted-tile').last().closest('.group').find('.correct-tile').each(function(){t[$(this).data('index')]=$(this).data('letter')});let o={};$('.submitted-tile').last().closest('.group').find('.present-tile').each(function(){o[$(this).data('index')]=$(this).data('letter')});if(e===c.word){p=1;E(`You won after ${h.length} guesses!`);$('#player-dialog').addClass('show');$('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}else if($('.empty-tile').length<30&&$('.empty-tile').length%15===0&&f===2){r=r.map(e=>({...e,score:N(e,Object.values(t).join(''))})).filter(e=>e.score>=Object.keys(t).length&&e!==c.word);c=G();d.push(c);u=[];E(`The answer changed!`);$('.keyboard-key').removeClass('incorrect-key').removeClass('present-key');$('.correct-key').removeClass('correct-key').addClass('present-key');if($('.empty-tile').length===0){$('.bar').css('width',`${Object.keys(t).length>0?Object.keys(t).length/10*100:0}%`);y()}else $('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}else if(f===1.5&&$('.empty-tile').length===0){y();$('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}else $('.bar').css('width',`${(Object.keys(o).length+Object.keys(t).length*2)/10*100}%`)}function G(){let e=Math.floor(Math.random()*r.length);return r[e]}function W(t){const s=new Map;for(let e of t){if(s.has(e))s.set(e,s.get(e)+1);else s.set(e,1)}return s}function N(e,t){const s=e.stringMap;const i=W(t);let l=0;for(let e of s.keys()){if(i.has(e))l+=Math.min(s.get(e),i.get(e))}return l}function E(e){$('#toast-msg').text(e).addClass('show');setTimeout(function(){$('#toast-msg').removeClass('show')},3e3)}function F(i){return new Promise(t=>{let e='https://prod-36.westus.logic.azure.com:443/workflows/1b3523c694f3450bbedc70d5a6a0017b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mFxXtjnlu0AQ2-BZ66dNgFkoQTRTEEte36VvS7pEsxE';let s=new XMLHttpRequest;s.open("POST",e,true);s.setRequestHeader("Content-Type","application/json");s.onreadystatechange=function(){if(this.readyState===4){s.onreadystatechange=null;if(this.status===200){let e=JSON.parse(this.response);t(e.def)}}};s.send(JSON.stringify({term:i}))})}