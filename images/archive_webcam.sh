#!/bin/bash
cd /usr/local/fowler/sites/chadfowler.com/html/images/
cp webcam.jpg rubyconf/`ls -la webcam.jpg |awk '{print $6,$7,$8}'|sed 's/ //g'`.jpg
