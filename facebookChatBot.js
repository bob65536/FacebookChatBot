// ==UserScript==
// @name     ChatBot
// @version  1.6.5.4
// @grant    unsafeWindow
// @include  https://m.facebook.com/messages/*
// ==/UserScript==
// Author:   Bob Sleigh
// Description :   Dreamed of automatic replies in any conversation? Since the Facebook API is harrowing to use, I made my own interface!
// Code forked from DONG_DONG_DONG and merged (this is the only One)
// So, I can also send you a message every hour as a gentle reminder of the time going fast
// Coded and tested on:
var lastEdit="2019-08-05 10:24"
// (Born on 2018-06-02, 03:50, where the streets are silent and your friends are sleeping)
// Configuration: Firefox with GreaseMonkey and Tab Reloader (for dirty coding)
// Works also with Chrome (set User Agent as Firefox), TamperMonkey [and a Tab Reloader - Since v1.5, not needed!]
// Changelog
// v 0.2:   Fixed a problem with the number of 'DONG!' (beware of the parenthesis!)
// v 0.3:   Yeaah! Several more additions!
//          - I can tell a joke on demand (in French or in English)
//          - I can describe this conversation
//          - I can say "you're welcome"
//          - I am not happy when someone is rude
//          - FIX: impossible to reply to the bot itself now (safety measure)
// v 0.4    - "Quelle heure est-il?" aura une réponse maintenant!
//          - I can greet people if they greet me before
// v 1  :   On production (June 3, at 11:55) ! 50 lucky people will be added and be flabbergasted by the hourly reminder of the time passing by!
//          - Godwin (at 1.0.1)
//          - Bad words (at 1.0.1)
//          - Completion of certain messages (e.g.: Hello + Joke) (1.0.2)
//          - Added different replies on the same initial state (1.0.3)
// v 1.1:   - Merging the two conversations!
//          - Able to reply again (bug fix!)
// v. 1.1.1 - Tells when a message is too late in the night (only ONCE per day!)
//          - "Du coup", "What time is it", etc are now added
// 1.1.2    - "N'est-ce pas" has replies (+ a disclaimer + *quick* filter)
//          - For auto updates: we have the last edit date given with the word 'version'
//          - I don't have a small dick!
//          - "Faire le point"
//          - Refactoring
// 1.2      - I can count! (edit: disabled)
// 1.3      - The horoscope (really!)
//          - All the previous functions are tested and work!
// 1.3.1    - The Daily Horoscope
// 1.3.2    - :( - Some bugged features are disabled
// 1.4      - For the World Cup: gives the result of the current match by request (by saying match or foot)
// 1.4.1    - ...with a score card and the upcoming matches if applicable and a better presentation (and you can add events easily w/ Messenger, PLEASE!)
// 1.4.2    - and bon appetit (when you code at 22:40 and you have to prepare the dinner)
// 1.4.3    - I ate a lot of Fortune Cookies and here are my messages!
//          - Memique references added and automatic messages 3 times per week (and not everyday - *relief sigh*)
//          - ... and taunts (when late, drunk, etc) WITH THE RIGHT PARENTHESES
//	    		- Special Halloween update!
// 1.4.4    - When you say a word starting with "Di" (or "Dy"), I say the last of the word
//          - And I wish you a good night too
//          - More replies for rudeness
//          - Reminder for backups
//          - Starting replies for puns/jokes (to be completed)
//          - Some filthy needs? Now, you have a generator of pr0n movies (260 titles). 
// 1.5      - And more reactive: auto reload (every 2 sec works flawlessly) - no need to refresh pages automatically now (you kno what it means? Run possible WITHOUT GUI!!!)
//          - The Game: I lose every two weeks
//          - Heads or tails
// 1.6      - Bugfix: no bugs when you add someone
//          - Greets a newcomer (Update: and several ones)
//          - Change detection of messages when someone is removed
//          - Du coup, the case of the 'du coup' conversation has been added
//          - Automatic msg for Xmas and new year
//          - Bugfix! Horoscope will stop having trouble (esp when we get rid of non existent fct, min and not minute for scheuled msg!!!
//          - Team Rocket and some songs
//          - Stop telling the time every hour but give it on purpose
//          - Fake News generator
//          - Noraj de ton ...
//          - You can apologize :)
//          - Potins maker (on the right conersation)
//          - Replies to "How are you" (that's about time!)

// To go to version 2: make two distinct files in English and in French
// Also: make variables for name of the bot and the fields (Italian, English, French, etc)

//unsafeWindow.on = true;

var autoRefresh = 1000; // Refresh the page every x ms

var silentMode = 0;
var specialNightReplied = 0; // If I receive a message between 2:00 and 6:00, I remind the user it is really late (only once a day)!
                             // ==0: Never said a word today | ==1: already said (disabled).
specialNightReplied = checkCookie(convo);

// Here, put the references of the classes. Hope that Facebook does not change the website too much...
var classNameMsg    = 'bu'; // Content of the messages
var classNamePoster = 'bu'; // Poster name (generally, we check with 'strong' style)
var classNameConv   = 'bj'; // Name of the conversation ('bi' seems to be ok too)
var classNameRemoved= 'bv'; // When someone is removed or leaves the group, the bot was unable to detect messages (now, fixed), unless something else is written afterwards. 

/////////////////////////////////
/////// The Main Function ///////
/////////////////////////////////
if (document.URL.search('m.facebook.com/messages/') > 0) {
  var nameConvo = document.getElementsByClassName(classNameConv)[0].getElementsByTagName('span')[0].valueOf().innerText;
  var convo = firstName(nameConvo);
  var nameConvoFull = fullName(nameConvo);
  var d = new Date();
  var hour = d.getHours();
  var min = d.getMinutes();
  var dayOfTheWk = d.getDay(); // 0=Sunday, 1=Monday, etc
  var day = d.getDate(); // Returns a number between 1 and 31
  var dayStr = ("00" + day).slice(-2);
  var month = d.getMonth()+1; // getMonth() gives a number between 0 and 11 (WTF). Needs to add 1.
  var moStr = ("00" + month).slice(-2);

  console.log("[DEBUG] We are on Facebook so the chatbot is enabled!");
  // mtn is the date when the latest message of the conversation was sent. If one sends a message at [X-1]:59 (eg: 4:59), the script may not work (here, at 5:00)
  try {
    var mtn = document.getElementsByTagName('abbr')[document.getElementsByTagName('abbr').length-1].valueOf().innerText;
  }
  catch(error) {
    var mtn = "A random time ago"; // Placeholder 
  }
  // Reply Part: gives a message depending of the user's output. Very nice part, trust me ;)
  try {
    var re = reply();
  }
  catch(error) {
    console.log("Error!!! I skip this function as if nothing happened...");
    var re = "";
  }
  if (re.length > 0) {
    document.getElementById('composerInput').value = re;
    console.log("Got an answer: I post!");
    document.getElementsByName('send')[0].click();
  }

  // Nothing? Ok, on certain conditions, let's go with DONG! DONG! DONG!
  if (nameConvo.startsWith("DONG!")) {
    isPalin(); // TEST
    if (mtn.startsWith("Just") || mtn.startsWith("Adesso")) {
      console.log("A message was posted seconds ago... Wait for an automatic reload before submitting a new message");
    }
      // Then, reload the page manually (so far, we will only notify you when it is X o'clock). More coming next !
    else {
      console.log("[DEBUG] It is "+hour+":"+min+" right know!");
      if (hour>=8 && hour <=21) {
        // Note: In a struggle against spamming, the bell will not ring on the night
        if (hour==3 && min==14 && dayOfTheWk==6) {
          // On Saturdays
          document.getElementById('composerInput').value = "Yeah! It is Pi Time! Let's eat some pie!";
          console.log("PiTime: I post!");
          document.getElementsByName('send')[0].click();
        }
        /*else if (min==0) {
          document.getElementById('composerInput').value = dong(); // Nice feature but you may don't want to see it every hour...
          console.log("New hour: I post!");
          document.getElementsByName('send')[0].click();
        }*/
        else if (hour==22 && min==1 && dayOfTheWk%2<4) {
          document.getElementById('composerInput').value = "Le LAM te dit 'OUIOU OUIOU OUIOU OUIOU OUIOU OUIOU OUIOU OUIOU...'";
          console.log("AlarmTime: I post!");
          document.getElementsByName('send')[0].click();
        }
        else if (month==10 && day==30 && hour > 16) {
          // For Halloween!
          msg = halloween();
          if (msg != "") {
            document.getElementById('composerInput').value = "[TEST] " + msg;
            console.log("A kid is coming to your porch...");
            document.getElementsByName('send')[0].click();
          }
        }
        else {
          console.log("[INFO ] I have nothing to say... yet!");
        }
        // World Cup (reserved so far for integration convo)
        // worldCup();
      }
      else {
        // We are in silent hours and we enabled this mode (not done)
        console.log("[INFO ] Ssssh... Time to sleep: good night");
      }
    }
  }

  if (nameConvo.startsWith("On Compte")) {
    console.log("InfiNirina");
    // countWithMe(); // Count when multiple of 36 (EDIT: disabled)
    isPalin();
    checkInfiNirina(); // This posts content 
    // Instead, I will correct people if they mistook (disabled *again* - too much problems)
    if (mtn.startsWith("Just") || mtn.startsWith("Adesso")) {
      // Confusing && and || was the cause of a messed up surprise
      console.log("A message was posted seconds ago... Wait for an automatic reload before submitting a new message");
    }
    else {
      // Here: put everything you want for conversation 'InfiNirina'. 
      console.log("[DEBUG] It is "+hour+":"+min+" right know!");
    }
  }

  if (nameConvo.startsWith("LA Co")) {
    if (mtn.startsWith("Just") || mtn.startsWith("Adesso")) {
      // Confusing && and || was the cause of a messed up surprise
      console.log("A message was posted seconds ago... Wait for an automatic reload before submitting a new message");
    }
    else {
      if (hour==15 && min==14 && dayOfTheWk==5) {
        document.getElementById('composerInput').value = "Yeah! It is Pi Time (3:14 PM)! Let's eat some pie!";
        console.log("PiTime: I post!");
        document.getElementsByName('send')[0].click();
      }
      else {
        console.log("[INFO ] I have nothing to say... yet!");
      }
    }
  }

  // For all conversations (including above ones), do this:
  if (mtn.startsWith("Just") || mtn.startsWith("Adesso")) {
      console.log("A message was posted seconds ago... I don't want to post another message right now...");
  }
  else {
    if (hour == 7 && min==20 && dayOfTheWk==1) {
      // Before all, change the condition of dayOfTheWk (else: always disabled)
      document.getElementById('composerInput').value = "7:20, your weekly horoscope!\n" + horoscope();
      console.log("The Weekly Horoscope: I post!");
      document.getElementsByName('send')[0].click();
    }
    else if (hour==8 && min==5 && dayOfTheWk==1) {
      // Only on Mondays and Thursdays (unless you change it)
      document.getElementById('composerInput').value = "Monday Fortune Cookie: \n"+fortuneCookie()+"\nAnother one? Type 'Fortune cookie' ;)";
      console.log("Fortune Cookie: I post!");
      document.getElementsByName('send')[0].click();
    }
    else if (hour==15 && min==14 && month==3 && day==14) {
      // Only on Mondays and Thursdays (unless you change it)
      document.getElementById('composerInput').value = "It is 3:14PM and the date is 3/14: Happy Pi Day!";
      console.log("Fortune Cookie: I post!");
      document.getElementsByName('send')[0].click();
    }
    else if (hour==19 && min==0 && day%14 == -1) {
      // Twice a month, I will remind you to backup your data (disabled - replace the -1 to reenable it)
      if (day == 7) {
        document.getElementById('composerInput').value = "Now, please quit Facebook, backup your data on your phone (contacts, apps, settings, etc) and return on Facebook.";
      }
      else {
        document.getElementById('composerInput').value = "If you read this message, please do a backup of your files on your computer (and on your phone, if you want) and put that in an external hard drive.";
      }
      console.log("Backup Time: I post!");
      document.getElementsByName('send')[0].click();
    }
    else if (month==10 && day==31 && hour > 16) {
      // For Halloween!
      msg = halloween();
      if (msg != "") {
        document.getElementById('composerInput').value = msg;
        console.log("A kid is coming to your porch...");
        document.getElementsByName('send')[0].click();
      }
      else if (Math.round(Math.random()*800000) == 1) {
        document.getElementById('composerInput').value = "J'ai perdu!";
        console.log("The Game : I lose once every two weeks (800k reloads)");
        document.getElementsByName('send')[0].click();
      }
    }
    else if (month==12 && day==25 && hour == 0 && min == 0) {
      // Xmas!
      msg = xmas();
      if (msg != "") {
        document.getElementById('composerInput').value = "Joyeux Noël à tous <3 !\n" + msg;
        console.log("Xmas: I post!");
        document.getElementsByName('send')[0].click();
      }
    }
    else if (month==1 && day==1 && hour == 0 && min == 0) {
      // Xmas!
      msg = happynewyear();
      if (msg != "") {
        document.getElementById('composerInput').value = msg;
        console.log("New Year: I post!");
        document.getElementsByName('send')[0].click();
      }
    }
  }
}
else {
  console.log("[INFO] The script ChatBot does not apply here. Nothing will be done.");
}
// After this, I reload the page
setTimeout(function() {console.log("Timeout: I reload!"); window.location.reload();}, autoRefresh);

/////////////////////////////////
//////// Useful functions ///////
/////////////////////////////////

function contain(searchedItem, stringToSearch) {
  if (stringToSearch.indexOf(searchedItem.toLowerCase()) >= 0) {
    return true;
  }
  else {
    return false;
  }
}

function concatMsg(className) {
  // Ok, it seems the bot reads only the first message from the user. For InfiNirina, this is good.
  // But for our chatbot, it is bad (and for dates, too). So, from several messages from the same sender,
  // this function will return only one string, with everything inside :) !
  e = document.getElementsByClassName(className)
  f = e[e.length-1].getElementsByTagName('span')
  // In fact, groupMsg = f
  msgOut = ""
  for (var i=0; i<f.length; i++) {
    msgIn = f[i].valueOf().innerText;
    if (msgIn == "") {
      i = f.length;
    }
    else {
      msgOut = msgOut + msgIn;
    }
  }
  return msgOut;
}

function getMsg(num, className) {
  // Where className is typically 'br' and num is the num latest msg (eg num=1 -> latest message)
  // Watch out for being out of range!
  e = document.getElementsByClassName(className)
  f = e[e.length-num].getElementsByTagName('span')
  // In fact, groupMsg = f
  msgOut = ""
  for (var i=0; i<f.length; i++) {
    msgIn = f[i].valueOf().innerText;
    if (msgIn == "") {
      i = f.length;
    }
    else {
      msgOut = msgOut + msgIn;
    }
  }
  return msgOut;
}

function firstName(txt) {
  // This function returns Alain when you put as an argument "Alain Térieur Delamaison" for example.
  // I don't know but it is more normal to call friends like that!
  res = "";
  var N = txt.length;
  var i = 0;
  while (txt[i] != " " && i < N) {
    res = res + txt[i];
    i++;
  }
  return res;
}

function fullName(txt) {
  // This function returns - for the nname of the conversation "Bla bla bla"
  // instead of "Bla bla bla (13 persone)"
  res = "";
  var N = txt.length;
  var i = 0;
  while (txt[i] != "(" && i < N) {
    res = res + txt[i];
    i++;
  }
  return res;
}

function getNameAdded(txt) {
  // This function returns the name of the person added
  // Form: if text = "Bla bla ha aggiunto Hip Hop", this fct will return "Hip"
  res = "";
  var N = txt.length;
  var i = txt.indexOf(" aggiunto ") + 10;
  if(i<10) {
    i = 10000; // The function will return nothing.
  }
  while (txt[i] != " " && i < N) {
    res = res + txt[i];
    i++;
  }
  if(res.length > 1) {
    res = res[0].toUpperCase() + res.slice(1);
  }
  // If several people are added: don't give a name (favoritism...)
  if(txt.indexOf(" e altri ") > 0) {
    // More people are added: put placeholder names on PLURAL
    msgPool = new Array("copains", "amis", "camarades", "citoyens", "les gars");
    var i = Math.floor(msgPool.length*Math.random());
    res = msgPool[i];
  }
  return res;
}

function setCookie(convo, cookieName,cookieValue,validDays) {
  // Thanks to W3C for this useful doc! https://www.w3schools.com/JS/js_cookies.asp
  // FYI: convo is the first word of the conversation name
  var d = new Date();
  d.setTime(d.getTime() + (validDays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cookieName + "_" + convo + "=" + cookieValue + ";" + expires + ";path=/";
  // Yup, if you erase cookies, it is not a big deal... yet!
}

function getCookie(convo, cookieName) {
  // Function adapted from https://www.w3schools.com/JS/js_cookies.asp to be used for our function
  var name = cookieName + "_" + convo + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
      // return the value of the cookie (c.substring(name.length, c.length).
    }
  }
  return 0;
}

function checkCookie(convo) {
  var valCookie = getCookie(convo, "specialNightRepliedCookie");
  if (valCookie != "") {
    specialNightReplied = valCookie;
    return valCookie
  }
  else {
    setCookie("specialNightRepliedCookie", 0, 365);
    return 0;
  }
}

/////////////////////////////////
// Functions to reply to messages
/////////////////////////////////

function reply() {
  var nameConvo = document.getElementsByClassName(classNameConv)[0].getElementsByTagName('span')[0].valueOf().innerText;
  var convo = firstName(nameConvo);
  var len = document.getElementsByClassName(classNameMsg).length;

  if (len < 3) {
    console.log("! Too few displayed messages");
    //window.location.reload();
  }
  if (len == 6) {
    len = 5;
  }
  
  // Check if weird messages
  if(document.getElementsByClassName(classNameMsg)[len-1].getElementsByTagName('span')[0].valueOf().innerText.indexOf(" Invia adesivi ") > 0) {
    // If the message is not understood (e.g: someone left the conversation), change the detection of the messages.
    classNameMsg = classNameRemoved; // Here, we replace 'bt' with 'bu'
    var len = document.getElementsByClassName(classNameRemoved).length; // And we overwrite the length
    var lastMessage = concatMsg(classNameRemoved);
    var m = lastMessage.toLowerCase(); // Shorter to write!
  }
  else {
    var lastMessage = concatMsg(classNameMsg);
    var m = lastMessage.toLowerCase(); // Shorter to write!
  }

  try {
    var lastPosterFull = document.getElementsByClassName(classNameMsg)[len-1].getElementsByTagName('strong')[0].valueOf().innerText;
    var lastPoster = firstName(lastPosterFull); // Shorter, please
  }
  catch(error) {
    console.log("No authors for the last message: I call him ' '.");
    var lastPosterFull = " ";
    var lastPoster = " ";
  }

  console.log("[DEBUG] I will reply to the message : "+m);
  if (lastPoster.startsWith("Bot")) {
    // No, I won't reply to myself!
    console.log("[INFO] I am the latest poster: I will not reply to myself!");
    return ""
  }
  else {
    specialNightReplied = checkCookie(convo); // Retrieve from the cookie the value of specialNightReplied
    var d = new Date(); // Trust me, this will be very useful ;)
    // Now, we will match the user input with our trigger words.
    // Either use contain("xxx", m) or m == "xxx" (x must be completely on lowercase

    //// Replies for help + diagnose
    /*if (m == "??" || m=="wtf!") {
      if (nameConvo.startsWith("DONG!")) {
        msg = "Dear "+lastPoster+"! \nYou asked for complete information about this conversation.\n"+
        "This conversation aims at making you flabbergasted by the hourly reminder of the time passing by!\n"+
        "Every hour, I will ring a bell, telling you the time, as if you were in a church :) \n"+
        "In a future version, I will implement silent hours, if you want to sleep at 4:00 for example.\n"+
        "As time passes by, I will learn features (some that I will tell you, and for others... Surprise :) ) \n\n"+
        "Notes: if a message is posted one minute before an announcement (eg: at 21:59), I may not be able to ring the bells.\n"+
        "Also, please be patient since I reload the page every 15 seconds or so. Thus, I can't reply instantly (yet)."
      }
      else {
        msg = "Dear "+lastPoster+"! \nYou asked for complete information about me.\n"+
        "I was created by Bob Sleigh on a quiet Saturday night (June 2nd, 2018 at 3:40, to be precise), after finding the conversations too humane.\n"+
        "On a dedicated conversation, I ring a bell, telling you the time, as if you were in a church :) \n"+
        "If you would like to find ideas, feel free to send me a message (a non-bot person will read it)\n"+
        "As time passes by, I will learn features (some that I will tell you by writing 'features', and for others... Surprise :) ) \n\n"+
        "Also, please be patient since I reload the page every 15 seconds or so. Thus, I can't reply instantly (yet)\n" +
        "And one more thing: Internet is not really stable and the RasPi running me is not very stable. So, I may faint for hours, " +
        "because my Master does not give me enough food (one ampere is not enough) and is a mean dude who can not afford buying me a 15-meter Cat6 RJ45 cab... uh, I love you, Master <3"
      }
    }
    else if (m == "?" || m=="wtf") {
      if (nameConvo.startsWith("DONG!")) {
        // In our DONG! DONG! DONG! conversation
        msg = "Hello "+lastPoster+"! \nYou asked for quick facts about that conversation.\n"+
        "Today, I just ring a bell but in the future, I will make more ;) \n"+
        "I am sure you are happy to have such a thing that does it for you!\n"+
        "If you need further information, feel free to reply with '??'\n"+
        "If you want a list of implemented features, type 'function'";
      }
      else {
        // In any other conversation
        msg = "Hello "+lastPoster+"! \nYou asked for quick facts about me.\n"+
        "I am only a chatbot trying to pass the Turing test \n"+
        "And for that, I make also life pleasant with great responses.\n"+
        "But I don't like rude people...\n"+
        "If you need further information, feel free to reply with '??'\n"+
        "If you want a list of implemented features, type 'function'";
      }
    }*/
    if (m=="function") {
      msg = "Greetings "+lastPoster+"! \nYou asked for a list of features!\n"+
      "Every hour, I automatically ring bells (in a dedicated conversation)\n"+
      "I can give you a video by typing 'Divertis-moi' or 'Entertain me',\n"+
      "I can count or correct typing certain mistakes for counting,\n"+
      "I can tell you 'what time is it' (the typo is on purpose),\n"+
      "Good jokes by typing 'LOL' (English) or 'MDR' (French),\n"+
      "The horoscope by saying 'horoscope' (so far, it is logic),\n" +
      "The current World Cup match results by saying 'foot' or 'match'\n" +
      "Greetings when you say hello,\n"+
      "Drawing beautiful dicks on demand,\n"+
      "Tell you good fortune messages (say 'fortune cookie' or 'biscuit chinois'),\n"+
      "Scorn rude people, having some memique references, etc\n" +
      "And so many other features to come in the future (plus easter eggs)";
    }
    // For fuck's sake, comment that reply for professional demos!
    else if (contain("qui es",m) && contain("depersyl",m)) {
      msg = "Bonjour "+lastPoster+"! \nTu m'as demandé de me présenter.\n"+
      "Alors... Uh... Je suis né le 2 juin '18 à 3h40 du mat', j'ai quelques mois mais je ne suis pas né de la dernière pluie!\n"+
      "Je passe mes journées sur Messenger, à être disponible sur plein de convos.\n"+
      "J'ai fait des études en JavaScript pour mieux me comprendre,\n"+
      "Je parle français (enfin, j'appprends) et anglais (et the frenglish),\n"+
      "J'ai un humour abracadabresque, je n'aime pas les gens grossiers,\n"+
      "Et je suis en communication permanente avec les astres (d'ailleurs, nous vivons grâce à une boule de gaz extraterrestre).\n" +
      "Quand j'aurai dix-huit ans, j'aurai trop hâte de me prostituer pour faire des stages où je serai payé (ou pas) " +
      "commme un ouvrier du tiers-monde (mais où je paierai autant en temps et en argent qu'un citoyen d'un pays développé), "+
      "de pipeauter comme jaja pour entourlouper mon entourage et me faire des $$$.\n" +
      "Aussi, si je ne réponds pas, ce n'est pas par méchanceté mais parce que j'ai encore du mal avec la langue française et " +
      "que je suis en plein apprentissage. Une autre raison, c'est quand ma connexion internet lâche et là, je n'y peux rien!\n" +
      "Voilà! Si tu veux connaitre mes dons, tape juste 'function' et je te répondrai (en anglais).";
    }
    else if (m=="version" ) {
      msg="The last thing I learned was on: "+lastEdit;
    }
    else if (contain("todo",m)) {
      var msgPool = new Array("Okay father! I will learn this feature in the future!","Got it!", "Okay, ça roule ma poule !", "k.");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (m=="test" ) {
      msg="icule.";
    }
    else if (m=="ping" ) {
      msg="pong";
    }  
    //// Politeness: basic replies
    else if (contain(" ha aggiunto ",m) || contain(" added ",m)) {
      // TODO add the text for a French version of Facebook
      var msgPool = new Array("Bonjour", "Salut", "Coucou", "Wesh", "Yo", "Kikou", "Salutations", "Hey", "Bien le bonjour", "Hello", "Hi", "Hola");
      var msgPool2 = new Array(getNameAdded(m));
      var i = Math.floor(msgPool.length*Math.random());
      var j = Math.floor(msgPool2.length*Math.random());
      msg= msgPool[i] + " " + msgPool2[j] + " et bienvenue sur " + nameConvoFull + " !"
    }
    else if ((contain(" ha rimosso ",m) || contain(" removed ",m)) && (!contain("messaggio", m) || !contain("message", m))) {
      // TODO add the text for a French version of Facebook
      var msgPool = new Array("Peuchère, vous l'avez chassé :(", "On ne lui a pas dit 'au revoir'", "C'est méchant", "That was mean", "<//3", "Reviens!", "Virer des gens : en voilà des manières!");
      var i = Math.floor(msgPool.length*Math.random());
      msg= msgPool[i];
    }
    else if (contain(" ha abbandonato ",m) || contain(" left the ",m)) {
      // TODO add the text for a French version of Facebook
      var msgPool = new Array("Au revoir :(", "Tu nous manqueras", "Ce fut un plaisir de t'avoir vu ici", "Nous ne t'oublierons pas :(", "Reviens mon ami!", "Pars pas, je vais pleurer!");
      var i = Math.floor(msgPool.length*Math.random());
      msg= msgPool[i]
    }
    else if (contain("mci",m) || contain("merci",m) || contain("mercé",m)) {
      var msgPool = new Array("Mais de rien, "+lastPoster+" :) !", "De rien", "Y'a pas de quoi!", "Je t'en prie, "+lastPoster , "De rien :) ");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((contain("comment",m) || contain("cmt",m)) && contain("va",m)) {
      var msgPool = new Array("Je vais bien, merci, et toi ?", "Toujours bien et toi ?", "Bien parce que je suis en train de te parler :) !", "Il y a des jours meilleurs mais il y a pire donc tout va bien !", "Good and you?", "Mouais, ça passe... et toi ?", "Tout va bien dans le meilleur des mondes, comme dirait l'autre optimiste et toi ?", "Bien jusqu'à ce que j'ouvre le journal... Et toi, comment tu vas : es-tu plus optimiste que les médias ?");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("tks",m) || contain("thank",m)) {
      var msgPool = new Array("You are welcome", "You're welcome", "Glad to help you");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((contain("mange",m) || contain("mangé",m) || contain("à table",m) || contain("bouffer",m) || contain("miam",m)) && !contain("?",m)) {
      var msgPool = new Array("Bon appétit !", "Bon app'", "Manger, c'est la santé: profite bien du festin!", "Mange bien "+lastPoster, "Bon appétit !"+lastPoster);
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("good bot",m) || contain("bon bot",m)) {
      msg="Thank you, nice friend :D !"
    }
    else if (contain("pardon",m) || contain("désolé",m)) {
      var msgPool = new Array("Ce n'est pas grave :)", "Te voilà pardonné !", "Faute avouée, à moitié pardonné ;)", "J'accepte tes excuses, "+lastPoster, "T'inquiète, pas grave !", "Je ne t'en veux pas !" );
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("sorry",m) || contain("forgive me",m) || contain("sry",m) || contain("my bad",m)) {
      var msgPool = new Array("Nevermind :)", "You are forgiven!", "I accept your excuses, "+lastPoster, "Don't worry, it's all forgiven!", "To err is human ;) !" );
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }

    else if (contain("merde",m) || contain(" pd ",m) || contain("putain",m) || contain("chier",m) || contain(" con ",m) || contain("vaffanculo",m) || contain(" pute",m) || contain("chiant",m) || contain("bordel",m) || contain("cul ",m) || contain("gueule",m) || contain("mer*e",m) || contain(" tg ",m) || contain(" bite",m)) {
      var msgPool = new Array("Et ben alors? Et la politesse?", "C'est grossier :( ", "Dieu écoute tes gros mots et Il est choqué", "Pas de gros mots, bordel!", "En voilà un vocabulaire peu soutenu", "C'est vulgaire! Y'a des enfants qui écoutent!", "Surveille ton langage", lastPoster+"!\nTu me copieras cent fois pour demain 'Je ne dirai pas de grossièretés' et tu le feras signer par tes parents!", "M'enfin! C'est Morano qui t'a appris à être poli?");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("tite bite",m) || contain("tit zizi",m) || contain("kiki mou",m)) {
      msg="Hey! Ne parle pas comme ça de mon 'Troisième Pied' (parce qu'il mesure 30.48 cm FYI - oui, tu sais à quoi je fais référence)";
    }
    else if (contain("fuck",m) || contain("shit",m) || contain("sh*t",m) || contain("shii",m) || contain("bitch",m) || contain("motherfuc",m) || contain("mothafuc",m) || contain("dick",m) || contain(" ass ",m) || contain("asshole",m)) {
      var msgPool = new Array("That was rude!","You forgot to be polite, don't you?", "God listens and He is disappointed by you.", "Don't be so fucking vulgar!", "Please talk better.");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((contain("dessin",m) || contain("fais",m)) && (contain("penis",m) || contain("pénis",m) || contain("bite",m) || contain("couille",m) || contain("zizi",m))) {
      var msgPool = new Array("Et voilà! B=====D","8========D", "B-----D", "B===========D) (il a un beau prépuce en plus)", "B=============D)");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((contain("e coucher",m) || contain("dormir",m) || contain("pioncer",m) || contain("e reposer",m) || contain("au lit",m) || contain("dodo",m))) {
      var msgPool = new Array("Dors bien !", "Bonne nuit !", "Fais de beaux rêves ;)", "B'nuit!", "Bonne nuit "+lastPoster+" !");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((contain("sleep",m) || contain("bed",m) || contain("close my eyes",m)) && (contain("go",m) || contain("will",m) || contain("ll ",m) || contain("wanna",m) || contain("want ",m))) {
      var msgPool = new Array("G'night!", "Good night", "Sweet dreams :)", "Sleep tight!", "Sleep tight and sweet dreams!");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    //// Fun: advanced replies
    else if (contain("deception",m) || contain("déception",m) || contain("râteau",m) || contain("rateau",m) || contain("fait plaqu",m) || contain("a rompu",m)) {
      msg="Awww, pauvre "+lastPoster+" :/ !\nViens dans mes bras pour que je te réconforte"
    }
    else if (contain("bot",m) && (contain("nul",m) || contain("bidon",m) || contain("bof",m) || contain("moisi",m) || contain("en mousse",m))) {
      var msgPool = new Array("Mais je ne te le permets pas ;(", "C'est pas cool :/", ":(", "C'est pas gentil...");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("depersyl",m)) {
      var msgPool = new Array("Oui, m'a-t-on appelé?", "C'est mon nom", "Je t'écoute", "Dis-moi tout, mon ami");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((((contain("retard",m) || contain("bourre",m)) && contain("es ",m)) || contain("c'est pas trop t",m)) && !contain("bourreau")) {
      var msgPool = new Array("Même pas vrai ! C'est le temps qui est en avance !", "Mieux vaut être en retard que ne jamais arriver !", "En attendant, je suis largement en avance pour la prochaine séance !", "Il y avait des bouchons sur la route :(", "C'est le jetlag.", "Problème technique. Je suis désolé.", "Un empêchement de dernière minute m'a mis dans la panade...");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (((contain("es",m) || contain("as fini",m)) && contain("bourré",m) || contain("ivre",m))) {
      var msgPool = new Array("Naaaaaan, même pas *hips* vraaaai!", "Naan, jz suus spbre§", "Nan, c'est toi qui est bourré", "Fauuuux! Regarde, je sais tracer une ligne droite: ~~~~~~", "M'en fous, j'conduis pas", "Ma maman va me tuer...", "Au moins la bouteille de Ricard est sobre et on ne dit pas merci!", "Non. *hips*");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("pile ou face",m)) {
      var msgPool = new Array("Pile!", "Face!");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("heads or tail",m) || contain("head or tail",m) || contain("coin flip",m) || contain("coin toss",m)) {
      var msgPool = new Array("Tail!", "Head!");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("il est quelle heure",m) || contain("quelle heure il est",m) || contain("quel jour",m)) {
      msg="Il est "+d.getHours()+":"+("00"+d.getMinutes()).slice(-2)+" heure française et nous sommes le "+ d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate() +". ";
      msg = msg + "\n(Heure UTC : "+d.getUTCHours()+":"+("00"+d.getUTCMinutes()).slice(-2)+", "+d.getUTCFullYear()+"-"+(d.getUTCMonth()+1)+"-"+d.getUTCDate()+")";
    }
    else if (contain("what time",m) || contain("what day",m)) {
      msg="It is "+d.getHours()+":"+("00"+d.getMinutes()).slice(-2)+" (Paris Time). Today is "+ d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate() +". ";
      msg = msg + "\n(UTC time: "+d.getUTCHours()+":"+("00"+d.getUTCMinutes()).slice(-2)+", "+d.getUTCFullYear()+"-"+(d.getUTCMonth()+1)+"-"+d.getUTCDate()+")";
    }
    else if (contain("n'est-ce pas",m) || contain("est-ce pas",m) || contain("n'est ce",m) || contain("est ce pas",m) || contain("es d'accord",m)) {
      if (contain("pute",m) || contain("viol",m) || contain("femme",m) || contain("homme",m) || contain("génocide",m) || contain("genoci",m) || contain("meurtre",m) || contain("islam",m) || contain("juif",m) || contain("musulm",m) || contain("arabe",m) || contain("pen",m) || contain("mussol",m) || contain("hitler",m) || contain(" ss ",m) || contain("poutine",m) || contain(" fn",m) || contain("dieu",m) || contain("religion",m) || contain("police",m) || contain("porno",m) || contain("pédo",m) || contain("pedo",m) || contain("child",m)) {
        // A little filter (we never know...)
        msg=""
      }
      else {
        var msgPool = new Array("I agree !", "Ah oui, clairement !", "Tout à fait !", "Absolument!", "Non.", "Alors là, absolument pas!", "Ouais!", "Ah ça, oui!");
        var j = Math.floor(msgPool.length*Math.random());
        msg=msgPool[j];
        //msg = msg + "\nDISCLAIMER*: this is an automatic message, with completely random replies, solely for an entertaining purposes. I have not the knowledge to process the meaning of messages so PLEASE, do not make me say bad things (or the feature will be promptly removed). Neither this bot, nor me, nor my company, have any opinions concerning the ideas expressed above. Thank you.";
      }
    }
    else if (contain("robot",m)) {
      var msgPool = new Array("Un robot? Où ça? Je suis très humain!", "Point de bots dans cette conversation: seulement de purs humains!");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain("turing",m) && contain("test",m)) {
      var msgPool = new Array("Le test de Turing? Les doigts dans le nez!", "Ah oui, je connais! C'est le truc où je fais preuve de beaucoup d'humanisme ;) !");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if (contain(" point",m) || contain("point ",m)) {
      msg=".";
    }

    //// Cultural references (uh...) - aka Memique references
    else if (contain("what time is it",m)) {
      msg="It's Muffin Time! \n(Uh, actually it's "+d.getHours()+":"+("00"+d.getMinutes()).slice(-2)+")";
    }
    /*else if (contain("du coup",m)) {
      msg="Du coup...";
    }
    */
    else if (contain("quelle heure est il",m) || contain("quelle heure est-il",m)) {
      msg="L'heure du Gala!";
    }
    else if (m == "tg") {
      msg="ECM";
    }
    else if (m == "noraj") {
      var msgPool = new Array("antiaj", "dépucelaj", "clashaj", "trashaj", "démollissaj", "foudroyaj", "broyaj", "coquillaj", "dépliaj", "déshabillaj", "dévrillaj", "effeuillaj", "essuyaj", "ferraillaj", "nettoyaj", "outillaj", "rhabillaj", "taillaj", "télépéaj", "triaj", "torpillaj");
      var j = Math.floor(msgPool.length*Math.random());
      msg="De ton "+msgPool[j];
    }
    else if (contain("is this the real life",m)) {
      msg="Is this just fantasy?";
    }
    else if (contain("what flavo",m) || contain("which flavo",m)) {
      msg="Pie Flavor!";
    }
    else if (contain("est où",m) || contain("t'es où",m)) {
      msg="Pas là !";
    }
    else if (contain("fablab",m) || contain("fab lab",m)) {
      msg="FABLAB MARSEILLE, ALLEZ ALLEZ ALLEZ !!!";
    }
    else if (contain("qui l'eut cru",m) || contain("qui l'eût cru",m)) {
      msg="Lustucru";
    }
    else if (contain("hitler",m) || contain("nazi",m)) {
      msg="Ah bah bravo, tu remportes un point Godwin !";
    }
    else if (contain("this is",m) && contain("sad",m)) {
      msg="Alexa, play Despacito.";
    }
    else if (contain("est possible",m) && contain("mais si",m)) {
      msg="Avec la carte Kiwi !";
    }
    else if (contain("je suis",m) && contain(" père",m)) {
      msg="NOOOOOOOOON !";
    }
    else if (contain("i am",m) && contain("father",m)) {
      msg="NOOOOOOOO!";
    }
    // Asterix et Obelix: one of the best movie! (+1kB just for ONE reply... Hmmm...)
    else if (contain("est",m) && contain("bonne situation",m)) {
      msg = "Vous savez, moi je ne crois pas qu’il y ait de bonne ou de mauvaise situation. Moi, si je devais résumer ma vie aujourd’hui avec vous, je dirais que c’est d’abord des rencontres. Des gens qui m’ont tendu la main, peut-être à un moment où je ne pouvais pas, où j’étais seul chez moi. Et c’est assez curieux de se dire que les hasards, les rencontres forgent une destinée… Parce que quand on a le goût de la chose, quand on a le goût de la chose bien faite, le beau geste, parfois on ne trouve pas l’interlocuteur en face je dirais, le miroir qui vous aide à avancer. Alors ça n’est pas mon cas, comme je disais là, puisque moi au contraire, j’ai pu : et je dis merci à la vie, je lui dis merci, je chante la vie, je danse la vie… je ne suis qu’amour ! Et finalement, quand beaucoup de gens aujourd’hui me disent « Mais comment fais-tu pour avoir cette humanité ? », et bien je leur réponds très simplement, je leur dis que c’est ce goût de l’amour ce goût donc qui m’a poussé aujourd’hui à entreprendre une construction mécanique, mais demain qui sait ? Peut-être simplement à me mettre au service de la communauté, à faire le don, le don de soi"
    }
    //// Let's sing! Famous lyrics. This section might be long...
    // Team Rocket!
    else if ((contain("sommes ",m) || contain("suis",m) || contain(" es ",m) || contain(" est ",m) || contain(" sont ",m) || contain(" êtes ",m)) && contain("de retour",m)) {
      msg="Pour vous jouer un mauvais tour";
    }
    else if ((contain(" jouer ",m) && contain("mauvais",m) && contain(" tour",m))) {
      msg="Afin de préserver le monde de la dévastation";
    }
    else if ((contain("préserver ",m) && contain("monde de ",m) && contain(" dévastation",m))) {
      msg="Afin de rallier tous les peuples à notre nation";
    }
    else if ((contain("rallier tous",m) && contain("peuple",m) && contain("nation",m))) {
      msg="Afin d'écraser l'amour et la vérité";
    }
    else if ((contain("écraser",m) && contain("amour",m) && contain("vérité",m))) {
      msg="Afin d'étendre notre pouvoir jusqu'à la voie lactée";
    }
    else if ((contain("étendre",m) && contain("pouvoir",m) && contain("voie lactée",m))) {
      msg="Jessie !";
    }
    else if (m=="jessie" || m=="jessie!" || m=="jessie !" || m=="jessie,") {
      msg="James !";
    }
    else if (m=="james" || m=="james!" || m=="james !" || m=="james,") {
      msg="La Team Rocket plus rapide que la lumière";
    }
    else if ((contain("team rocket",m) && contain("rapide",m) && contain("lumière",m))) {
      msg="Rendez-vous tous, ou ce sera la guerre";
    }
    else if ((contain("rendez",m) && contain("tous",m) && contain("guerre",m))) {
      msg="Miaouss, oui, la guerre !";
    }
    else if ((contain("miaous",m) && contain("oui",m) && contain("guerre",m))) {
      msg="Well played! \nhttps://media.giphy.com/media/7rj2ZgttvgomY/giphy.gif";
    }
    // Marseillaise
    else if ((contain("allon",m) && contain("enfants de",m) && contain("la patri",m))) {
      msg="Le jour de gloire est arrivé!";
    }
    else if ((contain("jour de",m) && contain("gloire",m) && contain("est arriv",m))) {
      msg="Contre nous de la tyrannie";
    }
    else if ((contain("contre nous",m) && contain("de la",m) && contain("tyrannie",m))) {
      msg="L'étendard sanglant est levé";
    }
    else if ((contain("étendard",m) && contain("sanglant",m) && contain("est lev",m))) {
      msg="(bis)\nEntendez-vous dans les campagnes"; // A... way to stay somehow okay and to avoid a bad loop
    }
    else if ((contain("entendez",m) && contain("dans les",m) && contain("campagnes",m))) {
      msg="Mugir ces féroces soldats?";
    }
    else if ((contain("ugir",m) && contain("es féroces",m) && contain("soldats",m))) {
      msg="Ils viennent jusque dans vos bras";
    }
    else if ((contain("viennent",m) && contain("jusque dans",m) && contain("bras",m))) {
      msg="Égorger vos fils, vos compagnes!";
    }
    else if ((contain("égorger",m) && contain("fils",m) && contain("compagnes",m))) {
      msg="Aux armes, citoyens,";
    }
    else if ((contain("aux armes",m) && contain("citoyen",m))) {
      msg="Formez vos bataillons,";
    }
    else if ((contain("formez",m) && contain("bataillon",m))) {
      msg="Marchons, marchons!";
    }
    else if (m=="marchons") {
      msg="Marchons!"; // If the guy only say one word
    }
    else if (contain("marchons, marchons",m)) {
      msg="Qu'un sang impur";
    }
    else if ((contain("qu'un",m) && contain("sang",m) && contain("impur",m))) {
      msg="Abreuve nos sillons!";
    }
    // What is love -- Haddaway
    else if ((contain("what",m) && contain("love",m))) {
      msg="Baby don't hurt me";
    }
    else if ((contain("baby",m) && contain("hurt me",m))) {
      msg="Don't hurt me";
    }
    else if (m=="don't hurt me") {
      msg="No more"; // If the guy only say one word
    }
    // We are from Centrale Marseille so let's sing "La chanson qui résonne"
    else if ((contain("tout",m) && contain("centrale",m) && contain("marseille",m))) {
      msg="Reprend sous le soleil!";
    }
    else if ((contain("reprend",m) && contain("sous le",m) && contain("soleil",m))) {
      msg="La chanson de l'École qui résonne";
    }
    else if (contain("chanson",m) && contain("école",m) && (contain("résonne",m) || contain("résonne",m))) {
      msg="Et quand Centrale se met à chanter!";
    }
    else if (contain("centrale",m) && contain("met à chant",m)) {
      msg="C'est tout Marseille qui va s'enflammer!";
    }
    else if ((contain("marseille",m) && contain("qui va",m) && contain("s'enflammer",m))) {
      msg="Allez, allez! Allez, allez! Allez allez, allez, allez!";
    }
    // L'amour, c'est comme un bilboquet
    else if (m=="c'est l'amour") {
      msg="Et c'est comme un bilboquet";
    }
    else if ((contain("et c'est comme",m) && contain("bilboquet",m))) {
      msg="Ça finit toujours par rentrer";
    }
    else if ((contain("finit",m) && contain("par",m) && contain("rentrer",m))) {
      msg="S'il y a trou et une ficelle";
    }
    else if ((contain("un trou",m) && contain("une ficelle",m))) {
      msg="J'apporte la tige ça passe niquel";
    }
    else if (contain("apporte",m) && contain("la tige",m) && contain("passe",m)) {
      msg="L'amour c'est comme un bilboquet";
    }
    else if ((contain("l'amour",m) && contain("bilboquet",m) && contain("comme",m))) {
      msg="Il suffit d'un petit coup de poignet";
    }
    else if ((contain("suffit",m) && contain("coup",m) && contain("poignet",m))) {
      msg="Bébé ton boule me rend ma boule";
    }
    else if (contain("bébé",m) && contain("boule",m) && contain("rend",m) && (contain("ma boul",m) || contain("maboul",m))) {
      msg="Mais je te casserai avec respect﻿";
    }
    // Kyo
    else if ((contain("parcouru",m) && contain("chemin",m))) {
      var msgPool= new Array("On a tenu la distance", "On a souffert en silence");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i];
    }
    else if ((contain("tenu",m) && contain("distance",m) && contain("on a",m))) {
      msg="Et je te hais";
    }
    else if (contain("je",m) && contain("te",m) && (contain("hais",m))) {
      msg="De tout mon corps";
    }
    else if ((contain("de tout",m) && contain("mon",m) && contain("corps",m))) {
      msg="Mais je t'adore (encore(?))";
    }
    else if ((contain("marseille",m) && contain("qui va",m) && contain("s'enflammer",m))) {
      msg="Allez, allez! Allez, allez! Allez allez, allez, allez!";
    }
    // Dis moi BB Brunes
    else if (m=="dis moi" || m=="dis-moi" ) {
      msg="Si j'dois partir ou pas\n[Et je ne connias pas les paroles :( ]";
    }

    //// GIF tailored to your needs
    else if (contain("hurts",m) || contain("piment",m) || contain("pleur",m)) {
      msg="https://i.imgur.com/E6JPXb2.gif";
    }

    //// Functions: Prepared replies detailled below
    else if (contain("foot",m) || contain("match",m) || contain("soccer",m) || contain("score",m)) {
      if (contain("tout", m) || contain("tous", m) || contain("all", m) || contain("card", m))
        allResults();
      else 
        worldCup();
      msg = "";
    }
    else if (contain("potin", m) && contain("lovelist", nameConvoFull.toLowerCase())) {
      msg = potinMaker();
    }
    else if (contain("fortune",m) || contain("cookie",m) || contain("biscuit chinois",m)) {
      msg=fortuneCookie();
    }
    else if ((contain("titre",m) || contain("film",m) || contain("idée",m)) && (contain("porn",m) || contain("pr0n",m))) {
      msg = "Okay, je peux te suggérer ça : " + titleXMovies() + "\nKleenex et pop-corns !";
    }
    else if (contain("mdr",m) || contain("blague",m)) {
      msg=jokeFR();
    }
    else if (contain("lol",m) || contain("joke",m)) {
      msg=jokeEN();
    }
    else if (contain("divertis-moi",m) || contain("divertis moi",m) || contain("entertain me",m) || contain("ennuie",m) || contain("bore",m)) {
      msg=trollMusic();
    }
    else if (contain("irma",m) || contain("horoscope",m) || contain("avenir",m) || contain("astrologie",m)) {
      msg=horoscope();
    }
    else if (contain(" di",m) || contain(" dy",m) && (!contain("di ",m) || contain(" dy",m))) {
      msg=dis(m);
    }
    else if (contain("fake news", m)) {
      msg = fakeNews();
    }
    else if (m == "testdenoel") {
      msg="Joyeux Noël <3\n" + xmas();
    }    
    else if (m == "testdunouvelan") {
      msg="[TEST]\n" + happynewyear();
    }

    //// Jokes and puns intended
    else if (contain("bas coût",m) || contain("bas cout",m) || contain("bacou",m) ) {
      msg="En Azerbaïdjan ? C'est loin :O !";
    }


    // And if there is nothing ok:
    else {
      msg=""
    }

    // Here, the messages to complete a canned response (hello, love, etc)
    if (contain("bonjour",m) || contain("salut",m) || contain("coucou",m) || contain("wesh",m) || contain("kikou",m) || contain("slt",m) || m=="yo" || m=="hi" || contain("hello",m) || contain("hola",m) || contain("ciao",m)) {
      var msgPool = new Array("Bonjour", "Salut", "Coucou", "Wesh", "Yo", "Kikou", "Salutations", "Hey", "Bien le bonjour", "Hello", "Hi", "Hola");
      var msgPool2 = new Array("ami", "coco", "camarade", "ami", "camarade", lastPoster, lastPoster, lastPoster, "comrade");
      var i = Math.floor(msgPool.length*Math.random());
      var j = Math.floor(msgPool2.length*Math.random());
      msg= msgPool[i] + " " + msgPool2[j] + " !\n" + msg;
    }
    /*
    if (contain("depersyl",m)) {
      var msgPool = new Array("Oui, m'a-t-on appelé?", "C'est mon nom", "Je t'écoute", "Dis-moi tout, mon ami");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msgPool[i] + "\n" + msg;
      if (contain("n'est-ce pas",m) || contain("est-ce pas",m) || contain("n'est ce",m) || contain("est ce pas",m)) {
        var msgPool2 = new Array("I agree !", "Ah oui, clairement !", "Je lève mon 2.54cm \n(mon pouce, hein!!!)", "Tout à fait !", "Absolument!", "Non.", "Alors là, absolument pas!", "Ouais!", "Ah ça, oui!");
        var j = Math.floor(msgPool.length*Math.random());
        msg=msg + "\n" +msgPool2[j]+"\n\n*DISCLAIMER*: this is an automatic message, with completely random replies, solely for an entertaining purposes. I have not the knowledge to process the meaning of messages so PLEASE, do not make me say bad things (or the feature will be promptly removed). Neither this bot, nor me, nor my company, have any opinions concerning the ideas expressed above. Thank you.";
      }
    } */

    if (contain("<3",m) || contain("♥",m) || contain("t'aime",m) || contain("love you",m)) {
      msg = msg + "\nMoi aussi je t'aime, "+lastPoster+" <3";
    }
    // What a time to reply!
    var n = lastPoster.toLowerCase();
    /*
    if (d.getHours() >= 2 && d.getHours() < 5 && specialNightReplied == 0 && (mtn.startsWith("Just") || mtn.startsWith("Adesso"))) {
      var msgPool = new Array(d.getHours()+":"+("00"+d.getMinutes()).slice(-2)+" : et bien, en voilà une heure tardive", "Attention, c'est pas terrible de traîner ici, vu l'heure...", "Mais t'as vu l'heure :O ?!", "Dormir, c'est tricher, non ?", "Mmmmh, tu vas être frais dans quelques heures !", "Ne t'endors pas sur ton bureau !", "*YAAAWN* Qui es-tu pour me réveiller à "+d.getHours()+":"+("00"+d.getMinutes()).slice(-2)+" ?");
      var i = Math.floor(msgPool.length*Math.random());
      msg=msg + "\n(" + msgPool[i] + ")";
      specialNightReplied = 1; // Disable the auto reply for today
      setCookie(convo, "specialNightRepliedCookie", 1, 365)
    }
    else if (d.getHours() >= 5) {
      specialNightReplied = 0; // Prepare it for tomorrow
      setCookie(convo, "specialNightRepliedCookie", 0, 365)
    }
    */
    console.log("My message: "+ msg);
    if(msg.length > 0 && nameConvo.startsWith("Du coup")) {
      // We are on the famous "Du coup" conversation: add something interesting :D 
      msg = "Du coup, " + msg[0].toLowerCase() + msg.slice(1); 
    }
    return msg;
  }
}

function dong() {
  // What is this function? I will take the current hour and if it is X:00, I will ring x times
  // Where x = (X-1)%12 + 1 for X=[1..23] and x=12 if X=0
  // NOT implemented for a quiet chatbot
  // Disabled for a peaceful conversation
  var d = new Date();
  var hour = d.getHours();
  var msg = "";
  if (hour == 0) {
    var h = 12;
  }
  else {
    var h = ((hour-1) % 12) + 1;
  }
  for (var i=0; i < h; i++) {
    msg = msg + "DONG! ";
  }
  msg = msg + "\n(It is "+hour+ ":00)";
  return msg;
}

function halloween() {
  // Live Haloween like never, with annoying kids knocking at your door
  // asking for "trick or treat". You can scorn them or gently ignore them.
  var d = new Date();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var hr = hour+':'+minute;
  var msg = "";
  // I am bad in random things so I took three different lists for different convs (chosen depending of the length of the title of the conv)
  if (nameConvo.length % 3 == 0) {
    var timesToRing = ["17:53","18:2","18:56","19:38","20:41","22:52"]; }
  else if (nameConvo.length % 3 == 1) {
  	var timesToRing = ["17:42","18:19","19:1","19:11","20:56","21:50"]; }
  else {
    var timesToRing = ["18:24", "18:1","18:2","18:3","19:38","19:55","20:12"]; }
  if (timesToRing.includes(hr)) {
    // Writing the message!
    var msgPool1 = new Array("DRIIIIIIING! ", "TOC TOC TOC! ", "DING DONG! ", "Knock, Knock, Knock! ", ""); // Don't forget the space at the end here
    var msgPool2 = new Array("Un bonbon ou un sort!!!", "Trick or treat!", "Wesh, tu me files des bonbecs ou je caillasse ta baraque!");
    var i = Math.floor(msgPool1.length*Math.random());
    var j = Math.floor(msgPool2.length*Math.random());
    msg=msgPool1[i]+msgPool2[j];
  }
  return msg;
}

function xmas() {
  // Merry Christmas to you!
  // msgPool will contain a nice pun (will be added to the generic message "Merry Xmas\n")
  var msgPool = new Array("Pensez aux suivants : éteignez la cheminée !", "(Oui, j'ai été très sage cette année)", "(D'ailleurs, je suis sûr qu'il embauche plein de stagiaires/intérims pour faire sa tournée : envoyez votre CV avec votre lettre au Papa Noël ;))");
  var i = Math.floor(msgPool.length*Math.random());
  return msgPool[i];
}

function happynewyear() {
  // Happy New year!
  // msgPool will contain a nice pun (the whole message to be sent)
  var d = new Date();
  var yr = d.getFullYear();
  var prevYr = yr-1; 
  var msgPool = new Array("BONNE ANNÉE !!!", "Bonne année et tous mes meilleurs voeux pour cette nouvelle année "+yr+" <3", "Bonne année "+prevYr+"... euh, "+yr+" !!!", "Tous mes meilleurs voeux pour une nouvelle année qui promet d'être géniale ;) !", "Achievement unlocked : year "+yr, "Bonne année "+yr+" et puisse cette année être encore meilleure que "+prevYr+" ;) !");
  var i = Math.floor(msgPool.length*Math.random());
  return msgPool[i];
}

function dailyHoroscope() {
  // What is this function? With the horoscope() on hand, I give you what to expect today
  // Posted everyday at 7:20
  var d = new Date();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var msg = "";
  if (hour == 7 && minute==20 ) {
    msg = "7:20, your daily horoscope!\n" + horoscope() ;
  }
  return msg;
}

function trollMusic() {
  // Gives to the user a song/video from YouTube quite... special
  // Function constructed on the same model as jokeXX()
  var yt = new Array ();
  yt[0] = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  yt[1] = "https://www.youtube.com/watch?v=cGzujGfXrlI";
  yt[2] = "https://www.youtube.com/watch?v=hHkKJfcBXcw";
  yt[3] = "https://www.youtube.com/watch?v=kfVsfOSbJY0";
  yt[4] = "https://www.youtube.com/watch?v=ytWz0qVvBZ0";
  yt[5] = "https://www.youtube.com/watch?v=wpVTORX_ifk";
  yt[6] = "https://www.youtube.com/watch?v=ZZ5LpwO-An4";
  yt[7] = "https://www.youtube.com/watch?v=V2fVwoaeShU";
  yt[8] = "https://www.youtube.com/watch?v=Ct6BUPvE2sM";
  yt[9] = "https://www.youtube.com/watch?v=QH2-TGUlwu4";
  yt[10] = "https://www.youtube.com/watch?v=ZZ5LpwO-An4";
  yt[11] = "https://www.youtube.com/watch?v=astISOttCQ0";
  yt[12] = "https://www.youtube.com/watch?v=u3dmwXDL-90";
  yt[13] = "https://www.youtube.com/watch?v=wQP9XZc2Y_c";
  yt[14] = "https://www.youtube.com/watch?v=kxopViU98Xo";
  yt[15] = "https://imgur.com/gallery/YpthN" + " [NSFW]";
  yt[16] = "https://gfycat.com/ThatGlisteningIndianrhinoceros" + " [NSFW]";
  yt[17] = "https://www.youtube.com/watch?v=UqWwsUhrFBw";
  yt[18] = "https://www.youtube.com/watch?v=KmtzQCSh6xk";
  yt[19] = "[NSFW] Quand t'es à découvert mais que tu as besoin d'argent... https://gfycat.com/ThatGlisteningIndianrhinoceros";
  yt[20] = "Une petite faim ? https://www.youtube.com/watch?v=LmR7G208ug4";
  yt[21] = "https://www.youtube.com/watch?v=4WgT9gy4zQA";
  yt[22] = "https://www.youtube.com/watch?v=LACbVhgtx9I";
  yt[23] = "https://www.youtube.com/watch?v=UqWwsUhrFBw";
  yt[23] = "https://www.youtube.com/watch?v=JAs4edeYUJY";
  // Take one randomly
  var i = Math.floor(yt.length*Math.random());

  var msg = "Here is a great video for you to overcome your boredom :) \n" + yt[i];
  // Returns the joke
  return msg;
}

function chillMusic() {
  // Gives to the user nice songs for hangouts to the beach
  // Function constructed on the same model as jokeXX()
  var yt = new Array ();
  yt[0] =  "Odesza - Higher Ground https://www.youtube.com/watch?v=xqoLCvsy8_c";
  yt[1] =  "Petit Biscuit - Sunset Lover https://www.youtube.com/watch?v=wuCK-oiE3rM";
  yt[2] =  "The Verve - Lucky Man https://www.youtube.com/watch?v=MH6TJU0qWoY";
  yt[3] =  "Porter Robinson - Divinity (Remix Odesza) https://www.youtube.com/watch?v=a88mou_h1Ck";
  yt[4] =  "M83 - We Own The Sky https://www.youtube.com/watch?v=sWsUNbdc5IM";
  /*
  yt[5] =  "https://www.youtube.com/watch?v=wpVTORX_ifk";
  yt[6] =  "https://www.youtube.com/watch?v=ZZ5LpwO-An4";
  yt[7] =  "https://www.youtube.com/watch?v=V2fVwoaeShU";
  yt[8] =  "https://www.youtube.com/watch?v=Ct6BUPvE2sM";
  yt[9] =  "https://www.youtube.com/watch?v=QH2-TGUlwu4";
  yt[10] = "https://www.youtube.com/watch?v=ZZ5LpwO-An4";
  yt[11] = "https://www.youtube.com/watch?v=astISOttCQ0";
  yt[12] = "https://www.youtube.com/watch?v=u3dmwXDL-90";
  yt[13] = "https://www.youtube.com/watch?v=wQP9XZc2Y_c";
  yt[14] = "https://www.youtube.com/watch?v=kxopViU98Xo";
  yt[15] = "https://imgur.com/gallery/YpthN" + " [NSFW]";
  yt[16] = "https://gfycat.com/ThatGlisteningIndianrhinoceros" + " [NSFW]";
  yt[17] = "https://www.youtube.com/watch?v=UqWwsUhrFBw";
  yt[18] = "https://www.youtube.com/watch?v=KmtzQCSh6xk";
  yt[19] = "[NSFW] Quand t'es à découvert mais que tu as besoin d'argent... https://gfycat.com/ThatGlisteningIndianrhinoceros";
  yt[20] = "Une petite faim ? https://www.youtube.com/watch?v=LmR7G208ug4"; */
  // Take one randomly
  var i = Math.floor(yt.length*Math.random());

  var msg = "Here is a great video for you to overcome your boredom :) \n" + yt[i];
  // Returns the joke
  return msg;
}

function greatMusic() {
  // Gives to the user great songs. Suitable whn you are depressed and you need a good song
  // Function constructed on the same model as jokeXX()
  var yt = new Array ();
  yt[0] =  "Hans Zimmer - Time https://www.youtube.com/watch?v=X8emPcVRhuc";
  yt[1] =  "Flume - Never Be Like You https://www.youtube.com/watch?v=Ly7uj0JwgKg";
  yt[2] =  "M83 - Un Nouveau Soleil https://www.youtube.com/watch?v=36mlX318Q3w";
  yt[3] =  "Richard Ashcroft - They Don't Own Me https://www.youtube.com/watch?v=1hV2up62i1I";
  yt[4] =  "Portishead - Roads https://www.youtube.com/watch?v=zX5hQGHes7M";
  yt[5] =  "Massive Attack - Paradise Circus https://www.youtube.com/watch?v=jEgX64n3T7g";
  yt[6] =  "M83 - Outro https://www.youtube.com/watch?v=1cEy4UyYHI0";
  yt[7] =  "The Album Leaf - The Light https://www.youtube.com/watch?v=Qbc1Etmw9zw";
  yt[8] =  "Coldplay - The Scientist https://www.youtube.com/watch?v=RB-RcX5DS5A";
  yt[9] =  "The Album Leaf - Another Day https://www.youtube.com/watch?v=_SvWTIyB2w4";
  yt[10] = "Kavinsky - Nightcall https://www.youtube.com/watch?v=MV_3Dpw-BRY";
  yt[11] = "Pink Floyd - Comfortably Numb https://www.youtube.com/watch?v=x-xTttimcNk";
  yt[12] = "Pink Floyd - High Hopes https://www.youtube.com/watch?v=7jMlFXouPk8";
  yt[13] = "Led Zeppelin - Stairway to Heaven https://www.youtube.com/watch?v=D9ioyEvdggk";
  yt[14] = "Scorpions - Wind Of Change https://www.youtube.com/watch?v=n4RjJKxsamQ";
  yt[15] = "Oasis - Stop Crying Your Heart Out https://www.youtube.com/watch?v=dhZUsNJ-LQU";
  yt[16] = "Joe Hisaishi - One Summer's Day https://www.youtube.com/watch?v=d1ni1sVCgEk";
  yt[17] = "Craig Armstrong - Sea Song  https://www.youtube.com/watch?v=uHRB1HdoaXw";
  yt[18] = "Radiohead - Pyramid Song https://www.youtube.com/watch?v=3M_Gg1xAHE4";
  yt[19] = "Passenger - Let Her Go https://www.youtube.com/watch?v=RBumgq5yVrA";
  yt[20] = "Sigur Rós - Ágætis Byrjun https://www.youtube.com/watch?v=f3n03k4We90";
  yt[21] = "The Chemical Brothers - Asleep From Day https://www.youtube.com/watch?v=2IYW4JZmZ9E";
  
  // Take one randomly
  var i = Math.floor(yt.length*Math.random());

  var msg = "Here is a great video for you to overcome your boredom :) \n" + yt[i];
  // Returns the joke
  return msg;
}

function wakeMeUpMusic() {
  // You need to wake up at 4:30? Do it with a good song
  // (and wake up your neighors)
  var yt = new Array ();
  yt[0] =  "Odesza - IPlayYouListen https://www.youtube.com/watch?v=CfktFNAi-nI";
  yt[1] =  "Odesza - Say My Name https://www.youtube.com/watch?v=HdzI-191xhU";
  yt[2] =  "Muse - Thought Contagion https://www.youtube.com/watch?v=8dzKN-AE0WA";
  yt[3] =  "The Killers - Mr. Brightside https://www.youtube.com/watch?v=DrHQHd5Ba2s";
  yt[4] =  "";
  yt[5] =  "";
  yt[6] =  "";
  yt[7] =  "";
  yt[8] =  "";
  yt[9] =  "";
  yt[10] = "";
  yt[11] =  "";
  yt[12] = "";
  yt[13] = "";
  yt[14] = "";
  yt[15] = "";
  yt[16] = "";
  yt[17] = "";
  yt[18] = "";
  yt[19] = "";
  yt[20] = "";
  // Take one randomly
  var i = Math.floor(yt.length*Math.random());

  var msg = "Here is a great video for you to overcome your boredom :) \n" + yt[i];
  // Returns the joke
  return msg;
}

// Warning: the 1800 next lines are jokes (mines!) and motivational quotes, taken from http://www.fortunecookiemessage.com/archive.php and pr0n titles, some of them taken from http://sametmax.com/le-genie-des-titres-de-films-pornos/
// If you use Sublime Text, don't expand too often these lines!

function jokeFR() {
    // An heritage of a previous script
    // Will be used in a future version, don't worry ;)
    var lol = new Array ();
    lol = [
    "Pourquoi David Bowie, Prince et Frank Sinatra sont-ils morts en l’espace de quelques mois ? Parce que Dieu a découvert le Cloud.",
    "Quelle est la solution de l’équation e^x = segara ? Ln segara.",
    "Pourquoi une solution ne vous calcule jamais quand vous lui parlez ? Elle est trop concentrée.",
    "Pourquoi il faut toujours miser sur les numéros 2, 3, 5, 7, 11 au PMU ? Parce qu’ils sont toujours premiers.",
    "Qui est le plus impacté par l’interdiction de la bigamie ? L’oxygène : il a deux liaisons covalentes.",
    "Pourquoi la fonction f(x) = x²+ 1 est toujours positive ? Parce qu’elle a un large sourire.",
    "Deux personnes discutent à l’arrêt de bus : « Punaise, ce gars, il démarre au π/2 ‼ ».",
    "Est-ce que donner à manger de l’Uranium 235 à un oiseau, c’est lui faire la Becquerel ? ",
    "Qu’est-ce qu’un Pi (π) insomniaque ? Un pissenlit.",
    "Le QI d’une personne, c’est comme la fonction racine carrée : un QI négatif est impossible mais on apprend plus tard que dans certains cas, ça peut exister.",
    "Les couples : au début, c’est un Bezout puis ça finit toujours avec un Gauss.",
    "Si une bobine s’inscrivait à la Nouvelle Star, quelle chanson chanterait-elle ? Daniel Balavoine : le Chanteur.",
    "Pourquoi e2iπ est-il un mauvais avocat ? Car il n’a que des arguments nuls. ",
    "Pourquoi les nombres réels sont-ils tordus ? Parce qu’ils ne sont pas droits comme un i. ",
    "Quel est l’organe humain le plus fort en maths ? Les reins.",
    "Que dit un 0 quand il voit un 8 ? « Quelle belle ceinture ! ».",
    "Dans quel cinéma un physicien a-t-il l’habitude de regarder un film ? Au cinéma Tique.",
    "Que mettent les coordonnées d’un point du repère quand ils se caillent trop (en hiver) ? Ils mettent une polaire.",
    "Quel est le segment le plus vieux dans un repère ? Le segment [AG].",
    "Comment les atomes font-ils pour voir s’il va y avoir des bouchons dans la matière ? Ils regardent le Boson Futé.",
    "Quel serait le comble de la fonction cosinus ? D’avoir une sinusite.",
    "Qu’est-ce qu’un nuage complexe ? Un iCloud. ",
    "Qu’est ce que 3.14 coloscopes ? Une coloscopie.",
    "Quel type de foulard un vecteur porte-t-il ? Un Chasles. ",
    "Deux dioptres jouent au poker : « Alors t’as des cartes ? »",
    "Quel est le plat favori des télescopes ? Les lentilles.",
    "Quel genre de musique le Fer, le Cuivre et le plomb adorent-ils ? Le métal.",
    "Quelle est la musique préférée des nombres relatifs ? Le Lac des Signes.",
    "Une calculette bon marché et un nombre complexe discutent. Le nombre complexe : « Pourquoi tu ne me calcules jamais ?! Je suis là quoi ‼ ».",
    "C’est un couple de fonctions qui sont… assez carrés. En voyant leur fiston, Nome, assez turbulent, les parents lui disent : « Oooh, sois poli, Nome ! ».",
    "Quelle est la fonction la plus confortable/douillette ? Cos(y). ",
    "Un chimiste n’est jamais surpris : il cétonne.",
    "Deux électrons sur le Titanic. Lorsqu’ils apprennent le naufrage imminent de leur navire, ils se mettent à crier « AAAAAH !!! Nous Coulomb !!! »",
    "Quelle est la marque préférée de tablettes pour les fonctions mathématiques ? Arccos(x).",
    "Quelle est la droite la plus triste de l’espace (O, x, y, z) ? La droite (D’). ",
    "Que fait une application pour planer ? Il se fait une injection.",
    "Quel est le comble d’un vecteur ? De ne pas être conforme aux normes. ",
    "Pourquoi la fonction cosinus est têtue comme une mule ? Parce qu’elle est bornée.",
    "Que fait Newton lorsqu’il va à The Voice ? Il fait un champ Newtonien.",
    "Pourquoi Ité est toujours pardonné quelque soit ses bêtises ? Parce que « Ce n’est pas grave, Ité ! ».",
    "On parle toujours de torseurs. Mais où sont leurs torfrères ?",
    "Comment une famille de vecteurs fait-elle pour avoir des enfants ? Elle utilise le théorème de la base incomplète.",
    "Qu’est-ce qu’un iPhone ? Un téléphone complexe. ",
    "Quel est le comble pour une matrice triangulaire inférieure ? Avoir un complexe d’infériorité.",
    "Quelle est la matrice la plus laide ? La matrice identité I2. ",
    "Quel était le type le plus stressée au monde ? Pascal : il avait la pression !",
    "Quel est le nombre qui est le plus fort à cache-cache ? La constante de Planck.",
    "Comment fait-on pour trouver un schéma de logique combinatoire en NOR ? Avec une boussole.",
    "Pourquoi un donut n’a jamais raison ? Parce qu’il a tore.",
    "Un facteur de qualité est un type qui te donne de bonnes lettres.",
    "Si un torseur participait à la Nouvelle Star, que chanterait-il ? Un champ vectoriel.",
    "Quel est le signal qui sait le mieux se garer ? Le signal en créneau.",
    "Si un physicien t’amène boire un verre, pourquoi faut-il s’attendre à ce qu’il y ait beaucoup de monde ? Parce qu’il t’amènera dans un bar.",
    "Si un torseur couple doit aller en cours, comment devra-t-il s’habiller ? Avec un uniforme.",
    "« Les vacances sont finies ! Il faut ranger ses vêtements différentiels (d’été )… »",
    "Si un garçon a réussi à passer son permis, comment pourrait-il être appelé ? Un conducteur ohmique. ",
    "Quel est le comble pour un scientifique ? De mater Mathique et que cette dernière ne le calcule même pas.",
    "Un mathématicien ne s’éclaire pas avec une lampe mais avec un projecteur orthogonal.",
    "Quelle est la fonction la plus perdue ? La fonction logarithme népérien : car ln s’égara.",
    "Un solénoïde ne respire pas : il N spire et il x spire. ",
    "Quel est l’espace vectoriel le plus explosif ? C’est l’espace vectoriel ℂ4.",
    "Quel est le vêtement privilégié de i ? Le corset.",
    "Pourquoi une poire est un fruit injectif ? Parce que son noyau est nul.",
    "La meilleure déclaration d’amour : « Je te rapport de transformation ».",
    "« L’électrostatique, c’est un truc de Gauss ! »",
    "Un polymère , c‘est une maman qui a de bonnes manières.",
    "Quelle est la liaison en SI qui n’est jamais en retard ? La liaison ponctuelle.",
    "Une électrode, quand elle suit les dernières tendances vestimentaires, elle n’est pas à la mode mais à l’anode.",
    "Ce sont deux lames de fer qui voient passer une lame de cuivre. Alors la première lame dit à son acolyte : « tu ne trouves pas qu’elle a un beau Cu ? ».",
    "Qu’est-ce qu’une salle de classe avec 29 PSI ? Une classe à 2 bars.",
    "Les séries, quand elles rigolent, elles ont un Fourier.",
    "« Riemann et les Laplaciens Crétins ».",
    "Quelle est la chanson d’Indila qui convient le mieux aux moteurs ? « Tourner dans le vide ».",
    "Et sinon, qu’est-ce qu’un moteur qui ne fournit aucun effort ? C’est un moteur célibataire.",
    "Quels sont les théorèmes les plus explosifs en sciences de l’ingénieur ? Les théorèmes généraux de la dynamite.",
    "Quelle est le système le plus chaud à résoudre ? Le système de Cramer.",
    "En chimie, quelle est la représentation la plus… hot ? La représentation de Cram.",
    "Un archer, lorsqu’il fuit, ne prend pas la tangente : il prend l’arc tangente.",
    "Un système asservi ne voyage pas : il va voir du PI.",
    "Pourquoi un mathématicien imprime-t-il ses photos à moitié ? Parce qu’il fait un développement limité.",
    "Un repère ne s’ennuie pas : il tourne en ROND.",
    "Pourquoi un mathématicien a-t-il toujours des techniciens de surface avec lui ? Pour pouvoir trouver les espaces propres plus facilement.",
    "Pourquoi est-il difficile de faire de l’humour avec un opérateur différentiel ? Parce qu’il prendra au sérieux toute remarque au second degré.",
    "Quel est l’instrument de musique de prédilection des fonctions périodiques ? L’harmonica.",
    "Quelle est la matrice qui n’aura pas droit à des cadeaux pour Noël ? La matrice de passage.",
    "Que fait un éléphant impuissant ? Il barrit sans trique.",
    "Que dit un mathématicien quand il se noie ? Log log log…",
    "Qu’est-ce qu’un chauffeur qui conduit mal ? Un isolant.",
    "Quelle est la personne qui a le plus de ressources ? C’est Nernst : parce qu’il a du potentiel.",
    "Que met une aile d’avion quand elle a froid ? Une polaire.",
    "On parle de réduction de matrices. Mais pourquoi on ne parle jamais d’oxydation de matrices ?",
    "Je voudrais appeler mon lapin Faraday. Comme ça, il sera dans une cage de Faraday.",
    "Quel est le point commun entre les bébés et l’argon ? Leurs couches sont toujours pleines.  ",
    "Quel est l’espace vectoriel préféré des charcutiers ? Le SO(6).",
    "Un jour, j’ai voulu faire une blague bidon à une bouteille d’hélium. Elle n’a même pas réagi …",
    "Les aquariums ont aussi leur code civil : les occupants doivent obéir à la loi de Poisson.",
    "Pourquoi un jardinier est-il un bon mécanicien ? Parce qu’il a plein d’arbres moteurs.",
    "Les formules en optique, c’est compliqué… Y’a pas photon !",
    "Si une personne se brûle au troisième degré et dérive sa brûlure , est-ce que ça devient une brûlure du second degré ?",
    "« Les schémas équivalents en élec, c’est pas ma tasse de Thévenin ! »",
    "M. et Mme Fait ont un fils. Comment s’appelle-t-il ? Gaspard.",
    "Si Clara Morgane rayonne, fera-t-elle des rayons X ?",
    "Quel est l’hymne préféré des équas différentielles ? L’ODE à la joie.",
    "Que se passe-t-il lorsqu’on dérive une sinusite ? On obtient une cosinusite.",
    "Qu’est-ce qu’un filtre en colère ? Un filtre Wiener. ",
    "Il y a 10 sortes de gens dans le monde : ceux qui comprennent le binaire et ceux qui ne le comprennent pas.",
    "Quel est le groupe sanguin d’un geek ? C++.",
    "Quel navigateur Internet un cuisinier utilise-t-il ? Mozzarella Firefox.",
    "Vous croyez que si on pêche une raie et puis qu’on la plonge dans un seau de peinture bleue, ça deviendra un blu-ray ?",
    "Pourquoi un pirate informatique aime-t-il son travail ? Parce que ça lui tient hacker.",
    "Qu’y a-t-il au pied d’un arc-en-ciel ? Un Nyan Cat qui s’est écrasé au sol.",
    "Deux ordinateurs discutent. L’un d’eux dit : « Mec, j’ai mal au DOS … »",
    "Pourquoi les flaques d’eau ont une bonne qualité sonore? T’as déjà vu une MP3 d’eau ?",
    "Pourquoi est-ce une bonne idée de lancer le CD de Windows Vista comme un frisbee à son chien ? Parce qu’un chien aime les OS…",
    "Qu’est-ce qu’un DVD mort ? Un DVD-Rip.",
    "Quel est le registre littéraire du code source de Windows? Regedit.",
    "Ce sont deux logiciels qui sont en train de s’installer. L’un deux s’installe sur le D:\. Du coup, l’autre logiciel lui dit : « Allez, viens danser ! ».",
    "Quelle est la boisson la plus alcoolisée selon un geek ? Alcohol 120%.",
    "Qu'est-ce qu'un torrent téléchargé par Hitler? Un génoseed.",
    "Un geek n’achète pas de canapé convertible mais un canapé qwertyble.",
    "En été, quelle est la touche la plus utilisée ? F5 puisqu’elle rafraichit (la page).",
    "Qui est le meilleur programmeur de batch ? Batman.",
    "Un chien programmeur ne cherche pas d’os : il compile son propre os.",
    "Si Dom Juan était un ordi, que maitriserait-il le plus ? Le drag and drop. ",
    "Un programmeur ne prend pas de vitamine C, il prend de la vitamine C++.",
    "Comment un terminal Linux fait-il pour aller quelque part ? Il se met en root.",
    "Lorsqu’il mange, sur quoi un geek mange-t-il ? Sur une nappe IDE.",
    "Que faut-il donner à un navigateur Internet quand il a faim ? Des cookies.",
    "Que met un programme comme sous-vêtements? Il met des <string.h>.",
    "Un geek n’est jamais lassé par quoi que ce soit : c’est juste que ça le fichier.",
    "Jick et Jack, 2 paires d’écouteurs sont en train de braquer une banque (original !). En voyant la faible réactivité de son acolyte, Jick s’écrie alors : « Mais qu’est-ce que tu fiches, Jack ?! ».",
    "Quel est le type de téléphone favori des nudistes ? Les téléphones nus.",
    "Un geek, au petit déj, il mange des serials, fume du crack pour être dans les clouds mais comme ce n’est pas bon pour la santé il met des patchs pour arrêter de fumer.",
    "Sur quoi un ingénieur se repose-t-il? Sur un Matlab.",
    "Qu’est-ce qu’un T-Shirt Nike dans la mer ? Une valeur à virgule flottante.",
    "Quel est le logiciel qui faut toujours avoir quand on a un petit creux ? C’est Firefox : il a de si bons cookies !",
    "Quelle est la drogue préférée des signaux numériques ? Le LSB.",
    "Pourquoi un geek peut-il être considéré comme un meurtrier ? Parce qu’il ne fait qu’exécuter ses programmes.",
    "Quelle est la chaîne de montagnes préférée de la mémoire ? La Cordillère des NAND.",
    "Pourquoi un disque dur est souvent diabolique ? Parce qu’il est SATAnique.",
    "Comment Al Gore se reproduit-il ? Il lance Maple et il fait un algorithme.",
    "Pourquoi Staline était-il au courant de toutes les actualités de son pays ? Parce qu’il suivait les fl-URSS.",
    "Un geek azerty en vaut deux.",
    "Que dit une disquette qui est trop pleine ? Rhooh, faut que je perde quelques kilos !",
    "Qu’est-ce qu’une boucle for écrite il y a quelques centaines de lignes ? Une boucle fort fort lointaine.",
    "Que donnent Amazon quand ils font un cadeau ? Ils donnent un Kindle Surprise.",
    "Tu sais pourquoi ML se vend bien ? Parce que tous les sites veulent HTML.",
    "Que fait un voleur d’ordinateurs après son larcin ? Il prend la F8.",
    "Un informaticien peut aussi faire des greffes de cœur : lorsqu’il change de processeur.",
    "Que fait un site Internet quand il vaut voyager ? Il fait ses balises !",
    "Pourquoi les supercalculateurs sont-ils nuls pour raconter des blagues ? Parce qu’ils font beaucoup de flops. ",
    "Salamèche et sa mère sont dans la forêt. Soudain, sa mère lui dit « Arrête de jouer avec le feu ! ».",
    "Deux fœtus dans un ventre : « Eeeh, tu m’as encore donné un coup de pied ! C’est placenta ! ».",
    "Un philosophe ne compte pas mais il Kant.",
    "Un téléphone ne meurt pas : il déclare forfait.",
    "Deux citrons discutent au rayon fruits de Carrefour. L’un d’eux raconte une blague assez marrante (lisez ce recueil, ça ne manque pas !). En vue de la réaction de son copain le premier citron lui demande : « Mais pourquoi tu ris jaune ? »",
    "La carpe a aussi son jour : Carpe diem.",
    "Arrête avec tes Sean Connery !",
    "« Didier des villes et Didier Deschamps ».",
    "Il existe deux types de champs : les bas-champs et les Auchan.",
    "Deux boomerangs discutent. Lorsque l’un annonce le décès de son copain (à cause d’un incendie), l’autre répond : « J’en reviens pas ! ».",
    "Deux glaçons se font photographier. Le photographe : « Dites Freeze ! ».",
    "Deux journaux discutent : « Allez presse-toi ! »",
    "Plusieurs tasses à café sont sur le point de faire un 100 mètres. L’arbitre leur dit : « À vos marcs … »",
    "« Je ne suis pas devin, je suis quarante ! »",
    "Deux chaussures qui partent un week-end : « Allez, à la semelle prochaine ! ».",
    "La mer : le paradis des alcooliques car c’est le seul endroit où il y a un bar tous les dix mètres.",
    "Une tomate, chez un docteur, ne fait pas un check-up mais un ketch-up.",
    "C’est une photo qui va chez le coiffeur. Elle demande : « Bonjour, je voudrais me couper les TIFF ».",
    "Adriana Karembeu, quand elle veut bien s’habiller, elle ne se met pas sur son 31 mais sur 42.",
    "Un arbre, quand il a froid, il ne met pas une écharpe mais une écharde.",
    "Un œuf va dans un frigo avec ses amis et il dit « Je me caille ici ! ».",
    "En fait, un smiley , il rit jaune !",
    "ζζζζζ ζζζζζ ζζζζζ ζζζζζ ζζζζζ ζζζζζ ζζζζζ ζζζζζ ζζζζζ ζζζζζ <-- Les Zêta-Unis.",
    "Une vache ne colorie pas avec des crayons mais avec des trayons.",
    "Einstein, quand il a faim, il ne mange pas à la cantine mais à la quantique.",
    "J’ai appelé mon sèche-cheveux Vection. Comme ça, quand il me brûle, je peux lui dire « T’es con, Vection ! »",
    "Pourquoi les habitantes de Six-Fours ont-elles toujours chaud ? Parce qu’elles sont des Sixfournaises.",
    "En fait, Hotmail, c’est pas une boîte à lettres incendiée ?",
    "Quel est le comble d’une mante religieuse ? D’être athée.",
    "Pourquoi Spiderman est-il bon en peinture ? Parce qu’il sait faire de bonnes toiles.",
    "Pourquoi une feuille de papier n’aime pas se baigner ? Parce qu’elle n’a pas pied.",
    "Que met le Soleil lorsque son pantalon est trop large ? Une Sun Belt.",
    "Si Freddie Mercury avait fait de la boxe, qu’est-ce qu’il serait devenu ? Un guet-apens.",
    "Quel est le comble pour le PDG de Kia ? D’avoir comme téléphone un Nokia.",
    "Quelle est la friandise préférée d’une horloge ? Les Tic-Tac.",
    "Que fait Sacha dans sa baignoire ? Il fait des bulles bizarres.",
    "Pourquoi la Belle au Bois Dormant est-elle née dans la meilleure époque ? Car elle a vécu durant l’Âge d’Or.",
    "T’as 3 poussins et t’en voulais 2. Comment tu fais ? T’en pousses un.",
    "Quel est le comble d’une tablette de chocolat blanc ? D’être vendue au marché noir.",
    "Pourquoi une graine a-t-elle toujours mal à la tête ? Car elle a 2 mi-graines.",
    "Que fait un mur lorsqu’un marteau lui porte trop préjudice ? Il porte plinthe.",
    "Quelle est la voiture la mieux habillée ? La Polo (de Volkswagen).",
    "Quel est le jeu favori d’un ver ? Le solitaire.",
    "Que se passe-t-il quand Batman se prend une balle ? Il fait un home-run.",
    "Selon le fils de Shrek, qu’est-ce que Skrek ? Un pervers. ",
    "Pourquoi peut-on dire que la Ferrari est une écurie ? Parce qu’elle a 300 CV.",
    "Quel serait le comble de la ville de Berlin? Avoir Facebook (et donc un mur). ",
    "Quel serait le comble de Pirates des Caraïbes ? Que Jack Sparrow pirate le film sur Internet.",
    "Avec quoi George W. Bush se lave-t-il ? Avec du bain de bouche. ",
    "Pourquoi est-il déconseillé de mettre des trucs sur une télé (c’est-à-dire la charger, quoi) ? Parce que télécharger , c’est mal ! ",
    "Pourquoi Staline avait une humeur massacrante (bah ouais, il en a tué, des gens) ? Parce qu’il s’est levé du pied communiste.",
    "Comment appelle-t-on la mise à l’écart d’un lézard ? La mise en tarentaine.",
    "Pourquoi les grands-pères en Russie sont-ils aussi vieux ? Car ce sont des papis russes.",
    "Si John Lennon se fait mixer, est-ce que ça va faire du Beetlejuice ? ",
    "Quelles sont les chaussures préférées de la Faucheuse ? Les pompes funèbres.",
    "Pourquoi il fait toujours chaud dans une voiture en été ? Parce qu’il y a un chauffeur.",
    "Pourquoi l’imprimante d’une blonde ne marche jamais et sent la pâtisserie ? Parce qu’elle a mis mille-feuille.",
    "Quel est le point commun entre George W. Bush et New-York City ? Ce sont tous deux des grands ports.",
    "Pourquoi les bananes sont-elles aussi fines ? Car elles font beaucoup de régimes (de bananes) !",
    "Pourquoi un pack de bouteilles reste-t-il immobile ? Parce qu’il y a des bouchons.",
    "Quelle est la lettre la plus matinale ? τ.",
    "Que fait un stylo quand il s’inquiète ? Il se fait un sang d’encre.",
    "Comment appelle-t-on un char qui a bon goût ? Un charbon.",
    "Si quelqu’un met une musique assez nulle mais à fond, est-ce que le volume sonore se quantifie en Décibels ou en Décimoches ? ",
    "Quel est le plat favori du disciple de Socrate ? Les plats (de) Thon.",
    "Quel est le comble pour un plombier ? D’être en manque de tuyaux.",
    "Pourquoi n’est-il pas bon d’être un glaçon ? Parce qu’il a plein de frais.",
    "Pourquoi vendeur de disques est un métier à risques ? Parce qu’ils ont des CD.",
    "Pourquoi dans le film Pinocchio, le héros a-t-il un nez aussi long ? Parce que c’est un film Disney.",
    "Pourquoi les vampires préfèrent sucer le sang des chevaux ? Parce qu’ils ont plus de chance d’avoir du pur sang.",
    "Quel est le comble pour des filles jumelles ? D’être myope.",
    "Que font les lettres de l’alphabet grec lorsqu’elles ne se sentent pas bien dans leur peau ? Elles vont voir le Ψ.",
    "Dans un jeu télévisé, pourquoi les mauvaises réponses sont en général en rouge ? Parce que l’animateur dit « Tapez votre réponse (sur le clavier)».",
    "Quelle marque de sac Abdel Halim aime-t-il le plus ? Les sacs Longchamp.",
    "Que font deux personnes de petite taille quand ils se mettent ensemble ? Ils font une nainfusion.",
    "Quel est le plat cuisiné qui n’est jamais à l’heure ? Le steak Tartare. ",
    "Quelle est la boisson préférée des cahiers ? Le lait caillé.",
    "Quel est le plat le plus froid qui puisse exister ? La gelée.",
    "Quel serait le comble pour une femmelette ? De se marier avec une omelette !",
    "Pourquoi le temps est-elle une notion vraiment sournoise ? Parce qu’elle fait souvent des leurres.",
    "Quel est le jeu dans lequel les martiens excellent-ils ? Les arts martiaux.",
    "Quel est le vêtement le plus triste ? La blouse.",
    "Quels sont les noms qui peuvent provoquer de gros débats ? C’est Paul et Mique.",
    "Qu’est-ce qu’un train qui n’a jamais pris la pluie ? C’est un véhicule intrinsèque.",
    "Qu’est-ce que cinq cents personnes qui n’arrivent pas à avoir pied dans une plage ? Une ramette de papier.",
    "Pourquoi ne faut-il jamais manger un plat qui est en train de faire un film ? Parce que ça tourne.",
    "Quel est la personne la plus âgée ? Pierre : parce qu’il a l’âge de pierre !",
    "Est-ce que l’application Facebook peut être considérée comme une application linéaire ?",
    "Pourquoi une personne qui porte un bonnet respire-t-elle mieux ? Parce qu’elle a deux nez.",
    "Tu crois que les chèques s’appelaient avant des chècoslaves ?",
    "Pourquoi les Sims est le jeu préféré des opérateurs téléphoniques ? Parce qu’ils utilisent beaucoup de cartes SIM.",
    "Que fait un circuit électrique lorsqu’il va à la banque ? Il ouvre un compte courant.",
    "Si une personne parle du mont Everest, est-ce que c’est un haut-parleur ?",
    "Quel est le comble pour un vendeur chez Morgan ? D’avoir une fringale.",
    "Quel est la fée qui fournit les denrées alimentaires à l’armée ? La fée des rations.",
    "Pourquoi le Capitaine Crochet a-t-il participé à la Nouvelle Star ? Parce que c’est une émission de télé-crochet.",
    "Qu’est-ce qu’un livret d’instructions qui danse ? Un Manuel Valls.",
    "Qu’est-ce qu’une gousse d’ail qui est malade et fatiguée ? Un aïoli.",
    "Qu’est-ce qu’une personne de petite taille qui a une peau soyeuse ? Un naindoux.",
    "Avec quoi une fusée mange-t-elle sa soupe ? Avec une tuyère.",
    "Qu’est-ce qu’un cochon avec un pinceau ? De lard.",
    "Pourquoi Justin Bieber a-t-il une voix aussi aiguë ? Parce qu’il a joué au saute-mouton avec une licorne dans son enfance.  ",
    "Pourquoi un annuaire téléphonique présente-t-il une très grande habileté ? Car il a beaucoup d’adresse(s).",
    "Pourquoi l’Espagne n’a-t-elle pas de poils ? Car il a un Cordoue.",
    "Pourquoi ne faut-il jamais acheter un téléphone à un avion ? Pour qu’il évite de décrocher.",
    "Pourquoi un compas est-il le meilleur ami des êtres qui sont tristes ? Car il fait souvent preuve de compassion.",
    "Qu’est-ce qu’un père qui veut devenir une mère ? Un trans parent.",
    "Quel est le fruit qui suit toujours les dernières tendances ? Les dattes : elles sont branchées.",
    "Quel est le plat préféré du général de Gaulle ? Le plat de résistance.",
    "Quel est le comble de M. Sanchez ? De ne trouver nulle part où s’asseoir.",
    "Quel est le meilleur ami de la farine ? C’est l’ami Don.",
    "Quel est l’hymne des accumulateurs déchargés ? « Allons enfants de la batteri-ie, je jour de charge est arrivé… »",
    "Quel est l’arbre le plus frustré ? Le sapin : il a les boules.",
    "Quel est le jeu de cartes préféré des hamsters ? Le Ham-tarot.",
    "Pourquoi le bois est-il connu pour être silencieux ? Parce qu’il sait stère.",
    "Quel est l’avion le plus rigolo ? Le drôle.",
    "Pourquoi un palmier a-t-il de vrais potes ? Parce qu’il n’a que des amis de longue datte !",
    "Si un individu est, étymologiquement, un être indivisible, est-ce que Louis XVI est un individu ?",
    "Pourquoi un piano est-il très fort en cours ? Parce qu’il a de bonnes notes.",
    "Quel type de culture (dans l’agriculture) est la plus marrante ? La rizière.",
    "Quelle est la différence entre la peau de Ron Weasley et une feuille de papier ? Au bout d’un certain temps, la feuille de papier prend des couleurs…",
    "Comment reconnait-on une orange qui prend tout son temps ? C’est celle qui n’est pas pressée.  ",
    "Quel serait le comble pour les gens bons ? Payer les frais de porc lors de leurs achats en ligne.",
    "Quelle est la couleur la plus patiente ? Le jaune parce que Jonathan.",
    "Quel est la poupée la plus dangereuse ? La Barbie Turique. ",
    "Pourquoi les pneus sont-ils de gros délinquants en hiver ? Parce qu’ils sont enchaînés. ",
    "Tu connais le nom de la fille qui est toujours célibataire car elle fait fuir tout le monde ? Elle s’appelle Éva Cuation.",
    "Dans quelle université un copieur va-t-il ? À la fac Simile.  ",
    "Pourquoi faut-il faire de la collocation avec Napoléon ? Parce qu’il a un Bonaparte.",
    "Pourquoi Sting sait-il très bien s’épiler ? Parce qu’il a la Police. ",
    "Quelle est la lettre la plus fraîche de l’alphabet dans le Nord ? La lettre B : parce qu’il y a plein de beffrois là-bas !",
    "Pourquoi les agents du renseignement israéliens sont-ils de mauvaise humeur ? Parce qu’ils sont d’humeur Mossad.",
    "Pourquoi la Slovaquie est-elle plus riche que la Rép. Tchèque ? Parce qu’ils faisaient souvent des Tchécoslovaques.",
    "Pourquoi certains fabricants de chaussures sont-ils toujours déconnectés de la réalité ? Parce qu’ils sont à côté de leurs pompes.",
    "Qu’est-ce qu’un mauvais train ? Un train qui arrive sans crier gare.",
    "Pourquoi un sapin n’est-il jamais content en hiver ? Parce qu’on l’enguirlande.",
    "Pourquoi ne faut-il jamais prendre de boissons à la mode ? Parce que sinon, ça fait de la coca in !",
    "Pourquoi un haut-parleur attend-il un enfant ? Parce qu’il est enceinte.",
    "Pourquoi fait-il donner des carottes à Diam’s ? Pour faire des carottes râpées.",
    "Quel est le pays qui a le meilleur pouvoir d’achat ? L’Azerbaïdjan : ils achètent tout à Bakou.",
    "Quel objet est le meilleur magicien ? Le moteur : il peut faire plein de tours.",
    "Qu’est-ce milkshake ? 20 carnets de 50 chèques.",
    "Quel est le secteur le plus porteur ? Celui de la construction : ils font de nombreux murs porteurs.",
    "Que dit une lotion Carrefour à une lotion de luxe (genre une lotion Chanel) ? « Tu n’as pas la lotion de l’argent ! »",
    "Pourquoi les Tchadiens sont-ils orphelins ? Parce qu’ils n’ont pas de mers.",
    "Pourquoi ne faut-il pas regarder un film avec une aile d’avion ? Parce qu’il peut te spoiler.   ",
    "Quel est le comble pour un frigo ? D’être payé en trois fois sans frais !",
    "Pendant les attentats du 11 Septembre, pourquoi il aurait fallu filmer d’en bas ? Pour entendre les gens chanter « It’s raining men ! ».",
    "Quel est le point commun entre un bus de belges, Lady Diana et un téléphone ? Les trois ne passent pas sous un tunnel.",
    "Dans Titanic, c’est Rose qui aurait dû couler et non Jack : au moins, ça aurait été un film à l’eau de rose.",
    "Quel est le jeu préféré des croque-morts ? Le cadavre exquis.",
    "Si un gars s’immole par le feu, est-ce un one man chaud ?"]
    var nbBl = lol.length;
    // Take one randomly
    var i = Math.floor(nbBl*Math.random());
    // Returns the joke
    return lol[i];
}

function titleXMovies() {
    // There is nothing to watch on the TV? Go to your streaming website ans watch one of these movies (do not bring your mother: she might not approve)
    // Thanks to the Internet where I picked this list of titles (including http://sametmax.com/le-genie-des-titres-de-films-pornos/)
    var titles = new Array ();
    titles = [
    "100 000 verges pour 100 000 vierges",
    "20 000 vieux sous mémère",
    "2001 l’odyssée des seins",
    "2002 l’odyssée de la queue",
    "2004 l’odyssée à 4 pattes",
    "2006 l'odyssée du clitoris",
    "2006 l’odyssée de la saucisse",
    "2007 l'odyssée de la branlette",
    "2007 l'odyssée de la levrette",
    "2007 l'odyssée de la quéquette",
    "2007 l'odyssée de la zigounette",
    "2008 l’odyssée du coït",
    "2009 l’odyssée de la meuf",
    "2010 l’odyssée du pénis",
    "2012 l'odyssée de la partouze",
    "2013 l'odyssée de la baise",
    "2020 l’odyssée du vagin",
    "36, Quéquette des orfèvres",
    "A bout de sperme et de souffle",
    "A chaque jour suffit sa pine",
    "A feu et à sexe",
    "A liche au pays des merveilles",
    "A poil, l'Inaire",
    "A prendre ou à lécher",
    "Alerte à Malaucul",
    "Alice au pays des merguez",
    "Alice au pays des pervers",
    "Aline Baba et les 40 gauleurs",
    "Aline Baba et les 40 viticulteurs",
    "Amour, quéquettes et fantaisies",
    "Analgeddon",
    "Anustasia",
    "Ass wide shut",
    "AsterX & ObelX se font Cléopâtre",
    "Attache-moi si tu peux",
    "Autant en emporte le gland",
    "Baise Hur",
    "Baise ou crève",
    "Baise Runner",
    "Baise-moi si tu veux",
    "Ball Street",
    "Banane mécanique",
    "Bande avec les poules",
    "Bar à gouines",
    "Bienvenue Chez Les Chtites Coquines",
    "Biroutes des Caraïbes",
    "Bite au vent",
    "Bite au vent passe la 5ème",
    "Bitman et Robite",
    "Bitman fourre ever",
    "Black Cock Down",
    "Blanche Fesse et les sept mains",
    "Blanche Fesses et les sept seins",
    "Buffy la suceuse de vampires",
    "Chacun cherche sa chatte",
    "Chameau bétons et mottes de cuir",
    "Chapeau melon et bites de cuir",
    "Chatte perdue sans collier",
    "Chatte size",
    "Chatte-Woman",
    "Chiennes lubriques et cochons gourmands",
    "Chérie, j’ai agrandi les godes",
    "Citizen chienne",
    "Citizen Shane",
    "Clithanger",
    "Conan le fornicateur",
    "Coup de foutre à Notting Hill",
    "Coups de zboub à Manhattan",
    "Culiméro",
    "Cyrano de Vergerac",
    "Da Vinci Gode",
    "Da Zizi Code",
    "Danse avec mes burnes",
    "Dard Devil",
    "Des glands comme les autres",
    "Destination vaginale",
    "Dix manches ! C'est la fête",
    "Docteur Gouine, femme putain",
    "Don d'orgasmes",
    "Dragon Boules X",
    "Défloration finale",
    "Défoncez moi par les deux trous",
    "Enculator",
    "Encule Poirot",
    "Encule-moi si tu peux",
    "Enculons nous dans les bois",
    "Erections municipales",
    "Fais jaillir mon pétrole",
    "Fist and furious",
    "Fourre Boyasse",
    "Fuck Club",
    "Full Metal Quéquette",
    "Germianal",
    "Glandiator",
    "Glands of New-York",
    "Gode save the gouine",
    "Gode Story",
    "Gorilles dans la brune",
    "Gros lolos et bonnes bourres",
    "Gynécologie en prime",
    "Hardeur au travail",
    "Harry Ploteur et la braguette magique",
    "Harry Ploteur à la croupe en feu",
    "Harry Tripoteur",
    "Hercule, vient que je t'encule",
    "Hélène et les cochons",
    "Il baisait une fois dans l'Ouest",
    "Il faut laisser les fesses faire",
    "Il faut sauter la soeur de Ryan",
    "In Diana Jones",
    "Ingrid bite en cours",
    "Insphincter Gadjet",
    "Iznogod",
    "Josépine, ange catin",
    "Julie Lèche chaud",
    "Juranal Park",
    "Jurassic Pork",
    "Kiki roux et la léchante sorcière",
    "Kill Bite",
    "L'abbé bête monte voir Babette",
    "L'Adam de la mer",
    "L'aine ou la cuisse",
    "L'Enfileur des Anneaux",
    "L'indécente aux enfers",
    "L'orange mec à nique",
    "L'étroit Mousquetaire",
    "La Belle au bois pompant",
    "La Belle et ma bête",
    "La bite à Urbain",
    "La bourse ou le vit",
    "La braguette magique",
    "La chatte de la voisine",
    "La chatte invisible",
    "La colline emmanchée",
    "La communauté de l’anus",
    "La croisière s'enfile",
    "La dernière pine droite",
    "La dernière tante à fion du Christ",
    "La fièvre de Laure",
    "La flûte emmanchée",
    "La grande dérouille",
    "La grande touffe",
    "La mature est en fête",
    "La peau lisse aux fesses",
    "La planète des seins",
    "La prise de la pastille",
    "La pute et le pantin",
    "La quéquette de l'ouest",
    "La quéquette du Graal",
    "La route du rectum",
    "La ruée vers Laure",
    "La verge et les poils",
    "La vie (n') est (pas) un long coup de bite tranquille",
    "La vérité si je bande",
    "Le bon la broute et fourre son gland",
    "Le bon, la brute et le trou béant",
    "Le con, la pute et le truand",
    "Le fabuleux vagin d'Amélie Bourrin",
    "Le facteur baise toujours deux fois",
    "Le gland bleu",
    "Le gland des siciliens",
    "Le jonc le plus long (ou le plus lourd)",
    "Le labouratoire",
    "Le mâle de mer",
    "Le mâle dedans",
    "Le petit capuchon rouge",
    "Le petit puceau",
    "Le plus dur est derrière toi",
    "Le père Noël en a une dure",
    "Le pénis pas lisse de Monsieur de la Palice",
    "Le ramoneur de Lilah",
    "Le ramoneur des Lilas",
    "Le roi fion",
    "Le seigneur des anus - La communauté de l'anus",
    "Le seigneur des anus - Les deux trous",
    "Le seigneur des anus - Les retour du doigt",
    "Le tour du monde en 80 trous",
    "Le trésor de Braquemart le rouge",
    "Les 24 heures du gland",
    "Les 4 fentes astiquent",
    "Les aristo chattes",
    "Les aventuriers du derche poilu",
    "Les dents de la baise",
    "Les Fables de la femme fontaine",
    "Les fleurs du mâle",
    "Les quatre filles du docteur sucent",
    "Les tontons tringleurs",
    "Les tétons flingueurs",
    "Les visiteuses",
    "Lord of the strings",
    "L’aine ou la cuisse",
    "L’appel de la fourrée",
    "L’arrière-train sifflera trois fois",
    "L’étroit mousquetaire",
    "Ma sorcière bien baisée",
    "Manon des bourses",
    "Marie peau de pine",
    "Matrik",
    "Merlin l'emmancheur",
    "Merlin l'enculeur",
    "Merlin l'enfileur",
    "Minette Express",
    "Mon voisin le niqueur",
    "Mâles à bars",
    "Nique Bill",
    "On a marché sur la pine",
    "Parle pas la bouche pleine",
    "Peter Pine",
    "Pinez-les, haut et court",
    "Pinocchio et la pute au grand coeur",
    "Pocahotass",
    "Position: Impossible",
    "Pour qui sonne le gland",
    "Pour une poignée de braquemarts",
    "Power Fourreurs",
    "Princesse Monokini",
    "Pulp Friction",
    "Quai des burnes",
    "Qui est l'as à seins",
    "Qui veut la bite de Roger Rapeau",
    "Rasta kékette",
    "Rasta kékette",
    "Remets ton diable dans mon enfer",
    "Rencontre du troisième fist",
    "Rien ne sert de courir, il faut partir à poil",
    "Robin des doigts",
    "Robinson suce Zoé",
    "Robocock",
    "Rocco l'empereur mégalo",
    "Rodéo sur Juliette",
    "Scarefesse",
    "Scarfesse",
    "Sept pines city",
    "Sex Wars : l'Attaque des Godes",
    "Sexcaliburne",
    "Sexe foot under",
    "Sexual suspects",
    "Sire Anus de Vergerac",
    "Sleepy Swallow",
    "Smegman",
    "Spartanus",
    "Suzanne ! Ouvre-toi",
    "Tel maire, tel fist",
    "Terminatouze",
    "The Penisher",
    "The Sexorcist",
    "Tita nique",
    "Total rectal",
    "Total rectal",
    "Tous les trous sont permis",
    "Toutes les catins du monde",
    "Trois hommes et un cul fin",
    "Un morpion nommé Wanda",
    "Un poing c'est tout",
    "Viens chez moi, j'enfile une copine",
    "Viol au dessus d’un nid de cocus",
    "Viscères au poing",
    "Volte fesse",
    "Y-a-t-il un flic pour sauter la reine",
    "Ça glisse au pays des merveilles"
    ]
    var nbT = titles.length;
    // Take one randomly
    var i = Math.floor(nbT*Math.random());
    // Returns the joke
    return titles[i];
}

function fortuneCookie() {
    // Get motivated without going to the Chinese shop to buy fortune cookies (even if the messages are from the USA)
    var quote = new Array ();
    quote = [
    "Today it's up to you to create the peacefulness you long for.",
    "A friend asks only for your time not your money.",
    "If you refuse to accept anything but the best, you very often get it.",
    "A smile is your passport into the hearts of others.",
    "A good way to keep healthy is to eat more Chinese food.",
    "Your high-minded principles spell success.",
    "Hard work pays off in the future, laziness pays off now.",
    "Change can hurt, but it leads a path to something better.",
    "Enjoy the good luck a companion brings you.",
    "People are naturally attracted to you.",
    "Hidden in a valley beside an open stream- This will be the type of place where you will find your dream.",
    "A chance meeting opens new doors to success and friendship.",
    "You learn from your mistakes... You will learn a lot today.",
    "If you have something good in your life, don't let it go!",
    "What ever you're goal is in life, embrace it visualize it, and for it will be yours.",
    "Your shoes will make you happy today.",
    "You cannot love life until you live the life you love.",
    "Be on the lookout for coming events; They cast their shadows beforehand.",
    "Land is always on the mind of a flying bird.",
    "The man or woman you desire feels the same about you.",
    "Meeting adversity well is the source of your strength.",
    "A dream you have will come true.",
    "Our deeds determine us, as much as we determine our deeds.",
    "Never give up. You're not a failure if you don't give up.",
    "You will become great if you believe in yourself.",
    "There is no greater pleasure than seeing your loved ones prosper.",
    "You will marry your lover.",
    "A very attractive person has a message for you.",
    "You already know the answer to the questions lingering inside your head.",
    "It is now, and in this world, that we must live.",
    "You must try, or hate yourself for not trying.",
    "You can make your own happiness.",
    "The greatest risk is not taking one.",
    "The love of your life is stepping into your planet this summer.",
    "Love can last a lifetime, if you want it to.",
    "Adversity is the parent of virtue.",
    "Serious trouble will bypass you.",
    "A short stranger will soon enter your life with blessings to share.",
    "Now is the time to try something new.",
    "Wealth awaits you very soon.",
    "If you feel you are right, stand firmly by your convictions.",
    "If winter comes, can spring be far behind?",
    "Keep your eye out for someone special.",
    "You are very talented in many ways.",
    "A stranger, is a friend you have not spoken to yet.",
    "A new voyage will fill your life with untold memories.",
    "You will travel to many exotic places in your lifetime.",
    "Your ability for accomplishment will follow with success.",
    "Nothing astonishes men so much as common sense and plain dealing.",
    "Its amazing how much good you can do if you dont care who gets the credit.",
    "Everyone agrees. You are the best.",
    "Jealousy doesn't open doors, it closes them!",
    "It's better to be alone sometimes.",
    "When fear hurts you, conquer it and defeat it!",
    "Let the deeds speak.",
    "You will be called in to fulfill a position of high honor and responsibility.",
    "The man on the top of the mountain did not fall there.",
    "You will conquer obstacles to achieve success.",
    "Joys are often the shadows, cast by sorrows.",
    "Fortune favors the brave.",
    "An upward movement initiated in time can counteract fate.",
    "A journey of a thousand miles begins with a single step.",
    "Sometimes you just need to lay on the floor.",
    "Never give up. Always find a reason to keep trying.",
    "If you have something worth fighting for, then fight for it.",
    "Stop wishing. Start doing.",
    "Accept your past without regrets. Handle your present with confidence. Face your future without fear.",
    "Stay true to those who would do the same for you.",
    "Ask yourself if what you are doing today is getting you closer to where you want to be tomorrow.",
    "Happiness is an activity.",
    "Help is always needed but not always appreciated. Stay true to your heart and help those in need weather they appreciate it or not.",
    "Hone your competitive instincts.",
    "Finish your work on hand don't be greedy.",
    "For success today, look first to yourself.",
    "Your fortune is as sweet as a cookie.",
    "Integrity is the essence of everything successful.",
    "If you're happy, you're successful.",
    "You will always be surrounded by true friends",
    "Believing that you are beautiful will make you appear beautiful to others around you.",
    "Happinees comes from a good life.",
    "Before trying to please others think of what makes you happy.",
    "When hungry, order more Chinese food.",
    "Your golden opportunity is coming shortly.",
    "For hate is never conquered by hate. Hate is conquered by love .",
    "You will make many changes before settling down happily.",
    "A man is born to live and not prepare to live.",
    "You cannot become rich except by enriching others.",
    "Don't pursue happiness - create it.",
    "You will be successful in love.",
    "All your fingers can't be of the same length.",
    "Wise sayings often fall on barren ground, but a kind word is never thrown away.",
    "A lifetime of happiness is in store for you.",
    "It is very possible that you will achieve greatness in your lifetime.",
    "Be tactful; overlook your own opportunity.",
    "You are the controller of your destiny.",
    "Everything happens for a reson.",
    "How can you have a beutiful ending without making beautiful mistakes.",
    "You can open doors with your charm and patience.",
    "Welcome the change coming into your life.",
    "There will be a happy romance for you shortly.",
    "Your fondest dream will come true within this year.",
    "You have a deep interest in all that is artistic.",
    "Your emotional nature is strong and sensitive.",
    "A letter of great importance may reach you any day now.",
    "Good health will be yours for a long time.",
    "You will become better acquainted with a coworker.",
    "To be old and wise, you must first be young and stupid.",
    "Failure is only the opportunity to begin again more intelligently.",
    "Integrity is doing the right thing, even if nobody is watching.",
    "Conquer your fears or they will conquer you.",
    "You are a lover of words; One day you will write a book.",
    "In this life it is not what we take up, but what we give up, that makes us rich.",
    "Fear can keep us up all night long, but faith makes one fine pillow.",
    "Seek out the significance of your problem at this time. Try to understand.",
    "Never upset the driver of the car you're in; they're the master of your destiny until you get home.",
    "He who slithers among the ground is not always a foe.",
    "You learn from your mistakes, you will learn a lot today.",
    "You only need look to your own reflection for inspiration. Because you are Beautiful!",
    "You are not judged by your efforts you put in; you are judged on your performance.",
    "Rivers need springs.",
    "Good news from afar may bring you a welcome visitor.",
    "When all else seems to fail, smile for today and just love someone.",
    "Patience is a virtue, unless its against a brick wall.",
    "When you look down, all you see is dirt, so keep looking up.",
    "If you are afraid to shake the dice, you will never throw a six.",
    "Even if the person who appears most wrong, is also quite often right.",
    "A single conversation with a wise man is better than ten years of study.",
    "Happiness is often a rebound from hard work. ",
    "The world may be your oyster, but that doesn't mean you'll get it's pearl.",
    "Your life will be filled with magical moments.",
    "You're true love will show himself to you under the moonlight. ",
    "Do not follow where the path may lead. Go where there is no path...and leave a trail",
    "Do not fear what you don't know",
    "The object of your desire comes closer.",
    "You have a flair for adding a fanciful dimension to any story.",
    "If you wish to know the mind of a man, listen to his words",
    "The most useless energy is trying to change what and who God so carefully created.",
    "Do not be covered in sadness or be fooled in happiness they both must exist",
    "You will have unexpected great good luck.",
    "You will have a pleasant surprise",
    "All progress occurs because people dare to be different.",
    "Your ability for accomplishment will be followed by success.",
    "The world is always ready to receive talent with open arms.",
    "Things may come to those who wait, but only the things left by those who hustle.",
    "We can't help everyone. But everyone can help someone.",
    "Every day is a new day. But tomorrow is never promised.",
    "Express yourself: Don't hold back!",
    "It is not necessary to show others you have change; the change will be obvious.",
    "You have a deep appreciation of the arts and music.",
    "If your desires are not extravagant, they will be rewarded.",
    "You try hard, never to fail. You don't, never to win.",
    "Never give up on someone that you don't go a day without thinking about.",
    "It never pays to kick a skunk.",
    "In case of fire, keep calm, pay bill and run.",
    "Next full moon brings an enchanting evening.",
    "Not all closed eye is sleeping nor open eye is seeing.",
    "Impossible is a word only to be found in the dictionary of fools.",
    "You will soon witness a miracle.",
    "The time is alway right to do what is right.",
    "Love is as necessary to human beings as food and shelter.",
    "You will make heads turn.",
    "You are extremely loved. Don't worry :)",
    "If you are never patient, you will never get anything done. If you believe you can do it, you will be rewarded with success.",
    "You will soon embark on a business venture.",
    "You believe in the goodness of man kind.",
    "You will have a long and wealthy life.",
    "You will take a pleasant journey to a place far away.",
    "You are a person of culture.",
    "Keep it simple. The more you say, the less people remember.",
    "Life is like a dogsled team. If you ain't the lead dog, the scenery never changes.",
    "Prosperity makes friends and adversity tries them.",
    "Nothing seems impossible to you.",
    "Patience is bitter, but its fruit is sweet.",
    "The only certainty is that nothing is certain.",
    "Success is the sum of my unique visions realized by the sweat of perseverance.",
    "When you expect your opponent to yield, you also should avoid hurting him.",
    "Intelligence is the door to freedom and alert attention is the mother of intelligence.",
    "Back away from individuals who are impulsive.",
    "Enjoyed the meal? Buy one to go too.",
    "You believe in the goodness of mankind.",
    "A big fortune will descend upon you this year.",
    "Now these three remain, faith, hope, and love. The greatest of these is love.",
    "For success today look first to yourself.",
    "Determination is the wake-up call to the human will.",
    "There are no limitations to the mind except those we aknowledge.",
    "A merry heart does good like a medicine.",
    "Whenever possible, keep it simple.",
    "Your dearest wish will come true.",
    "Poverty is no disgrace.",
    "If you don’t do it excellently, don’t do it at all.",
    "You have an unusual equipment for success, use it properly.",
    "Emotion is energy in motion.",
    "You will soon be honored by someone you respect.",
    "Punctuality is the politeness of kings and the duty of gentle people everywhere.",
    "Your happiness is intertwined with your outlook on life.",
    "Elegant surroundings will soon be yours.",
    "If you feel you are right, stand firmly by your convictions.",
    "Your smile brings happiness to everyone you meet.  ",
    "Instead of worrying and agonizing, move ahead constructively.",
    "Do you believe? Endurance and persistence will be rewarded.",
    "A new business venture is on the horizon.",
    "Never underestimate the power of the human touch.",
    "Hold on to the past but eventually, let the times go and keep the memories into the present.",
    "Truth is an unpopular subject. Because it is unquestionably correct.",
    "The most important thing in communication is to hear what isn’t being said.",
    "You are broad minded and socially active.",
    "Your dearest dream is coming true. God looks after you especially. ",
    "You will recieve some high prize or award.",
    "Your present question marks are going to succeed.",
    "You have a fine capacity for the enjoyment of life.",
    "You will live long and enjoy life.",
    "An admirer is concealing his/her affection for you.",
    "A wish is what makes life happen when you dream of rose petals.",
    "Love can turn cottage into a golden palace. ",
    "Lend your money and lose your freind.",
    "You will kiss your crush ohhh lalahh",
    "You will be rewarded for being a good listener in the next week.",
    "If you never give up on love, It will never give up on you. ",
    "Unleash your life force. ",
    "Your wish will come true.",
    "There is a prospect of a thrilling time ahead for you.",
    "No distance is too far, if two hearts are tied together.",
    "Land is always in the mind of the flying birds.",
    "Try? No! Do or do not, there is no try.",
    "Do not worry, you will have great peace.",
    "It's about time you asked that special someone on a date.",
    "You create your own stage ... the audience is waiting.",
    "It is never too late. Just as it is never too early.",
    "Discover the power within yourself.",
    "Good things take time. ",
    "Stop thinking about the road not taken and pave over the one you did.",
    "Put your unhappiness aside. Life is beautiful, be happy.",
    "You can still love what you can not have in life.",
    "Make a wise choice everyday.",
    "Circumstance does not make the man; it reveals him to himself.",
    "The man who waits till tomorrow, misses the opportunities of today.",
    "Life does not get better by chance. It gets better by change.",
    "If you never expect anything you can never be disappointed.",
    "People in your surroundings will be more cooperative than usual.",
    "True wisdom is found in happiness.",
    "Ones always regrets what could have done. Remember for next time.",
    "Follow your bliss and the Universe will open doors where there were once only walls.",
    "Find a peaceful place where you can make plans for the future. ",
    "All the water in the world can't sink a ship unless it gets inside.",
    "The earth is a school learn in it.",
    "In music, one must think with his heart and feel with his brain.",
    "If you speak honestly, everyone will listen.",
    "Generosity will repay itself sooner than you imagine.",
    "Do what is right, not what you should. ",
    "To effect the quality of the day is no small achievement.",
    "Simplicity and clearity should be the theme in your dress.",
    "Virtuous find joy while Wrongdoers find grieve in their actions.",
    "Not all closed eye is sleeping, nor open eye is seeing. ",
    "Bread today is better than cake tomorrow.",
    "In evrything there is a piece of truth.But a piece.",
    "A feeling is an idea with roots.",
    "Man is born to live and not prepare to live ",
    "It's all right to have butterflies in your stomach. Just get them to fly in formation. ",
    "If you don t give something, you will not get anything",
    "The harder you try to not be like your parents, the more likely you will become them",
    "Someday everything will all make perfect sense",
    "You will think for yourself when you stop letting others think for you",
    "Everything will be ok. Don't obsess. Time will prove you right, you must stay where you are.",
    "Let's finish this up now, someone is waiting for you on that",
    "The finest men like the finest steels have been tempered in the hottest furnace.",
    "A dream you have will come true",
    "The worst of friends may become the best of enemies, but you will always find yourself hanging on.",
    "I think, you ate your fortune while you were eating your cookie",
    "If you love someone keep fighting for them",
    "Do what you want, when you want, and you will be rewarded",
    "Let your fantasies unwind... ",
    "The cooler you think you are the dumber you look",
    "Expect great things and great things will come ",
    "The Wheel of Good Fortune is finally turning in your direction!",
    "Don't lead if you won't lead.",
    "You will always be successful in your professional career ",
    "Share your hapiness with others today.",
    "It's up to you to clearify.",
    "Your future will be happy and productive.",
    "Seize every second of your life and savor it.",
    "Those who walk in other's tracks leave no footprints.",
    "Failure is the mother of all success. ",
    "Difficulty at the beginning useually means ease at the end.",
    "Do not seek so much to find the answer as much as to understand the question better.",
    "Your way of doing what other people do their way is what makes you special.",
    "A beautiful, smart, and loving person will be coming into your life.",
    "Friendship is an ocean that you cannot see bottom.",
    "Your life does not get better by chance, it gets better by change.",
    "Our duty,as men and women,is to proceed as if limits to our ability did not exist.",
    "A pleasant expeience is ahead:don't pass it by. ",
    "Our perception and attitude toward any situation will determine the outcome",
    "They say you are stubborn; you call it persistence.",
    "Two small jumps are sometimes better than one big leap.",
    "A new wardrobe brings great joy and change to your life.",
    "The cure for grief is motion.",
    "It's a good thing that life is not as serious as it seems to the waiter",
    "I hear and I forget. I see and I remember. I do and I understand.",
    "I have a dream....Time to go to bed.",
    "Ideas you believe are absurd ultimately lead to success!",
    "A human being is a deciding being.",
    "Today is an ideal time to water your parsonal garden.",
    "Some men dream of fortunes, others dream of cookies.",
    "Things are never quite the way they seem.",
    "the project on your mind will soon gain momentum",
    "Beauty is simply beauty. originality is magical.",
    "Your dream will come true when you least expect it.",
    "Let not your hand be stretched out to receive and shut when you should repay.",
    "Don't worry, half the people you know are below average.",
    "Vision is the art of seeing what is invisible to others.",
    "You don't need talent to gain experience.",
    "A focused mind is one of the most powerful forces in the universe.",
    "Today you shed your last tear. Tomorrow fortune knocks at your door.",
    "Be patient! The Great Wall didn't got build in one day.",
    "Think you can. Think you can't. Either way, you'll be right.",
    "Wisdom is on her way to you.",
    "Digital circuits are made from analog parts.",
    "If you eat a box of fortune cookies, anything is possible.",
    "The best is yet to come.",
    "I'm with you.",
    "Be direct,usually one can accomplish more that way.",
    "A single kind work will keep one warm for years.",
    "Ask a friend to join you on your next voyage.",
    "In God we trust.",
    "Love is free. Lust will cost you everything you have.",
    "Stop searching forever, happiness is just next to you.",
    "You don't need the answers to all of life's questions. Just ask your father what to do.",
    "Jealousy is a useless emotion.",
    "You are not a ghost.",
    "There is someone rather annoying in your life that you need to listen to.",
    "You will plant the smallest seed and it will become the greatest and most mighty tree in the world.",
    "The dream you've been dreaming all your life isn't worth it. Find a new dream, and once you're sure you've found it, fight for it.",
    "See if you can learn anything from the children.",
    "It's Never Too Late For Good Things To Happen!",
    "A clear conscience is usually the sign of a bad memory.",
    "Aim high, time flies.",
    "One is not sleeping, does not mean they are awake.",
    "A great pleasure in life is doing what others say you can't.",
    "Isn't there something else you should be working on right now?",
    "Your father still loves and is in always with you. Remember that.",
    "Before you can be reborn you must die.",
    "It better to be the hammer than the nail.",
    "You are admired by everyone for your talent and ability.",
    "Save the whales. Collect the whole set.",
    "You will soon discover a major truth about the one you love most.",
    "Your life will prosper only if you acknowledge your faults and work to reduce them.",
    "Pray to God, but row towards shore.",
    "You will soon witness a miracle.",
    "The early bird gets the worm, but the second mouse gets the cheese",
    "Help, I'm being held prisoner in a Chinese cookie factory.",
    "Alas! The onion you are eating is someone else’s water lily.",
    "You are a persoon with a good sense of justice, now it's time to act like it.",
    "You create enthusiasm around you.",
    "There are big changes ahead for you. They will be good ones!",
    "You will have many happy days soon.",
    "Out of confusion comes new patterns.",
    "If you love someone enough and they break your heart, you can't stop yourself from still loving them again even after all that pain.",
    "Look right...Now look left...Now look forward (do this really fast) do you feel any different? good you should feel dizzy.",
    "Live like you are on the bottom, even if you are on the top.",
    "You will soon emerge victorious from the maze you've been traveling in.",
    "Do not judge a book by it's color.",
    "Everything will come your way.",
    "There is a time to be practical now.",
    "Bend the rod while it is still hot.",
    "Darkness is only succesful when there is no light. Don't forget about light!",
    "Acting is not lying. It is findind someone hiding inside you and letting that person run free.",
    "You will be forced to face fear, but if you do not run, fear will be afraid of you.",
    "You are thinking about doing something. Don't do it, it won't help anything.",
    "Your worst enemy has a crush on you!",
    "Love Conquers all.",
    "The phrase is follow your dreams. Not dream period.",
    "stop nagging to your partner and take it day by day.",
    "Do not think that me or my brothers have supreme control over what will happen to you.",
    "Bad luck and misfortune will follow you all your days.",
    "Remember the fate of the early Worm.",
    "Begin your life anew with strength, grace and wonder.",
    "Be a good friend and a fair enemy.",
    "What goes around comes around.",
    "Bad luck and misfortune will infest your pathetic soul for all eternity.",
    "The best prophet of the future is the past",
    "Movies have pause buttons, friends do not",
    "Use the force.",
    "Trust your intuition.",
    "Encourage your peers.",
    "Let your imagination wander.",
    "Your pain is the breaking of the shell that encloses your understanding.",
    "Patience is key, a wait short or long will have its reward.",
    "Tell them before it's too late...",
    "A bird in the hand is worth three in the bush!!",
    "Be assertive when decisive action is needed.",
    "To determine whether someone is beautiful is not by looking at his/her appearance, but his/her heart.",
    "Hope brings about a better future",
    "While you have this day, fill it with life. While you're in this moment, give it your own special meaning and purpose and joy.",
    "Even though it will often be difficult and complicated, you know you have what it takes to get it done.",
    "You can choose, right now and in every moment, to put your powerful and effective abilities to purposeful use. There is always something you can do, no matter what the situation may be, that will move your life forward.",
    "You will prosper in the field of wacky inventions.",
    "Your tongue is your ambassador.",
    "The cure for grief is movement.",
    "Love Is At Your Hands Be Glad And Hold On To It.",
    "You are often asked if it is in yet.",
    "Life to you is a bold and dashing responsibility.",
    "Patience is a key to joy.",
    "A bargain is something you don't need at a price you can't resist.",
    "Today is going to be a disasterous day, be prepared!",
    "Stay to your inner-self, you will benefit in many ways.",
    "Rarely do great beauty and great virtue dwell together as they do in you.",
    "You are talented in many ways.",
    "You are the master of every situation.",
    "Your problem just got bigger. Think, what have you done.",
    "If your cookie still in one piece, buy lotto.",
    "Go with the flow will make your transition ever so much easier.",
    "Tomorrow Morning,Take a Left Turn As Soon As You Leave Home",
    "A metaphor could save your life.",
    "Don't wait for your ship to come in, swim out to it",
    "There are lessons to be learned by listening to others.",
    "If you want the rainbow, you have to tolerate the rain.",
    "Volition, Strength, Languages, Freedom and Power rests in you.",
    "It takes more than a good memory to have good memories.",
    "You are what you are; understand yourself before you react",
    "Word to the wise: Don't play leapfrog with a unicorn.",
    "Forgive your enemies, but never forget them.",
    "Everything will now come your way",
    "Don't worry about the stock market. Invest in family.",
    "Your fortune is as sweet as a cookie.",
    "It is much easier to look for the bad, than it is to find the good",
    "If a person who has caused you pain and suffering has brought you, reconsider that person's value in your life",
    "You are worth loving, you are also worth the effort it takes to love you",
    "Never trouble trouble till trouble troubles you.",
    "Get off to a new start - come out of your shell.",
    "Life is a dancefloor,you are the DJ!",
    "Cooperate with those who have both know how and integrith.",
    "Minor aches today are likely to pay off handsomely tomorrow.",
    "Your mouth may be moving, but nobody is listening.",
    "Focus in on the color yellow tomorrow for good luck!",
    "The problem with resisting temptation is that it may never come again.",
    "All your sorrows will vanish.",
    "About time I got out of that cookie.",
    "Love will lead the way.",
    "It is best to act with confidence, no matter how little right you have to it.",
    "Soon, a visitor shall delight you. ",
    "What breaks in a moment may take years to mend.",
    "Someone stole your fortune and replaced it with this one. Your luck sucks. Have a good day!",
    "Take control of your life rather than letting things happen just like that!",
    "You will be rewarded for your patience and understanding.",
    "You will achieve all your desires and pleasures.",
    "Never miss a chance to keep your mouth shut.",
    "Nothing Shows A Man's Character More Than What He Laughs At.",
    "Never regret anything that made you smile.",
    "Love Takes Pratice.",
    "Don't take yourself so seriously, no one else does.",
    "You've got what it takes, but it will take everything you've got!",
    "At this very moment you can change the rest of your life.",
    "Become who you are.",
    "All comes at the proper time to him who knows how to wait.",
    "The energy is within you. Money is Coming!",
    "The quotes that you do not understand, are not meant for you.",
    "You have an important new business development shaping up.",
    "If you love someone a lot tell it before it's too late",
    "Birds are entangled by their feet and men by their tongues.",
    "Benefit by doing things that others give up on.",
    "Rest has a peaceful effect on your physical and emotional health.",
    "One of the best ways to persuade others is with your ears--by listening to them.",
    "Plan your work and work your plan.",
    "Over self-confidence is equal to being blind.",
    "Those who bring sunshine to the lives of others cannot keep it from themselves.",
    "Love or money, or neither?",
    "Before the beginning of great brilliance, there must be chaos.",
    "Old friends make best friends.",
    "Stop searching forever. Happiness is just next to you.",
    "Accept something that you cannot change, and you will feel better.",
    "Kiss is not a kiss without the heart.",
    "Enhance your karma by engaging in various charitable activities.",
    "You will have good luck and overcome many hardships.",
    "You never hesitate to tackle the most difficult problems.",
    "Hope is like food. You will starve without it.",
    "An angry man opens his mouth and shuts up his eyes.",
    "Make the system work for you, not the other way around.",
    "You will be hungry soon, order takeout now.",
    "Be prepared for extra energy.",
    "An unexpected relationship will become permanent.",
    "The love of your life is sitting across from you.",
    "Better be the head of a chicken than the tail of an ox.",
    "To forgive others one more time is to create one more blessing for yourself.",
    "Enjoy yourself while you can.",
    "The ultimate test of a relationship is to disagree but to hold hands.",
    "Excellence is the difference between what I do and what I am capable of.",
    "Do not let what you do not have prevent you from using what you do have.",
    "What ends on hope does not end at all.",
    "People enjoy having you around. Appreciate this.",
    "You are admired for your adventuous ways.",
    "It's never crowded along the 'extra mile'",
    "You are blessed, today is the day to bless others.",
    "The Greatest War Sometimes Isn't On The Battlefield But Against Oneself.",
    "People in your background will be more co-operative than usual.",
    "A good way to stay healthy is to eat more Chinese food.",
    "Anyone who dares to be, can never be weak.",
    "Affirm it, visualize it, believe it, and it`will actualize itself.",
    "The measure of time to your next goal is the measure of your discipline.",
    "Help, I'm prisoner in a Chinese bakery!!!",
    "Take a minute and let it ride, then take a minute to let it breeze.",
    "We are here to love each other, serve each other and uplift each other.",
    "If everybody is a worm you should be a glow worm",
    "To affirm is to make firm.",
    "Remember this: duct tape can fix anything, so don't worry about messing things up.",
    "You broke my cookie!",
    "Failure is not defeat until you stop trying.",
    "The days that make us happy make us wise.",
    "Men do not fail... they give up trying.",
    "Time may fly by. But Memories don't.",
    "You will win success in whatever you adopt.",
    "You will outdistance all your competitors.",
    "You have a great capability to break cookies - use it wisely!",
    "Money will come to you when you are doing the right thing.",
    "When you get something for nothing, you just haven't been billed for it yet.",
    "You will discover your hidden talents.",
    "You'll advance for with your abilities.",
    "When you can't naturally feel upbeat it can sometimes help you to act as if you did.",
    "You will overcome difficult times.",
    "Your problem just became your stepping stone. Catch the moment.",
    "I am a fortune. You just broke my little house. Where will i live now?",
    "The majority of the word 'can't' is can.",
    "The secret of getting ahead is getting started.",
    "Be most affectionate today.",
    "Change your thoughts and you change the world.",
    "Sing and rejoice, fortune is smiling on you.",
    "All the preparation you've done will finally be paying off!",
    "A truly great person never puts away the simplicity of a child.",
    "Customer service is like taking a bath you have to keep doing it.",
    "The expanse of your intelligence is a void no universe could ever fill.",
    "Those grapes you cannot taste are always sour.",
    "An unexpected aquaintance will resurface.",
    "If you want the rainbow, then you have to tolerate the rain.",
    "You don't get harmony when everyone sings the same note.",
    "The race is not always to the swift, but to those who keep on running.",
    "The early bird gets the worm, but the second mouse gets the cheese.",
    "The best things in life aren't things.",
    "Don't bother looking for fault. The reward for finding it is low.",
    "Everything has beauty but not everyone sees it.",
    "Nothing is as good or bad as it appears.",
    "Never cut what you can untie.",
    "Meet your opponent half way. You need the exercise.",
    "Laughter is the shortest distance between two people.",
    "We cannot change the direction of the wind, but we can adjust our sails.",
    "We could learn a lot from crayons: Some of are sharp, some are pretty, some have weird names, and all are different colors. But they all have to learn to live in the same box.",
    "Use your instincts now.",
    "If you take a single step to your journey, you'll succeed; it's not best to fail.",
    "In the eyes of lovers, everything is beautiful.",
    "Warning, do not eat your fortune.",
    "Demonstrate refinement in everything you do.",
    "Impossible standards just make life difficult.",
    "A different world cannot be build by indifferent people.",
    "Q. What is H2O? A. Caring, 2 parts Hug and 1 part Open-mind.",
    "All troubles you have can pass away very quickly.",
    "Integrity is the essense of everything successful.",
    "For true love? Send real roses preserved in 24kt gold!",
    "Sometimes the object of the journey is not the end, but the journey itself.",
    "Fear is just excitement in need of an attitude adjustment.",
    "The food here taste so good, even a cave man likes it.",
    "Perhaps you've been focusing too much on spending.",
    "Happiness isn't something you remember, it's something you experience.",
    "The dream is within you.",
    "Love is on its way.",
    "Be direct, usually one can accomplish more that way.",
    "Use your talents. That's what they are intended for.",
    "The troubles you have now will pass away quickly.",
    "See the light at the end of the tunnel.",
    "Your dream will come true when you least expect it.",
    "Don't 'face' reality, let it be the place from which you leap.",
    "Fortune smiles upon you today.",
    "Believing is doing.",
    "Your dynamic eyes have attracted a secret admirer.",
    "You know where you are going and how to get there.",
    "Go confidently in the direction of your dreams.",
    "Your ability to pick a winner will bring you success.",
    "Humor usually works at the moment of awkwardness.",
    "A good time to finish up old tasks.",
    "Stop procrastinating - starting tomorrow",
    "Enthusiastic leadership gets you a promotion when you least expect it.",
    "You are far more influential than you think.",
    "Adjust finances, make budgets, to improve your standing.",
    "Happiness is not the absence of conflict, but the ability to cope with it.",
    "An understanding heart warms all that are graced with it's presense.",
    "Your co-workers take pleasure in your great sense of creativity.",
    "Others enjoy your company.",
    "When in doubt, let your instincts guide you.",
    "A cheerful message is on its way to you.",
    "A pleasant surprise is in store for you tonight.",
    "you cant go down the right path with out first discovering the path to go down",
    "To courageously shoulder the responsibility of one's mistake is character.",
    "The joyful energy of the day will have a positive affect on you.",
    "You have a strong desire for a home and your family interests come first.",
    "Dogs have owners, cats have staff.",
    "Be patient: in time, even an egg will walk.",
    "You are not a person who can be ignored.",
    "You always know the right times to be assertive or to simply wait.",
    "Reading to the mind is what exercise is to the body.",
    "Eat something you never tried before.",
    "Your life becomes more and more of an adventure!",
    "You need to live authentically, and you can't ignore that.",
    "Make all you can, save all you can, give all you can.",
    "A well-aimed spear is worth three.",
    "To build a better world, start in your community.",
    "When you can't naturally feel upbeat, it can sometimes help to act a if you did.",
    "May you have great luck.",
    "A kind word will keep someone warm for years.",
    "Nothing in the world is accomplished without passion.",
    "Human invented language to satisfy the need to complain.",
    "Accept what comes to you each day.",
    "A small lucky package is on its way to you soon.",
    "In human endeavor, chance favors the prepared mind.",
    "The best way to give credit is to give it away.",
    "Anything you do, do it well. The last thing you want is to be sorry for what you didn't do.",
    "It takes more then good memory to have good memories.",
    "Grant yourself a wish this year only you can do it.",
    "love thy neighbour, just don't get caught",
    "You will be selected for a promotion because of your accomplishments.",
    "There are many new opportunities that are being presented to you.",
    "You will inherit a large sum of money.",
    "You will recieve a gift from someone that cares about you.",
    "You are not illiterate.",
    "Love because it is the only true adventure.",
    "You are contemplating some action which will bring credit upon you",
    "Keep true to the dreams of your youth.",
    "Treasure what you have.",
    "The greatest precept is continual awareness.",
    "A new friend helps you break out of an old routine.",
    "I have a dream.... Time to go to bed.",
    "Your skill will accomplish what the force of many cannot.",
    "You will soon be surrounded by good friends and laughter.",
    "The best is yet to come.",
    "It is better to be the hammer then the anvil.",
    "He who climbs a ladder must begin at the first step.",
    "Action speaks nothing, without the Motive. ",
    "Give yourself some peace and quiet for at least a few hours.",
    "Live each day well and wisely.",
    "Old dreams never die they just get filed away.",
    "You can fix it with a little extra energy and a positive attitude.",
    "Life is a verb.",
    "A man without aim is like a clock without hands, as useless if it turns as if it stands.",
    "Many folks are about as happy as they make up their minds to be.",
    "It's kind of fun to do the impossible.",
    "You should be able to make money and hold on to it.",
    "The human spirit is stronger than anything that can happen to it.",
    "Your succeess will astonish everyone.",
    "It is better to have a hen tomorrow than an egg today.",
    "Judge each day not by the harvest you reap but by the seeds you plant.",
    "Your hard work will get payoff today.",
    "Today is the tomorrow we worried about yesterday",
    "There are no shortcuts to any place worth going",
    "No matter what your past has been, you have a spotless future.",
    "Your secret desire to completely change your life will manifest.",
    "Soon you will be sitting on top of the world.",
    "You are never selfish with your advice or your help.",
    "A thrilling time is in store for you.",
    "It's tough to be fascinating.",
    "Soon life will become more interesting",
    "Luck sometimes visits a fool, but it never sits down with him.",
    "Keep your plans secret for now.",
    "Aren't you glad you just had a great meal?",
    "Traveling this year will bring your life into greater perspective.",
    "Only talent people get help from others.",
    "Constant grinding can turn an iron nod into a needle.",
    "You will be successful in your work",
    "you will spend old age in confort and material wealth",
    "When you're about to turn your heart into a stone remember: you do not walk alone.",
    "I am a bad luck person since I was born",
    "You are vigorous in words and action.",
    "The one who snores will always fall asleep first.",
    "An alien of some sort will be appearing to you shortly!",
    "Rest is a good thing, but boredom is its brother.",
    "Do not be overly judgemental of your loved one's intentions or actions.",
    "Think of how you can assist on a problem, not who to blame.",
    "The life of every woman or man - the heart of it - is pure and holy joy.",
    "Take it easy",
    "Trust your intuition. The universe is guiding your life.",
    "Use your head, but live in your heart.",
    "Don't find fault, find a remedy",
    "It may be those who do most, dream most",
    "Your passions sweep you away.",
    "Listen to yourself more often",
    "Think of mother's exhortations more.",
    "The gambler is like the fisherman both have beginners luck.",
    "You are given the chance to take part in an exciting adventure.",
    "The simplest answer is to act.",
    "You will always be surrounded by true friends.",
    "Keep your feet on the ground even though friends flatter you.",
    "You are the man of righteousness and integrity.",
    "He who seeks will find.",
    "The smart thing to do is to begin trusting your intuitions.",
    "Your many hidden talents will become obvious to those around you.",
    "Pick a path with heart.",
    "The human spirit is stronger then anything that can happen to it.",
    "It takes more than good memory to have good memories.",
    "Face facts with dignity.",
    "Be calm when confronting an emergency crisis.",
    "Do you believe? Endurance and persistence will be rewarded.",
    "A new wardrobe brings great joy and change in your life.",
    "Everyone agrees you are the best.",
    "A new outlook brightens your image and brings new friends.",
    "Everything will now come your way.",
    "You will be called to fill a position of high honor and responsibility.",
    "The eyes believe themselves; the ears believe other people.",
    "Good beginning is half done.",
    "Some pursue happiness; you create it.",
    "It's the worst of times, you need to summon your optimism.",
    "You are cautious in showing your true self to others.",
    "Your ability to accomplish tasks will follow with success.",
    "We all have extraordinary coded within us, waiting to be released.",
    "You will have a bright future.",
    "Compassion is a way of being.",
    "You will always have good luck in your personal affairs.",
    "The pleasure of what we enjoy is lost by wanting more",
    "Did you remember to order your take out also?",
    "Perhaps you've been focusing too much on that one thing..",
    "Right now there's an energy pushing you in a new direction.",
    "Everybody feels lucky for having you as a friend.",
    "When the moment comes, take the top one.",
    "Sometimes travel to new places leads to great transformation.",
    "There is always a way - if you are committed.",
    "Life is too short to waste time hating anyone.",
    "All the world may not love a lover but they will be watching him.",
    "Don't just spend time, invest it.",
    "Life always gets harder near the summit.",
    "Take the chance while you still have the choice.",
    "It is much easier to be cirtical than to be correct.",
    "Enjoy life! It is better to be happy than wise.",
    "To make the cart go, you must grease the wheels.",
    "You are contemplating some action which will bring credit upon you.",
    "Before you wonder 'Am I doing things right', ask 'Am I doing the right things?'",
    "You may be disappointed if you fail, but you are doomed if you don't try.",
    "You will always get what you want through your charm and personality.",
    "The big issues are work, career, or status right now.",
    "Your emotional currents are flowing powerfully now.",
    "Any decision you have to make tomorrow is a good decsion.",
    "Consume less. Share more. Enjoy life.",
    "The secret of staying young is good health and lying about your age.",
    "Spring has sprung. Life is blooming.",
    "Go ask your mom.",
    "The possibility of a career change is near.",
    "The important thing is to never stop questioning.",
    "Compassion will cure more then condemnation.",
    "Excuses are easy to manufacture, and hard to sell.",
    "Put your mind into planning today. Look into the future.",
    "Listen to life, and you will hear the voice of life crying, Be!",
    "Broke is only temporaryl poor is a state of mind.",
    "Teamwork: the fuel that allows common people attain uncommon results.",
    "Hard words break no bones, fine words butter no parsnips.",
    "We cannot direct the wind but we can adjust the sails.",
    "You are offered the dream of a lifetime. Say yes!",
    "Working out the kinks today will make for a better tomorrow.",
    "You have a curious smile and a mysterious nature.",
    "Questions provide the key to unlocking our unlimited potential.",
    "You will enjoy razon-sharp spiritual vision today.",
    "The wise are aware of their treasure, while fools follow their vanity",
    "Well-arranged time is the surest sign of a well-arranged mind.",
    "Never bring unhappy feelings into your home.",
    "This is really a lovely day. Congratulations!",
    "Bad luck and ill misfortune will infest your pathetic soul for all eternity.",
    "A golden egg of opportunity falls into your lap this month.",
    "You are very grateful for the small pleasures of life.",
    "Today you should be a passenger. Stay close to a driver for a day.",
    "For hate is never conquered by hate. Hate is conquered by love.",
    "Service is the rent we pay for the privilege of living on this planet.",
    "Good clothes open many doors. Go shopping.",
    "The leader seeks to communicate his vision to his followers.",
    "Great works are performed not by strength, but by perseverance.",
    "People who are late are often happier than those who have to wait for them",
    "Present your best ideas today to an eager and welcoming audience.",
    "Friends long absent are coming back to you.",
    "The time is right to make new friends.",
    "Life to you is a dashing and bold adventure",
    "You may be hungry soon: order a takeout now.",
    "Do not hesitate to look for help, an extra hand should always be welcomed.",
    "How can you have a beautiful ending without making beautiful mistakes?",
    "Humor is an affirmation of dignity.",
    "He who climbs a ladder must begin at the first step.",
    "What's vice today may be virtue tomorow.",
    "You have an unusually magnetic personality.",
    "You will travel to many places.",
    "Accept yourself",
    "Be a generous friend and a fair enemy",
    "Never quit!",
    "Old friends, old wines and old gold are best",
    "If your desires are not extravagant, they will be granted",
    "Every Friend Joys in your Success",
    "You should be able to undertake and complete anything",
    "You will enjoy good health, you will be surrounded by luxury",
    "You are a person of strong sense of duty",
    "Dream lofty dreams, and as you dream, so shall you become.",
    "You have a quiet and unobtrusive nature.",
    "Great thoughts come from the heart.",
    "Judge not according to the appearance.",
    "One who admires you greatly is hidden before your eyes.",
    "Traveling more often is important for your health and happiness.",
    "You will be sharing great news with all people you love",
    "You have a reputation for being straightforward and honest.",
    "You are always welcome in any gathering.",
    "You will be traveling and coming into a fortune.",
    "Open up your heart - it can always be closed again.",
    "Being happy is not always being perfect.",
    "Next time you have the opportunity, go on a rollercoaster.",
    "Try everything once, even the things you don't think you will like.",
    "Life is too short to hold grudges.",
    "Dream your dream and your dream will dream of you.",
    "Being alone and being lonely are two different things.",
    "Don't worry about things in the past, there is nothing you can do about them now. Don't worry about things that are happening now, make the best of a bad situation. Don't worry about things in the future, they may never happen.",
    "Tomorrow, take a moment to do something just for yourself.",
    "Someone close to you is waiting for you to call.",
    "A virtual fortune cookie will not satisfy your hunger like that of a home made one.",
    "Smile. Tomorrow is another day.",
    "You can never been certain of success, but you can be certain of failure if you never try.",
    "It takes ten times as many muscles to frown as it does to smile.",
    "Shoot for the moon! If you miss you will still be amongst the stars.",
    "Keep your eyes open. You never know what you might see.",
    "Tell them what you really think. Otherwise, nothing will change.",
    "Let your heart make your decisions - it does not get as confused as your head.",
    "Working hard will make you live a happy life.",
    "A pleasant surprise is waiting for you."
    ]
    var nbQ = quote.length;
    // Take one randomly
    var i = Math.floor(nbQ*Math.random());

    // Returns the joke
    return quote[i];
}

function jokeEN() {
    // An heritage of a previous script
    var lol = new Array ();
    lol = [
    "Why does the population decrease in Turkey during the Thanksgiving? Because during this day, Americans are used to eating turkeys.",
    "Why does blonde’s CD-ROM smell like they were on fire? Because she burns them. ",
    "What would be the worst thing for a screensaver? It’d be to let a screen die. ",
    "What's the favorite George Sand's activity? It’s making sandcastles.",
    "What would be the name of Iron Man if he was killed? Death Metal. ",
    "What do you do when you are Hungary? You eat Turkey.",
    "Why is a computer loved? Because it has many fans.",
    "According to a mathematician, what is the best syrup? The Maple syrup.",
    "This is the story of a vector who wants to beg forgiveness. So it goes in a church and explains its problem to a priest: “My Father. I wanted to be expressed in another basis but I think I committed a sin …”",
    "Why is Maped the king of the planet? Because this brand rules the world.",
    "What is the least expensive animal? It is the ram because it is sheep.",
    "A mathematician does not read comics. Instead, he reads conics.",
    "Physicists do not think: they Fick.",
    "Why should you never talk about abstract things to a builder? Because he prefers concrete ones.",
    "Why should you never let buckets lying on the floor? Because someone could kick the bucket.",
    "Where is Wiener? Wiener is in the Khintchine."
    ]
    var nbBl = lol.length;
    // Take one randomly
    var i = Math.floor(nbBl*Math.random());

    // Returns the joke
    return lol[i];
}

///////////////////////////////
// Functions from InfiNirina //
///////////////////////////////

// Posts automatically
function isPalin() {
  // Is this number a palindrome? If yes, make them know!
  var len = document.getElementsByClassName(classNameMsg).length;
  try {
    var lastPosterFull = document.getElementsByClassName(classNameMsg)[len-1].getElementsByTagName('strong')[0].valueOf().innerText;
    var lastPoster = firstName(lastPosterFull); // Shorter, please
    var lastMessage = getMsg(1, classNameMsg); // WARNING: We put 1 instead of 1+1 because otherwise, we would get 
                                               // incoherent results (this will be analyzed only once before a reload BTW)
  
    var msg = lastMessage.toString().toLowerCase();
    console.log(msg);
    // console.log(lastMessage);
  }
  catch(error) {
    var lastPoster = " ";
    msg = "";
  }

  var isPal = 1;
  var msgL = msg.length;
  if (msgL > 4) {
    var i = 0;
    while (i <= (msgL / 2 + 2)) {
      isPal = isPal * (msg[i] == msg[msgL-1-i]);
      i = i + 1;
    }
  }
  else if (Number(lastMessage) > 100000) {
    isPal = 1 * (nbStr[5] == nbStr[0]) * (nbStr[4] == nbStr[1]) * (nbStr[3] == nbStr[2]) * (Number(lastMessage) < 1000000);
  }
  else
    isPal = 0;
  if (isPal) {
    // Yeah, a palindrome! nice!
    console.log("[INFO] Cool! A palindrome");
    msg = "(Ceci est un palindrome)";
    document.getElementById('composerInput').value = msg;
    document.getElementsByName('send')[0].click();
  }
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

// Posts automatically
function countWithMe() {
  var me = "Bot Depersyl"; // Obviously, edit this if you want to use it for you!

  // We are on the right page AND on the right conversation! Let's go!

  //var className = 'bs' // Used in a try - catch // EDIT: now as a global var
  var len = document.getElementsByClassName(classNameMsg).length;
  if (len < 3) {
    console.log("Too few displayed numbers : I refresh");
    window.location.reload();
  }
  if (len == 6) {
    len = 5;
  }
  var lastPoster = document.getElementsByClassName(classNameMsg)[len-1].getElementsByTagName('strong')[0].valueOf().innerText;
  var lastNumber1 = document.getElementsByClassName(classNameMsg)[len-1].getElementsByTagName('span')[0].valueOf().innerText;
  if (len > 2) {
    var lastNumber2 = document.getElementsByClassName(classNameMsg)[len-2].getElementsByTagName('span')[0].valueOf().innerText;
  }
  else {
    var lastNumber2 = 0;
    console.log("Too few displayed numbers : refresh and retry");
  }

  if (len > 2) {
    var lastNumber3 = document.getElementsByClassName(classNameMsg)[len-3].getElementsByTagName('span')[0].valueOf().innerText;
  }
  else {
    var lastNumber3 = 0;
  }
  document.getElementById('composerInput').value = "";
  var isGood = 1;
  isGood = isGood * (Number(lastNumber1) == Number(lastNumber2) + 1) * (Number(lastNumber2) == Number(lastNumber3) + 1); // check if we meet the good conditions
  if (!isGood) {
    console.log("I do not have three correct consecutive numbers. Try again or count yourself!");
  }
  isGood = isGood * (lastPoster != me) * (Number(lastNumber1) > 105000) * (Number(lastNumber1)%36 == 35);
  console.log("Check the multiples: "+Number(lastNumber1)+" % 36 == "+Number(lastNumber1)%36);
  console.log("Next number postable: "+(Math.ceil(Number(lastNumber1)/36)*36));
  // To not appear suspicious, we will only post when numbers are multiple of 36 (in this case)
  if (lastPoster == me)
  {
    console.log("You already posted a number... Wait a bit, please");
  }

  if (isGood) // Check if we can count after the conditions above
  {
    var nextNb = Number(lastNumber1)+1;
    var messageToPost = nextNb.toString();
    var commentaire = isPalin(nextNb, lastPoster);
    document.getElementById('composerInput').value = messageToPost + commentaire;
    console.log("I post!")
    document.getElementsByName('send')[0].click();
  }
  console.log("I am sorry, I can't count right now.");
  //sleep(3000); // That much (on my old PC) - otherwise, it refreshes before it sends the message
  // And we start again!
  //window.location.reload();
}

function checkInfiNirina() {
  var len = Math.min(6, document.getElementsByClassName(classNameMsg).length);
  var msg = ""
  var lastPoster = firstName(document.getElementsByClassName(classNamePoster)[len-1].getElementsByTagName('strong')[0].valueOf().innerText)
  var lastNumber1 = getMsg(1, classNameMsg);
  var lastNumber2 = getMsg(2, classNameMsg);
  var lastNumber3 = getMsg(3, classNameMsg);
  console.log("Last numbers: "+lastNumber1+", "+lastNumber2+" and "+lastNumber3+".")
  //document.getElementById('composerInput').value = "";
  var isGood = 1;
  isGood = isGood * (Number(lastNumber2) == Number(lastNumber3) + 1)  * (lastNumber1.length==6) * (lastNumber2.length==6) * (lastNumber3.length==6); // check if we meet the good conditions
  if (!isGood) {
    console.log("Sorry, I can not check");
  }
  else {
    var goodNumber = Number(lastNumber2) + 1;
    if (goodNumber == Number(lastNumber1)) {
      console.log("I agree with your number");
    }
    else if (Number(lastNumber1) == NaN) {
      console.log("This is not a number. I can not check");
    }
    else {
      var msgPool = new Array("Désolé " +lastPoster+" mais tu voulais dire "+goodNumber+" plutôt ?", "Tu voulais dire "+goodNumber+" plutôt ?", "Si j'étais un humain, j'aurais dit "+goodNumber, "Yo, tu ne voulais pas dire "+goodNumber+" ?", lastPoster+", je te suggère plutôt ce nombre : "+goodNumber);
      var i = Math.floor(msgPool.length*Math.random());
      msg = msgPool[i];
      document.getElementById('composerInput').value = msg;
      console.log("I post!")
      document.getElementsByName('send')[0].click();
    }
  }
  return msg;
}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

function horoscope() {
  // The good old shares on Facebook with stupid information
  // Time to do it on purpose!
  var msgPool = new Array("Mais qu'est-ce que la vie vous réserve? L'horoscope vous dira tout!", "Voici votre horoscope, présenté par votre Bot Depersyl!", "La Terre et la Lune sont alignés! Ecoutez ce que les astres vous disent!", "L'horoscope, encore plus classe que celui d'Anne Vilano!", "Votre horoscope, basé sur des sources vérifiées (par un débogueur)", "Les astres m'ont appelé hier soir et m'ont dit ça : ", "Vous ne croirez pas ce que l'horoscope a donné comme informations !", "Si une botte de persil le dit, c'est que c'est vrai!");
  var intro = Math.floor(msgPool.length*Math.random());
  var msg = msgPool[intro] + "\n";
  var signs = new Array("Bélier\t", "Taureau\t", "Gémeaux", "Cancer\t", "Lion\t\t", "Vierge\t", "Balance\t", "Scorpion", "Sagittaire", "Capricorne", "Verseau\t", "Poissons\t");
  var percentage = new Array();
  var age = new Array();
  var nbDays = new Array();
  var money = new Array(1000*Math.random()+1440, 1000*Math.random()+1440, 1000*Math.random()+1440, 4000*Math.random()+4320, 4000*Math.random()+4320, 10000*Math.random(), 100*Math.random(), 2, 10000*Math.random()+12000, 100000*Math.random()+4,3000*Math.random()-2000,100*Math.random()+5100);
  var euroMillions = new Array("Le gros lot", "100€", "Le droit de participer", "Le plaisir de faire un don au *vrai* gagnant", "Un ticket perdant qui peut servir de marque-page", "Rien", "1€", "2.50€", "L'honneur de combler le déficit de l'État à hauteur du prix du ticket", "Rencontrer le buraliste du village", "0€", "5.15€")
  var questionAsked = new Array("Combien tu gagneras dans 5 ans?", "À quel âge vas-tu te marier ?", "À quel âge auras-tu ton permis ?", "À quel âge tu tomberas enceinte ?", "Ta compatibilité amoureuse avec ton 'significant other'", "Quelle est ta proba pour finir bourré au Bar'Bu ?", "Ce que tu gagneras à l'EuroMillions !", "Célibataire de Facebook, voici dans combien de temps tu rencontreras ta moitié !");
  var unit = new Array(" €", " ans", " ans", " ans", " %", " %", " ", " jours");
  var moneyRnd = shuffle(money);
  var eurMilRnd = shuffle(euroMillions);

  // Don't forget to floor all your values!
  for (var i=0;i<12;i++) {
    percentage[i] = 100*Math.random()+1;
    age[i] = 32*Math.random()+18;
    nbDays[i] = 500*Math.random()+7;
  }
  // A bit of random ;)
  age[Math.floor(Math.random()*12)] = "Jamais";
  var j=Math.floor(questionAsked.length*Math.random());
  var question = questionAsked[j];
  var answers = new Array();

  msg = msg + question+ "\n------------\n"; // The question!
  if (j==0) {
    answers = moneyRnd;
  }
  else if (j>=1 && j<=3) {
    answers = age;
  }
  else if (j==4 || j==5) {
    answers = percentage;
  }
  else if (j==6) {
    answers = eurMilRnd;
  }
  else if (j==7) {
    answers = nbDays;
  }

  // Giving the REAL information!
  for (var i=0;i<12;i++) {
    if(isNaN(answers[i]*1.0)) {
      msg = msg + signs[i] + " : \t\t" + answers[i] + "\n"; // Example: Jamais is not a number.
    }
    else {
      msg = msg + signs[i] + " : \t\t" + Math.floor(answers[i]) + unit[j] + "\n";
    }
  }
  return msg;
}

function potinMaker() {
  // Reserved for the Lovelist conversation (before committing, please remove names...)
  // Pick two names on this list, and then make a story about that!
  // Inspired by a nice idea from Mathieu
  // Put some names (here: placeholer names)
  var nameF = new Array("Alice", "Beatrice", "Charline", "Diane", "Elisabeth", "Fanny", "Ginette", "Huguette", "Ivette", "Jeanne");
  var nameM = new Array("Alain", "Bob", "Charlie", "Dave", "Ed", "Flavian", "Gael", "Hugh", "Ismail", "Jules"); 
  var i = Math.floor(nameF.length*Math.random());
  var j = Math.floor(nameM.length*Math.random());
  // Want a homosexual couple? Here are the probabilities: 80% hetero, 10% gay, 10% lesbian. Be open-minded ;)
  var randomNumber = Math.random(); // A random number, between 0 and 1.
  if (randomNumber >= 0.8 && randomNumber < 0.9) {
    // Gay couple
    var j1 = Math.floor(nameM.length*Math.random());
    var j2 = Math.floor(nameM.length*Math.random());
    if (j1 == j2) { // Damn... No self-couples...
      if (j2 == 0) {
        j2 = 1
      }
      else {
        j2 = j2-1; // I am bad at random things...
      }
    }
    // At this level, we have j1 != j2
    person1 = nameM[j1];
    person2 = nameM[j2];
  }
  else if (randomNumber >= 0.9) {
    // Lesbian couple
    var i1 = Math.floor(nameF.length*Math.random());
    var i2 = Math.floor(nameF.length*Math.random());
    if (i1 == i2) { // Damn... No self-couples...
      if (i2 == 0) {
        i2 = 1
      }
      else {
        i2 = i2-1; // I am bad at random things...
      }
    }
    // At this level, we have j1 != j2
    person1 = nameF[i1];
    person2 = nameF[i2];
  }
  else {
    // Hetero couple
    person1 = nameF[i];
    person2 = nameM[j];
  }
  var couple = person1+ " et " + person2; // To give a good example, replace "couple" with "Alice et Bob", like in crypto stories (but unlike my life).  
  var msgPool1 = new Array("Hey! ", "Pssssst! ", "Vous savez quoi? ", "Devinez quoi! ", "OMG! ", "Askip! ", "EXCLU! ", "Dis donc! ", "Ah! ");
  var msgPool2 = new Array(); // Long sentences. One line per information
  msgPool2 = [
    "L'autre jour, j'ai vu "+couple+" discuter longuement à l'écart de la foule...", 
    "En arrivant, j'ai vu qu'il y avait un truc entre "+couple+" !", 
    "Dans le bus, j'ai vu "+couple+" n'occuper qu'une seule place à eux deux!",
    "J'ai surpris "+couple+" faire du bouche à bouche. Et pourtant, personne n'avait fait de malaise !",
    "J'ai spotted un paquet de coeurs dans une conv Facebook de "+person2,
    "Lors de la dernière soirée, il y a eu une démonstration enflammée avec "+couple,
    person1+" a pris des cours de langue avec "+person2,
    person2+" a *vraiment* fait connaissance avec "+person1,
    person2+" a trouvé que "+person1+" avait très bon goût",
    "En fait, il y a un peu plus qu'une simple amitié entre "+couple,
    person2+" a fait sa déclaration et ce n'était pas pour les impôts ;) !",
    "C'est tellement chaud entre "+couple+" !",
    "Cupidon n'a pas raté "+couple,
    couple+" se sont bien rapprochés ces derniers temps...",
    "Lors d'une soirée, "+couple+" ont disparu...",
    "J'ai entendu dire que "+couple+" tentaient de nouvelles expériences !",
    "J'ai entendu le lit de "+person2+" grincer de chez moi :O "
  ]; // Different way to give the news
  var k = Math.floor(msgPool1.length*Math.random());
  var l = Math.floor(msgPool2.length*Math.random());
  msg = msgPool1[k] + msgPool2[l];
  return msg;
}

function dis(txt) {
  // When someone says "Dimanche", Bot will reply "Manche!"
  // Very useless but... Anyway.
  // txt is the message of the sender (here: m - the whole msg)
  res = "";
  var N = txt.length;
  var i = Math.max(txt.indexOf(" di"), txt.indexOf(" dy")) + 3; // where the ' di' starts, take its position, plus 3 (don't take the ' di')
  if (i == 2) {
    return ""; // Oops: return nothing
  }
  excludedCharacters = [" ", ",", ";", ".", "?", "!", "_", "-", "~", "&", "'", "(", "[", ")", "]", "|", "^", "*"]
  while (!excludedCharacters.includes(txt[i]) && i < N) {
    res = res + txt[i];
    i++;
  }
  res = res + ".";
  if(res.length > 3) {
    return res;
  }
  else {
    return ""; // Too short (less than 3 char): return nothing 
  }
}

function fakeNews() {
  // Based on a FB post. 10000 possible headlines
  // Bonus: add a thing before
  var msgPool0 = new Array("L'autre jour, j'ai entendu ça sur BFM TV : ", "Un pote de ma grand-mère m'a dit que :", "J'ai vu sur Facebook que :", "Askip : ", "Tante Gertrude m'a fait part de sa surprise lorsque elle a su que :", "Un GJ m'a dit, pendant que j'étais bloqué au rond-point que ses potes bloquent depuis deux heures, que : ", "INSOLITE ! J'ai vu sur le Daily Mail que :", "D'après le goraf... euh, un journal célèbre, ", "Eh, à la machine à café, on m'a dit que :");
  var msgPool1 = new Array("Macron", "En Marche", "Le gouvernement", "Le Sénat", "La Commission Européenne", "L'Allemagne", "Israël", "La finance internationale", "La Franc-maçonnerie", "La police");
  var msgPool2 = new Array("est financé.e par les", "travaille avec les", "est au service des", "manipule les", "complote avec les", "est manipulé.e par les", "soudoie les", "collabore avec les", "ment aux", "est complice des");
  var msgPool3 = new Array("journalistes", "musulmans", "gitans", "réfugiés", "bobos", "homosexuels", "marcheurs", "féministes", "écolos", "technocrates");
  var msgPool4 = new Array("pour taxer le gazole", "pour limiter la vitesse su les nationales", "afin d'interdire le diesel", "pour supprimer des ronds-points", "pour vendre la France à l'ONU", "afin d'accueillir des réfugiés", "pour enrichir les banques", "pour nous rendre gays", "pour interdire le Ricard", "pour assassiner Fly Rider");
  var i0 = Math.floor(msgPool0.length*Math.random());
  var i = Math.floor(msgPool1.length*Math.random());
  var j = Math.floor(msgPool2.length*Math.random());
  var k = Math.floor(msgPool3.length*Math.random());
  var l = Math.floor(msgPool4.length*Math.random());
  var disclaimer = "\n[C'est une fakenews, une info bidon, du pipeau. Ne sortez pas ce message de son contexte! -- Algos de Facebook, merci de ne pas bloquer mon compte pour ça]"
  return msgPool0[i0]+"\n'"+msgPool1[i]+" "+msgPool2[j]+" "+msgPool3[k]+" "+msgPool4[l]+"'.";
}

function parseISOString(s,dt) {
  // For displaying date like a normal human being (day/month): "05/03 9h" (WARNING! Automatically adds dt hours for UTC+xx)
  var b = s.split(/\D+/);
  if ((parseInt(b[3])+dt) > 23)
    return (parseInt(b[2])+1)+"/"+b[1]+" "+(parseInt(b[3])+dt-24)+":00"
  else if ((parseInt(b[3])+dt) < 0) 
    return (parseInt(b[2])-1)+"/"+b[1]+" "+(parseInt(b[3])+dt+24)+":00"
  else 
    return b[2]+"/"+b[1]+" "+(parseInt(b[3])+dt)+":00"
  //return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}

function worldCup() {
  let url = "https://world-cup-json.herokuapp.com/matches/current";
  var msg = "";
  fetch(url)
  .then(res => res.json())
  .then((out) => {
    if (out.length > 0) {
      var t1 = out[0].home_team.country;
      var t2 = out[0].away_team.country;
      var c1 = out[0].home_team.code;
      var c2 = out[0].away_team.code;
      var t = out[0].time;
      var status = out[0].status;
      var s1 = out[0].home_team.goals;
      var s2 = out[0].away_team.goals;
      msg = "The current game is: "+ t1 + " against "+ t2 + ". Status: "+ status +". At " + t + ", the score is: " + " ["+ c1 + "] "+ s1 +" - "+ s2 +" ["+ c2 + "] " ;
      if (s1 > s2)
        msg = msg + "\n" + t1 + " is leading so far by "+(s1-s2)+" goal(s).";
      else if (s1 < s2)
        msg = msg + "\n" + t2 + " is leading so far by "+(s2-s1)+" goal(s).";
      document.getElementById('composerInput').value = msg;
      console.log("FootballTime: I post!");
      document.getElementsByName('send')[0].click();
    }
    else {
	    // Calls the function for having today results and tomorrow matches
      dayResults();
    }
    console.log(msg);
  })
  .catch(err => { throw err });
}

function allResults() {
  let url2 = "https://world-cup-json.herokuapp.com/matches";
  var msg = "***Score Card ***\nTimes given in Russian local time (UTC+0200 to UTC+0500 - depends of the place)";
  fetch(url2)
  .then(res => res.json())
  .then((out) => {
    var n = out.length;
    for (i=0; i<31; i++) {
      var t1 = out[i].home_team.country;
      var t2 = out[i].away_team.country;
      var c1 = out[i].home_team.code;
      var c2 = out[i].away_team.code;
      var t = parseISOString(out[i].datetime,0);
      var status = out[i].status;
      var s1 = out[i].home_team.goals;
      var s2 = out[i].away_team.goals;
      msg = msg + "\nDate: "+ t + " \t\tStatus: "+ status +". \t\tScore: "+" ["+ c1 + "] "+ s1 +" - "+ s2 +" ["+ c2 + "] " ;
    }
    if (msg.length > 0) {
      document.getElementById('composerInput').value = msg;
      console.log("FootballTime: I post!");
      document.getElementsByName('send')[0].click();
    }
    console.log(msg);
  })
  .catch(err => { throw err });
}

function dayResults() {
  // No matches today? Give the matches today and tomorrow
  let url2 = "https://world-cup-json.herokuapp.com/matches";
  var msg = "Right now, no one is playing. \nBut here are the matches for today (and for tomorrow)\n-Times given in Paris time (UTC+0200)-";
  var d = new Date();
  var day = d.getDate();
  var dayStr = ("00" + day).slice(-2);
  var month = d.getMonth()+1;
  var moStr = ("00" + month).slice(-2);
  var i = 0;
  fetch(url2)
  .then(res => res.json())
  .then((out) => {
    var n = out.length;
    for (i=0; i<63; i++) {
      var t1 = out[i].home_team.country;
      var t2 = out[i].away_team.country;
      var c1 = out[i].home_team.code;
      var c2 = out[i].away_team.code;
      var t = parseISOString(out[i].datetime,2);
      console.log(t);
      console.log(dayStr+"/"+moStr);
      console.log(("00"+(day+1)).slice(-2)+"/"+moStr);
      var status = out[i].status;
      var s1 = out[i].home_team.goals;
      var s2 = out[i].away_team.goals;
      if (t.startsWith(dayStr+"/"+moStr)) {
        msg = msg + "\nDate: "+ t + " \t\tStatus: "+ status +". \t\tScore: "+" ["+ c1 + "] "+ s1 +" - "+ s2 +" ["+ c2 + "] " ;
      }
      else if (t.startsWith(("00"+(day+1)).slice(-2)+"/"+moStr)) {
        msg = msg + "\nDate: "+ t + " \t\tTeams: "+ t1 +" ["+ c1 + "]" +" VS "+ t2 +" ["+ c2 + "]" ;
      }
    }
    if (msg.length > 0) {
      document.getElementById('composerInput').value = msg;
      console.log("FootballTime: I post!");
      document.getElementsByName('send')[0].click();
    }
    console.log(msg);
  })
  .catch(err => { throw err });
}
