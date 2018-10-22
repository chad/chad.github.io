---
layout: post
title: !binary |-
  UnVieUdlbSBvZiB0aGUgd2VlayAtIHJ1dmkgKHdhcyBSVlNIKQo=
enki_id: 4491
---

Update: Being the King of Good Timing, I posted this entry the day
before  
Alex renamed rvsh to "ruvi&quot; (nice name!) and broke all of the  
links in this post. The links should now work.

<p>
I’m not sure this will become a weekly habit, but I’ve been  
enjoying <a href="http://onestepback.org">Jim’s</a> "Module  
Spotlights&quot;, and thought I’d do something similar to give a  
little exposure to some of the nice <a
href="http://rubyforge.org/projects/rubygems">RubyGems packages</a>
that  
are now out there for the taking.

</p>
<p>
This week’s featured gem is "ruvi&quot; \[<a
href="http://www.lypanov.net/xml/development/ruvi.xml">www.lypanov.net/xml/development/ruvi.xml</a>\].  
It was created by <a href="http://www.lypanov.net">Alexander
Kellett</a>,  
and is a <a href="http://vim.sf.net">vim</a> clone written in *pure
Ruby*!

</p>
<p>
So, if you’ve got the latest <a
href="http://rubyforge.org/frs/?group_id=126">RubyGems</a> distribution
(go  
get it!), you can do this:

</p>
            $ sudo gem -Ri ruvi --install-stub
            Attempting remote installation of 'ruvi'
            Successfully installed ruvi version 0.4.5

            $ ruvi RvshGem.rdoc

<p>
You’ll see something that looks like this:

</p>
<p>
<img src="http://chadfowler.com/images/rvsh.jpg">

</p>
<p>
(though if you’ve got your terminal configured properly, it will look  
a lot better that this).

</p>
<p>
It’s still early in development, but it has a surprising number of  
features implemented. I actually used it to create this weblog entry.
I  
think I could waste a few hours having fun hacking in features that I
never  
had the energy to do in vim script or Emacs Lisp.

</p>
<p>
Now that you’ve got the latest RubyGems distribution, try:

</p>
          $ gem -R --list

<p>
There are a lot of lovely gems already out there. And, of course,
armed  
with the RubyGems distribution, you are now equipped to create more.

</p>
