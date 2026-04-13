#!/bin/bash
open "https://app.netlify.com/drop"
sleep 2
open "/Users/joshuarush/Documents/Claude/Projects/new co/"
osascript -e 'display dialog "Netlify Drop is open in Chrome.\nYour folder is open in Finder.\n\nDrag  peptideverify_website.html\nonto the Netlify Drop zone.\n\nYou'\''ll have a live URL in 10 seconds!" buttons {"Got it!"} default button 1 with title "Deploy PeptideVerify"'
