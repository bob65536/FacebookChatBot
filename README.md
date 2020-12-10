# FacebookChatBot
If you want to post (some) automatic messages and don't want to mess with the Facebook API, I have some good news for you!

## Update (2020-12-10)
It seems like Facebook has removed the simple text chat, once available on old phones and in CLI.  
This script used the lite version of Messages, by going to (Facebook Mobile)[m.facebook.com/messages] but, maybe for _improving the user experience_, now end up with an error message.  
During two years, it was a joy to reply automatically to some messages and to improve this script (even if source code was awful).  
I won't sell my soul (or pay to give it for free) to get an API key.  
So the project to do a chatbot will need a serious overhaul, that I am not willing to do right now.  

Goodbye.  

**Warning: dev version. THings may not work! Pay attention to the logs!**

To get this script working, you will need some things:  
- Firefox with TamperMonkey installed (Greasemonkey works too but was not tested since a long time)
- A Facebook account (obvious)  
- _(optional)_ Extension: tab reloader (if there is an error)  
- _(optional)_ Extension: tab cycler (or revolver), which cycles between tabs if you have several tabs (and an old hardware)  

It may work with Chrome too but you need to make some changes (changing the user agent for Firefox or a old browser). 

Then, you need to change some things (e.g.: the name of the account, to be replaced in the script) and you are done!
Last thing: it will only work on m.facebook.com (yeah, the old mobile version).

Tested on Raspberry Pi 3 w/ Chromium, Win10 with Firefox.
