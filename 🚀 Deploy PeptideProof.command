#!/bin/bash
# Opens Netlify Drop + your folder — drag peptideproof_website.html to go live
open "https://app.netlify.com/drop"
sleep 2
open "/Users/joshuarush/Documents/Claude/Projects/new co/"
osascript -e 'display dialog "Netlify Drop is open in Chrome.\nYour folder is open in Finder.\n\nDrag  peptideproof_website.html  onto\nthe Netlify Drop zone to deploy.\n\nYou'\''ll get a new live URL in ~10 seconds!" buttons {"Got it!"} default button 1 with title "Deploy PeptideProof"'
