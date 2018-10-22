---
layout: post
title: !binary |-
  VHlwZSBXYXRjaGluZw==
enki_id: 4502
---

Dave has posted a clever piece of <a
href="http://pragprog.com/pragdave/Tech/Ruby/LazyType.rdoc">code</a>,  
showing how you could do runtime class checking in Ruby (or a
Ruby-like  
language) by simply wrapping methods and recording the first class that
is  
used for each method parameter. In his example, he uses it to throw an  
error if any subsequent invocation has a parameter of a class
different  
from the first usage of that parameter. So, the following would fail:

      bob.age = 32
      bob.age = Duck.new

<p>
Though he warns that this is just a "coffee-break  
implementation&quot;, the actual code is remarkably simple as well. I  
consider this to be a hallmark of Dave’s.

</p>
<p>
As anyone in the dynamic programming languages world knows, "type  
checking&quot;(1) is a touchy and usually unproductive subject (<a
href="index.cgi/Computing/Programming/Ruby/RubyTypesAndClasses.rdoc,v">RubyTypesAndClasses</a>).  
The common complaint is that, without "type&quot; information for  
method parameters, code is hard to understand and maintain. I don’t  
generally find this to be true for myself, but I can see and
understand  
that sometimes it would be helpful to have some hints as to what kinds
of  
objects a library author passes into certain method calls.

</p>
<p>
The simplest solution to this—which wouldn’t require a  
compromise of the design philosophy of the language—would be for all  
library authors to simply document their code, giving their users a hint
as  
to what each method expects. We’ve all heard that one before. Even  
those of us with the best intentions do, on average, a poor job
documenting  
our own code. Additionally, what’s obvious to me may not be obvious  
to you. So as a library author, I will probably either overdocument
(waste  
my own time and clutter the code) or underdocument.

</p>
<p>
Taking a cue from Dave, I did my own coffee-break implementation(2) of
a  
hack that would auto-document the class of parameters for a given set
of  
methods. It’s implemented as a modification to <a
href="http://rdoc.sf.net">rdoc</a>. The idea is that you can  
"instrument&quot; your code temporarily, run through a typical usage  
of it, and have Ruby keep track of—and save—class information  
for the method parameters of specified classes.

</p>
<h2>
An example

</h2>
<p>
I’ve written a servlet (which I’ll talk about in more detail in  
a later post) that I would like to document via rdoc. Assuming the
servlet  
is called "ContinuationServlet&quot;, I can auto-generate parameter  
class hints for this servlet by adding the following to my code:

</p>
      require 'class_hints'
      wrap_methods(ContinuationServlet)
      ...
      (invoke webrick normally here)
      ...
      File.open(&quot;seasidehints.out&quot;, &quot;w&quot;) do |file|
        file.write(Marshal::dump(Kernel::METHOD_PARAM_HINTS))
      end

<p>
This will install a wrapper around every method of
ContinuationServlet,  
which will save class information for each parameter in the nested
hash,  
Kernel::METHOD\_PARAM\_HINTS. After having clicked around through the  
application with a web browser, we just dump this to disk as a
marshalled  
Ruby object.

</p>
<p>
Next, we feed this hash to rdoc when we document:

</p>
      rdoc --param-hint-file=seasidehints.out pm_seaside.rb

<p>
You can see the output <a
href="http://chadfowler.com/lazyseaside/doc/">here</a>. For the lazy,  
documented methods now look something like this:

</p>
      call_cont([Continuation]cont, [WEBrick::HTTPUtils::FormData]answer)

<p>
Full code listing:

</p>
<p>
<a
href="http://www.chadfowler.com/lazyseaside/class_hint.html">class\_hint.rb</a>

</p>
<p>
<a
href="http://chadfowler.com/lazyseaside/pm_seaside.html">pm\_seaside.rb</a>

</p>
<p>
<a
href="http://chadfowler.com/lazyseaside/rdoc-class-hints.diff">rdoc.diff</a>

</p>
<p>
Like Dave, I’m just throwing this up here for comment. I’m not  
sure anyone will find it useful, and the implementation is definitely
a  
hack. But, it seems like something <span class="underline">like
this</span> might help to quiet some of  
the complaints that half the population seems to have about
dynamically  
typed languages. And, for example, could <a
href="http://freeride.rubyforge.org">FreeRIDE</a> use a trick like this
to  
provide intellisense-like hints in the IDE?

</p>
<hr size="2">
</hr>
<p>
(1) The word "type&quot; is frequently misused in the Ruby world to  
mean "class&quot;. Matz actually deprecated the \#type message on  
Object to clarify that a Ruby object’s "type&quot; is more  
focused on its capabilities than its class. Class is little more than
a  
convenience mechanism.

</p>
<p>
(2) It was a pretty long coffee break :)

</p>
